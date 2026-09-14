const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255), // URL to image
    allowNull: true,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  tableName: 'Categories',
  indexes: [
    {
      fields: ['slug'],
    },
    {
      fields: ['parentId'],
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
Category.associate = (models) => {
  Category.hasMany(models.Product, {
    foreignKey: 'categoryId',
    as: 'products',
  });
  Category.belongsTo(models.Category, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  Category.hasMany(models.Category, {
    foreignKey: 'parentId',
    as: 'children',
  });
};

module.exports = Category;