// src/services/auth.service.js

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models');

const User = db.User;
const PasswordResetToken = db.PasswordResetToken;

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Create password reset token
const createResetToken = async (userId) => {
  // Delete existing unused tokens
  await PasswordResetToken.destroy({
    where: {
      userId,
      used: false,
      expiresAt: { [db.Sequelize.Op.gt]: new Date() }
    }
  });
  
  // Create new token
  const token = crypto.randomBytes(32).toString('hex');
  const resetToken = await PasswordResetToken.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  });
  
  return resetToken.token;
};

// Validate reset token
const validateResetToken = async (token) => {
  const resetToken = await PasswordResetToken.findOne({
    where: {
      token,
      used: false,
      expiresAt: { [db.Sequelize.Op.gt]: new Date() }
    },
    include: [{ model: User, as: 'user' }]
  });
  
  return resetToken;
};

// Mark token as used
const markTokenAsUsed = async (token) => {
  token.used = true;
  await token.save();
};

module.exports = {
  generateToken,
  createResetToken,
  validateResetToken,
  markTokenAsUsed,
};