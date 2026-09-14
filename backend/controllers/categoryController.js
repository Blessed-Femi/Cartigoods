const { db } = require('../config/database');
const { Op } = require('sequelize');
const slugify = require('slugify');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { parentId, isActive, isFeatured } = req.query;

    const where = {};
    if (parentId !== undefined) where.parentId = parentId === 'null' ? null : parentId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

    const categories = await db.Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db.Category.findByPk(id, {
      include: [
        {
          model: db.Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: db.Category,
          as: 'children',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await db.Category.findOne({
      where: { slug },
      include: [
        {
          model: db.Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: db.Category,
          as: 'children',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });
    }

    const category = await db.Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Slug must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;

    // Update slug if name changed
    if (categoryData.name && !categoryData.slug) {
      const category = await db.Category.findByPk(id);
      if (category) {
        categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });
      }
    }

    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update(categoryData);
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products or subcategories
    const productCount = await db.Product.count({ where: { categoryId: id } });
    const childrenCount = await db.Category.count({ where: { parentId: id } });

    if (productCount > 0 || childrenCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing products or subcategories'
      });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};