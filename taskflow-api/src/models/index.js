const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.User = require('./User.model')(sequelize, Sequelize);
db.PasswordResetToken = require('./PasswordResetToken.model')(sequelize, Sequelize);
db.Project = require('./Project.model')(sequelize, Sequelize);
db.Tag = require('./Tag.model')(sequelize, Sequelize);
db.Task = require('./Task.model')(sequelize, Sequelize);
db.TaskTag = require('./TaskTag.model')(sequelize, Sequelize);
db.ReminderLog = require('./ReminderLog.model')(sequelize, Sequelize);
db.ActivityLog = require('./ActivityLog.model')(sequelize, Sequelize);
