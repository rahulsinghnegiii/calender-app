const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const goalRoutes = require('./routes/goalRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Connect to Database
connectDB();

// Create Express app
const app = express();

// Debug endpoint to check server status without any middleware interference
app.get('/api/debug/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug endpoint is working',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

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
  /\.onrender\.com$/,
  // Allow all origins in development
  '*'
];

// Apply CORS middleware with more permissive settings to overcome Render issues
app.use(cors({
  origin: '*', // Temporarily allow all origins to debug
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'unknown'}`);
  console.log('Request headers:', JSON.stringify(req.headers));
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Diagnostic middleware to check if we reach this point for API requests
app.use('/api', (req, res, next) => {
  console.log(`API request received: ${req.method} ${req.originalUrl}`);
  // Continue processing the request
  next();
});

// Create diagnostic events endpoint to bypass any potential auth middleware
app.get('/api/debug/events', async (req, res) => {
  try {
    // Return an empty array of events for diagnostic purposes
    res.status(200).json({
      success: true,
      message: 'Debug events endpoint',
      data: []
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);

// Add root route to handle basic API requests
app.get('/', (req, res) => {
  res.json({
    message: 'Calendar API is running',
    endpoints: {
      events: '/api/events',
      goals: '/api/goals',
      tasks: '/api/tasks',
      debug: '/api/debug/status'
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