const Student = require('../models/Student');
const EventSettings = require('../models/EventSettings');

/**
 * Assigns a student to a non-full group randomly using MongoDB Atlas queries.
 *
 * Guarantees:
 * - Prevents duplicate mobile registration (returns existing group number)
 * - Only assigns to groups that are below `studentsPerGroup` capacity
 * - Randomly picks among available non-full groups
 * - Automatically creates new groups up to totalGroups
 */
async function assignGroup({ name, department, mobile }) {
  const cleanName = String(name || '').trim();
  const cleanDept = String(department || '').trim();
  const cleanMobile = String(mobile || '').trim();

  if (!cleanName || !cleanDept || !cleanMobile) {
    throw new Error('INVALID_INPUT');
  }

  // 1. Check duplicate mobile number
  const existing = await Student.findOne({ mobile: cleanMobile });
  if (existing) {
    return {
      alreadyRegistered: true,
      groupNumber: existing.groupNumber,
    };
  }

  // 2. Fetch event settings
  const settings = await EventSettings.getSettings();

  if (!settings.registrationOpen) {
    throw new Error('REGISTRATION_CLOSED');
  }

  const { totalStudents, studentsPerGroup } = settings;
  const totalGroups = Math.max(1, Math.ceil(totalStudents / studentsPerGroup));

  // 3. Count total registered students
  const totalCount = await Student.countDocuments();
  if (totalCount >= totalStudents) {
    throw new Error('REGISTRATION_FULL');
  }

  // 4. Calculate student count per group using aggregation
  const groupCounts = await Student.aggregate([
    { $group: { _id: '$groupNumber', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  groupCounts.forEach((g) => {
    countMap[g._id] = g.count;
  });

  // 5. Find all groups that are NOT full
  const availableGroups = [];
  for (let i = 1; i <= totalGroups; i++) {
    const currentCount = countMap[i] || 0;
    if (currentCount < studentsPerGroup) {
      availableGroups.push(i);
    }
  }

  if (availableGroups.length === 0) {
    throw new Error('REGISTRATION_FULL');
  }

  // 6. Randomly pick from available non-full groups
  const groupNumber = availableGroups[Math.floor(Math.random() * availableGroups.length)];

  // 7. Format registration date & time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  // 8. Create student document in MongoDB
  const student = await Student.create({
    name: cleanName,
    department: cleanDept,
    mobile: cleanMobile,
    groupNumber,
    registeredDate: dateStr,
    registeredTime: timeStr,
  });

  return {
    alreadyRegistered: false,
    groupNumber: student.groupNumber,
    student,
  };
}

/**
 * Gets counters for all groups (count and max capacity)
 */
async function getGroupCounters() {
  const settings = await EventSettings.getSettings();
  const { totalStudents, studentsPerGroup } = settings;
  const totalGroups = Math.max(1, Math.ceil(totalStudents / studentsPerGroup));

  const groupCounts = await Student.aggregate([
    { $group: { _id: '$groupNumber', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  groupCounts.forEach((g) => {
    countMap[g._id] = g.count;
  });

  const groups = [];
  for (let i = 1; i <= totalGroups; i++) {
    groups.push({
      groupNumber: i,
      count: countMap[i] || 0,
      maxCapacity: studentsPerGroup,
      isFull: (countMap[i] || 0) >= studentsPerGroup,
    });
  }

  return {
    totalStudents,
    studentsPerGroup,
    totalGroups,
    groups,
  };
}

module.exports = {
  assignGroup,
  getGroupCounters,
};
