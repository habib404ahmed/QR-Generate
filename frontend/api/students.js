const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

eventSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ totalStudents: 80, studentsPerGroup: 5 });
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
    console.error('[Students GET Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
