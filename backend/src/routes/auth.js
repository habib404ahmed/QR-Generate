// Auth Routes — Admin Login
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../utils/jwt');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/login
 * Authenticate admin and return JWT
 */
router.post(
  '/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = generateToken({ username, role: 'admin' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
  }
);

/**
 * POST /api/auth/verify
 * Verify current token validity
 */
const authMiddleware = require('../middleware/authMiddleware');
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
