const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI =
  'mongodb+srv://kingofkalilinux404_db_user:DaJJhVwpk9qCsjgp@cluster0.x7m7owd.mongodb.net/freshers_group_generator?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      autoIndex: true,
    });

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
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
