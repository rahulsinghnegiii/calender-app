const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const eventRoutes = require('./routes/eventRoutes');

// Connect to Database
connectDB();

// Create Express app
const app = express();

// Improved CORS configuration
const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  // Render domains
  'https://calendar-app-frontend-qscz.onrender.com',
  'https://calendar-app-backend.onrender.com',
  // Allow requests from any subdomain of onrender.com
  /\.onrender\.com$/
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      console.log('CORS: Allowed origin:', origin);
      return callback(null, true);
    } else {
      console.error('CORS: Blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// API Routes
app.use('/api/events', eventRoutes);

// Add root route to handle basic API requests
app.get('/', (req, res) => {
  res.json({
    message: 'Calendar API is running',
    endpoints: {
      events: '/api/events'
    }
  });
});

// Serve frontend static files only if they exist
if (process.env.NODE_ENV === 'production') {
  // Check if the dist directory exists
  const frontendBuildPath = path.join(__dirname, '../dist');
  
  if (fs.existsSync(frontendBuildPath) && fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
    console.log('Frontend build directory found, serving static files');
    // Set static folder
    app.use(express.static(frontendBuildPath));

    // Any route that is not an API route should be handled by React
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  } else {
    console.log('Frontend build directory not found, running in API-only mode');
    // Return JSON for any route that's not an API route
    app.get('*', (req, res) => {
      res.status(404).json({
        message: 'Not Found - API endpoints start with /api'
      });
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // Send appropriate error response
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS error: Origin not allowed',
      error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
  }
  
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
}); 