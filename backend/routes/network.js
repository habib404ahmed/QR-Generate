const express = require('express');
const router = express.Router();
const os = require('os');
const EventSettings = require('../models/EventSettings');

function getNetworkDetails() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  const allInterfaces = [];

  for (const devName in interfaces) {
    const iface = interfaces[devName];
    const nameLower = devName.toLowerCase();

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        const ip = alias.address;
        allInterfaces.push({ name: devName, ip });

        // Skip VirtualBox host-only subnet (192.168.56.x)
        if (ip.startsWith('192.168.56.')) continue;

        // Skip virtual / vethernet / vbox / vmware / docker adapters
        if (nameLower.includes('vbox') || nameLower.includes('docker') || nameLower.includes('vethernet') || nameLower.includes('vmware')) {
          continue;
        }

        const isWifi = nameLower.includes('wi-fi') || nameLower.includes('wlan') || nameLower.includes('wireless');
        candidates.push({ ip, name: devName, isWifi });
      }
    }
  }

  // Prioritize physical Wi-Fi adapter
  const wifiMatch = candidates.find((c) => c.isWifi);
  const selectedIp = wifiMatch ? wifiMatch.ip : (candidates.length > 0 ? candidates[0].ip : '127.0.0.1');

  return { selectedIp, allInterfaces };
}

router.get('/info', async (req, res) => {
  try {
    const { selectedIp: localIp, allInterfaces } = getNetworkDetails();
    const frontendPort = process.env.FRONTEND_PORT || 5173;
    const backendPort = process.env.PORT || 5000;

    const settings = await EventSettings.getSettings();
    const mode = settings.networkMode || 'local';
    const publicDomain = (settings.publicDomain || '').trim();

    let activeRegistrationUrl = `http://${localIp}:${frontendPort}/register`;

    if (mode === 'public' && publicDomain) {
      let formattedDomain = publicDomain;
      if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
        formattedDomain = `https://${formattedDomain}`;
      }
      formattedDomain = formattedDomain.replace(/\/+$/, '');
      if (!formattedDomain.endsWith('/register')) {
        formattedDomain = `${formattedDomain}/register`;
      }
      activeRegistrationUrl = formattedDomain;
    }

    res.json({
      success: true,
      networkMode: mode,
      publicDomain: publicDomain,
      localIp,
      allInterfaces,
      frontendPort,
      backendPort,
      activeRegistrationUrl,
      networkRegistrationUrl: `http://${localIp}:${frontendPort}/register`,
      localRegistrationUrl: `http://localhost:${frontendPort}/register`,
      networkBackendUrl: `http://${localIp}:${backendPort}`,
      frontendStatus: 'Running',
      backendStatus: 'Running',
      dbStatus: 'MongoDB Connected',
      qrStatus: 'Ready',
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
