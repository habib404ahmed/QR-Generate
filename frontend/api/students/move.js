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

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

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

    const { mobile, newGroupNumber } = req.body || {};
    if (!mobile || !newGroupNumber) {
      return res.status(400).json({ success: false, message: 'Mobile and newGroupNumber are required' });
    }

    const student = await Student.findOne({ mobile: String(mobile).trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    student.groupNumber = Number(newGroupNumber);
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Moved ${student.name} to Group ${student.groupNumber}`,
    });
  } catch (err) {
    console.error('[Move Student Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
