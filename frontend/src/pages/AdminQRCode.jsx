// AdminQRCode — Local Network (Same Wi-Fi) QR Code Generator Page
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Check,
  Globe,
  Wifi,
  Activity,
  Server,
  Database,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { useEventSettings } from '../hooks/useEventSettings';
import { networkAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminQRCode() {
  const { settings } = useEventSettings();
  const canvasRef = useRef(null);

  // Network State from Backend
  const [networkData, setNetworkData] = useState(null);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState(null); // { reachable: boolean, ms: number }
  const [testing, setTesting] = useState(false);

  // Fetch Auto-detected Network Info on Mount
  useEffect(() => {
    const fetchNetworkInfo = async () => {
      const isVercel = window.location.hostname.endsWith('vercel.app') || window.location.protocol === 'https:';
      const prodUrl = `${window.location.origin}/register`;

      if (isVercel) {
        setUrl(prodUrl);
        return;
      }

      try {
        const res = await networkAPI.getInfo();
        const data = res.data;
        setNetworkData(data);

        const saved = localStorage.getItem('saved_qr_registration_url');
        if (saved && (saved.includes('192.168.56.') || saved.includes('10.27.') || saved.includes(':5173'))) {
          localStorage.removeItem('saved_qr_registration_url');
        }

        const validSaved = localStorage.getItem('saved_qr_registration_url');
        if (validSaved && !validSaved.includes('localhost') && !validSaved.includes('127.0.0.1')) {
          setUrl(validSaved);
        } else if (data?.networkRegistrationUrl) {
          setUrl(data.networkRegistrationUrl);
        } else {
          setUrl(`${window.location.origin}/register`);
        }
      } catch {
        setUrl(prodUrl);
      }
    };

    fetchNetworkInfo();
  }, []);

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  // Save to localStorage when URL changes
  useEffect(() => {
    if (url) {
      localStorage.setItem('saved_qr_registration_url', url);
    }
  }, [url]);

  // Reset to auto-detected network IP / Production URL
  const handleResetToNetworkIP = () => {
    const isVercel = window.location.hostname.endsWith('vercel.app') || window.location.protocol === 'https:';
    if (isVercel) {
      const prodUrl = `${window.location.origin}/register`;
      setUrl(prodUrl);
      toast.success(`Reset URL to Vercel Production: ${prodUrl}`);
    } else if (networkData?.networkRegistrationUrl) {
      setUrl(networkData.networkRegistrationUrl);
      toast.success(`Reset URL to Local Network IP: ${networkData.networkRegistrationUrl}`);
    } else {
      const fallback = `${window.location.origin}/register`;
      setUrl(fallback);
      toast.success('Reset URL to Registration address');
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      await networkAPI.pingHealth();
      const duration = Math.round(performance.now() - start);
      setTestResult({ reachable: true, ms: duration });
      toast.success(`🟢 Connection Reachable (${duration}ms)`);
    } catch {
      setTestResult({ reachable: false, ms: 0 });
      toast.error('🔴 Registration URL Not Reachable');
    } finally {
      setTesting(false);
    }
  };

  // Copy URL
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Registration link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Open in new tab
  const handleOpenPage = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Download PNG
  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) {
      toast.error('Failed to capture QR Code');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'Freshers_Registration_QR.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('Downloaded Freshers_Registration_QR.png');
  };

  // Print A4 sheet
  const handlePrint = () => {
    const canvas = document.getElementById('qr-code-canvas');
    const qrDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    const eventTitle = settings?.eventName || 'Freshers Orientation 2026';
    const college = settings?.collegeName || 'Your College';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Registration QR Code</title>
          <style>
            @page { size: A4; margin: 0; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              background: #ffffff;
              color: #111827;
              text-align: center;
              box-sizing: border-box;
            }
            .college { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4f46e5; margin-bottom: 8px; }
            .title { font-size: 36px; font-weight: 900; color: #0f172a; margin: 0 0 16px; line-height: 1.2; }
            .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 16px; padding: 8px 24px; border-radius: 99px; margin-bottom: 32px; }
            .qr-box { padding: 24px; background: #ffffff; border: 4px solid #0f172a; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 24px; }
            .qr-box img { width: 300px; height: 300px; display: block; }
            .scan-text { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
            .url-text { font-size: 15px; color: #64748b; word-break: break-all; font-family: monospace; max-width: 500px; }
            .footer { margin-top: 40px; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; width: 100%; max-width: 500px; }
          </style>
        </head>
        <body>
          <div class="college">${college}</div>
          <h1 class="title">${eventTitle}</h1>
          <div class="badge">Official Group Registration</div>
          <div class="qr-box">
            <img src="${qrDataUrl}" alt="QR Code" />
          </div>
          <div class="scan-text">📷 Point your camera & scan to register</div>
          <div class="url-text">${url}</div>
          <div class="footer">Freshers Orientation • Connect to same Wi-Fi to scan with Android, iPhone, or Google Lens</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AdminLayout pageTitle="QR Code Generator">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1000, margin: '0 auto' }}>

        {/* Header Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                QR Code Generator
              </h1>
              <p style={{ color: '#9ca3af', fontSize: 15, fontWeight: 500, margin: '4px 0 0' }}>
                Generate a Local Network Wi-Fi QR code for student registration.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Localhost Warning Banner */}
        {isLocalhost && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '18px 22px', borderRadius: 16,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}
          >
            <AlertTriangle style={{ width: 22, height: 22, color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#fef08a', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
                Localhost Warning
              </p>
              <p style={{ color: '#fde047', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Students cannot access localhost from another device. Use the Local Network URL when everyone is connected to the same Wi-Fi.
              </p>
            </div>
          </motion.div>
        )}

        {/* Network Information Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
        }}>
          {/* Server Status */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Server style={{ width: 14, height: 14 }} /> Server Status
            </div>
            <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 800, marginTop: 6, marginBotton: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              🟢 Running
            </p>
          </div>

          {/* Local URL */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Globe style={{ width: 14, height: 14 }} /> Local URL
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'monospace', fontWeight: 600, marginTop: 6, marginBotton: 0 }}>
              {networkData?.localRegistrationUrl || 'http://localhost:5173'}
            </p>
          </div>

          {/* Network URL */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Wifi style={{ width: 14, height: 14 }} /> Network URL (Wi-Fi)
            </div>
            <p style={{ color: '#a5b4fc', fontSize: 14, fontFamily: 'monospace', fontWeight: 800, marginTop: 6, marginBotton: 0 }}>
              {networkData?.networkRegistrationUrl || `http://${window.location.hostname}:5173/`}
            </p>
          </div>

          {/* Backend URL */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Activity style={{ width: 14, height: 14 }} /> Backend URL
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'monospace', fontWeight: 600, marginTop: 6, marginBotton: 0 }}>
              {networkData?.networkBackendUrl || `http://${window.location.hostname}:5000`}
            </p>
          </div>

          {/* Database */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <Database style={{ width: 14, height: 14 }} /> Database
            </div>
            <p style={{ color: '#34d399', fontSize: 14, fontWeight: 700, marginTop: 6, marginBotton: 0 }}>
              {networkData?.dbStatus || 'MongoDB Connected'}
            </p>
          </div>
        </div>

        {/* Input & Action Panel */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
                REGISTRATION PORTAL URL
              </label>

              {/* Reachability Badge */}
              {testResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: testResult.reachable ? '#4ade80' : '#f87171' }}>
                  {testResult.reachable ? <CheckCircle2 style={{ width: 15, height: 15 }} /> : <XCircle style={{ width: 15, height: 15 }} />}
                  {testResult.reachable ? `🟢 Reachable (${testResult.ms}ms)` : '🔴 Not Reachable'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Globe style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#6b7280' }} />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://192.168.1.100:5173/register"
                  style={{
                    width: '100%', height: 48, paddingLeft: 44, paddingRight: 16,
                    borderRadius: 12, background: '#111827', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#f9fafb', fontSize: 15, fontFamily: 'monospace', fontWeight: 600,
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              <button
                onClick={handleResetToNetworkIP}
                title="Reset URL to auto-detected local network IP"
                style={{
                  padding: '0 18px', height: 48, borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                  color: '#9ca3af', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}
              >
                <RefreshCw style={{ width: 16, height: 16 }} /> Reset to Network IP
              </button>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button
              onClick={handleDownload}
              style={{
                height: 46, padding: '0 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(79,70,229,0.35)', transition: 'transform 0.15s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Download style={{ width: 16, height: 16 }} /> Download PNG
            </button>

            <button
              onClick={handlePrint}
              style={{
                height: 46, padding: '0 20px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f6', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <Printer style={{ width: 16, height: 16 }} /> Print A4 Page
            </button>

            <button
              onClick={handleCopy}
              style={{
                height: 46, padding: '0 20px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f6', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              {copied ? <Check style={{ width: 16, height: 16, color: '#4ade80' }} /> : <Copy style={{ width: 16, height: 16 }} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleOpenPage}
              style={{
                height: 46, padding: '0 20px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f6', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <ExternalLink style={{ width: 16, height: 16 }} /> Open Page
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                height: 46, padding: '0 20px', borderRadius: 12,
                border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.12)',
                color: '#4ade80', fontSize: 14, fontWeight: 700, cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!testing) e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
              onMouseLeave={e => { if (!testing) e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; }}
            >
              <Activity style={{ width: 16, height: 16 }} /> {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* QR Code Center Display Card (Size 300 × 300) */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 24, textAlign: 'center',
        }}>

          <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            High-Resolution Local Network QR Code (300 × 300)
          </div>

          {/* White High Contrast Box for QR */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={url}
            style={{
              padding: 24, borderRadius: 24, background: '#ffffff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <QRCodeSVG
              value={url || `http://${window.location.hostname}:5173/`}
              size={300}
              level="H"
              includeMargin={true}
            />

            {/* Hidden Canvas used for PNG download and printing */}
            <div style={{ display: 'none' }}>
              <QRCodeCanvas
                id="qr-code-canvas"
                ref={canvasRef}
                value={url || `http://${window.location.hostname}:5173/`}
                size={600}
                level="H"
                includeMargin={true}
              />
            </div>
          </motion.div>

          {/* Underneath URL display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 600 }}>
            <p style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, margin: 0 }}>
              Student Registration URL
            </p>
            <p style={{ color: '#818cf8', fontSize: 15, fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '8px 20px', borderRadius: 99, margin: '4px 0 0' }}>
              {url}
            </p>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4, marginBotton: 0 }}>
              Scannable by Android Camera, iPhone Camera, Google Lens & all QR reader apps on the same Wi-Fi.
            </p>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
