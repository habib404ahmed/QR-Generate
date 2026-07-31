// Settings Routes — MySQL Edition
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getSettings, updateSettings, calculateTotalGroups, resetEvent } = require('../services/groupAssignment');
const { syncGroupCounters, getPool } = require('../services/database');

/**
 * GET /api/settings
 * Public — students and admin can read settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    const totalGroups = calculateTotalGroups(settings.totalStudents, settings.studentsPerGroup);
    res.json({ success: true, data: { ...settings, totalGroups } });
  } catch (err) {
    console.error('[Settings GET]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/settings
 * Admin only — update event settings
 */
router.put(
  '/',
  authMiddleware,
  [
    body('eventName').trim().notEmpty().withMessage('Event name is required'),
    body('totalStudents').isInt({ min: 1 }).withMessage('Total students must be a positive integer'),
    body('studentsPerGroup').isInt({ min: 1 }).withMessage('Students per group must be a positive integer'),
    body('registrationOpen').isBoolean().withMessage('registrationOpen must be boolean'),
    body('departments').isArray({ min: 1 }).withMessage('At least one department is required'),
    body('collegeName').trim().notEmpty().withMessage('College name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const result = await updateSettings(req.body);
      res.json({ success: true, message: 'Settings updated successfully', data: result });
    } catch (err) {
      console.error('[Settings PUT]', err);
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  }
);

/**
 * POST /api/settings/reset
 * Admin only — wipe all student data and reset event
 */
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    await resetEvent();
    res.json({ success: true, message: 'Event has been reset. All student data deleted.' });
  } catch (err) {
    console.error('[Settings RESET]', err);
    res.status(500).json({ success: false, message: 'Failed to reset event' });
  }
});

module.exports = router;
