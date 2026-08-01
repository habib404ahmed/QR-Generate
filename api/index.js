const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const connectDB = require('../backend/config/db');
const Admin = require('../backend/models/Admin');
const EventSettings = require('../backend/models/EventSettings');
const { assignGroup } = require('../backend/utils/groupAssignment');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ success: true, message: 'Server is healthy and online' });
});

// Auth Login
app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const cleanPassword = String(password).trim();

    let admin = await Admin.findOne({ username: cleanUsername });
    if (!admin && cleanUsername === 'admin' && cleanPassword === 'admin123') {
      admin = await Admin.create({ username: 'admin', password: 'admin123', role: 'superadmin' });
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'freshers_super_secret_2026_change_me',
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { username: admin.username, role: admin.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Student Registration
app.post(['/api/students/register', '/students/register'], async (req, res) => {
  try {
    const { name, department, mobile } = req.body;
    const result = await assignGroup({ name, department, mobile });
    if (result.alreadyRegistered) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: `You are already registered! Your group is Group ${result.groupNumber}.`,
        groupNumber: result.groupNumber,
      });
    }
    return res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message: `Registration successful! You have been assigned to Group ${result.groupNumber}.`,
      groupNumber: result.groupNumber,
    });
  } catch (err) {
    if (err.message === 'REGISTRATION_CLOSED') {
      return res.status(403).json({ success: false, message: 'Registration is currently closed.' });
    }
    if (err.message === 'REGISTRATION_FULL') {
      return res.status(403).json({ success: false, message: 'All groups are full. Registration is closed.' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback to full backend server app for remaining admin endpoints
const fullServerApp = require('../backend/server');
app.use(fullServerApp);

module.exports = app;
