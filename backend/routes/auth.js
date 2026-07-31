const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { login, verify } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

/**
 * GET /api/auth/verify
 */
router.get('/verify', authMiddleware, verify);

module.exports = router;
