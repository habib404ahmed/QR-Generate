import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── Inline SVG icons ─────────────────────────────────────────────────── */
const IconGradCap = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
    <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/>
  </svg>
);
const IconShieldFill = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconLockSm = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconSignIn = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════ */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Successfully logged in as Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />
      {/* Purple nebula sweep (right side) */}
      <div style={s.nebula} />
      {/* Blue sweep (left) */}
      <div style={s.nebulaLeft} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 680, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 10 }}
      >
        {/* ── HERO HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* Graduation cap icon */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
            style={s.logoBox}
          >
            <IconGradCap />
          </motion.div>

          {/* Title */}
          <h1 style={s.heading}>Admin Portal</h1>

          {/* Subtitle */}
          <p style={s.subheading}>Freshers Group Generator Management</p>

          {/* Decorative dot line */}
          <div style={s.decorLine}>
            <div style={s.decorDash} />
            <div style={s.decorDot} />
            <div style={s.decorDash} />
          </div>
        </div>

        {/* ── CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          style={s.card}
        >
          {/* Card Header */}
          <div style={s.cardHeader}>
            <div style={s.cardHeaderIcon}>
              <IconShieldFill />
            </div>
            <div>
              <h2 style={s.cardTitle}>AUTHENTICATE TO CONTINUE</h2>
              <p style={s.cardSubtitle}>Please sign in to access the admin dashboard</p>
            </div>
          </div>

          {/* Divider */}
          <div style={s.divider} />

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ADMIN USERNAME */}
            <div>
              <label style={s.fieldLabel}>
                <span style={s.labelIcon}><IconUser /></span>
                ADMIN USERNAME
              </label>
              <div style={s.inputWrap}>
                {/* Left icon inside input */}
                <span style={s.inputIconLeft}><IconUser /></span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  style={{ ...s.input, ...(error ? s.inputErr : {}) }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.18)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? '#f43f5e' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label style={s.fieldLabel}>
                <span style={s.labelIcon}><IconLock /></span>
                PASSWORD
              </label>
              <div style={s.inputWrap}>
                {/* Left icon inside input */}
                <span style={s.inputIconLeft}><IconLock /></span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ ...s.input, paddingRight: 48, ...(error ? s.inputErr : {}) }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.18)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? '#f43f5e' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {/* Eye toggle on right */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={s.errorBox}>
                <IconLockSm />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              id="login-btn"
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.012, boxShadow: '0 8px 40px rgba(99,102,241,0.55)' } : {}}
              whileTap={!loading ? { scale: 0.988 } : {}}
              style={s.submitBtn}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <IconSignIn />
                  <span>Sign In to Dashboard</span>
                  <IconArrowRight />
                </>
              )}
            </motion.button>

            {/* Default credentials — inside card */}
            <div style={s.credentialsRow}>
              <IconLockSm />
              <span style={s.credText}>Default Credentials:</span>
              <span style={s.credVal}>admin</span>
              <span style={s.credSep}>/</span>
              <span style={s.credVal}>admin123</span>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050814 0%, #080d1c 40%, #0c0a1e 70%, #060410 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif",
  },
  orb1: {
    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
    width: 650, height: 450,
    background: 'radial-gradient(ellipse, rgba(79,70,229,0.20) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '10%', left: '-5%',
    width: 380, height: 380,
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '10%', left: '5%',
    width: 300, height: 500,
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
  },
  // Large purple nebula sweep on the right
  nebula: {
    position: 'absolute', top: '-10%', right: '-10%',
    width: 550, height: 900,
    background: 'radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.20) 35%, transparent 70%)',
    borderRadius: '40%', filter: 'blur(55px)', pointerEvents: 'none',
  },
  nebulaLeft: {
    position: 'absolute', bottom: '-5%', left: '-5%',
    width: 350, height: 600,
    background: 'radial-gradient(ellipse at 30% 60%, rgba(59,130,246,0.25) 0%, transparent 65%)',
    borderRadius: '40%', filter: 'blur(55px)', pointerEvents: 'none',
  },

  /* Logo */
  logoBox: {
    width: 80, height: 80, margin: '0 auto 16px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 50px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
    border: '1px solid rgba(139,92,246,0.5)',
  },

  /* Header text */
  heading: {
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: 900,
    color: '#ffffff',
    margin: '0 0 6px',
    letterSpacing: '-0.01em',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subheading: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: 500,
    margin: '0 0 12px',
  },
  decorLine: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  decorDash: {
    width: 28, height: 1.5,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6))',
    borderRadius: 2,
  },
  decorDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    boxShadow: '0 0 8px rgba(99,102,241,0.7)',
  },

  /* Card */
  card: {
    background: 'rgba(12,18,42,0.80)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(99,102,241,0.30)',
    borderRadius: 20,
    padding: '28px 32px 24px',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 64px rgba(0,0,0,0.55), 0 0 60px rgba(79,70,229,0.12)',
    maxWidth: 640,
    margin: '0 auto',
    width: '100%',
  },

  /* Card header */
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 52, height: 52, flexShrink: 0,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(99,102,241,0.45)',
    border: '1px solid rgba(99,102,241,0.4)',
  },
  cardTitle: {
    fontSize: 15.5, fontWeight: 900, color: '#f1f5f9',
    margin: '0 0 4px', letterSpacing: '0.05em',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  cardSubtitle: {
    fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5,
  },

  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), rgba(139,92,246,0.2), transparent)',
    marginBottom: 24,
  },

  /* Field label */
  fieldLabel: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  labelIcon: {
    color: '#818cf8',
    display: 'flex', alignItems: 'center',
  },

  /* Input wrapper */
  inputWrap: { position: 'relative' },

  /* Input — icon on LEFT */
  input: {
    width: '100%',
    height: 56,
    paddingLeft: 46,   // space for left icon
    paddingRight: 18,
    background: 'rgba(8,12,30,0.85)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  inputErr: {
    borderColor: '#f43f5e',
  },
  // Icon on the LEFT inside input
  inputIconLeft: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(148,163,184,0.55)',
    display: 'flex', alignItems: 'center',
    pointerEvents: 'none',
  },

  /* Eye button */
  eyeBtn: {
    position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(148,163,184,0.55)',
    display: 'flex', alignItems: 'center',
    padding: '4px',
    transition: 'color 0.2s',
  },

  /* Error */
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 7,
    color: '#f87171', fontSize: 12.5, fontWeight: 600,
    background: 'rgba(239,68,68,0.10)',
    border: '1px solid rgba(239,68,68,0.25)',
    padding: '10px 14px',
    borderRadius: 10,
  },

  /* Submit button */
  submitBtn: {
    width: '100%', height: 56,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 80%, #9333ea 100%)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 17, fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(99,102,241,0.40), inset 0 1px 0 rgba(255,255,255,0.12)',
    transition: 'opacity 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.01em',
    marginTop: 4,
  },

  /* Default credentials row */
  credentialsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    color: '#475569', fontSize: 13, fontWeight: 500,
    marginTop: 2,
  },
  credText: { color: '#64748b' },
  credVal: {
    color: '#818cf8', fontWeight: 700, fontSize: 13.5,
  },
  credSep: { color: '#475569', margin: '0 2px' },
};
