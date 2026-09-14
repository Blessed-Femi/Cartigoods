const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'pending',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  // Shipping information
  shippingFirstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  shippingLastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  shippingAddressLine1: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  shippingAddressLine2: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  shippingCity: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  shippingState: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  shippingPostalCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  shippingCountry: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  shippingPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  // Billing information (can be same as shipping)
  billingFirstName: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  billingLastName: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  billingAddressLine1: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  billingAddressLine2: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  billingCity: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  billingState: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  billingPostalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  billingCountry: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  billingPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  // Payment information
  paymentMethod: {
    type: DataTypes.STRING(50), // e.g., 'credit_card', 'paypal', 'stripe'
    allowNull: true,
  },
  paymentId: {
    type: DataTypes.STRING(100), // Payment gateway transaction ID
    allowNull: true,
  },
  // Notes
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Timestamps for fulfillment
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Orders',
  indexes: [
    {
      fields: ['orderNumber'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentStatus'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Define associations
Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  Order.hasMany(models.OrderItem, {
    foreignKey: 'orderId',
    as: 'orderItems',
  });
};

module.exports = Order;