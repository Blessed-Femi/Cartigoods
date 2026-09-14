const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Protected routes (admin only)
router.use(protect);
router.post('/', authorize('admin'), productController.createProduct);
router.put('/:id', authorize('admin'), productController.updateProduct);
router.delete('/:id', authorize('admin'), productController.deleteProduct);

module.exports = router;