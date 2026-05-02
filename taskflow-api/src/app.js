// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const authRouter = require('./routes/auth.router');
const projectRouter = require('./routes/project.router');
const tagRouter = require('./routes/tag.router');
const taskRouter = require('./routes/task.router');
const dashboardRouter = require('./routes/dashboard.router');
const userRouter = require('./routes/user.router');
const { errorHandler } = require('./middleware/error.middleware');
const activityRouter = require('./routes/activity.router');

const app = express();
// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/activity', activityRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;