const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    unique: true, // One cart per user
  },
}, {
  timestamps: true,
  tableName: 'Carts',
  indexes: [
    {
      fields: ['userId'],
      unique: true,
    },
  ],
});

// Define associations
Cart.associate = (models) => {
  Cart.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  Cart.hasMany(models.CartItem, {
    foreignKey: 'cartId',
    as: 'items',
    onDelete: 'CASCADE',
  });
};

module.exports = Cart;