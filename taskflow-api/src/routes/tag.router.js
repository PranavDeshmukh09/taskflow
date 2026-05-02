// src/routes/tag.router.js

const router = require('express').Router();
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All tag routes require authentication
router.use(authMiddleware);

router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;