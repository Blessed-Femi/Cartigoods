const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Email routes
router.post('/welcome/:userId', protect, emailController.sendWelcomeEmail);
router.post('/order-confirmation/:orderId', protect, emailController.sendOrderConfirmationEmail);
router.post('/shipping/:orderId', protect, emailController.sendShippingEmail);
router.post('/password-reset', protect, emailController.sendPasswordResetEmail);

// Admin-only routes
router.use(protect);
router.post('/promotional', authorize('admin'), emailController.sendPromotionalEmail);
router.get('/templates', authorize('admin'), emailController.getEmailTemplates);
router.put('/templates/:templateId', authorize('admin'), emailController.updateEmailTemplate);

module.exports = router;