// src/controllers/tag.controller.js

const db = require('../models');
const { NotFoundError, ValidationError } = require('../middleware/error.middleware');
const constants = require('../shared/constants');

const Tag = db.Tag;

// Get all tags for authenticated user
exports.getAllTags = async (req, res, next) => {
  try {
    const { q } = req.query; // Search query for autocomplete
    
    const whereClause = { userId: req.user.id };
    
    if (q) {
      whereClause.name = { [db.Sequelize.Op.iLike]: `%${q}%` };
    }
    
    const tags = await Tag.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: q ? 10 : undefined
    });
    
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

// Get single tag by ID
exports.getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

// Create new tag
exports.createTag = async (req, res, next) => {
  try {
    const { name, colour } = req.body;
    
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Tag name is required');
    }
    
    if (name.length > 30) {
      throw new ValidationError('Tag name must be 30 characters or less');
    }
    
    if (colour && !constants.ALLOWED_COLOURS.includes(colour)) {
      throw new ValidationError(`Invalid colour. Allowed colours: ${constants.ALLOWED_COLOURS.join(', ')}`);
    }
    
    // Check for duplicate tag name for this user
    const existingTag = await Tag.findOne({
      where: { userId: req.user.id, name: name.trim() }
    });
    
    if (existingTag) {
      throw new ValidationError('Tag with this name already exists');
    }
    
    const tag = await Tag.create({
      userId: req.user.id,
      name: name.trim(),
      colour: colour || '#6B7280'
    });
    
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// Update tag
exports.updateTag = async (req, res, next) => {
  try {
    const { name, colour } = req.body;
    
    const tag = await Tag.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    if (name) {
      if (name.length > 30) {
        throw new ValidationError('Tag name must be 30 characters or less');
      }
      
      // Check for duplicate name
      const existingTag = await Tag.findOne({
        where: { userId: req.user.id, name: name.trim(), id: { [db.Sequelize.Op.ne]: tag.id } }
      });
      
      if (existingTag) {
        throw new ValidationError('Tag with this name already exists');
      }
      
      tag.name = name.trim();
    }
    
    if (colour) {
      if (!constants.ALLOWED_COLOURS.includes(colour)) {
        throw new ValidationError(`Invalid colour. Allowed colours: ${constants.ALLOWED_COLOURS.join(', ')}`);
      }
      tag.colour = colour;
    }
    
    await tag.save();
    
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

// Delete tag
exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    
    // Remove tag from all tasks (junction table cleanup in Chunk 3)
    if (db.TaskTag) {
      await db.TaskTag.destroy({ where: { tagId: tag.id } });
    }
    
    await tag.destroy();
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
};