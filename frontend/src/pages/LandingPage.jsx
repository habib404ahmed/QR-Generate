import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { validators } from '../utils/validators';
import { studentsAPI, settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

/* ── Inline SVG icons (matches reference image exactly) ───────────────── */
const IconGradCap = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
    <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/>
  </svg>
);
const IconUser = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const IconBuilding = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconPhone = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconUsersGroup = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 opacity-60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Spinner ─────────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ name: '', department: '', mobile: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    settingsAPI.get()
      .then((res) => setSettings(res.data.data))
      .catch(() => setSettings({
        eventName: 'Freshers Orientation 2026',
        collegeName: 'Your College',
        departments: ['BCA', 'B.Tech'],
        registrationOpen: true,
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm((f) => ({ ...f, mobile: digits }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const { errors: ve, isValid } = validators.registration(form);
    if (!isValid) { setErrors(ve); return; }
    setSubmitting(true);
    try {
      const res = await studentsAPI.register(form);
      const { groupNumber, alreadyRegistered } = res.data;
      if (alreadyRegistered) toast('Welcome back! Already assigned.', { icon: 'ℹ️' });
      navigate('/success', { state: { groupNumber, name: form.name, alreadyRegistered } });
    } catch (err) {
      console.error('Registration submit error:', err);
      if (!err.response) {
        toast.error('Connection timeout. Please refresh this page on your phone and try again.');
      } else {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* Loading screen */
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.orb1} /><div style={styles.orb2} /><div style={styles.orb3} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, letterSpacing: '0.08em' }}>Loading Orientation Portal...</p>
        </div>
      </div>
    );
  }

  const isOpen = settings?.registrationOpen !== false;
  const depts = settings?.departments?.length ? settings.departments : ['BCA', 'B.Tech'];
  const eventName = settings?.eventName || 'Freshers Orientation 2026';
  const collegeName = settings?.collegeName || 'Your College';

  return (
    <div style={styles.page}>
      {/* ── Background orbs / nebula glow ── */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      {/* Diagonal beam top-right */}
      <div style={styles.beam1} />
      {/* Diagonal beam bottom-left */}
      <div style={styles.beam2} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 880, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 10 }}
      >
        {/* ══ HERO HEADER ══════════════════════════════════════════════ */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Event Title */}
          <h1 style={styles.heading}>{eventName}</h1>

          {/* Decorative subtitle line ─── • text • ─── */}
          <div style={styles.subtitleRow}>
            <div style={styles.subtitleLine} />
            <span style={styles.subtitleDot}>•</span>
            <span style={styles.subtitleText}>Official Group Registration Portal</span>
            <span style={styles.subtitleDot}>•</span>
            <div style={styles.subtitleLine} />
          </div>
        </div>

        {/* ══ REGISTRATION CARD ════════════════════════════════════════ */}
        {!isOpen ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '48px 40px' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <ShieldAlert size={36} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, fontFamily: 'Space Grotesk, sans-serif' }}>Registration Closed</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6 }}>Registration is currently locked. Please contact the orientation organizers.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.48 }}
            style={styles.card}
          >
            {/* Card Header */}
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderIcon}>
                <IconUserPlus />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Register to Get Your Group</h2>
                <p style={styles.cardSubtitle}>Fill in your details below to receive your group number instantly.</p>
              </div>
            </div>

            {/* Divider */}
            <div style={styles.divider} />

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* FULL NAME */}
              <div>
                <label style={styles.fieldLabel}>
                  <IconUser className="w-[18px] h-[18px]" />
                  FULL NAME
                </label>
                <div style={styles.inputWrap}>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Enter your full name"
                    value={form.name} onChange={handleChange}
                    autoComplete="name"
                    style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
                    onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.name ? '#f43f5e' : 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <span style={styles.inputIcon}><IconUser className="w-[18px] h-[18px]" /></span>
                </div>
                {errors.name && <p style={styles.errorText}>{errors.name}</p>}
              </div>

              {/* DEPARTMENT */}
              <div>
                <label style={styles.fieldLabel}>
                  <IconBuilding className="w-[18px] h-[18px]" />
                  DEPARTMENT
                </label>
                <div style={styles.inputWrap}>
                  <select
                    id="department" name="department"
                    value={form.department} onChange={handleChange}
                    style={{ ...styles.input, ...styles.select, ...(errors.department ? styles.inputError : {}), color: form.department ? '#f1f5f9' : '#64748b' }}
                    onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.department ? '#f43f5e' : 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="" disabled style={{ color: '#64748b', background: '#0f172a' }}>Select Department</option>
                    {depts.map((d) => (
                      <option key={d} value={d} style={{ background: '#0f172a', color: '#f1f5f9' }}>{d}</option>
                    ))}
                  </select>
                  <span style={{ ...styles.inputIcon, pointerEvents: 'none' }}><IconChevronDown /></span>
                </div>
                {errors.department && <p style={styles.errorText}>{errors.department}</p>}
              </div>

              {/* MOBILE NUMBER */}
              <div>
                <label style={styles.fieldLabel}>
                  <IconPhone className="w-[18px] h-[18px]" />
                  MOBILE NUMBER
                </label>
                <div style={styles.inputWrap}>
                  <input
                    id="mobile" name="mobile" type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobile} onChange={handleChange}
                    inputMode="numeric" maxLength={10}
                    autoComplete="tel"
                    style={{ ...styles.input, ...(errors.mobile ? styles.inputError : {}) }}
                    onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.mobile ? '#f43f5e' : 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <span style={styles.inputIcon}><IconPhone className="w-[18px] h-[18px]" /></span>
                </div>
                {errors.mobile && <p style={styles.errorText}>{errors.mobile}</p>}
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                id="register-btn"
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.015, boxShadow: '0 8px 40px rgba(109,40,217,0.55)' } : {}}
                whileTap={!submitting ? { scale: 0.985 } : {}}
                style={styles.submitBtn}
              >
                {submitting ? (
                  <>
                    <Spinner />
                    <span>Assigning Group...</span>
                  </>
                ) : (
                  <>
                    <IconUsersGroup />
                    <span>Get My Group Number</span>
                    <IconArrowRight />
                  </>
                )}
              </motion.button>

              {/* Security footer inside card */}
              <div style={styles.cardFooter}>
                <IconShield />
                <span>Secure Allocation System</span>
                <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                <span>Your data is safe with us</span>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>

      {/* CSS keyframes for loading spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Styles object (matching reference image pixel-perfect) ─────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #050814 0%, #0a0f1e 40%, #0d0820 70%, #080512 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif",
  },
  // Deep purple-blue nebula orbs
  orb1: {
    position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
    width: 700, height: 500,
    background: 'radial-gradient(ellipse, rgba(79,70,229,0.22) 0%, rgba(109,40,217,0.10) 40%, transparent 70%)',
    borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '10%', right: '-10%',
    width: 500, height: 500,
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '5%', left: '-8%',
    width: 400, height: 400,
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 65%)',
    borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
  },
  // Light beams (bright streaks on left)
  beam1: {
    position: 'absolute', top: '-5%', left: '5%',
    width: 3, height: '55%',
    background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.6), transparent)',
    transform: 'rotate(-25deg)', transformOrigin: 'top',
    filter: 'blur(2px)', pointerEvents: 'none',
  },
  beam2: {
    position: 'absolute', bottom: '-5%', left: '18%',
    width: 2, height: '45%',
    background: 'linear-gradient(to top, transparent, rgba(99,102,241,0.5), transparent)',
    transform: 'rotate(-20deg)', transformOrigin: 'bottom',
    filter: 'blur(2px)', pointerEvents: 'none',
  },

  /* Logo box */
  logoBox: {
    width: 80, height: 80,
    margin: '0 auto 14px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 50px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
    border: '1px solid rgba(139,92,246,0.5)',
  },

  /* Hero text */
  collegeName: {
    color: '#818cf8',
    fontSize: 13, fontWeight: 700,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontSize: 'clamp(32px, 6vw, 60px)',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: 16,
    background: 'linear-gradient(90deg, #60a5fa 0%, #818cf8 35%, #c084fc 65%, #f472b6 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 0,
  },
  subtitleLine: {
    flex: '0 1 60px', height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(148,163,184,0.35))',
  },
  subtitleDot: {
    color: 'rgba(148,163,184,0.5)', fontSize: 12,
  },
  subtitleText: {
    color: '#94a3b8', fontSize: 15, fontWeight: 500, letterSpacing: '0.01em',
  },

  /* Card */
  card: {
    background: 'rgba(15,20,40,0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 20,
    padding: '32px 36px 28px',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(79,70,229,0.12)',
    maxWidth: 680,
    margin: '0 auto',
    width: '100%',
  },

  /* Card header (icon + title) */
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 52, height: 52, flexShrink: 0,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(109,40,217,0.45)',
    border: '1px solid rgba(139,92,246,0.4)',
  },
  cardTitle: {
    fontSize: 20, fontWeight: 800, color: '#f1f5f9',
    margin: 0, lineHeight: 1.3,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  cardSubtitle: {
    fontSize: 13.5, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5,
  },

  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), rgba(139,92,246,0.2), transparent)',
    marginBottom: 28,
  },

  /* Form fields */
  fieldLabel: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12.5, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    padding: '0 48px 0 18px',
    background: 'rgba(10,15,35,0.80)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: 15.5,
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'Inter', sans-serif",
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  select: {
    cursor: 'pointer',
    paddingRight: 48,
  },
  inputError: {
    borderColor: '#f43f5e',
  },
  inputIcon: {
    position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(148,163,184,0.5)',
    display: 'flex', alignItems: 'center',
  },

  /* Error text */
  errorText: {
    color: '#f87171', fontSize: 12, fontWeight: 600, marginTop: 6,
    display: 'flex', alignItems: 'center', gap: 4,
  },

  /* Submit button */
  submitBtn: {
    width: '100%', height: 58,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 17, fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(109,40,217,0.40), inset 0 1px 0 rgba(255,255,255,0.12)',
    transition: 'opacity 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.01em',
    marginTop: 4,
  },

  /* Card footer (inside card, below button) */
  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    color: '#475569', fontSize: 12.5, fontWeight: 500,
    marginTop: 4,
  },
};
