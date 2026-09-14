const { db } = require('../config/database');
const { Op } = require('sequelize');

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      search = '',
      categoryId,
      minPrice,
      maxPrice,
      isFeatured,
      isActive
    } = req.query;

    // Build where clause
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (minPrice !== undefined) where.price = { ...(where.price || {}), [Op.gte]: parseFloat(minPrice) };
    if (maxPrice !== undefined) where.price = { ...(where.price || {}), [Op.lte]: parseFloat(maxPrice) };
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Get total count for pagination
    const totalCount = await db.Product.count({ where });

    // Get products with pagination
    const products = await db.Product.findAll({
      where,
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id, {
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get average rating and review count
    const reviewStats = await db.Review.findAll({
      where: { productId: id },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'reviewCount']
      ]
    });

    const productData = product.toJSON();
    productData.averageRating = reviewStats[0]?.averageRating || 0;
    productData.reviewCount = reviewStats[0]?.reviewCount || 0;

    res.json(productData);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString().substring(6);
      productData.sku = `PROD-${timestamp}`;
    }

    const product = await db.Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'SKU must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const product = await db.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update(productData);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await db.Product.findAll({
      where: { isFeatured: true, isActive: true },
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      limit: limit,
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const where = { categoryId, isActive: true };

    const totalCount = await db.Product.count({ where });

    const products = await db.Product.findAll({
      where,
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};