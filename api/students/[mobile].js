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

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI || DEFAULT_ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
    });
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

    const { mobile } = req.query;
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number parameter is required' });

    const cleanMobile = String(mobile).trim();

    if (req.method === 'DELETE') {
      const student = await Student.findOneAndDelete({ mobile: cleanMobile });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
      return res.status(200).json({ success: true, message: 'Student record deleted successfully' });
    }

    if (req.method === 'PUT') {
      const { name, department } = req.body || {};
      const student = await Student.findOne({ mobile: cleanMobile });
      if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

      if (name) student.name = String(name).trim();
      if (department) student.department = String(department).trim();

      await student.save();
      return res.status(200).json({ success: true, message: 'Student record updated successfully', data: student });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Student Mobile Action Error]', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
};
