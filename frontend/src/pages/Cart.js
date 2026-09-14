import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Card, CardContent, CardMedia, Button, Divider, TextField, CircularProgress } from '@mui/material';
import cartService from '../services/cartService';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartData = await cartService.getCart();
        setCart(cartData);
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await cartService.updateCartItem(itemId, newQuantity);
      // Reload cart to reflect changes
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      // Reload cart to reflect changes
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [] });
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    }
  };

  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 50 ? 0 : 10; // Free shipping over $50
  };

  if (loading) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const subtotal = calculateSubtotal(cart.items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Shopping Cart
      </Typography>

      <Box sx={{ mb: 4 }}>
        {cart.items.map((item) => (
          <Card key={item.id} sx={{ mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <CardMedia
                component="img"
                height="100"
                width="100"
                image={item.productImage || '/images/placeholder.jpg'}
                alt={item.productName}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">
                  {item.productName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const newQuantity = Math.max(1, item.quantity - 1);
                      handleQuantityChange(item.id, newQuantity);
                    }}
                  >
                    -
                  </Button>
                  <Typography variant="body1">{item.quantity}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      handleQuantityChange(item.id, item.quantity + 1);
                    }}
                  >
                    +
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ${item.unitPrice.toFixed(2)} each
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 auto', textAlign: 'right' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '0 0 45%', minWidth: 250 }}>
          <Typography variant="h5" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2">
              Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items):
            </Typography>
            <Typography variant="h6" sx={{ float: 'right' }}>
              ${subtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Tax (8%):
            </Typography>
            <Typography variant="h6" sx={{ float: 'right' }}>
              ${tax.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Shipping:
            </Typography>
            <Typography variant="h6" sx={{ float: 'right' }}>
              ${shipping.toFixed(2)}
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5">
              Total:
            </Typography>
            <Typography variant="h4" sx={{ float: 'right' }}>
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: '0 0 45%', minWidth: 250, p: 3, border: '1px solid', borderRadius: 2 }}>
          <Button variant="contained" size="large" sx={{ width: '100%', mb: 2 }}>
            Proceed to Checkout
          </Button>
          <Button variant="outlined" size="large" sx={{ width: '100%' }}>
            Continue Shopping
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Cart;