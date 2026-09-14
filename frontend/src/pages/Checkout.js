import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, TextField, CircularProgress, Container, Card, CardContent, CardActions, Divider } from '@mui/material';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import emailService from '../services/emailService';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Confirmation
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

  // Form data for shipping and billing
  const [formData, setFormData] = useState({
    shipping: {
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: ''
    },
    billing: {
      sameAsShipping: true,
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: ''
    }
  });

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

  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 50 ? 0 : 10; // Free shipping over $50
  };

  const handleFormChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleProceedToPayment = async () => {
    // Validate form
    const requiredFields = [
      'firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'
    ];

    const shipping = formData.shipping;
    for (const field of requiredFields) {
      if (!shipping[field]) {
        setError(`Please fill in all shipping fields`);
        return;
      }
    }

    if (!formData.billing.sameAsShipping) {
      const billing = formData.billing;
      for (const field of requiredFields) {
        if (!billing[field]) {
          setError(`Please fill in all billing fields`);
          return;
        }
      }
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError('');

    try {
      // Calculate totals
      const items = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const subtotal = calculateSubtotal(cart.items);
      const taxAmount = calculateTax(subtotal);
      const shippingAmount = calculateShipping(subtotal);
      const discountAmount = 0; // TODO: implement coupon system
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

      // Create order
      const orderResponse = await orderService.createOrder({
        cartItems: items,
        shippingAddress: formData.shipping,
        billingAddress: formData.billing.sameAsShipping ? null : formData.billing,
        paymentMethod: 'credit_card' // TODO: make this dynamic based on payment method selected
      });

      setOrderId(orderResponse.id);

      // Create payment intent
      const paymentResponse = await paymentService.createPaymentIntent(
        Math.round(totalAmount * 100), // Amount in cents
        'usd'
      );
      setClientSecret(paymentResponse.client_secret);

      // Note: In a real implementation, you would use Stripe.js to confirm the payment
      // For this demo, we'll simulate successful payment
      // const paymentConfirmation = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: cardElement, // Card element from Stripe.js
      //     billing_details: {
      //       name: `${formData.shipping.firstName} ${formData.shipping.lastName}`,
      //       email: userEmail, // from auth
      //       address: {
      //         line1: formData.shipping.addressLine1,
      //         line2: formData.shipping.addressLine2,
      //         city: formData.shipping.city,
      //         state: formData.shipping.state,
      //         postal_code: formData.shipping.postalCode,
      //         country: formData.shipping.country
      //       }
      //     }
      //   }
      // });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo, assume payment succeeded
      // In reality, you'd check paymentConfirmation.status
      setStep(3);

      // Send order confirmation email (would be triggered by backend on order creation)
      // await emailService.sendOrderConfirmationEmail(orderResponse.id);

      // Clear cart
      await cartService.clearCart();
    } catch (err) {
      console.error('Error placing order:', err);
      setPaymentError(err.response?.data?.message || 'Failed to process order');
    } finally {
      setPaymentProcessing(false);
    }
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
  const taxAmount = calculateTax(subtotal);
  const shippingAmount = calculateShipping(subtotal);
  const totalAmount = subtotal + taxAmount + shippingAmount;

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Container maxWidth="lg">
        {step === 1 && (
          <>
            <Typography variant="h4" gutterBottom align="center">
              Checkout
            </Typography>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Shipping Information
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <TextField
                    label="First Name"
                    value={formData.shipping.firstName}
                    onChange={(e) => handleFormChange('shipping', 'firstName', e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="Last Name"
                    value={formData.shipping.lastName}
                    onChange={(e) => handleFormChange('shipping', 'lastName', e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>
                <TextField
                  label="Address Line 1"
                  value={formData.shipping.addressLine1}
                  onChange={(e) => handleFormChange('shipping', 'addressLine1', e.target.value)}
                  required
                  mb={2}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="Address Line 2"
                  value={formData.shipping.addressLine2}
                  onChange={(e) => handleFormChange('shipping', 'addressLine2', e.target.value)}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <TextField
                    label="City"
                    value={formData.shipping.city}
                    onChange={(e) => handleFormChange('shipping', 'city', e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="State"
                    value={formData.shipping.state}
                    onChange={(e) => handleFormChange('shipping', 'state', e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="Postal Code"
                    value={formData.shipping.postalCode}
                    onChange={(e) => handleFormChange('shipping', 'postalCode', e.target.value)}
                    required
                    sx={{ flexGrow: 1 }}
                  />
                </Stack>
                <TextField
                  label="Country"
                  value={formData.shipping.country}
                  onChange={(e) => handleFormChange('shipping', 'country', e.target.value)}
                  required
                  sx={{ width: 200 }}
                />
                <TextField
                  label="Phone Number"
                  value={formData.shipping.phone}
                  onChange={(e) => handleFormChange('shipping', 'phone', e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Billing Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Ship to same address?
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    color={formData.billing.sameAsShipping ? 'primary' : 'disabled'}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      billing: {
                        ...prev.billing,
                        sameAsShipping: !prev.billing.sameAsShipping
                      }
                    }))}
                  >
                    {!formData.billing.sameAsShipping ? 'Use shipping address' : 'Use different address'}
                  </Button>
                </Box>
                {!formData.billing.sameAsShipping && (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <TextField
                        label="First Name"
                        value={formData.billing.firstName}
                        onChange={(e) => handleFormChange('billing', 'firstName', e.target.value)}
                        required
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="Last Name"
                        value={formData.billing.lastName}
                        onChange={(e) => handleFormChange('billing', 'lastName', e.target.value)}
                        required
                        sx={{ flexGrow: 1 }}
                      />
                    </Stack>
                    <TextField
                      label="Address Line 1"
                      value={formData.billing.addressLine1}
                      onChange={(e) => handleFormChange('billing', 'addressLine1', e.target.value)}
                      required
                      mb={2}
                      sx={{ marginBottom: 2 }}
                    />
                    <TextField
                      label="Address Line 2"
                      value={formData.billing.addressLine2}
                      onChange={(e) => handleFormChange('billing', 'addressLine2', e.target.value)}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <TextField
                        label="City"
                        value={formData.billing.city}
                        onChange={(e) => handleFormChange('billing', 'city', e.target.value)}
                        required
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="State"
                        value={formData.billing.state}
                        onChange={(e) => handleFormChange('billing', 'state', e.target.value)}
                        required
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="Postal Code"
                        value={formData.billing.postalCode}
                        onChange={(e) => handleFormChange('billing', 'postalCode', e.target.value)}
                        required
                        sx={{ flexGrow: 1 }}
                      />
                    </Stack>
                    <TextField
                      label="Country"
                      value={formData.billing.country}
                      onChange={(e) => handleFormChange('billing', 'country', e.target.value)}
                      required
                      sx={{ width: 200 }}
                    />
                    <TextField
                      label="Phone Number"
                      value={formData.billing.phone}
                      onChange={(e) => handleFormChange('billing', 'phone', e.target.value)}
                      required
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Order Review
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Items ({cart.items.reduce((sum, item) => sum + item.quantity, 0)}):
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
                    ${taxAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Shipping:
                  </Typography>
                  <Typography variant="h6" sx={{ float: 'right' }}>
                    ${shippingAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5">
                    Total:
                  </Typography>
                  <Typography variant="h4" sx={{ float: 'right' }}>
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button variant="outlined" onClick={() => window.location.href = '/cart'}>
                  Continue Shopping
                </Button>
                <Button variant="contained" color="primary" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </CardActions>
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="h4" gutterBottom align="center">
              Payment
            </Typography>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Items ({cart.items.reduce((sum, item) => sum + item.quantity, 0)}):
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
                    ${taxAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Shipping:
                  </Typography>
                  <Typography variant="h6" sx={{ float: 'right' }}>
                    ${shippingAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5">
                    Total:
                  </Typography>
                  <Typography variant="h4" sx={{ float: 'right' }}>
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {paymentError && (
              <Box sx={{ mb: 4 }}>
                <Typography color="error">
                  {paymentError}
                </Typography>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={paymentProcessing}
                sx={{ width: '80%', maxWidth: 400 }}
                onClick={handlePlaceOrder}
              >
                {paymentProcessing ? 'Processing Payment...' : 'Place Order'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button variant="outlined" onClick={() => setStep(1)}>
                Back to Shipping
              </Button>
            </Box>
          </>
        )}

        {step === 3 && (
          <>
            <Typography variant="h4" gutterBottom align="center">
              Order Confirmed!
            </Typography>

            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" color="success">
                Thank you for your order!
              </Typography>
              <Typography variant="h4">
                Order #{orderId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 4 }}>
                Your order has been placed successfully. A confirmation email has been sent to you.
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Button variant="contained" size="large" onClick={() => {
                  navigate('/');
                }}>
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Checkout;