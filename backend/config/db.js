const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Increase connection timeout for cold starts on Render
    const connectionTimeout = parseInt(process.env.MONGODB_CONNECTION_TIMEOUT) || 120000;
    const socketTimeout = parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 120000;
    // Note: keepAlive is handled differently in newer MongoDB drivers
    
    console.log(`Connection settings: timeout=${connectionTimeout}ms, socketTimeout=${socketTimeout}ms`);
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: connectionTimeout,
      socketTimeoutMS: socketTimeout,
      // Pool size for better performance
      minPoolSize: 5,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: connectionTimeout,
      heartbeatFrequencyMS: 30000
    };
    
    // Use a fallback local database for development if no URI is provided
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-app';
    
    console.log(`Using connection string: ${connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Log process memory for debugging
    const memoryUsage = process.memoryUsage();
    console.log(`Process memory: RSS=${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap=${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
    
    // Connect with a longer retry strategy for cold starts
    mongoose.connection.on('connecting', () => {
      console.log('Connecting to MongoDB...');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB!');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    const conn = await mongoose.connect(connectionString, connectionOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Error type: ${error.name}, code: ${error.code}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('Check your connection string, hostname could not be reached');
    } else if (error.message.includes('Authentication failed')) {
      console.error('Check your username and password in the connection string');
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.warn('Running in production without database connection, API will use mock data');
      return false;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB; 