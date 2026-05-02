// src/server.js

const app = require('./app');
const db = require('./models');
//const startReminderCron = require('./jobs/reminderCronJob');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database (only in development)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database synced');
    }
    // Start reminder cron job (only in production, or always in development)
    //if (process.env.NODE_ENV === 'production' || true) {
   // startReminderCron();
    //}
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();