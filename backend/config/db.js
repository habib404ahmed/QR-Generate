const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freshers_group_generator';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
      family: 4, // Force IPv4 resolution for Windows network environments
    });

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
  }
};

// Auto-reconnect & Event Listeners
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB Connection Lost. Attempting auto-reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB Reconnected Successfully');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB Connection Error: ${err.message}`);
});

module.exports = connectDB;
