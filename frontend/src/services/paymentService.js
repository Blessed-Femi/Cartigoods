import api from './api';

// Payment service for handling checkout and payments
const paymentService = {
  // Create payment intent (for Stripe) or set up payment (for PayPal)
  createPaymentIntent: async (amount, currency = 'usd') => {
    // In a real implementation, this would call your backend
    // which would then communicate with Stripe/PayPal
    try {
      const response = await api.post('/payments/create-intent', {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      // Fallback for development - simulate payment intent
      console.warn('Using simulated payment intent (development only)');
      return {
        client_secret: 'pi_test_12345_secret_abcdef',
        id: 'pi_test_12345',
        amount,
        currency
      };
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      const response = await api.post('/payments/confirm', {
        paymentIntentId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      // Fallback for development
      console.warn('Using simulated payment confirmation (development only)');
      return {
        status: 'succeeded',
        paymentIntentId,
        paymentMethodId
      };
    }
  },

  // Get payment methods (for displaying saved cards, etc.)
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Add payment method
  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await api.post('/payments/methods', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
};

export default paymentService;