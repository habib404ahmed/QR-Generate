const rateLimit = require('express-rate-limit');

// Registration rate limiter — high limit for mass Wi-Fi event registrations (max 1000 requests per 15 minutes)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter — max 2000 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  registrationLimiter,
  generalLimiter,
};
