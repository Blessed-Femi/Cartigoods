const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User routes (protected)
router.use(protect);
router.get('/', orderController.getUserOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);

// Admin routes (protected + admin only)
router.use(authorize('admin'));
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);
router.get('/stats/summary', orderController.getOrderStats);

module.exports = router;