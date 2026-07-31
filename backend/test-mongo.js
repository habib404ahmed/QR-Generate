require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing connection to:', process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ SUCCESS! Connected to host:', conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
