// src/jobs/reminderCronJob.js

const cron = require('node-cron');
const { processReminders } = require('../services/notification.service');

let isRunning = false;

// Run every 15 minutes
const startReminderCron = () => {
  console.log('⏰ Starting reminder cron job (runs every 15 minutes)');
  
  // Schedule task to run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    // Prevent multiple instances from running simultaneously
    if (isRunning) {
      console.log('⚠️ Reminder job already running, skipping...');
      return;
    }
    
    isRunning = true;
    try {
      await processReminders();
    } catch (error) {
      console.error('❌ Reminder cron job failed:', error);
    } finally {
      isRunning = false;
    }
  });
  
  // Also run once on startup (after 1 minute delay)
  setTimeout(() => {
    console.log('🔄 Running initial reminder check...');
    processReminders();
  }, 60000);
};

module.exports = startReminderCron;