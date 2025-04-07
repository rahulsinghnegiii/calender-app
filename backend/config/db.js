const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-app', {
      // These options are no longer needed in newer mongoose versions but keeping for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ENOTFOUND')) {
      console.error('Check your connection string, hostname could not be reached');
    } else if (error.message.includes('Authentication failed')) {
      console.error('Check your username and password in the connection string');
    }
    process.exit(1);
  }
};

module.exports = connectDB; 