const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('../backend/config/db');
const authRoutes = require('../backend/routes/auth');
const settingsRoutes = require('../backend/routes/settings');
const studentRoutes = require('../backend/routes/students');
const networkRoutes = require('../backend/routes/network');
const errorHandler = require('../backend/middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto DB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('[DB Error]', e.message);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy and online' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/network', networkRoutes);

// 404 fallback for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

app.use(errorHandler);

module.exports = app;
