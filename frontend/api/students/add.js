const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const DEFAULT_ATLAS_URI =
  'mongodb+srv://kingofkalilinux404_db_user:DaJJhVwpk9qCsjgp@cluster0.x7m7owd.mongodb.net/freshers_group_generator?retryWrites=true&w=majority';

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
    totalStudents: { type: Number, default: 80 },
    studentsPerGroup: { type: Number, default: 5 },
    registrationOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ totalStudents: 80, studentsPerGroup: 5, registrationOpen: true });
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

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'freshers_super_secret_2026_change_me');
  } catch {
    return null;
  }
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

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    await connectDB();

    const { name, department, mobile } = req.body || {};
    if (!name || !department || !mobile) {
      return res.status(400).json({ success: false, message: 'Name, department, and mobile are required' });
    }

    const cleanMobile = String(mobile).trim();
    const existing = await Student.findOne({ mobile: cleanMobile });
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

    const groupCounts = await Student.aggregate([{ $group: { _id: '$groupNumber', count: { $sum: 1 } } }]);
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
      name: String(name).trim(),
      department: String(department).trim(),
      mobile: cleanMobile,
      groupNumber,
      registeredDate: now.toISOString().split('T')[0],
      registeredTime: now.toTimeString().split(' ')[0],
    });

    return res.status(201).json({
      success: true,
      message: `Student added to Group ${groupNumber}.`,
      groupNumber,
      data: student,
    });
  } catch (err) {
    console.error('[Add Student Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
