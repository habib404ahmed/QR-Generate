// AdminLayout — Single Scroll Architecture, Fixed 72px Header, Fixed 280px Sidebar, 1600px Max Content Width
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useEventSettings } from '../../hooks/useEventSettings';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function TopBar({ pageTitle = 'Admin Dashboard' }) {
  const { settings } = useEventSettings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const greeting   = getGreeting();
  const isOpen     = settings?.registrationOpen !== false;
  const eventName  = settings?.eventName || 'Freshers Orientation 2026';

  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <header className="hidden lg:flex" style={{
      position: 'fixed',
      top: 0,
      left: 280,
      right: 0,
      height: 72,
      zIndex: 1000,
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      alignItems: 'center',
      padding: '0 32px',
      gap: 24,
    }}>
      {/* Left — greeting + title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
          {greeting} 👋
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ color: '#f9fafb', fontSize: 20, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {pageTitle}
          </h1>
          <span style={{ color: '#4b5563', fontSize: 13, fontWeight: 500 }}>{eventName}</span>
        </div>
      </div>

      {/* Right — status + date/time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        {/* Registration status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 14px', borderRadius: 999,
          background: isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${isOpen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isOpen ? '#22c55e' : '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: isOpen ? '#4ade80' : '#f87171' }}>
            {isOpen ? 'Registration Open' : 'Registration Closed'}
          </span>
        </div>

        {/* Date & time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14, color: '#6b7280' }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>{dateStr}</span>
          <span style={{ color: '#374151', fontSize: 12 }}>•</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#d1d5db' }}>{timeStr}</span>
        </div>

        {/* Bell */}
        <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111827' }}>3</span>
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children, pageTitle }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', position: 'relative' }}>
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Fixed Desktop Top Bar */}
      <TopBar pageTitle={pageTitle} />

      {/* Main Content Area — Single Window Scroll Architecture */}
      <main
        className="admin-main-content"
        style={{
          minHeight: 'calc(100vh - 72px)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* Desktop Layout */
        @media (min-width: 1024px) {
          .admin-main-content {
            margin-left: 280px !important;
            margin-top: 72px !important;
            padding: 32px !important;
          }
        }

        /* Mobile / Tablet Layout */
        @media (max-width: 1023px) {
          .admin-main-content {
            margin-left: 0 !important;
            margin-top: 72px !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
