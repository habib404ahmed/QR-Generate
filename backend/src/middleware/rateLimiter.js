// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Strict limiter for registration endpoint — 10 requests per minute per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please wait a minute.',
  },
});

// General API limiter — 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

// Auth limiter — 5 login attempts per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a minute.',
  },
});

module.exports = { registrationLimiter, generalLimiter, authLimiter };
