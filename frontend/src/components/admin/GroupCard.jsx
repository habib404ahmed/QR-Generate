// GroupCard — Redesigned Premium SaaS Card Layout
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ChevronDown, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import { printGroup } from '../../utils/exportUtils';

export default function GroupCard({ groupNumber, members = [], maxCapacity = 5, settings, delay = 0 }) {
  const [expanded, setExpanded] = useState(true);

  const count = members.length;
  const isFull = count >= maxCapacity;
  const pct = maxCapacity > 0 ? Math.min(100, Math.round((count / maxCapacity) * 100)) : 0;
  const remaining = Math.max(0, maxCapacity - count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay * 0.04 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.3)' }}
      style={{
        minHeight: 150,
        borderRadius: 20,
        padding: 22,
        background: isFull ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
        border: isFull ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        transition: 'all 0.25s ease',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      {/* ── Top Section: 60x60 Number + Info + Action Buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        
        {/* Left + Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 }}>
          
          {/* 60x60 Group Number Box */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: isFull
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              flexShrink: 0,
              boxShadow: isFull
                ? '0 0 20px rgba(16,185,129,0.35)'
                : '0 0 20px rgba(99,102,241,0.35)',
            }}
          >
            {groupNumber}
          </div>

          {/* Group Name & Student Count Info */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: '#f9fafb', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                Group {groupNumber}
              </h3>
              
              {/* Status Badge */}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 99,
                  background: isFull ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                  border: isFull ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.3)',
                  color: isFull ? '#4ade80' : '#818cf8',
                }}
              >
                {isFull ? `FULL (${count}/${maxCapacity})` : `${remaining} slot${remaining === 1 ? '' : 's'} left`}
              </span>
            </div>

            <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users style={{ width: 18, height: 18, color: '#6b7280' }} />
              <span>{count} of {maxCapacity} Students Assigned</span>
            </p>
          </div>

        </div>

        {/* Right Actions: Print & Expand Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            title="Print Group List"
            onClick={() => printGroup(groupNumber, members, settings)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
              e.currentTarget.style.color = '#818cf8';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <Printer style={{ width: 18, height: 18 }} />
          </button>

          <button
            title={expanded ? 'Collapse Group' : 'Expand Group'}
            onClick={() => setExpanded(!expanded)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown style={{ width: 20, height: 20 }} />
            </motion.div>
          </button>
        </div>

      </div>

      {/* ── Progress Bar Section ── */}
      <div style={{ marginTop: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity Fill</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: isFull ? '#4ade80' : '#818cf8', fontFamily: 'Space Grotesk, sans-serif' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 99,
              background: isFull
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              boxShadow: isFull ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(99,102,241,0.5)',
            }}
          />
        </div>
      </div>

      {/* ── Member List (Collapsible) ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', paddingTop: 6 }}
          >
            {members.length === 0 ? (
              /* Empty State */
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>👥</span>
                <p style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 700, margin: 0 }}>
                  No students assigned yet
                </p>
                <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 500, margin: 0 }}>
                  Waiting for registrations...
                </p>
              </div>
            ) : (
              /* Student Rows */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map((m, idx) => (
                  <div
                    key={m.mobile || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  >
                    {/* Index + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ color: '#f3f4f6', fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.name}
                      </span>
                    </div>

                    {/* Department + Mobile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <Badge variant="blue">{m.department}</Badge>
                      <span style={{ color: '#9ca3af', fontSize: 14, fontFamily: 'monospace' }}>
                        {m.mobile}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
