// Student Routes — MySQL Edition
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { registrationLimiter, generalLimiter } = require('../middleware/rateLimiter');
const {
  assignGroup,
  getAllStudents,
  updateStudent,
  deleteStudent,
  moveStudent,
  getSettings,
  getGroupCounters,
} = require('../services/groupAssignment');

/**
 * POST /api/students/register
 * Public — student registration with group assignment
 */
router.post(
  '/register',
  registrationLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('mobile')
      .trim()
      .matches(/^\d{10}$/)
      .withMessage('Mobile number must be exactly 10 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, department, mobile } = req.body;

    try {
      const settings = await getSettings();

      if (!settings.registrationOpen) {
        return res.status(403).json({
          success: false,
          message: 'Registration is currently closed.',
        });
      }

      if (!settings.departments.includes(department)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department selected.',
        });
      }

      const result = await assignGroup({ name, department, mobile });

      if (result.alreadyRegistered) {
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: `You are already registered! Your group is ${result.groupNumber}.`,
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
      console.error('[Register]', err);
      return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }
);

/**
 * GET /api/students
 * Admin only — retrieve all students + group counters
 */
router.get('/', authMiddleware, generalLimiter, async (req, res) => {
  try {
    const [students, counters] = await Promise.all([getAllStudents(), getGroupCounters()]);
    res.json({ success: true, data: { students, counters } });
  } catch (err) {
    console.error('[Get Students]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

/**
 * PUT /api/students/:mobile
 * Admin only — edit student name or department
 */
router.put(
  '/:mobile',
  authMiddleware,
  [
    param('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      await updateStudent(req.params.mobile, req.body);
      res.json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
      console.error('[Update Student]', err);
      res.status(500).json({ success: false, message: 'Failed to update student' });
    }
  }
);

/**
 * DELETE /api/students/:mobile
 * Admin only — delete a student and decrement group counter
 */
router.delete(
  '/:mobile',
  authMiddleware,
  [param('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      await deleteStudent(req.params.mobile);
      res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
      if (err.message === 'Student not found') {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      console.error('[Delete Student]', err);
      res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
  }
);

/**
 * POST /api/students/move
 * Admin only — move student to another group
 */
router.post(
  '/move',
  authMiddleware,
  [
    body('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number'),
    body('newGroupNumber').isInt({ min: 1 }).withMessage('Invalid group number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      await moveStudent(req.body.mobile, req.body.newGroupNumber);
      res.json({ success: true, message: 'Student moved successfully' });
    } catch (err) {
      if (err.message === 'Student not found') {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      console.error('[Move Student]', err);
      res.status(500).json({ success: false, message: 'Failed to move student' });
    }
  }
);

/**
 * POST /api/students/add
 * Admin only — manually add a student (bypasses registration_open check)
 */
router.post(
  '/add',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('mobile').trim().matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, department, mobile } = req.body;

    try {
      const result = await assignGroup({ name, department, mobile });

      if (result.alreadyRegistered) {
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: `Student already registered in Group ${result.groupNumber}.`,
          groupNumber: result.groupNumber,
        });
      }

      return res.status(201).json({
        success: true,
        message: `Student added to Group ${result.groupNumber}.`,
        groupNumber: result.groupNumber,
      });
    } catch (err) {
      if (err.message === 'REGISTRATION_FULL') {
        return res.status(403).json({ success: false, message: 'All groups are full.' });
      }
      console.error('[Add Student]', err);
      return res.status(500).json({ success: false, message: 'Failed to add student' });
    }
  }
);

module.exports = router;
