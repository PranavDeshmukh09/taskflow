// src/routes/activity.router.js

const router = require('express').Router();
const db = require('../models');
const authMiddleware = require('../middleware/auth.middleware');

const ActivityLog = db.ActivityLog;

// Get user's activity logs (own logs only)
router.get('/my-logs', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, action, fromDate, toDate } = req.query;
    
    const where = { userId: req.user.id };
    
    if (action) where.action = action;
    if (fromDate) where.createdAt = { [db.Sequelize.Op.gte]: new Date(fromDate) };
    if (toDate) where.createdAt = { ...where.createdAt, [db.Sequelize.Op.lte]: new Date(toDate) };
    
    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      logs: rows,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get activity summary stats
router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const summary = await ActivityLog.findAll({
      where: {
        userId: req.user.id,
        createdAt: { [db.Sequelize.Op.gte]: last7Days }
      },
      attributes: [
        'action',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['action']
    });
    
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// Admin only: Get all logs (for super admin)
router.get('/all', authMiddleware, async (req, res, next) => {
  // Check if user is admin (you can add an isAdmin field to User model)
  const user = req.user;
  
  if (!user.isAdmin) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  
  try {
    const { limit = 50, offset = 0, userId, action } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    
    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: db.User, as: 'user', attributes: ['email', 'displayName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      logs: rows,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;