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
// ========== User Associations ==========
db.User.hasMany(db.PasswordResetToken, { foreignKey: 'userId', as: 'resetTokens' });
db.PasswordResetToken.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasMany(db.Project, { foreignKey: 'userId', as: 'projects' });
db.Project.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasMany(db.Tag, { foreignKey: 'userId', as: 'tags' });
db.Tag.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasMany(db.Task, { foreignKey: 'userId', as: 'tasks' });
db.Task.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// ========== Task Associations ==========
db.Task.belongsTo(db.Project, { foreignKey: 'projectId', as: 'project' });
db.Project.hasMany(db.Task, { foreignKey: 'projectId', as: 'tasks' });

// Task <-> Tag (many-to-many through TaskTag)
db.Task.belongsToMany(db.Tag, { through: db.TaskTag, foreignKey: 'taskId', as: 'tags' });
db.Tag.belongsToMany(db.Task, { through: db.TaskTag, foreignKey: 'tagId', as: 'tasks' });
// ReminderLog associations
db.Task.hasMany(db.ReminderLog, { foreignKey: 'taskId', as: 'reminderLogs' });
db.ReminderLog.belongsTo(db.Task, { foreignKey: 'taskId', as: 'task' });
//Activitylog
db.User.hasMany(db.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
db.ActivityLog.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;