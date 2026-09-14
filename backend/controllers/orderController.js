const { db } = require('../config/database');
const { Op } = require('sequelize');

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id; // From auth middleware

    const where = { userId };
    if (status) where.status = status;

    const totalCount = await db.Order.count({ where });

    const orders = await db.Order.findAll({
      where,
      include: [{
        model: db.OrderItem,
        as: 'orderItems',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth middleware

    const order = await db.Order.findOne({
      where: { id, userId },
      include: [{
        model: db.OrderItem,
        as: 'orderItems',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images', 'price']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new order from cart
exports.createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { cartItems, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = await db.Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images?.[0] || '',
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });
    }

    // Calculate tax (8% for example)
    const taxAmount = subtotal * 0.08;
    // Calculate shipping (free over $50)
    const shippingAmount = subtotal > 50 ? 0 : 10;
    const discountAmount = 0; // TODO: implement coupon/discount system
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create order
    const order = await db.Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
      currency: 'USD',
      ...shippingAddress,
      ...(billingAddress ? { billingFirstName: billingAddress.firstName, billingLastName: billingAddress.lastName, billingAddressLine1: billingAddress.addressLine1, billingAddressLine2: billingAddress.addressLine2, billingCity: billingAddress.city, billingState: billingAddress.state, billingPostalCode: billingAddress.postalCode, billingCountry: billingAddress.country, billingPhone: billingAddress.phone } : {}),
      paymentMethod
    }, { transaction });

    // Create order items
    const orderItems = await db.OrderItem.bulkCreate(
      orderItemsData.map(item => ({ ...item, orderId: order.id })),
      { transaction }
    );

    // Update product stock
    for (const item of cartItems) {
      await db.Product.decrement('stockQuantity', { by: item.quantity, where: { id: item.productId } }, { transaction });
    }

    await transaction.commit();
    res.status(201).json(order);
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await db.Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    // Set timestamps based on status
    if (status === 'shipped') {
      await order.update({ shippedAt: new Date() });
    } else if (status === 'delivered') {
      await order.update({ deliveredAt: new Date() });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const totalCount = await db.Order.count({ where });

    const orders = await db.Order.findAll({
      where,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }, {
        model: db.OrderItem,
        as: 'orderItems',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order statistics (admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await db.sequelize.query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN paymentStatus = 'paid' THEN totalAmount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN paymentStatus = 'paid' THEN totalAmount END) as average_order_value
      FROM Orders
      WHERE createdAt >= CURRENT_DATE - INTERVAL '30 days'
    `, { type: db.sequelize.QueryTypes.SELECT });

    res.json(stats[0]);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};