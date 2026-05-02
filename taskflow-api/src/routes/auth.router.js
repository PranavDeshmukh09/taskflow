// src/routes/auth.router.js

const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
// Logout route
router.post('/logout', authMiddleware, authController.logout);

// Add this route at the end (for testing only)
router.post('/test-email', async (req, res) => {
  const { testEmailConfig, sendResetEmail } = require('../shared/emailService');
  
  const isValid = await testEmailConfig();
  if (!isValid) {
    return res.status(500).json({ error: 'Email config invalid' });
  }
  
  const result = await sendResetEmail(req.body.email || 'test@example.com', 'test-token-123');
  res.json({ success: result });
});
module.exports = router;