// Admin Settings Page — Clean, Spacious Enterprise UI for Event & Network Configuration
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  RotateCcw,
  Calculator,
  QrCode,
  Download,
  Plus,
  Trash2,
  Sliders,
  Wifi,
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '../components/layout/AdminLayout';
import Modal from '../components/ui/Modal';
import { useEventSettings } from '../hooks/useEventSettings';
import { useStudents } from '../hooks/useStudents';
import { networkAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { settings, loading, updateSettings, resetEvent } = useEventSettings();
  const { students } = useStudents();
  const [form, setForm] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [warnModal, setWarnModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [newDept, setNewDept] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // Fetch Network Info on mount
  useEffect(() => {
    const fetchNet = async () => {
      try {
        const res = await networkAPI.getInfo();
        setNetworkInfo(res.data);
      } catch {
        // network info error fallback
      }
    };
    fetchNet();
  }, []);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        eventName: settings.eventName || '',
        collegeName: settings.collegeName || '',
        totalStudents: settings.totalStudents || 80,
        studentsPerGroup: settings.studentsPerGroup || 5,
        registrationOpen: settings.registrationOpen !== false,
        departments: settings.departments || ['BCA', 'B.Tech'],
        networkMode: settings.networkMode || 'local',
        publicDomain: settings.publicDomain || '',
      });
    }
  }, [settings]);

  if (loading || !form) {
    return (
      <AdminLayout pageTitle="Event Settings">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </AdminLayout>
    );
  }

  const totalGroups = Math.max(1, Math.ceil(form.totalStudents / form.studentsPerGroup));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : (name === 'totalStudents' || name === 'studentsPerGroup') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    if (students.length > 0) {
      setPendingSave(form);
      setWarnModal(true);
    } else {
      doSave(form);
    }
  };

  const doSave = async (data) => {
    setSaving(true);
    try {
      await updateSettings({ ...data, departments: form.departments });
      toast.success('Event & Network settings saved successfully!');
      setWarnModal(false);
      const res = await networkAPI.getInfo();
      setNetworkInfo(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const doReset = async () => {
    setResetting(true);
    try {
      await resetEvent();
      toast.success('Event reset complete. All student data deleted.');
      setResetModal(false);
    } catch {
      toast.error('Failed to reset event');
    } finally {
      setResetting(false);
    }
  };

  const addDepartment = () => {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    if (form.departments.includes(trimmed)) { toast.error('Department already exists'); return; }
    setForm((f) => ({ ...f, departments: [...f.departments, trimmed] }));
    setNewDept('');
  };

  const removeDept = (dept) => {
    setForm((f) => ({ ...f, departments: f.departments.filter((d) => d !== dept) }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      await networkAPI.pingHealth();
      const ms = Math.round(performance.now() - start);
      setTestResult({ success: true, ms });
      toast.success(`🟢 Connection Reachable (${ms}ms)`);
    } catch {
      setTestResult({ success: false, ms: 0 });
      toast.error('🔴 Connection Failed');
    } finally {
      setTesting(false);
    }
  };

  const localIp = networkInfo?.localIp || '192.168.1.40';
  let qrRegistrationUrl = `http://${localIp}:5173/register`;

  if (form.networkMode === 'public' && form.publicDomain.trim()) {
    let domain = form.publicDomain.trim();
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }
    domain = domain.replace(/\/+$/, '');
    if (!domain.endsWith('/register')) {
      domain = `${domain}/register`;
    }
    qrRegistrationUrl = domain;
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrRegistrationUrl);
      setCopied(true);
      toast.success('Registration URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.eventName || 'freshers'}_QR_Code.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 28,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    height: 52,
    paddingLeft: 18,
    paddingRight: 18,
    borderRadius: 14,
    background: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  return (
    <AdminLayout pageTitle="Event & Network Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Page Header ── */}
        <div>
          <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0, lineHeight: 1.2 }}>
            Event & Network Settings
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500, marginTop: 6, marginBottom: 0 }}>
            Configure event identity, local Wi-Fi connectivity, group capacity, and registration QR code.
          </p>
        </div>

        {/* ── Main Layout: 2 Columns ── */}
        <div className="settings-grid">
          
          {/* Left Column — Config Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* 1. NETWORK ACCESS MODE */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Wifi style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                    Network Access Mode
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: '2px 0 0' }}>
                    Select how students will connect to the registration portal.
                  </p>
                </div>
              </div>

              {/* Mode Option Cards */}
              <div className="network-mode-cards">
                {/* Option 1: Local Network */}
                <div
                  onClick={() => setForm((f) => ({ ...f, networkMode: 'local' }))}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: form.networkMode === 'local' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: form.networkMode === 'local' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: form.networkMode === 'local' ? '5px solid #6366f1' : '2px solid #6b7280', background: '#111827', boxSizing: 'border-box' }} />
                    <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 800 }}>Local Network (Development)</span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5, margin: 0, paddingLeft: 28 }}>
                    Uses your laptop's Wi-Fi IP address (<code style={{ color: '#818cf8', fontWeight: 700 }}>{localIp}</code>) for scanning on the same Wi-Fi network without internet.
                  </p>
                </div>

                {/* Option 2: Public Domain */}
                <div
                  onClick={() => setForm((f) => ({ ...f, networkMode: 'public' }))}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: form.networkMode === 'public' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: form.networkMode === 'public' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: form.networkMode === 'public' ? '5px solid #8b5cf6' : '2px solid #6b7280', background: '#111827', boxSizing: 'border-box' }} />
                    <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 800 }}>Public Domain (Production)</span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5, margin: 0, paddingLeft: 28 }}>
                    Connect your deployed Vercel domain for live public internet registration.
                  </p>
                </div>
              </div>

              {/* Public Domain Input */}
              {form.networkMode === 'public' && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={labelStyle}>PUBLIC DOMAIN URL</label>
                  <input
                    type="text"
                    name="publicDomain"
                    value={form.publicDomain}
                    onChange={handleChange}
                    placeholder="https://mywebsite.vercel.app"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Network Status & Diagnostics Card */}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    LIVE NETWORK STATUS
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', padding: '4px 12px', borderRadius: 99, background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    🟢 {form.networkMode === 'local' ? 'Local Wi-Fi Mode' : 'Public Domain Mode'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Active Local IP:</span>
                    <p style={{ color: '#818cf8', fontSize: 15, fontFamily: 'monospace', fontWeight: 800, margin: '2px 0 0' }}>{localIp}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Backend API:</span>
                    <p style={{ color: '#e5e7eb', fontSize: 15, fontFamily: 'monospace', fontWeight: 600, margin: '2px 0 0' }}>http://{localIp}:5000</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    style={{
                      height: 40, padding: '0 18px', borderRadius: 10,
                      border: '1px solid rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.12)',
                      color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: testing ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                    }}
                  >
                    <Activity style={{ width: 16, height: 16 }} /> {testing ? 'Testing...' : 'Test Connection'}
                  </button>

                  {testResult && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: testResult.success ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {testResult.success ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <XCircle style={{ width: 16, height: 16 }} />}
                      {testResult.success ? `🟢 Reachable (${testResult.ms}ms)` : '🔴 Connection Failed'}
                    </div>
                  )}
                </div>

                {testResult && !testResult.success && (
                  <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                    <span>Your Windows Firewall may be blocking incoming connections. Please allow Node.js on Private Networks.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. EVENT IDENTITY */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <Building2 style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                    Event Identity
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: '2px 0 0' }}>
                    Set your institution and orientation event details.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>COLLEGE NAME</label>
                  <input type="text" name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="e.g. ABC Institute of Technology" style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>EVENT NAME</label>
                  <input type="text" name="eventName" value={form.eventName} onChange={handleChange} placeholder="e.g. Freshers Orientation 2026" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* 3. GROUP CAPACITY SETUP */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Calculator style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                    Group Capacity Setup
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: '2px 0 0' }}>
                    Specify overall student numbers and team allocation size.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>TOTAL EXPECTED STUDENTS</label>
                  <input type="number" min="1" name="totalStudents" value={form.totalStudents} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>STUDENTS PER GROUP</label>
                  <input type="number" min="1" name="studentsPerGroup" value={form.studentsPerGroup} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              {/* Calculated Teams Preview */}
              <div style={{ padding: 18, borderRadius: 14, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                  <Layers style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, uppercase: 'true', margin: 0 }}>Calculated Group Allocation</p>
                  <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: '2px 0 0' }}>
                    {totalGroups} Teams Total
                  </p>
                  <p style={{ color: '#6b7280', fontSize: 12, margin: '2px 0 0' }}>
                    ⌈{form.totalStudents} total ÷ {form.studentsPerGroup} per group⌉ = {totalGroups} groups
                  </p>
                </div>
              </div>

              {/* Registration Access Toggle */}
              <div style={{ marginTop: 20, padding: 18, borderRadius: 14, background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#ffffff', fontSize: 15, fontWeight: 700, margin: 0 }}>Registration Portal Access</p>
                  <p style={{ color: form.registrationOpen ? '#4ade80' : '#f87171', fontSize: 13, fontWeight: 600, marginTop: 4, marginBotton: 0 }}>
                    {form.registrationOpen ? '🟢 Registration is currently OPEN' : '🔒 Registration portal is CLOSED'}
                  </p>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="registrationOpen"
                    checked={form.registrationOpen}
                    onChange={handleChange}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 99,
                    background: form.registrationOpen ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#374151',
                    transition: '0.2s ease',
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: form.registrationOpen ? 27 : 3, width: 22, height: 22,
                      borderRadius: '50%', background: '#ffffff', transition: '0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }} />
                  </span>
                </label>
              </div>
            </div>

            {/* 4. ALLOWED DEPARTMENTS */}
            <div style={cardStyle}>
              <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 18 }}>
                Allowed Departments / Branches
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {form.departments.map((dept) => (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: 14, fontWeight: 700 }}>
                    <span>{dept}</span>
                    <button type="button" onClick={() => removeDept(dept)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', padding: 0 }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                  placeholder="Add new department (e.g. MCA, BBA)..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addDepartment}
                  style={{
                    height: 52, padding: '0 20px', borderRadius: 14, border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Add
                </button>
              </div>
            </div>

            {/* Save & Reset Actions Bar */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2, height: 54, borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff',
                  fontSize: 16, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)', transition: 'transform 0.15s',
                }}
                onMouseDown={e => { if (!saving) e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={e => { if (!saving) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {saving ? 'Saving Settings...' : <><Save style={{ width: 20, height: 20 }} /> Save All Settings</>}
              </button>

              <button
                type="button"
                onClick={() => setResetModal(true)}
                style={{
                  flex: 1, height: 54, borderRadius: 14,
                  border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
              >
                <RotateCcw style={{ width: 18, height: 18 }} /> Reset Event
              </button>
            </div>

          </div>

          {/* Right Column — Sticky Registration QR Card */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...cardStyle, position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
              
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QrCode style={{ width: 20, height: 20, color: '#a78bfa' }} />
                  <h2 style={{ color: '#ffffff', fontSize: 17, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                    Registration QR Code
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={downloadQR}
                  style={{
                    height: 36, padding: '0 14px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                    color: '#f3f4f6', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <Download style={{ width: 14, height: 14 }} /> Download SVG
                </button>
              </div>

              {/* White QR Box */}
              <div ref={qrRef} style={{ padding: 20, borderRadius: 20, background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)', display: 'inline-block' }}>
                <QRCodeSVG
                  value={qrRegistrationUrl}
                  size={240}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="H"
                />
              </div>

              {/* Registration URL & Copy Button */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, uppercase: 'true' }}>Target Registration URL</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '8px 12px' }}>
                  <p style={{ flex: 1, color: '#a5b4fc', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', margin: 0, textAlign: 'left' }}>
                    {qrRegistrationUrl}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    style={{ background: 'none', border: 'none', color: copied ? '#4ade80' : '#9ca3af', cursor: 'pointer', padding: 4, display: 'flex' }}
                  >
                    {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, margin: 0, textAlign: 'left' }}>
                💡 Project this QR code on auditorium screens or print it at desks. Students scan to immediately register and receive their group assignment!
              </p>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
        }

        .network-mode-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 1100px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .network-mode-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Warning Modal */}
      <Modal
        isOpen={warnModal}
        onClose={() => setWarnModal(false)}
        title="⚠️ Existing Registrations Warning"
        message={`${students.length} students are already registered. Updating settings now will apply dynamically. Proceed?`}
        confirmText="Yes, Save Settings"
        confirmVariant="primary"
        onConfirm={() => doSave(pendingSave)}
      />

      {/* Reset Modal */}
      <Modal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        title="🚨 Reset Entire Event"
        message={`This will permanently delete ALL ${students.length} student registrations in MongoDB. This action cannot be undone. Are you sure?`}
        confirmText={resetting ? 'Resetting...' : 'Yes, WIPE ALL DATA'}
        confirmVariant="danger"
        onConfirm={doReset}
      />
    </AdminLayout>
  );
}
