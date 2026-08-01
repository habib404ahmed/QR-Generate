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

async function getGroupCounters() {
  const settings = await EventSettings.getSettings();
  const { totalStudents, studentsPerGroup } = settings;
  const totalGroups = Math.max(1, Math.ceil(totalStudents / studentsPerGroup));

  const groupCounts = await Student.aggregate([{ $group: { _id: '$groupNumber', count: { $sum: 1 } } }]);
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

  return { totalStudents, studentsPerGroup, totalGroups, groups };
}

function extractMobile(req) {
  let mobile = req.query?.mobile;
  const cleanUrl = (req.url || '').split('?')[0];
  const matches = cleanUrl.match(/\/(\d{10})/);

  if (matches) {
    mobile = matches[1];
  } else if (!mobile || mobile === 'students') {
    const parts = cleanUrl.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== 'students' && last !== 'register' && last !== 'move' && last !== 'add') {
      mobile = last;
    }
  }

  if (!mobile && req.body?.mobile) {
    mobile = req.body.mobile;
  }

  return mobile ? String(mobile).trim() : null;
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

  try {
    await connectDB();

    const mobile = extractMobile(req);
    const cleanUrl = (req.url || '').split('?')[0];

    // 1. DELETE student by mobile (admin only)
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body?._method === 'DELETE')) {
      if (!verifyToken(req)) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

      const student = await Student.findOneAndDelete({ mobile });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Student record deleted successfully',
      });
    }

    // 2. PUT edit student by mobile (admin only)
    if (req.method === 'PUT') {
      if (!verifyToken(req)) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

      const { name, department } = req.body || {};
      const student = await Student.findOne({ mobile });
      if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

      if (name) student.name = String(name).trim();
      if (department) student.department = String(department).trim();

      await student.save();

      return res.status(200).json({
        success: true,
        message: 'Student record updated successfully',
        data: student,
      });
    }

    // 3. POST /move
    if (req.method === 'POST' && cleanUrl.endsWith('/move')) {
      const { mobile: bodyMobile, newGroupNumber } = req.body || {};
      const targetMobile = mobile || bodyMobile;
      const student = await Student.findOne({ mobile: String(targetMobile).trim() });
      if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

      student.groupNumber = Number(newGroupNumber);
      await student.save();

      return res.status(200).json({
        success: true,
        message: `Moved ${student.name} to Group ${student.groupNumber}`,
      });
    }

    // 4. GET all students
    if (req.method === 'GET') {
      const { search, department, groupNumber } = req.query || {};
      const query = {};

      if (department) query.department = department;
      if (groupNumber) query.groupNumber = Number(groupNumber);

      if (search && String(search).trim()) {
        const q = String(search).trim();
        const isNum = !isNaN(q);

        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { department: { $regex: q, $options: 'i' } },
          { mobile: { $regex: q, $options: 'i' } },
        ];

        if (isNum) query.$or.push({ groupNumber: Number(q) });
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

      return res.status(200).json({
        success: true,
        data: {
          students: formattedStudents,
          counters,
        },
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Students API Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
