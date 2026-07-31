// Admin Groups Page — Premium SaaS Layout matching all spec requirements
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Search, Users } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import GroupCard from '../components/admin/GroupCard';
import { useStudents } from '../hooks/useStudents';
import { useEventSettings } from '../hooks/useEventSettings';
import { printAllGroups } from '../utils/exportUtils';

export default function AdminGroups() {
  const { students, loading: studentsLoading } = useStudents();
  const { settings, loading: settingsLoading } = useEventSettings();
  const [search, setSearch] = useState('');

  const loading = studentsLoading || settingsLoading;

  const totalGroups = useMemo(() => {
    if (!settings) return 0;
    return settings.totalGroups || Math.ceil(settings.totalStudents / settings.studentsPerGroup);
  }, [settings]);

  // Map group numbers to members
  const groupMap = useMemo(() => {
    const map = {};
    for (let i = 1; i <= totalGroups; i++) map[i] = [];
    students.forEach((s) => {
      const g = s.groupNumber || s.group_number;
      if (map[g]) map[g].push(s);
      else if (g) map[g] = [s];
    });
    return map;
  }, [students, totalGroups]);

  const getMaxCapacity = (groupNum) => {
    if (!settings) return 0;
    const { totalStudents, studentsPerGroup } = settings;
    const isLast = groupNum === totalGroups;
    if (isLast && totalStudents % studentsPerGroup !== 0) {
      return totalStudents % studentsPerGroup;
    }
    return studentsPerGroup;
  };

  const filteredGroupNums = useMemo(() => {
    const nums = Object.keys(groupMap).map(Number).sort((a, b) => a - b);
    if (!search.trim()) return nums;
    const q = search.toLowerCase().trim();
    return nums.filter((g) => {
      const members = groupMap[g] || [];
      return (
        String(g).includes(q) ||
        members.some((s) =>
          s.name.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          s.department.toLowerCase().includes(q)
        )
      );
    });
  }, [groupMap, search]);

  return (
    <AdminLayout pageTitle="Group Management">
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* ── Header: Title + Subtitle + Print Button ── */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: 32, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
              Group Management
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500, marginTop: 10, marginBotton: 0 }}>
              {totalGroups} Total Groups • {students.length} students currently assigned
            </p>
          </div>

          <button
            onClick={() => printAllGroups(students, settings)}
            style={{
              height: 56,
              padding: '0 30px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            <Printer style={{ width: 20, height: 20, color: '#818cf8' }} />
            <span>Print All Groups</span>
          </button>
        </div>

        {/* ── Search Bar: Height 56px, Radius 16px, Margin Bottom 30px ── */}
        <div style={{ position: 'relative', marginBottom: 30 }}>
          <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#6b7280' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by group number, student name, mobile, or department..."
            style={{
              width: '100%',
              height: 56,
              paddingLeft: 54,
              paddingRight: 20,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f9fafb',
              fontSize: 16,
              fontWeight: 500,
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* ── Group Cards Grid (2 Cards Per Row, 24px Gap) ── */}
        {loading ? (
          <div className="groups-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 180, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : filteredGroupNums.length === 0 ? (
          /* Empty Search State */
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px border rgba(255,255,255,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Users style={{ width: 44, height: 44, color: '#4b5563' }} />
            <p style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 700, margin: 0 }}>
              No matching groups found
            </p>
            <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
              Try adjusting your search query or clear the search input.
            </p>
          </div>
        ) : (
          <div className="groups-grid">
            {filteredGroupNums.map((g, i) => (
              <GroupCard
                key={g}
                groupNumber={g}
                members={groupMap[g] || []}
                maxCapacity={getMaxCapacity(g)}
                settings={settings}
                delay={i}
              />
            ))}
          </div>
        )}

      </div>

      {/* Grid CSS Rules */}
      <style>{`
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .groups-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
