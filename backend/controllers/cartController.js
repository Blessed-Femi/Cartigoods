const { db } = require('../config/database');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or create cart for user
    let cart = await db.Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await db.Cart.create({ userId });
    }

    // Get cart items with product details
    const cartWithItems = await db.Cart.findOne({
      where: { id: cart.id },
      include: [{
        model: db.CartItem,
        as: 'items',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images', 'price']
        }]
      }]
    });

    res.json(cartWithItems || { id: cart.id, items: [] });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid product ID and quantity required' });
    }

    // Find or create cart for user
    let cart = await db.Cart.findOne({ where: { userId } }, { transaction });

    if (!cart) {
      cart = await db.Cart.create({ userId }, { transaction });
    }

    // Check if product exists and has sufficient stock
    const product = await db.Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    // Check if item already in cart
    let cartItem = await db.CartItem.findOne({
      where: { cartId: cart.id, productId }
    }, { transaction });

    if (cartItem) {
      // Update quantity if item already exists
      const newQuantity = cartItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      await cartItem.update({ quantity: newQuantity }, { transaction });
    } else {
      // Create new cart item
      cartItem = await db.CartItem.create({
        cartId: cart.id,
        productId,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images?.[0] || '',
        quantity,
        unitPrice: product.price
      }, { transaction });
    }

    await transaction.commit();

    // Return updated cart
    const updatedCart = await db.Cart.findOne({
      where: { id: cart.id },
      include: [{
        model: db.CartItem,
        as: 'items',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images', 'price']
        }]
      }]
    });

    res.status(201).json(updatedCart);
  } catch (error) {
    await transaction.rollback();
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!itemId || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valid item ID and quantity required' });
    }

    // Find cart item and verify it belongs to user's cart
    const cartItem = await db.CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: db.Cart,
        as: 'cart',
        where: { userId }
      }],
      transaction
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check product stock
    const product = await db.Product.findByPk(cartItem.productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    // Update quantity
    await cartItem.update({ quantity }, { transaction });
    await transaction.commit();

    // Return updated cart
    const updatedCart = await db.Cart.findOne({
      where: { id: cartItem.cartId },
      include: [{
        model: db.CartItem,
        as: 'items',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images', 'price']
        }]
      }]
    });

    res.json(updatedCart);
  } catch (error) {
    await transaction.rollback();
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Find cart item and verify it belongs to user's cart
    const cartItem = await db.CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: db.Cart,
        as: 'cart',
        where: { userId }
      }],
      transaction
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Remove item
    await cartItem.destroy({ transaction });
    await transaction.commit();

    // Return updated cart
    const updatedCart = await db.Cart.findOne({
      where: { id: cartItem.cartId },
      include: [{
        model: db.CartItem,
        as: 'items',
        include: [{
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'images', 'price']
        }]
      }]
    });

    res.json(updatedCart || { id: cartItem.cartId, items: [] });
  } catch (error) {
    await transaction.rollback();
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await db.Cart.findOne({ where: { userId } }, { transaction });

    if (!cart) {
      await transaction.commit();
      return res.json({ message: 'Cart is already empty' });
    }

    // Remove all items
    await db.CartItem.destroy({ where: { cartId: cart.id } }, { transaction });
    await transaction.commit();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get cart count (for badge in header)
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await db.Cart.findOne({ where: { userId } });

    if (!cart) {
      return res.json({ count: 0 });
    }

    const count = await db.CartItem.sum('quantity', { where: { cartId: cart.id } }) || 0;
    res.json({ count: parseInt(count) });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};