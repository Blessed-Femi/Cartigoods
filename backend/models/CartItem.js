const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Carts',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  // Store snapshot of product data at time of adding to cart
  productName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  productSku: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  productImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  timestamps: true,
  tableName: 'CartItems',
  indexes: [
    {
      fields: ['cartId'],
    },
    {
      fields: ['productId'],
    },
  ],
});

// Define associations
CartItem.associate = (models) => {
  CartItem.belongsTo(models.Cart, {
    foreignKey: 'cartId',
    as: 'cart',
  });
  CartItem.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product',
  });
};

module.exports = CartItem;