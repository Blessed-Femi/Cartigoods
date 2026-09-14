const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB } = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cartigoods E-commerce API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Product routes
app.use('/api/products', require('./routes/products'));

// Category routes
app.use('/api/categories', require('./routes/categories'));

// Cart routes
app.use('/api/cart', require('./routes/cart'));

// Payment routes
app.use('/api/payments', require('./routes/payments'));

// Order routes
app.use('/api/orders', require('./routes/orders'));

// Review routes
app.use('/api/reviews', require('./routes/reviews'));

// Email routes
app.use('/api/emails', require('./routes/emails'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;