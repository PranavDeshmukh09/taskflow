// src/models/Task.model.js

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'project_id'
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 120]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: false,
      defaultValue: 'Medium'
    },
    status: {
      type: DataTypes.ENUM('To-Do', 'In Progress', 'Done'),
      allowNull: false,
      defaultValue: 'To-Do'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'reminder_sent'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'due_date']
      },
      {
        fields: ['user_id', 'status']
      },
      {
        fields: ['user_id', 'priority']
      },
      {
        fields: ['user_id', 'project_id']
      },
      {
        fields: ['reminder_sent', 'due_date']
      }
    ]
  });

  return Task;
};