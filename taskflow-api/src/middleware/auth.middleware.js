const jwt = require('jsonwebtoken');
const db = require('../models');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        }
      });
    }
    
   const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await db.User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      });
    }
    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedTime = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (passwordChangedTime > decoded.iat) {
        return res.status(401).json({
          error: {
            code: 'TOKEN_INVALIDATED',
            message: 'Password changed, please login again'
          }
        });
      }
    }
    
    req.user = user;
    next();