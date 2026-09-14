const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
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
  // Store snapshot of product data at time of purchase
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
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  timestamps: true,
  tableName: 'OrderItems',
  indexes: [
    {
      fields: ['orderId'],
    },
    {
      fields: ['productId'],
    },
  ],
});

// Define associations
OrderItem.associate = (models) => {
  OrderItem.belongsTo(models.Order, {
    foreignKey: 'orderId',
    as: 'order',
  });
  OrderItem.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product',
  });
};

module.exports = OrderItem;