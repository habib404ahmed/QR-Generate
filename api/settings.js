const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const DEFAULT_ATLAS_URI =
  'mongodb+srv://kingofkalilinux404_db_user:DaJJhVwpk9qCsjgp@cluster0.x7m7owd.mongodb.net/freshers_group_generator?retryWrites=true&w=majority';

const eventSettingsSchema = new mongoose.Schema(
  {
    eventName: { type: String, default: 'Freshers Orientation 2026', trim: true },
    collegeName: { type: String, default: 'Your College', trim: true },
    collegeLogo: { type: String, default: '', trim: true },
    totalStudents: { type: Number, default: 80, min: 1 },
    studentsPerGroup: { type: Number, default: 5, min: 1 },
    totalGroups: { type: Number, default: 16, min: 1 },
    registrationOpen: { type: Boolean, default: true },
    departments: { type: [String], default: ['BCA', 'B.Tech'] },
    networkMode: { type: String, default: 'local' },
    publicDomain: { type: String, default: '', trim: true },
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

const EventSettings = mongoose.models.EventSettings || mongoose.model('EventSettings', eventSettingsSchema);
const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({}, { strict: false }));

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
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    if (req.method === 'GET') {
      const settings = await EventSettings.getSettings();
      return res.status(200).json({ success: true, data: settings });
    }

    if (req.method === 'PUT') {
      const admin = verifyToken(req);
      if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized' });

      let settings = await EventSettings.getSettings();
      const { eventName, collegeName, collegeLogo, totalStudents, studentsPerGroup, registrationOpen, departments } = req.body || {};

      if (eventName !== undefined) settings.eventName = eventName;
      if (collegeName !== undefined) settings.collegeName = collegeName;
      if (collegeLogo !== undefined) settings.collegeLogo = collegeLogo;
      if (totalStudents !== undefined) settings.totalStudents = Number(totalStudents);
      if (studentsPerGroup !== undefined) settings.studentsPerGroup = Number(studentsPerGroup);
      if (registrationOpen !== undefined) settings.registrationOpen = Boolean(registrationOpen);
      if (departments !== undefined && Array.isArray(departments)) settings.departments = departments;

      settings.totalGroups = Math.max(1, Math.ceil(settings.totalStudents / settings.studentsPerGroup));
      await settings.save();

      return res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    }

    if (req.method === 'POST') {
      const admin = verifyToken(req);
      if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await Student.deleteMany({});
      return res.status(200).json({ success: true, message: 'Event reset successfully. All registrations cleared.' });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Settings Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
