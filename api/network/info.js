const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI =
  'mongodb+srv://kingofkalilinux404_db_user:DaJJhVwpk9qCsjgp@cluster0.x7m7owd.mongodb.net/freshers_group_generator?retryWrites=true&w=majority';

const eventSettingsSchema = new mongoose.Schema(
  {
    networkMode: { type: String, default: 'local' },
    publicDomain: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const EventSettings = mongoose.models.EventSettings || mongoose.model('EventSettings', eventSettingsSchema);

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    let settings = await EventSettings.findOne();
    const networkMode = settings?.networkMode || 'public';
    const publicDomain = settings?.publicDomain || '';

    return res.status(200).json({
      success: true,
      data: {
        mode: networkMode,
        publicDomain,
        port: 5000,
        activeUrl: 'https://qr-generate-wheat.vercel.app',
      },
      mode: networkMode,
      publicDomain,
      port: 5000,
      activeUrl: 'https://qr-generate-wheat.vercel.app',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
