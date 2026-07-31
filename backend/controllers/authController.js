const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * POST /api/auth/login
 * Admin login with JWT generation
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const payload = { id: admin._id, username: admin.username, role: admin.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'freshers_super_secret_2026_change_me',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { username: admin.username, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/verify
 * Verify active token
 */
const verify = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

module.exports = {
  login,
  verify,
};
