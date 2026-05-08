const app = require('./app');
const db = require('./models');
//const startReminderCron = require('./jobs/reminderCronJob');
const PORT = process.env.PORT || 5000;


startServer();