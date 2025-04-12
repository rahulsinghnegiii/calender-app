const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Increase connection timeout for cold starts on Render
    const connectionTimeout = parseInt(process.env.MONGODB_CONNECTION_TIMEOUT) || 30000;
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: connectionTimeout,
      socketTimeoutMS: connectionTimeout
    };
    
    // Use a fallback local database for development if no URI is provided
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-app';
    
    console.log(`Using connection string: ${connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(connectionString, connectionOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
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