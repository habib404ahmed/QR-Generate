const EventSettings = require('../models/EventSettings');
const Student = require('../models/Student');
const { emitUpdate } = require('../utils/socket');

/**
 * GET /api/settings
 * Public/Admin — fetch event settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/settings
 * Admin only — update settings
 */
const updateSettings = async (req, res, next) => {
  try {
    let settings = await EventSettings.getSettings();

    const {
      eventName,
      collegeName,
      collegeLogo,
      totalStudents,
      studentsPerGroup,
      registrationOpen,
      departments,
    } = req.body;

    if (eventName !== undefined) settings.eventName = eventName;
    if (collegeName !== undefined) settings.collegeName = collegeName;
    if (collegeLogo !== undefined) settings.collegeLogo = collegeLogo;
    if (totalStudents !== undefined) settings.totalStudents = Number(totalStudents);
    if (studentsPerGroup !== undefined) settings.studentsPerGroup = Number(studentsPerGroup);
    if (registrationOpen !== undefined) settings.registrationOpen = Boolean(registrationOpen);
    if (departments !== undefined && Array.isArray(departments)) settings.departments = departments;

    settings.totalGroups = Math.max(1, Math.ceil(settings.totalStudents / settings.studentsPerGroup));

    await settings.save();

    emitUpdate('settings:updated', settings);

    res.json({
      success: true,
      message: 'Event settings updated successfully',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/settings/reset
 * Admin only — reset event (clear all registered students)
 */
const resetEvent = async (req, res, next) => {
  try {
    await Student.deleteMany({});

    emitUpdate('event:reset', { timestamp: new Date() });

    res.json({
      success: true,
      message: 'Event reset successfully. All registrations cleared.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetEvent,
};
