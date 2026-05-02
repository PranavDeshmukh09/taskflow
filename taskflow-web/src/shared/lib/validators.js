// src/shared/lib/validators.js

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProjectName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Project name is required';
  }
  if (name.length > 60) {
    return 'Project name must be 60 characters or less';
  }
  return null;
};

export const validateTaskTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return 'Task title is required';
  }
  if (title.length > 120) {
    return 'Task title must be 120 characters or less';
  }
  return null;
};

export const validateTagName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Tag name is required';
  }
  if (name.length > 30) {
    return 'Tag name must be 30 characters or less';
  }
  return null;
};