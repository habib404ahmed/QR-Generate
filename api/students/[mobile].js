const connectDB = require('../../backend/config/db');
const Student = require('../../backend/models/Student');
const jwt = require('jsonwebtoken');

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

  // Verify auth for DELETE and PUT
  if (req.method === 'DELETE' || req.method === 'PUT') {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
  }

  try {
    await connectDB();

    // Vercel passes the dynamic segment as req.query.mobile for [mobile].js
    const mobile = req.query.mobile;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

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
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
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
