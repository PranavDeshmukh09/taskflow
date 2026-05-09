const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const authRouter = require('./routes/auth.router');
const projectRouter = require('./routes/project.router');
