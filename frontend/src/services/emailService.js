import api from './api';

// Email service for handling email notifications
// Note: Actual email sending happens on the backend for security
// This service interacts with backend endpoints that trigger emails
const emailService = {
  // Send welcome email (triggered after user registration)
  sendWelcomeEmail: async (userId) => {
    try {
      const response = await api.post(`/emails/welcome/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send order confirmation email
  sendOrderConfirmationEmail: async (orderId) => {
    try {
      const response = await api.post(`/emails/order-confirmation/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  },

  // Send shipping notification email
  sendShippingEmail: async (orderId, trackingInfo) => {
    try {
      const response = await api.post(`/emails/shipping/${orderId}`, {
        trackingInfo
      });
      return response.data;
    } catch (error) {
      console.error('Error sending shipping email:', error);
      throw error;
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email, resetToken) => {
    try {
      const response = await api.post('/emails/password-reset', {
        email,
        resetToken
      });
      return response.data;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  // Send promotional email (admin only)
  sendPromotionalEmail: async (emailData) => {
    try {
      const response = await api.post('/emails/promotional', emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending promotional email:', error);
      throw error;
    }
  },

  // Get email templates (admin only)
  getEmailTemplates: async () => {
    try {
      const response = await api.get('/emails/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  },

  // Update email template (admin only)
  updateEmailTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/emails/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }
};

export default emailService;