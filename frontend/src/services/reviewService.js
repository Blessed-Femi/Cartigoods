import api from './api';

const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Create new review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  // Mark review as helpful
  helpfulVote: async (id) => {
    const response = await api.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  // Get top rated products
  getTopRatedProducts: async (params = {}) => {
    const response = await api.get('/reviews/top-rated', { params });
    return response.data;
  }
};

export default reviewService;