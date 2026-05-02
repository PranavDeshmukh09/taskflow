// src/models/User.model.js

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'display_name'
    },
    passwordHash: {
      type: DataTypes.STRING(60),
      allowNull: false,
      field: 'password_hash'
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'avatar_url'
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'email_notifications'
    },
    loginAttempts: {
      type: DataTypes.SMALLINT,
      defaultValue: 0,
      field: 'login_attempts'
    },
    lastFailedAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_failed_attempt'
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_changed_at'
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(12);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(12);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
          user.passwordChangedAt = new Date();
        }
        user.updatedAt = new Date();
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.incrementLoginAttempts = async function() {
    this.loginAttempts += 1;
    this.lastFailedAttempt = new Date();
    await this.save();
  };

  User.prototype.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lastFailedAttempt = null;
    await this.save();
  };

  return User;
};