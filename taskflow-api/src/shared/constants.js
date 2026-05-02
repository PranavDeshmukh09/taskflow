// src/shared/constants.js

module.exports = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  BASE_DELAY_MS: 2000,
  MAX_DELAY_MS: 10000,
  
  
  // Password validation
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*\d).+$/,
  
  // JWT
  JWT_ALGORITHM: 'HS256',
  JWT_EXPIRES_IN: '24h',
  // User limits
  MAX_PROJECTS_PER_USER: 20,
  MAX_TASKS_PER_USER: 500,
  
  // Task defaults
  DEFAULT_PRIORITY: 'Medium',
  DEFAULT_STATUS: 'To-Do',
  
  // Allowed values
  ALLOWED_PRIORITIES: ['Low', 'Medium', 'High', 'Critical'],
  ALLOWED_STATUSES: ['To-Do', 'In Progress', 'Done'],
  ALLOWED_COLOURS: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#A855F7'
  ],
  
  // Pagination
  DEFAULT_PAGE_LIMIT: 20,
  MAX_PAGE_LIMIT: 100,
  
  // Reminders
  REMINDER_CRON_INTERVAL: '*/15 * * * *', // Every 15 minutes
  REMINDER_HOURS_BEFORE: 24,
  EMAIL_RETRY_ATTEMPTS: 3,
  EMAIL_RETRY_BACKOFF_MS: 1000
};