const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected routes (admin only)
router.use(protect);
router.post('/', authorize('admin'), categoryController.createCategory);
router.put('/:id', authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router;