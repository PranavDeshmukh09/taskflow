module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
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
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'entity_id'
    },
    oldData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'old_data'
    },
    newData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'new_data'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'activity_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['created_at'] }
    ]
  });

  return ActivityLog;
};