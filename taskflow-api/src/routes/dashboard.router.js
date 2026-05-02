// src/routes/dashboard.router.js

const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/trend', dashboardController.getProductivityTrend);

module.exports = router;