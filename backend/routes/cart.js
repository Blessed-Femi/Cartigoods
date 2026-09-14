const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(protect);

// Cart operations
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update-item', cartController.updateCartItem);
router.delete('/remove-item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.get('/count', cartController.getCartCount);

module.exports = router;