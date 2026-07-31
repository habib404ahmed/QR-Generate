// AdminDashboard — Premium SaaS Grid & Responsive Layout matching all spec requirements
import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { useStudents } from '../hooks/useStudents';
import { useEventSettings } from '../hooks/useEventSettings';
import { settingsAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

/* ═══════════════════════════ ICONS ════════════════════════════════════ */
const mkI = (d) => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }} stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IcoUsers    = () => mkI(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>);
const IcoGrid     = () => mkI(<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>);
const IcoPerson   = () => mkI(<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>);
const IcoSlots    = () => mkI(<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></>);
const IcoStatus   = () => mkI(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>);
const IcoEye      = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEdit     = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash    = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IcoClock    = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoChevL    = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR    = () => <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

/* ═══════════════════════════ ANIMATED COUNT-UP ═══════════════════════ */
function CountUp({ target, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{val}{suffix}</>;
}

/* ═══════════════════════════ STAT CARD ═══════════════════════════════ */
function StatCard({ label, description, value, numericVal, suffix = '', barPct, barColor, iconBg, Icon, statusText, statusColor, actionBtn, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)' }}
      style={{
        minHeight: 160,
        borderRadius: 20,
        padding: 24,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: iconBg, opacity: 0.08, filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon />
      </div>

      <p style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
        {label}
      </p>

      <p style={{ fontSize: 42, fontWeight: 900, color: '#f9fafb', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {typeof numericVal === 'number' ? <CountUp target={numericVal} /> : value}
        {suffix}
      </p>

      <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', lineHeight: 1.4 }}>
        {description}
      </p>

      {barPct !== undefined && (
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(barPct, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: delay * 0.08 + 0.3 }}
              style={{ height: '100%', borderRadius: 99, background: barColor }}
            />
          </div>
          {statusText && (
            <p style={{ fontSize: 12, fontWeight: 700, color: statusColor, marginTop: 6 }}>{statusText}</p>
          )}
        </div>
      )}

      {actionBtn && (
        <button onClick={actionBtn.onClick} style={{
          marginTop: 'auto', padding: '8px 0', borderRadius: 10,
          border: '1px solid rgba(244,63,94,0.4)', background: 'rgba(244,63,94,0.1)',
          color: '#f87171', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
        >
          {actionBtn.label}
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════ CIRCULAR PROGRESS ════════════════════════ */
function CircleProgress({ pct }) {
  const r = 58, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
        <motion.circle cx="80" cy="80" r={r} fill="none"
          stroke="url(#cg2)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 28, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
          <CountUp target={pct} suffix="%" />
        </span>
        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Completed</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════ GROUP CARD (Dashboard Item) ═════════════
   Spec: Min Width 170px, Min Height 130px, Padding 18px, Radius 18px
   Layout: GROUP N, Status Badge, 0 / 5 Students, Progress Bar
══════════════════════════════════════════════════════════════════════ */
function DashboardGroupCard({ num, count, max }) {
  const full = count >= max;
  const pct  = max > 0 ? Math.min((count / max) * 100, 100) : 0;
  return (
    <motion.div
      whileHover={{ borderColor: full ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)', y: -2 }}
      style={{
        minWidth: 170,
        minHeight: 130,
        padding: 18,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        gap: 12,
        transition: 'all 0.2s ease',
        cursor: 'default',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em', margin: 0 }}>
            GROUP {num}
          </p>
          <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600, marginTop: 4, marginBotton: 0 }}>
            {count} / {max} Students
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: full ? '#4ade80' : '#a78bfa',
          padding: '3px 10px', borderRadius: 99,
          background: full ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
          border: `1px solid ${full ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.3)'}`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {full ? '● Full' : '● Open'}
        </span>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 99, background: full ? '#22c55e' : 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════ SECTION HEADING ═════════════════════════ */
function SectionHeading({ icon, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#6366f1' }}>{icon}</span>
        <h2 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 28, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em', margin: 0 }}>
          {title}
        </h2>
      </div>
      {action && (
        <Link to={action.to} style={{ color: '#818cf8', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
          onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════ MAIN DASHBOARD ══════════════════════════ */
const PER_PAGE = 5;

export default function AdminDashboard() {
  const { students, loading: sl, refetch } = useStudents();
  const { settings, loading: stl, refetch: refetchSettings } = useEventSettings();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const loading = sl || stl;

  /* Confirm & execute delete */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await studentsAPI.delete(deleteTarget.mobile);
      toast.success(`${deleteTarget.name} deleted successfully`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Stats */
  const stats = useMemo(() => {
    const registered  = students.length;
    const total       = settings?.totalStudents  || 80;
    const perGroup    = settings?.studentsPerGroup || 5;
    const totalGroups = settings?.totalGroups    || Math.ceil(total / perGroup);
    const remaining   = Math.max(0, total - registered);
    const pct         = total > 0 ? Math.round((registered / total) * 100) : 0;
    return { total, perGroup, totalGroups, registered, remaining, pct };
  }, [students, settings]);

  /* Group counts */
  const groupData = useMemo(() => {
    const map = {};
    students.forEach(s => { const g = s.groupNumber || s.group_number; if (g) map[g] = (map[g] || 0) + 1; });
    return Array.from({ length: stats.totalGroups }, (_, i) => ({ num: i + 1, count: map[i + 1] || 0, max: stats.perGroup }));
  }, [students, stats]);

  /* Paginated rows */
  const sorted     = useMemo(() => [...students].reverse(), [students]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageRows   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const isOpen = settings?.registrationOpen !== false;

  const handleToggle = async () => {
    try {
      await settingsAPI.update({ ...settings, registrationOpen: !isOpen });
      toast.success(isOpen ? 'Registration closed' : 'Registration opened');
      if (refetchSettings) refetchSettings();
    } catch { toast.error('Failed to update registration status'); }
  };

  const deptStyle = (dept = '') => {
    if (dept.toLowerCase().includes('bca'))  return { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', color: '#2dd4bf' };
    if (dept.toLowerCase().includes('tech')) return { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  color: '#60a5fa' };
    return { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', color: '#c084fc' };
  };

  const fmtDate = (s) => {
    try {
      const d = s.registeredAt ? new Date(s.registeredAt) : null;
      if (!d) return '—';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '—'; }
  };

  const panel = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 };

  return (
    <AdminLayout pageTitle="Administrator Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ═══ 1. TOP STATS GRID (5 Columns Desktop) ═══ */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
          <StatCard
            delay={0} label="Total Students" Icon={IcoUsers}
            iconBg="linear-gradient(135deg,#3b82f6,#6366f1)"
            numericVal={stats.registered} value={stats.registered}
            description="Total registered students"
            barPct={stats.pct} barColor="linear-gradient(90deg,#3b82f6,#6366f1)"
            statusText={`${stats.pct}% Completed`} statusColor="#3b82f6"
          />
          <StatCard
            delay={1} label="Groups Created" Icon={IcoGrid}
            iconBg="linear-gradient(135deg,#6366f1,#8b5cf6)"
            numericVal={stats.totalGroups} value={stats.totalGroups}
            description="Active groups allocated"
            barPct={100} barColor="linear-gradient(90deg,#6366f1,#8b5cf6)"
            statusText="100% Completed" statusColor="#818cf8"
          />
          <StatCard
            delay={2} label="Students Per Group" Icon={IcoPerson}
            iconBg="linear-gradient(135deg,#22c55e,#16a34a)"
            numericVal={stats.perGroup} value={stats.perGroup}
            description="Students per group"
            statusText="Balanced distribution" statusColor="#4ade80"
          />
          <StatCard
            delay={3} label="Remaining Slots" Icon={IcoSlots}
            iconBg="linear-gradient(135deg,#f59e0b,#d97706)"
            numericVal={stats.remaining} value={stats.remaining}
            description={`Out of ${stats.total} total slots`}
            barPct={((stats.total - stats.remaining) / stats.total) * 100}
            barColor="linear-gradient(90deg,#f59e0b,#d97706)"
            statusText={stats.remaining === 0 ? 'All Filled' : `${stats.remaining} slots left`}
            statusColor={stats.remaining === 0 ? '#f59e0b' : '#94a3b8'}
          />
          <StatCard
            delay={4} label="Registration Status" Icon={IcoStatus}
            iconBg="linear-gradient(135deg,#f43f5e,#e11d48)"
            value={isOpen ? 'Active' : 'Closed'}
            description={isOpen ? 'Registration is open' : 'Registration is closed'}
            actionBtn={{ label: isOpen ? 'Close Registration' : 'Open Registration', onClick: handleToggle }}
          />
        </div>

        {/* ═══ 2. MAIN DASHBOARD GRID (2 Equal Columns Desktop, Stack Mobile) ═══ */}
        <div className="main-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, alignItems: 'stretch' }}>

          {/* Left Column: Registration Progress Card (Min Height 380px, Padding 32px) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ ...panel, padding: 32, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
            <SectionHeading icon={<IcoClock />} title="Registration Progress" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, flexWrap: 'wrap' }}>
              {/* Left Circle Progress */}
              <CircleProgress pct={stats.pct} />

              {/* Right Details */}
              <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: '#f3f4f6' }}>{stats.registered}</strong> of <strong style={{ color: '#f3f4f6' }}>{stats.total}</strong> students registered successfully!
                </p>

                {/* Progress Bar */}
                <div>
                  <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${stats.pct}%` }} transition={{ duration: 1.4 }}
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)' }}
                    />
                  </div>
                </div>

                {/* Statistics Grid — 4 mini cards (min 120x120 each, 20px gap) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  {[
                    { v: stats.registered, l: 'Registered' },
                    { v: stats.remaining,  l: 'Remaining'  },
                    { v: stats.totalGroups,l: 'Groups'     },
                    { v: `${stats.pct}%`,  l: 'Completion' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ minHeight: 80, padding: '16px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: '#f9fafb', fontWeight: 900, fontSize: 26, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                        {typeof v === 'number' ? <CountUp target={v} /> : v}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4, fontWeight: 700, margin: 0 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Group Overview Card (Min Height 380px, Padding 32px, NO Scrollbars) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ ...panel, padding: 32, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
            <SectionHeading icon={<IcoGrid />} title="Group Overview" action={{ to: '/admin/groups', label: 'View All Groups' }} />
            
            {/* Group Cards Grid: 4 cols desktop, 3 tablet, 2 small tablet, 1 mobile (18px gap) */}
            <div className="dashboard-group-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 4 }}>
              {groupData.slice(0, 8).map(g => (
                <DashboardGroupCard key={g.num} num={g.num} count={g.count} max={g.max} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══ 3. RECENT STUDENT REGISTRATIONS (Min Height 420px, Header 72px) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ ...panel, minHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Header (72px Height) */}
          <div style={{ height: 72, padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <SectionHeading icon={<IcoClock />} title="Recent Student Registrations" action={{ to: '/admin/students', label: 'View All Registrations' }} />
          </div>

          {loading ? (
            <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '2.5px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : sorted.length === 0 ? (
            /* Empty State — Max Height 420px, Centered Icon, Title, Button */
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 14, maxHeight: 420 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>🎓</div>
              <h3 style={{ color: '#f9fafb', fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                No Students Registered Yet
              </h3>
              <p style={{ color: '#9ca3af', fontSize: 15, margin: 0, maxWidth: 400 }}>
                Students will appear here live in real-time once they register using the QR code.
              </p>
              <Link to="/admin/qrcode" style={{ marginTop: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Open QR Code Generator
              </Link>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 60  }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: 120 }} />
                  </colgroup>
                  <thead>
                    <tr style={{ height: 56, background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['#', 'FULL NAME', 'DEPARTMENT', 'MOBILE NUMBER', 'ASSIGNED GROUP', 'REGISTERED AT', 'ACTIONS'].map(h => (
                        <th key={h} style={{ padding: '0 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((s, i) => {
                      const dc  = deptStyle(s.department);
                      const idx = (page - 1) * PER_PAGE + i + 1;
                      const odd = i % 2 === 1;
                      return (
                        <tr key={s.mobile || i}
                          style={{ height: 60, background: odd ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = odd ? 'rgba(255,255,255,0.015)' : 'transparent'}
                        >
                          <td style={{ padding: '0 20px', color: '#6b7280', fontSize: 15, fontWeight: 600 }}>{idx}</td>
                          <td style={{ padding: '0 20px', color: '#f3f4f6', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                          <td style={{ padding: '0 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: dc.bg, border: `1px solid ${dc.border}`, color: dc.color }}>
                              {s.department}
                            </span>
                          </td>
                          <td style={{ padding: '0 20px', color: '#9ca3af', fontSize: 15, fontFamily: 'monospace' }}>{s.mobile}</td>
                          <td style={{ padding: '0 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                              Group {s.groupNumber || s.group_number}
                            </span>
                          </td>
                          <td style={{ padding: '0 20px', color: '#6b7280', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtDate(s)}</td>
                          <td style={{ padding: '0 20px' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button title="View" onClick={() => navigate('/admin/students')}
                                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#818cf8'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              ><IcoEye /></button>
                              <button title="Edit" onClick={() => navigate('/admin/students')}
                                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.color = '#fbbf24'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              ><IcoEdit /></button>
                              <button title="Delete" onClick={() => setDeleteTarget(s)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; e.currentTarget.style.color = '#f87171'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              ><IcoTrash /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === 1 ? '#374151' : '#9ca3af', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <IcoChevL />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pg => (
                    <button key={pg} onClick={() => setPage(pg)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        background: page === pg ? '#6366f1' : 'transparent',
                        color: page === pg ? '#fff' : '#6b7280' }}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === totalPages ? '#374151' : '#9ca3af', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <IcoChevR />
                  </button>
                </div>
                <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 500, margin: 0 }}>
                  Showing <strong style={{ color: '#9ca3af' }}>{sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</strong> to <strong style={{ color: '#9ca3af' }}>{Math.min(page * PER_PAGE, sorted.length)}</strong> of <strong style={{ color: '#9ca3af' }}>{sorted.length}</strong> entries
                </p>
              </div>
            </>
          )}
        </motion.div>

      </div>

      {/* Grid CSS Rules */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }

        .dashboard-group-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 1400px) {
          .dashboard-group-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 1100px) {
          .dashboard-group-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .dashboard-group-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 1023px) {
          .main-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <h3 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 20, marginBottom: 10, fontFamily: 'Space Grotesk, sans-serif' }}>Delete Student</h3>
              <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                Are you sure you want to delete <strong style={{ color: '#f3f4f6' }}>{deleteTarget.name}</strong>? This will free up their slot in <strong style={{ color: '#818cf8' }}>Group {deleteTarget.groupNumber || deleteTarget.group_number}</strong>.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                  style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#9ca3af', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {deleteLoading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Deleting...</>
                  ) : 'Delete Student'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
