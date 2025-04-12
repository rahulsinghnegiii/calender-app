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

// Global vars to track connection state
let databaseConnected = false;

// Express app setup should continue even if DB connection fails
const app = express();

// Apply CORS middleware with more permissive settings for production
app.use(cors({
  origin: '*', // Allow all origins in development and production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Basic health check endpoint that doesn't require database
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    databaseConnected,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Debug endpoint to check server status without any middleware interference
app.get('/api/debug/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug endpoint is working',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    databaseConnected
  });
});

// Add request logging middleware with more details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Configure body-parser middleware before route handlers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Additional express json middleware for redundancy
app.use(express.json({ limit: '10mb' }));

// Create diagnostic events endpoint that always works even without DB
app.get('/api/debug/events', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Debug events endpoint',
      databaseConnected,
      data: []
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(200).json({ 
      success: false, 
      error: error.message,
      data: [] 
    });
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
    databaseStatus: databaseConnected ? 'connected' : 'disconnected',
    endpoints: {
      events: '/api/events',
      goals: '/api/goals',
      tasks: '/api/tasks',
      health: '/api/health',
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
  
  // Always return 200 for API errors to prevent frontend issues
  if (req.path.startsWith('/api/')) {
    return res.status(200).json({
      success: false,
      message: 'API error occurred',
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      data: []
    });
  }
  
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  
  // Connect to database after server is running
  try {
    databaseConnected = await connectDB();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    databaseConnected = false;
  }
}); 