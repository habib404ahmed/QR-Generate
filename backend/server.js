require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');

const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const studentRoutes = require('./routes/students');
const networkRoutes = require('./routes/network');

const Admin = require('./models/Admin');
const EventSettings = require('./models/EventSettings');

const app = express();
const server = http.createServer(app);

// Helper to get active IPv4 address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const devName in interfaces) {
    const iface = interfaces[devName];
    const nameLower = devName.toLowerCase();

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        const ip = alias.address;

        if (ip.startsWith('192.168.56.')) continue;
        if (nameLower.includes('vbox') || nameLower.includes('docker') || nameLower.includes('vethernet') || nameLower.includes('vmware')) {
          continue;
        }

        const isWifi = nameLower.includes('wi-fi') || nameLower.includes('wlan') || nameLower.includes('wireless');
        candidates.push({ ip, name: devName, isWifi });
      }
    }
  }

  const wifiMatch = candidates.find((c) => c.isWifi);
  if (wifiMatch) return wifiMatch.ip;
  if (candidates.length > 0) return candidates[0].ip;

  return '127.0.0.1';
}

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true, // Allow cross-origin requests from Wi-Fi mobile devices
    credentials: true,
  })
);
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/network', networkRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    frontend: 'Running',
    backend: 'Running',
    database: 'MongoDB Connected',
    timestamp: new Date(),
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Auto-seed Admin and EventSettings on startup
const seedDefaults = async () => {
  try {
    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await Admin.findOne({ username });
    if (!admin) {
      await Admin.create({ username, password, role: 'superadmin' });
      console.log(`[Seed] Default Admin created: ${username} / ${password}`);
    } else {
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        admin.password = password;
        await admin.save();
        console.log(`[Seed] Default Admin password reset to: ${password}`);
      } else {
        console.log(`[Seed] Default Admin verified: ${username}`);
      }
    }

    await EventSettings.getSettings();
    console.log('[Seed] Default EventSettings initialized');
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start Server & Database on 0.0.0.0
const startServer = async () => {
  await connectDB();
  await seedDefaults();

  server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\n🚀 Server Running`);
    console.log(`📡 Local API:   http://localhost:${PORT}`);
    console.log(`🌐 Network API: http://${localIp}:${PORT}\n`);
  });
};

startServer();
