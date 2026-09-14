const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  helpfulVotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'Reviews',
  indexes: [
    {
      fields: ['productId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Define associations
Review.associate = (models) => {
  Review.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product',
  });
  Review.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  Review.belongsTo(models.Order, {
    foreignKey: 'orderId',
    as: 'order',
  });
};

module.exports = Review;