// src/controllers/task.controller.js - FIXED VERSION

const { Op } = require('sequelize');
const db = require('../models');
const { NotFoundError, ValidationError } = require('../middleware/error.middleware');
const constants = require('../shared/constants');

const Task = db.Task;
const Project = db.Project;
const Tag = db.Tag;

// Helper: Build filter conditions
const buildFilters = (filters, userId) => {
  const where = { userId };
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.priority) {
    where.priority = filters.priority;
  }
  
  if (filters.projectId && filters.projectId !== 'null') {
    where.projectId = filters.projectId;
  }
  
  if (filters.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    switch (filters.dueDate) {
      case 'today':
        where.dueDate = {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        };
        break;
      case 'week':
        where.dueDate = {
          [Op.gte]: new Date(),
          [Op.lte]: nextWeek
        };
        break;
      case 'overdue':
        where.dueDate = { [Op.lt]: new Date() };
        where.status = { [Op.ne]: 'Done' };
        break;
    }
  }
  
  return where;
};

// Helper: Get sort order
const getSortOrder = (sortBy, sortOrder = 'DESC') => {
  const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const sortMap = {
    'dueDate': [['dueDate', orderDirection]],
    'priority': [
      [db.Sequelize.literal(`CASE priority 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
        ELSE 5 END`), orderDirection],
      ['dueDate', 'ASC']
    ],
    'createdAt': [['createdAt', orderDirection]],
    'title': [['title', orderDirection]]
  };
  
  return sortMap[sortBy] || [['createdAt', 'DESC']];
};

// Get all tasks with filters, sorting, pagination
exports.getAllTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = constants.DEFAULT_PAGE_LIMIT,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      priority,
      projectId,
      dueDate,
      tagId,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = buildFilters({ status, priority, projectId, dueDate }, req.user.id);
    
    // Build include for tags
    const include = [];
    
    if (tagId && tagId !== 'null') {
      include.push({
        model: Tag,
        as: 'tags',
        where: { id: tagId },
        through: { attributes: [] },
        required: true
      });
    } else {
      include.push({
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
        required: false
      });
    }
    
    // Add project include
    include.push({
      model: Project,
      as: 'project',
      attributes: ['id', 'name', 'colour'],
      required: false
    });
    
    // Add search condition
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const sort = getSortOrder(sortBy, sortOrder);
    
    const { count, rows } = await Task.findAndCountAll({
      where,
      include,
      distinct: true,
      order: sort,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      tasks: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: Project, as: 'project', attributes: ['id', 'name', 'colour'] }
      ]
    });
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Create new task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, projectId, tagIds } = req.body;
    
    // Check task limit
    const taskCount = await Task.count({ where: { userId: req.user.id } });
    if (taskCount >= constants.MAX_TASKS_PER_USER) {
      throw new ValidationError(`Maximum ${constants.MAX_TASKS_PER_USER} tasks per user`);
    }
    
    // Validate title
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Task title is required');
    }
    
    // Validate priority
    if (priority && !constants.ALLOWED_PRIORITIES.includes(priority)) {
      throw new ValidationError(`Invalid priority. Allowed: ${constants.ALLOWED_PRIORITIES.join(', ')}`);
    }
    
    // Validate status
    if (status && !constants.ALLOWED_STATUSES.includes(status)) {
      throw new ValidationError(`Invalid status. Allowed: ${constants.ALLOWED_STATUSES.join(', ')}`);
    }
    
    // Validate project ownership if provided
    if (projectId) {
      const project = await Project.findOne({
        where: { id: projectId, userId: req.user.id }
      });
      if (!project) {
        throw new ValidationError('Project not found or access denied');
      }
    }
    
    const task = await Task.create({
      userId: req.user.id,
      title: title.trim(),
      description: description || null,
      priority: priority || constants.DEFAULT_PRIORITY,
      status: status || constants.DEFAULT_STATUS,
      dueDate: dueDate || null,
      projectId: projectId || null
    });
    
    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await Tag.findAll({
        where: { id: tagIds, userId: req.user.id }
      });
      await task.addTags(tags);
    }
    
    // Fetch complete task with associations
    const completeTask = await Task.findOne({
      where: { id: task.id },
      include: [
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: Project, as: 'project' }
      ]
    });
    
    res.status(201).json(completeTask);
  } catch (error) {
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, projectId, tagIds } = req.body;
    
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    // Check if due date changed to reset reminder flag
    if (dueDate && new Date(dueDate).getTime() !== task.dueDate?.getTime()) {
      task.reminderSent = false;
    }
    
    // Validate priority
    if (priority && !constants.ALLOWED_PRIORITIES.includes(priority)) {
      throw new ValidationError(`Invalid priority. Allowed: ${constants.ALLOWED_PRIORITIES.join(', ')}`);
    }
    
    // Validate status
    if (status && !constants.ALLOWED_STATUSES.includes(status)) {
      throw new ValidationError(`Invalid status. Allowed: ${constants.ALLOWED_STATUSES.join(', ')}`);
    }
    
    // Validate project ownership if provided
    if (projectId) {
      const project = await Project.findOne({
        where: { id: projectId, userId: req.user.id }
      });
      if (!project) {
        throw new ValidationError('Project not found or access denied');
      }
    }
    
    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (projectId !== undefined) task.projectId = projectId;
    
    await task.save();
    
    // Update tags if provided
    if (tagIds !== undefined) {
      const tags = await Tag.findAll({
        where: { id: tagIds, userId: req.user.id }
      });
      await task.setTags(tags);
    }
    
    // Fetch updated task with associations
    const updatedTask = await Task.findOne({
      where: { id: task.id },
      include: [
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: Project, as: 'project' }
      ]
    });
    
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// Quick status update (Mark as Done)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    if (status && !constants.ALLOWED_STATUSES.includes(status)) {
      throw new ValidationError(`Invalid status. Allowed: ${constants.ALLOWED_STATUSES.join(', ')}`);
    }
    
    if (status) {
      task.status = status;
    } else {
      // Toggle: if Done -> To-Do, else -> Done
      task.status = task.status === 'Done' ? 'To-Do' : 'Done';
    }
    await task.save();
    
    res.json({ id: task.id, status: task.status });
  } catch (error) {
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    // Remove tag associations
    await task.setTags([]);
    
    await task.destroy();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};