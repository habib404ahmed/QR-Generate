// AdminSidebar — Fixed 280px Sidebar, 56px Menu Height, 22px Icons, 16px Font, No Scrollbar
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

/* ── Icons 22×22 ─────────────────────────────────────────────────────── */
const mk = (d) => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IcoDash    = () => mk(<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>);
const IcoGroups  = () => mk(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>);
const IcoStudents= () => mk(<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>);
const IcoRegs    = () => mk(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>);
const IcoActivity= () => mk(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>);
const IcoQR      = () => mk(<><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="3" height="3" rx="0.5"/><rect x="15" y="20" width="3" height="1" rx="0.5"/><rect x="20" y="15" width="1" height="3" rx="0.5"/></>);
const IcoExport  = () => mk(<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>);
const IcoDisplay = () => mk(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>);
const IcoSettings= () => mk(<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></>);
const IcoUsers   = () => mk(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>);
const IcoSystem  = () => mk(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>);
const IcoGrad    = () => mk(<><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></>);
const IcoLogout  = () => mk(<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>);
const IcoMenu    = () => mk(<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>);
const IcoX       = () => mk(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>);

const NAV_GROUPS = [
  {
    label: 'Management',
    items: [
      { to: '/admin/dashboard', Icon: IcoDash,     label: 'Dashboard' },
      { to: '/admin/groups',    Icon: IcoGroups,   label: 'Groups' },
      { to: '/admin/students',  Icon: IcoStudents, label: 'Students' },
      { to: '/admin/students',  Icon: IcoRegs,     label: 'Registrations' },
      { to: '/admin/dashboard', Icon: IcoActivity, label: 'Activity Log' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/admin/qrcode',    Icon: IcoQR,      label: 'QR Code' },
      { to: '/admin/students',  Icon: IcoExport,  label: 'Export Data' },
      { to: '/admin/dashboard', Icon: IcoDisplay, label: 'Display Screen' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/settings',  Icon: IcoSettings, label: 'Event Settings' },
      { to: '/admin/settings',  Icon: IcoUsers,    label: 'Users & Access' },
      { to: '/admin/settings',  Icon: IcoSystem,   label: 'System Settings' },
    ],
  },
];

const NAV_ITEM_STYLE = {
  display: 'flex', alignItems: 'center', gap: 12,
  height: 56, padding: '0 16px', borderRadius: 12,
  fontSize: 16, fontWeight: 600, textDecoration: 'none',
  transition: 'all 0.18s ease',
  marginBottom: 4,
};

function SidebarContent({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)',
      width: 280,
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, height: 72, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <IcoGrad />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.04em', lineHeight: 1 }}>FRESHERS</p>
            <p style={{ color: '#6366f1', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', marginTop: 3 }}>ORIENTATION 2026</p>
          </div>
        </div>
      </div>

      {/* Nav Menu — Hidden scrollbar if overflow occurs */}
      <nav className="no-scrollbar" style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 24 }}>
            <p style={{
              color: '#4b5563', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              padding: '0 16px', marginBottom: 8,
            }}>{label}</p>
            {items.map(({ to, Icon, label: lbl }) => (
              <NavLink key={lbl} to={to} onClick={onClose}
                style={({ isActive }) => ({
                  ...NAV_ITEM_STYLE,
                  background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ color: isActive ? '#818cf8' : '#6b7280', display: 'flex', flexShrink: 0 }}>
                      <Icon />
                    </span>
                    <span style={{ fontWeight: isActive ? 700 : 600 }}>{lbl}</span>
                    {isActive && (
                      <motion.div layoutId="sidebarDot" style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile Card */}
      <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
        <div style={{
          height: 80, padding: '0 16px', borderRadius: 14,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16,
          }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#f3f4f6', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Administrator</p>
            <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 600, marginTop: 2 }}>Super Admin</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            title="Sign Out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 6, display: 'flex', borderRadius: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <IcoLogout />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block" style={{ width: 280, height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 40 }}>
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile Top Navigation */}
      <header className="lg:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 72, background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoGrad />
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>FRESHERS</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}>
          {open ? <IcoX /> : <IcoMenu />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1040 }}
              onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 1050, width: 280 }}>
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
