const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI =
  'mongodb+srv://kingofkalilinux404_db_user:DaJJhVwpk9qCsjgp@cluster0.x7m7owd.mongodb.net/freshers_group_generator?retryWrites=true&w=majority';

// Mongoose Models
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    groupNumber: { type: Number, required: true },
    registeredDate: { type: String },
    registeredTime: { type: String },
  },
  { timestamps: true }
);

const eventSettingsSchema = new mongoose.Schema(
  {
    eventName: { type: String, default: 'Freshers Orientation 2026' },
    collegeName: { type: String, default: 'Your College' },
    totalStudents: { type: Number, default: 80 },
    studentsPerGroup: { type: Number, default: 5 },
    totalGroups: { type: Number, default: 16 },
    registrationOpen: { type: Boolean, default: true },
    departments: { type: [String], default: ['BCA', 'B.Tech'] },
  },
  { timestamps: true }
);

eventSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      eventName: 'Freshers Orientation 2026',
      collegeName: 'Your College',
      totalStudents: 80,
      studentsPerGroup: 5,
      totalGroups: 16,
      registrationOpen: true,
      departments: ['BCA', 'B.Tech'],
    });
  }
  return settings;
};

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const EventSettings = mongoose.models.EventSettings || mongoose.model('EventSettings', eventSettingsSchema);

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI || DEFAULT_ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }
}

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

  // 4. Calculate student count per group
  const groupCounts = await Student.aggregate([{ $group: { _id: '$groupNumber', count: { $sum: 1 } } }]);
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

  // 7. Create student document
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { name, department, mobile } = req.body || {};
    const result = await assignGroup({ name, department, mobile });

    if (result.alreadyRegistered) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: `You are already registered! Your group is Group ${result.groupNumber}.`,
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
    if (err.message === 'INVALID_INPUT') {
      return res.status(400).json({ success: false, message: 'Please enter valid Name, Department, and 10-digit Mobile number.' });
    }
    if (err.message === 'REGISTRATION_CLOSED') {
      return res.status(403).json({ success: false, message: 'Registration is currently closed.' });
    }
    if (err.message === 'REGISTRATION_FULL') {
      return res.status(403).json({ success: false, message: 'All groups are full. Registration is closed.' });
    }

    console.error('[Registration Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
