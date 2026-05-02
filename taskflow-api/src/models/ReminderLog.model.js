// src/models/ReminderLog.model.js

module.exports = (sequelize, DataTypes) => {
  const ReminderLog = sequelize.define('ReminderLog', {
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
    underscored: true,
    indexes: [
      {
        fields: ['task_id']
      },
      {
        fields: ['sent_at']
      }
    ]
  });

  return ReminderLog;
};