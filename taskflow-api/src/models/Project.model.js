module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
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
    name: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    
  }, {
    tableName: 'projects',
    timestamps: true,
    underscored: true
  });

  return Project;
};