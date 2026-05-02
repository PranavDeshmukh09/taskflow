// src/controllers/user.controller.js

const db = require('../models');
const { ValidationError, UnauthorizedError } = require('../middleware/error.middleware');
const constants = require('../shared/constants');

const User = db.User;

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, emailNotifications, avatarUrl } = req.body;
    const user = req.user;
    
    if (displayName) user.displayName = displayName;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    await user.save();
    
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailNotifications: user.emailNotifications,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    
    if (newPassword.length < constants.MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${constants.MIN_PASSWORD_LENGTH} characters`);
    }
    
    if (!constants.PASSWORD_REGEX.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter and one number');
    }
    
    user.passwordHash = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};