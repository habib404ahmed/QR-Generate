const Student = require('../models/Student');
const EventSettings = require('../models/EventSettings');
const { assignGroup, getGroupCounters } = require('../utils/groupAssignment');
const { emitUpdate } = require('../utils/socket');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

/**
 * POST /api/students/register
 * Public — student group registration
 */
const register = async (req, res, next) => {
  try {
    const { name, department, mobile } = req.body;

    const result = await assignGroup({ name, department, mobile });

    if (result.alreadyRegistered) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: `You are already registered! Your group is Group ${result.groupNumber}.`,
        groupNumber: result.groupNumber,
      });
    }

    emitUpdate('student:registered', {
      student: result.student,
      groupNumber: result.groupNumber,
    });

    return res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message: `Registration successful! You have been assigned to Group ${result.groupNumber}.`,
      groupNumber: result.groupNumber,
    });
  } catch (err) {
    if (err.message === 'INVALID_INPUT') {
      return res.status(400).json({ success: false, message: 'Please enter valid Name, Department, and 10-digit Mobile number.' });
    }
    if (err.message === 'REGISTRATION_CLOSED') {
      return res.status(403).json({ success: false, message: 'Registration is currently closed.' });
    }
    if (err.message === 'REGISTRATION_FULL') {
      return res.status(403).json({ success: false, message: 'All groups are full. Registration is closed.' });
    }
    next(err);
  }
};

/**
 * GET /api/students
 * Admin only — get all students with optional MongoDB search and filtering
 */
const getAll = async (req, res, next) => {
  try {
    const { search, department, groupNumber } = req.query;

    const query = {};

    if (department) {
      query.department = department;
    }

    if (groupNumber) {
      query.groupNumber = Number(groupNumber);
    }

    if (search && search.trim()) {
      const q = search.trim();
      const isNum = !isNaN(q);

      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
      ];

      if (isNum) {
        query.$or.push({ groupNumber: Number(q) });
      }
    }

    const [students, counters] = await Promise.all([
      Student.find(query).sort({ createdAt: 1 }),
      getGroupCounters(),
    ]);

    const formattedStudents = students.map((s) => ({
      id: s._id,
      name: s.name,
      department: s.department,
      mobile: s.mobile,
      groupNumber: s.groupNumber,
      registeredDate: s.registeredDate,
      registeredTime: s.registeredTime,
      registeredAt: s.createdAt,
    }));

    res.json({
      success: true,
      data: {
        students: formattedStudents,
        counters,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/:mobile
 * Admin only — edit student record
 */
const update = async (req, res, next) => {
  try {
    const { mobile } = req.params;
    const { name, department } = req.body;

    const student = await Student.findOne({ mobile });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (name) student.name = name.trim();
    if (department) student.department = department.trim();

    await student.save();

    emitUpdate('student:updated', student);

    res.json({
      success: true,
      message: 'Student record updated successfully',
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/:mobile
 * Admin only — delete student record
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { mobile } = req.params;

    const student = await Student.findOneAndDelete({ mobile });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    emitUpdate('student:deleted', { mobile, groupNumber: student.groupNumber });

    res.json({
      success: true,
      message: 'Student record deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/move
 * Admin only — move student to another group
 */
const moveStudent = async (req, res, next) => {
  try {
    const { mobile, newGroupNumber } = req.body;

    const student = await Student.findOne({ mobile });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const oldGroup = student.groupNumber;
    student.groupNumber = Number(newGroupNumber);
    await student.save();

    emitUpdate('student:moved', { mobile, oldGroup, newGroup: student.groupNumber });

    res.json({
      success: true,
      message: `Moved ${student.name} to Group ${student.groupNumber}`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/add
 * Admin only — manually add student (bypasses registration status check)
 */
const addStudent = async (req, res, next) => {
  try {
    const { name, department, mobile } = req.body;

    const existing = await Student.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: `Student already registered in Group ${existing.groupNumber}.`,
        groupNumber: existing.groupNumber,
      });
    }

    const settings = await EventSettings.getSettings();
    const { totalStudents, studentsPerGroup } = settings;
    const totalGroups = Math.max(1, Math.ceil(totalStudents / studentsPerGroup));

    // Calculate group counts
    const groupCounts = await Student.aggregate([
      { $group: { _id: '$groupNumber', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    groupCounts.forEach((g) => { countMap[g._id] = g.count; });

    const availableGroups = [];
    for (let i = 1; i <= totalGroups; i++) {
      if ((countMap[i] || 0) < studentsPerGroup) {
        availableGroups.push(i);
      }
    }

    if (availableGroups.length === 0) {
      return res.status(403).json({ success: false, message: 'All groups are full.' });
    }

    const groupNumber = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    const now = new Date();

    const student = await Student.create({
      name: name.trim(),
      department: department.trim(),
      mobile: mobile.trim(),
      groupNumber,
      registeredDate: now.toISOString().split('T')[0],
      registeredTime: now.toTimeString().split(' ')[0],
    });

    emitUpdate('student:registered', { student, groupNumber });

    res.status(201).json({
      success: true,
      message: `Student added to Group ${groupNumber}.`,
      groupNumber,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/export/csv
 * Direct CSV download from MongoDB
 */
const exportCSV = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: 1 });
    const fields = [
      { label: '#', value: (row, idx) => idx + 1 },
      { label: 'Full Name', value: 'name' },
      { label: 'Department', value: 'department' },
      { label: 'Mobile Number', value: 'mobile' },
      { label: 'Assigned Group', value: (row) => `Group ${row.groupNumber}` },
      { label: 'Registered Date', value: 'registeredDate' },
      { label: 'Registered Time', value: 'registeredTime' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment('students_registration.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/export/excel
 * Direct Excel download from MongoDB using exceljs
 */
const exportExcel = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    worksheet.columns = [
      { header: '#', key: 'idx', width: 8 },
      { header: 'Full Name', key: 'name', width: 25 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Mobile Number', key: 'mobile', width: 18 },
      { header: 'Assigned Group', key: 'group', width: 18 },
      { header: 'Registered Date', key: 'date', width: 18 },
      { header: 'Registered Time', key: 'time', width: 18 },
    ];

    students.forEach((s, idx) => {
      worksheet.addRow({
        idx: idx + 1,
        name: s.name,
        department: s.department,
        mobile: s.mobile,
        group: `Group ${s.groupNumber}`,
        date: s.registeredDate || '—',
        time: s.registeredTime || '—',
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('students_registration.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  getAll,
  update,
  deleteStudent,
  moveStudent,
  addStudent,
  exportCSV,
  exportExcel,
};
