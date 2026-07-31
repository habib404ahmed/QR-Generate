const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { registrationLimiter, generalLimiter } = require('../middleware/rateLimiter');
const {
  register,
  getAll,
  update,
  deleteStudent,
  moveStudent,
  addStudent,
  exportCSV,
  exportExcel,
} = require('../controllers/studentController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * POST /api/students/register
 * Public — Student registration with rate limiting
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
  validate,
  register
);

/**
 * GET /api/students
 * Admin only — Get all students with MongoDB search & filtering
 */
router.get('/', authMiddleware, generalLimiter, getAll);

/**
 * GET /api/students/export/csv
 * Admin only — CSV Export
 */
router.get('/export/csv', authMiddleware, exportCSV);

/**
 * GET /api/students/export/excel
 * Admin only — Excel Export
 */
router.get('/export/excel', authMiddleware, exportExcel);

/**
 * PUT /api/students/:mobile
 * Admin only — Edit student
 */
router.put(
  '/:mobile',
  authMiddleware,
  [
    param('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  ],
  validate,
  update
);

/**
 * DELETE /api/students/:mobile
 * Admin only — Delete student
 */
router.delete(
  '/:mobile',
  authMiddleware,
  [param('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number')],
  validate,
  deleteStudent
);

/**
 * POST /api/students/move
 * Admin only — Move student to another group
 */
router.post(
  '/move',
  authMiddleware,
  [
    body('mobile').matches(/^\d{10}$/).withMessage('Invalid mobile number'),
    body('newGroupNumber').isInt({ min: 1 }).withMessage('Invalid group number'),
  ],
  validate,
  moveStudent
);

/**
 * POST /api/students/add
 * Admin only — Manually add student
 */
router.post(
  '/add',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('mobile').trim().matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  ],
  validate,
  addStudent
);

module.exports = router;
