// src/controllers/project.controller.js - WITH TASK COUNT

const db = require('../models');
const { NotFoundError, ValidationError } = require('../middleware/error.middleware');
const constants = require('../shared/constants');

const Project = db.Project;
const Task = db.Task;

// Get all projects for authenticated user with task count
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    // Get task count for each project
    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.count({
          where: { 
            projectId: project.id, 
            userId: req.user.id 
          }
        });
        
        return {
          ...project.toJSON(),
          taskCount
        };
      })
    );
    
    res.json(projectsWithCount);
  } catch (error) {
    console.error('Get projects error:', error);
    next(error);
  }
};

// Get single project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    const taskCount = await Task.count({
      where: { projectId: project.id, userId: req.user.id }
    });
    
    res.json({
      ...project.toJSON(),
      taskCount
    });
  } catch (error) {
    next(error);
  }
};

// Create new project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, colour } = req.body;
    
    // Check project limit (max 20 per user)
    const projectCount = await Project.count({
      where: { userId: req.user.id }
    });
    
    if (projectCount >= constants.MAX_PROJECTS_PER_USER) {
      throw new ValidationError(`Maximum ${constants.MAX_PROJECTS_PER_USER} projects per user`);
    }
    
    // Validate colour if provided
    if (colour && !constants.ALLOWED_COLOURS.includes(colour)) {
      throw new ValidationError(`Invalid colour. Allowed colours: ${constants.ALLOWED_COLOURS.join(', ')}`);
    }
    
    const project = await Project.create({
      userId: req.user.id,
      name,
      description: description || null,
      colour: colour || constants.ALLOWED_COLOURS[0]
    });
    
    res.status(201).json({
      ...project.toJSON(),
      taskCount: 0
    });
  } catch (error) {
    console.error('Create project error:', error);
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, colour } = req.body;
    
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    if (colour && !constants.ALLOWED_COLOURS.includes(colour)) {
      throw new ValidationError(`Invalid colour. Allowed colours: ${constants.ALLOWED_COLOURS.join(', ')}`);
    }
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (colour) project.colour = colour;
    
    await project.save();
    
    const taskCount = await Task.count({
      where: { projectId: project.id, userId: req.user.id }
    });
    
    res.json({
      ...project.toJSON(),
      taskCount
    });
  } catch (error) {
    console.error('Update project error:', error);
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    // Check if project has tasks
    const taskCount = await Task.count({ 
      where: { projectId: project.id, userId: req.user.id } 
    });
    
    if (taskCount > 0) {
      throw new ValidationError(`Cannot delete project with ${taskCount} tasks. Move or delete tasks first.`);
    }
    
    await project.destroy();
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    next(error);
  }
};