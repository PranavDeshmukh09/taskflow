// src/routes/project.router.js

const router = require('express').Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All project routes require authentication
router.use(authMiddleware);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;