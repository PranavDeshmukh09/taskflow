// src/models/TaskTag.model.js

module.exports = (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'task_id',
      primaryKey: true
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'tag_id',
      primaryKey: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'task_tags',
    timestamps: false,
    underscored: true
  });

  return TaskTag;
};