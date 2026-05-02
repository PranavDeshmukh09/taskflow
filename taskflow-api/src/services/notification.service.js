// src/services/notification.service.js

const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const db = require('../models');

const Task = db.Task;
const User = db.User;
const ReminderLog = db.ReminderLog;

// Email transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

// Send a single reminder email with retry logic
const sendReminderEmail = async (toEmail, taskTitle, taskId, dueDate, retryCount = 0) => {
  const maxRetries = 3;
  const backoffMs = 1000 * Math.pow(2, retryCount);
  
  try {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`;
    const formattedDate = new Date(dueDate).toLocaleString();
    
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `⏰ TaskFlow Reminder: "${taskTitle}" is due soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">⏰ Task Reminder</h2>
          <p>Your task <strong>"${taskTitle}"</strong> is due on:</p>
          <p style="font-size: 18px; color: #3B82F6; margin: 20px 0;">${formattedDate}</p>
          <a href="${taskUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            View Task
          </a>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6B7280; font-size: 12px;">TaskFlow - Stay productive. You've got this! 💪</p>
        </div>
      `,
      text: `Task Reminder: "${taskTitle}" is due on ${formattedDate}\n\nView task: ${taskUrl}`
    });
    
    console.log(`📧 Reminder email sent to ${toEmail} for task: ${taskTitle}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send reminder email (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return sendReminderEmail(toEmail, taskTitle, taskId, dueDate, retryCount + 1);
    }
    
    return false;
  }
};

// Process reminders (called by cron job)
const processReminders = async () => {
  console.log('🕐 Running reminder check...', new Date().toISOString());
  
  try {
    const now = new Date();
    const reminderWindow = new Date(now);
    reminderWindow.setHours(reminderWindow.getHours() + 24);
    
    // Find tasks due in next 24 hours, not done, reminder not sent, user opted in
    const tasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.gte]: now,
          [Op.lte]: reminderWindow
        },
        status: { [Op.ne]: 'Done' },
        reminderSent: false
      },
      include: [
        {
          model: User,
          as: 'user',
          where: { emailNotifications: true },
          attributes: ['id', 'email', 'displayName']
        }
      ]
    });
    
    console.log(`📋 Found ${tasks.length} tasks requiring reminders`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const task of tasks) {
      // Check if reminder already sent for this task in last 24 hours
      if (task.reminderSent) {
        continue;
      }
      
      const success = await sendReminderEmail(
        task.user.email,
        task.title,
        task.id,
        task.dueDate
      );
      
      if (success) {
        // Mark reminder as sent
        task.reminderSent = true;
        await task.save();
        
        // Log reminder
        if (db.ReminderLog) {
          await db.ReminderLog.create({
            taskId: task.id,
            sentAt: new Date(),
            type: 'email_24h'
          });
        }
        
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Reminders sent: ${successCount}, Failed: ${failCount}`);
  } catch (error) {
    console.error('❌ Error in reminder processing:', error);
  }
};

// Create ReminderLog model if not exists (for V2)
const initReminderModel = (sequelize, DataTypes) => {
  if (!db.ReminderLog) {
    db.ReminderLog = sequelize.define('ReminderLog', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'task_id'
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'sent_at'
      },
      type: {
        type: DataTypes.STRING(20),
        defaultValue: 'email_24h'
      }
    }, {
      tableName: 'reminder_logs',
      timestamps: false,
      underscored: true
    });
  }
  return db.ReminderLog;
};

module.exports = {
  processReminders,
  sendReminderEmail,
  initReminderModel
};