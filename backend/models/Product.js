const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  weight: {
    type: DataTypes.FLOAT, // in kg
    allowNull: true,
  },
  dimensions: {
    type: DataTypes.JSON, // {length, width, height} in cm
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  seoTitle: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  seoDescription: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Products',
  indexes: [
    {
      fields: ['sku'],
    },
    {
      fields: ['categoryId'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['isFeatured'],
    },
  ],
});

// Define associations
Product.associate = (models) => {
  Product.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });
  Product.hasMany(models.Review, {
    foreignKey: 'productId',
    as: 'reviews',
  });
  Product.hasMany(models.OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems',
  });
};

module.exports = Product;