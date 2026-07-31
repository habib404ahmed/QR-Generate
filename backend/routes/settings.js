const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, resetEvent } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/settings
 * Public
 */
router.get('/', getSettings);

/**
 * PUT /api/settings
 * Admin only
 */
router.put('/', authMiddleware, updateSettings);

/**
 * POST /api/settings/reset
 * Admin only
 */
router.post('/reset', authMiddleware, resetEvent);

module.exports = router;
