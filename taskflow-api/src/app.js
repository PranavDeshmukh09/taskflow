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