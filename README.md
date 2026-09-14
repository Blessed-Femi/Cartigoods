# Cartigoods E-commerce Platform

A full-stack e-commerce web application built with React, Node.js, Express, and PostgreSQL.

## Features

### Frontend (React)
- Responsive design with Material-UI
- Home page with featured products and categories
- Product listing and detailed product views
- Shopping cart functionality
- User authentication (login/register)
- Admin dashboard for store management
- Checkout process

### Backend (Node.js/Express)
- RESTful API with Express.js
- PostgreSQL database with Sequelize ORM
- User authentication with JWT
- Password hashing with bcrypt
- Input validation and error handling
- Security headers with Helmet
- CORS protection
- Request logging with Morgan

## Project Structure

```
Cartigoods/
├── backend/                  # Node.js/Express server
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── config/               # Configuration files
│   ├── .env                  # Environment variables
│   ├── server.js             # Entry point
│   └── package.json          # Backend dependencies
└── frontend/                 # React frontend application
    ├── public/               # Static assets
    └── src/                  # Source code
        ├── components/       # Reusable components
        ├── pages/            # Page components
        ├── App.js            # Main app component
        └── index.js          # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on the example:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cartigoods
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_key
   BCRYPT_SALT_ROUNDS=10
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will run on `http://localhost:3000`

### Database Setup
1. Create a PostgreSQL database:
   ```bash
   createdb cartigoods
   ```
2. The backend will automatically sync the models on startup using Sequelize

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

## Environment Variables

### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT tokens
- `BCRYPT_SALT_ROUNDS` - Salt rounds for password hashing

## Future Enhancements

- Product management (CRUD operations)
- Order management system
- Payment gateway integration (Stripe/PayPal)
- Email notifications
- Product reviews and ratings
- Wishlist functionality
- Admin analytics and reporting
- Mobile app (React Native)
- Docker containerization
- CI/CD pipeline

## License

This project is licensed under the MIT License.