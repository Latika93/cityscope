// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // For MongoDB
const cors = require('cors');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://cityscope-okye.vercel.app',
      'https://cityscope-gsbp.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('Allowed Origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS Error: Origin not allowed:', origin);
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cityscope')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Cityscope API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            posts: '/api/posts',
            users: '/api/users'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ 
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
        });
    }
    
    res.status(500).json({ message: 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});