// src/controllers/auth.controller.js - COMPLETE WITH ACTIVITY LOGGING

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const db = require('../models');
const {
  DuplicateEmailError,
  NotFoundError,
  ValidationError,
  UnauthorizedError
} = require('../middleware/error.middleware');
const constants = require('../shared/constants');
const { logActivity, ACTIONS, getClientIp, getUserAgent } = require('../services/activityLog.service');
const { sendResetEmail } = require('../shared/emailService');

const User = db.User;
const PasswordResetToken = db.PasswordResetToken;

// Helper: Calculate delay for rate limiting
const getDelayMs = (attempts) => {
  if (attempts < constants.MAX_LOGIN_ATTEMPTS) return 0;
  const excess = attempts - constants.MAX_LOGIN_ATTEMPTS;
  const delay = Math.min(
    constants.BASE_DELAY_MS * Math.pow(1.5, excess),
    constants.MAX_DELAY_MS
  );
  return delay;
};

// ============= REGISTER =============
exports.register = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { email, displayName, password } = req.body;
    
    // Validate password strength
    if (password.length < constants.MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${constants.MIN_PASSWORD_LENGTH} characters`);
    }
    
    if (!constants.PASSWORD_REGEX.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter and one number');
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new DuplicateEmailError();
    }
    
    const user = await User.create({
      email,
      displayName,
      passwordHash: password
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // ✅ Log successful registration
    await logActivity({
      userId: user.id,
      action: ACTIONS.REGISTER,
      entityType: 'User',
      entityId: user.id,
      newData: { email: user.email, displayName: user.displayName },
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'success'
    });
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailNotifications: user.emailNotifications
      },
      token
    });
  } catch (error) {
    // Log failed registration attempt
    await logActivity({
      userId: null,
      action: ACTIONS.REGISTER,
      entityType: 'User',
      errorMessage: error.message,
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'failed'
    });
    next(error);
  }
};

// ============= LOGIN =============
exports.login = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    // Always respond with generic message for security
    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log failed login - user not found
      await logActivity({
        userId: null,
        action: ACTIONS.LOGIN_FAILED,
        entityType: 'User',
        newData: { email },
        errorMessage: 'User not found',
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'failed'
      });
      
      throw new UnauthorizedError('Invalid email or password');
    }
    
    // Rate limiting: calculate delay
    const delay = getDelayMs(user.loginAttempts);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const isValid = await user.validatePassword(password);
    
    if (!isValid) {
      await user.incrementLoginAttempts();
      
      // Log failed login - wrong password
      await logActivity({
        userId: user.id,
        action: ACTIONS.LOGIN_FAILED,
        entityType: 'User',
        entityId: user.id,
        newData: { email },
        errorMessage: 'Invalid password',
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'failed'
      });
      
      throw new UnauthorizedError('Invalid email or password');
    }
    
    // Successful login - reset attempts
    await user.resetLoginAttempts();
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // ✅ Log successful login
    await logActivity({
      userId: user.id,
      action: ACTIONS.LOGIN_SUCCESS,
      entityType: 'User',
      entityId: user.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'success'
    });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailNotifications: user.emailNotifications,
        avatarUrl: user.avatarUrl
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// ============= GET PROFILE =============
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailNotifications: user.emailNotifications,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// ============= UPDATE PROFILE =============
exports.updateProfile = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { displayName, emailNotifications, avatarUrl } = req.body;
    const user = req.user;
    
    const oldData = {
      displayName: user.displayName,
      emailNotifications: user.emailNotifications,
      avatarUrl: user.avatarUrl
    };
    
    if (displayName) user.displayName = displayName;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    
    await user.save();
    
    // ✅ Log profile update
    await logActivity({
      userId: user.id,
      action: 'PROFILE_UPDATE',
      entityType: 'User',
      entityId: user.id,
      oldData: oldData,
      newData: {
        displayName: user.displayName,
        emailNotifications: user.emailNotifications,
        avatarUrl: user.avatarUrl
      },
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'success'
    });
    
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

// ============= CHANGE PASSWORD =============
exports.changePassword = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
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
    
    // ✅ Log password change
    await logActivity({
      userId: user.id,
      action: ACTIONS.PASSWORD_CHANGE,
      entityType: 'User',
      entityId: user.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'success'
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// ============= FORGOT PASSWORD =============
exports.forgotPassword = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    // Always return success even if user not found (security)
    if (user) {
      // Delete any existing unused tokens
      await PasswordResetToken.destroy({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
      
      // Create new token
      const resetToken = await PasswordResetToken.create({
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      });
      
      // Send email
      await sendResetEmail(user.email, resetToken.token);
      
      // ✅ Log password reset request
      await logActivity({
        userId: user.id,
        action: ACTIONS.PASSWORD_RESET_REQUEST,
        entityType: 'User',
        entityId: user.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'success'
      });
    } else {
      // Log attempt with non-existent email (security - don't reveal user doesn't exist)
      await logActivity({
        userId: null,
        action: ACTIONS.PASSWORD_RESET_REQUEST,
        errorMessage: 'Email not found',
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'failed'
      });
    }
    
    res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
  } catch (error) {
    next(error);
  }
};

// ============= RESET PASSWORD =============
exports.resetPassword = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { token, newPassword } = req.body;
    
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{ model: User, as: 'user' }]
    });
    
    if (!resetToken) {
      throw new ValidationError('Invalid or expired reset token');
    }
    
    // Validate new password
    if (newPassword.length < constants.MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${constants.MIN_PASSWORD_LENGTH} characters`);
    }
    
    if (!constants.PASSWORD_REGEX.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter and one number');
    }
    
    // Update user's password
    resetToken.user.passwordHash = newPassword;
    await resetToken.user.save();
    
    // Mark token as used
    resetToken.used = true;
    await resetToken.save();
    
    // ✅ Log password reset complete
    await logActivity({
      userId: resetToken.user.id,
      action: ACTIONS.PASSWORD_RESET_COMPLETE,
      entityType: 'User',
      entityId: resetToken.user.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'success'
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// ============= LOGOUT (Optional - just for logging) =============
exports.logout = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    // Log logout action
    if (req.user) {
      await logActivity({
        userId: req.user.id,
        action: ACTIONS.LOGOUT,
        entityType: 'User',
        entityId: req.user.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: 'success'
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};