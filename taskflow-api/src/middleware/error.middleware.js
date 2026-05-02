// src/middleware/error.middleware.js

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class DuplicateEmailError extends AppError {
  constructor(message = 'Email already exists') {
    super(message, 409, 'DUPLICATE_EMAIL');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(err);
  
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Handle Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    if (err.errors[0]?.path === 'email') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists'
        }
      });
    }
  }
  
  // Handle Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors[0]?.message || 'Validation failed'
      }
    });
  }
  
  // Default server error
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'Something went wrong' : err.message
    }
  });
};

module.exports = {
  AppError,
  DuplicateEmailError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UnauthorizedError,
  errorHandler
};