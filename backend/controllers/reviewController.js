const { db } = require('../config/database');
const { Op } = require('sequelize');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const where = { productId };
    if (rating) where.rating = parseInt(rating);

    const totalCount = await db.Review.count({ where });

    const reviews = await db.Review.findAll({
      where,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Get rating summary
    const ratingSummary = await db.Review.findAll({
      where: { productId },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalReviews'],
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN rating = 5 THEN 1 END`), 'fiveStar'),
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN rating = 4 THEN 1 END`), 'fourStar'),
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN rating = 3 THEN 1 END`), 'threeStar'),
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN rating = 2 THEN 1 END`), 'twoStar'),
        [Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN rating = 1 THEN 1 END`), 'oneStar')
      ]
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      ratingSummary: ratingSummary[0] || {}
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new review
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { productId, orderId, rating, title, comment } = req.body;

    // Validate input
    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Product ID and valid rating (1-5) are required' });
    }

    // Check if product exists
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product (optional: allow multiple reviews)
    const existingReview = await db.Review.findOne({ where: { productId, userId } });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Verify purchase if orderId provided
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await db.Order.findOne({ where: { id: orderId, userId, status: 'delivered' } });
      if (order) {
        // Check if order contains this product
        const orderItem = await db.OrderItem.findOne({ where: { orderId, productId } });
        if (orderItem) {
          isVerifiedPurchase = true;
        }
      }
    }

    // Create review
    const review = await db.Review.create({
      productId,
      userId,
      orderId: orderId || null,
      rating,
      title: title || '',
      comment: comment || '',
      isVerifiedPurchase
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update review (user can only update their own review)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    const review = await db.Review.findOne({ where: { id, userId } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await review.update({
      rating: rating || review.rating,
      title: title !== undefined ? title : review.title,
      comment: comment !== undefined ? comment : review.comment
    });

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete review (user can only delete their own review)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await db.Review.findOne({ where: { id, userId } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get helpful vote for a review (placeholder for future implementation)
exports.helpfulVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await db.Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // TODO: Implement helpful vote tracking with a separate table
    // For now, just increment the counter
    await review.increment('helpfulVotes');

    res.json({ helpfulVotes: review.helpfulVotes + 1 });
  } catch (error) {
    console.error('Helpful vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top rated products
exports.getTopRatedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topRated = await db.sequelize.query(`
      SELECT
        p.*,
        AVG(r.rating) as averageRating,
        COUNT(r.id) as reviewCount
      FROM Products p
      LEFT JOIN Reviews r ON p.id = r.productId
      WHERE p.isActive = true
      GROUP BY p.id
      HAVING COUNT(r.id) >= 1
      ORDER BY averageRating DESC, reviewCount DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(topRated);
  } catch (error) {
    console.error('Get top rated products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};