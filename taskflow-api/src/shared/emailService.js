// src/shared/emailService.js - COMPLETE WORKING VERSION

const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

// Send password reset email
const sendResetEmail = async (toEmail, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'TaskFlow - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
            .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #3B82F6; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">TaskFlow</div>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>This link will expire in <strong>1 hour</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>TaskFlow - Stay productive. You've got this! 💪</p>
              <p>&copy; 2026 TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reset your TaskFlow password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    });
    
    console.log(`✅ Reset email sent to ${toEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send reset email:', error.message);
    return false;
  }
};

// Send task reminder email
const sendReminderEmail = async (toEmail, taskTitle, taskId, dueDate, retryCount = 0) => {
  const maxRetries = 3;
  const backoffMs = 1000 * Math.pow(2, retryCount);
  
  try {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`;
    const formattedDate = new Date(dueDate).toLocaleString();
    
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `⏰ TaskFlow: "${taskTitle}" is due soon`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Task Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #F59E0B; }
            .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
            .task-title { font-size: 18px; font-weight: bold; color: #3B82F6; }
            .due-date { font-size: 16px; color: #ef4444; margin: 10px 0; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #3B82F6; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⏰ TaskFlow Reminder</div>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your task <strong class="task-title">"${taskTitle}"</strong> is due soon!</p>
              <div class="due-date">📅 Due: ${formattedDate}</div>
              <div style="text-align: center;">
                <a href="${taskUrl}" class="button">View Task</a>
              </div>
              <p>Don't forget to complete it on time!</p>
            </div>
            <div class="footer">
              <p>TaskFlow - Stay productive. You've got this! 💪</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reminder: "${taskTitle}" is due on ${formattedDate}\n\nView task: ${taskUrl}`
    });
    
    console.log(`✅ Reminder email sent to ${toEmail} for task: ${taskTitle}`);
    console.log(`📧 Message ID: ${info.messageId}`);
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

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    return true;
  } catch (error) {
    console.error('❌ Email configuration invalid:', error.message);
    return false;
  }
};

module.exports = {
  sendResetEmail,
  sendReminderEmail,
  testEmailConfig
};