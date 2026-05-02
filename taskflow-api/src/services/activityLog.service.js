// src/services/activityLog.service.js

const db = require('../models');

const ActivityLog = db.ActivityLog;

// Define action types as constants
const ACTIONS = {
  // Auth actions
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // Task actions
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_STATUS_CHANGE: 'TASK_STATUS_CHANGE',
  TASK_RESTORE: 'TASK_RESTORE',
  
  // Project actions
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  
  // Tag actions
  TAG_CREATE: 'TAG_CREATE',
  TAG_UPDATE: 'TAG_UPDATE',
  TAG_DELETE: 'TAG_DELETE',
};

// Helper to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.socket?.remoteAddress || 
         req.ip || 
         'unknown';
};

// Helper to get user agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Main logging function
const logActivity = async (data) => {
  try {
    const log = await ActivityLog.create({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldData: data.oldData ? JSON.stringify(data.oldData) : null,
      newData: data.newData ? JSON.stringify(data.newData) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'success',
      errorMessage: data.errorMessage
    });
    
    // Don't log in development to avoid clutter
    if (process.env.NODE_ENV === 'production') {
      console.log(`📝 Activity logged: ${data.action} by user ${data.userId}`);
    }
    
    return log;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging should never break the main flow
  }
};

// Middleware to automatically log all requests
const activityLogger = (action, entityType = null, getEntityId = null) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Store request data
    const startTime = Date.now();
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    
    // Override json method to capture response
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log after response is sent
      if (req.user?.id) {
        logActivity({
          userId: req.user.id,
          action: action,
          entityType: entityType,
          entityId: getEntityId ? getEntityId(req, data) : null,
          oldData: req.body?.oldData,
          newData: req.body,
          ipAddress: ipAddress,
          userAgent: userAgent,
          status: res.statusCode < 400 ? 'success' : 'error',
          errorMessage: res.statusCode >= 400 ? data?.error?.message : null
        });
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  ACTIONS,
  logActivity,
  activityLogger,
  getClientIp,
  getUserAgent
};