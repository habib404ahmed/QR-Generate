// Admin Students Directory — Premium SaaS Layout matching all spec requirements
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, FileSpreadsheet, Trash2, Edit2, MoveRight, UserPlus, UserCheck, GraduationCap, Phone, Calendar } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { useStudents } from '../hooks/useStudents';
import { useEventSettings } from '../hooks/useEventSettings';
import { studentsAPI } from '../services/api';
import { exportCSV, exportExcel } from '../utils/exportUtils';
import AddStudentModal from '../components/admin/AddStudentModal';
import toast from 'react-hot-toast';

export default function AdminStudents() {
  const { students, loading, refetch } = useStudents();
  const { settings } = useEventSettings();

  // Responsive breakpoint
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = windowWidth < 768;

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  // Modals
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [moveGroup, setMoveGroup] = useState('');
  const [addForm, setAddForm] = useState({ name: '', department: '', mobile: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const totalGroups = useMemo(() => {
    if (!settings) return 0;
    return settings.totalGroups || Math.ceil(settings.totalStudents / settings.studentsPerGroup);
  }, [settings]);

  // Filter + search logic
  const filtered = useMemo(() => {
    let result = [...students];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.mobile.includes(q) ||
        s.department.toLowerCase().includes(q) ||
        String(s.groupNumber || s.group_number).includes(q)
      );
    }
    if (filterDept) result = result.filter((s) => s.department === filterDept);
    if (filterGroup) result = result.filter((s) => String(s.groupNumber || s.group_number) === filterGroup);
    return result;
  }, [students, search, filterDept, filterGroup]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await studentsAPI.delete(deleteModal.student.mobile);
      toast.success(`${deleteModal.student.name} deleted successfully`);
      setDeleteModal(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setActionLoading(true);
    try {
      await studentsAPI.update(editModal.student.mobile, editForm);
      toast.success('Student record updated');
      setEditModal(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMove = async () => {
    if (!moveModal || !moveGroup) return;
    setActionLoading(true);
    try {
      await studentsAPI.move(moveModal.student.mobile, parseInt(moveGroup));
      toast.success(`Moved ${moveModal.student.name} to Group ${moveGroup}`);
      setMoveModal(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdd = async (formData) => {
    const payload = formData || addForm;
    if (!payload.name || !payload.department || !payload.mobile) {
      toast.error('All fields are required');
      throw new Error('Validation failed');
    }
    if (!/^\d{10}$/.test(payload.mobile)) {
      toast.error('Mobile must be 10 digits');
      throw new Error('Validation failed');
    }
    setActionLoading(true);
    try {
      const res = await studentsAPI.add(payload);
      toast.success(`Added ${payload.name} to Group ${res.data.groupNumber}`);
      setAddForm({ name: '', department: '', mobile: '' });
      setAddModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const groupOptions = Array.from({ length: totalGroups }, (_, i) => String(i + 1));
  const deptOptions = settings?.departments || [];

  return (
    <AdminLayout pageTitle="Student Directory">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>

        {/* ── Page Header: 40px Title + 18px Subtitle ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ color: '#ffffff', fontSize: 40, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            Student Directory
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 18, fontWeight: 500, marginTop: 10, marginBottom: 0 }}>
            {students.length} Total Students • Showing {filtered.length} Results
          </p>
        </motion.div>

        {/* ── Control Panel (2 Responsive Rows) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Row 1: Search Box (50%) + Department Dropdown (25%) + Group Dropdown (25%) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, width: '100%' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 280 }}>
              <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#6b7280' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, department or group..."
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
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Department Dropdown */}
            <div style={{ flex: '0 1 280px', minWidth: 200 }}>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{
                  width: '100%',
                  height: 56,
                  padding: '0 20px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: filterDept ? '#f9fafb' : '#9ca3af',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="" style={{ background: '#111827', color: '#9ca3af' }}>All Departments</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d} style={{ background: '#111827', color: '#f9fafb' }}>{d}</option>
                ))}
              </select>
            </div>

            {/* Group Dropdown */}
            <div style={{ flex: '0 1 240px', minWidth: 180 }}>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                style={{
                  width: '100%',
                  height: 56,
                  padding: '0 20px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: filterGroup ? '#f9fafb' : '#9ca3af',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="" style={{ background: '#111827', color: '#9ca3af' }}>All Groups</option>
                {groupOptions.map((g) => (
                  <option key={g} value={g} style={{ background: '#111827', color: '#f9fafb' }}>Group {g}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Row 2: Export CSV + Export Excel + Add Student Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-end' }}>
            
            <button
              onClick={() => exportCSV(students, settings?.eventName)}
              style={{
                height: 56,
                padding: '0 28px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f6',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <Download style={{ width: 18, height: 18, color: '#60a5fa' }} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportExcel(students, settings?.eventName)}
              style={{
                height: 56,
                padding: '0 28px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f6',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <FileSpreadsheet style={{ width: 18, height: 18, color: '#34d399' }} />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => setAddModal(true)}
              style={{
                height: 56,
                padding: '0 28px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <UserPlus style={{ width: 18, height: 18 }} />
              <span>Add Student</span>
            </button>

          </div>

        </div>

        {/* ── Table Container / Empty State ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          {loading ? (
            <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '2.5px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            /* 👨‍🎓 Beautiful Empty State */
            <div style={{ padding: '80px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>👨‍🎓</div>
              <h3 style={{ color: '#f9fafb', fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                No Students Registered Yet
              </h3>
              <p style={{ color: '#9ca3af', fontSize: 16, margin: 0, maxWidth: 450 }}>
                Students will appear here once they complete registration, or you can add them manually.
              </p>
              <button
                onClick={() => setAddModal(true)}
                style={{
                  marginTop: 12,
                  height: 48,
                  padding: '0 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <UserPlus style={{ width: 18, height: 18 }} />
                <span>Add Student</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div style={{ display: isMobile ? 'none' : 'block', overflowX: 'auto', maxHeight: 650 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 60 }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: 140 }} />
                  </colgroup>
                  <thead style={{ position: 'sticky', top: 0, background: '#111827', zIndex: 10 }}>
                    <tr style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['#', 'STUDENT NAME', 'DEPARTMENT', 'MOBILE NUMBER', 'ASSIGNED GROUP', 'REGISTRATION TIME', 'ACTIONS'].map((h, idx) => (
                        <th key={h} style={{ padding: '0 20px', textAlign: idx === 6 ? 'right' : 'left', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, i) => {
                      const odd = i % 2 === 1;
                      const gNum = student.groupNumber || student.group_number;
                      return (
                        <tr
                          key={student.mobile || i}
                          style={{
                            height: 64,
                            background: odd ? 'rgba(255,255,255,0.015)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = odd ? 'rgba(255,255,255,0.015)' : 'transparent'}
                        >
                          <td style={{ padding: '0 20px', color: '#6b7280', fontSize: 15, fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: '0 20px', color: '#f3f4f6', fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</td>
                          <td style={{ padding: '0 20px' }}>
                            <Badge variant="blue">{student.department}</Badge>
                          </td>
                          <td style={{ padding: '0 20px', color: '#9ca3af', fontSize: 15, fontFamily: 'monospace' }}>{student.mobile}</td>
                          <td style={{ padding: '0 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                              Group {gNum}
                            </span>
                          </td>
                          <td style={{ padding: '0 20px', color: '#6b7280', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.registeredDate && student.registeredTime
                              ? `${student.registeredDate} ${student.registeredTime}`
                              : student.registeredAt
                                ? new Date(student.registeredAt).toLocaleString()
                                : '—'}
                          </td>
                          <td style={{ padding: '0 20px' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                title="Edit Record"
                                onClick={() => { setEditModal({ student }); setEditForm({ name: student.name, department: student.department }); }}
                                style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#818cf8'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              >
                                <Edit2 style={{ width: 16, height: 16 }} />
                              </button>

                              <button
                                title="Move Group"
                                onClick={() => { setMoveModal({ student }); setMoveGroup(String(gNum)); }}
                                style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.color = '#fbbf24'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              >
                                <MoveRight style={{ width: 16, height: 16 }} />
                              </button>

                              <button
                                title="Delete Record"
                                onClick={() => setDeleteModal({ student })}
                                style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; e.currentTarget.style.color = '#f87171'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
                              >
                                <Trash2 style={{ width: 16, height: 16 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Student Card View (< 768px) */}
              <div style={{ display: isMobile ? 'flex' : 'none', padding: 16, flexDirection: 'column', gap: 14 }}>
                {filtered.map((student, i) => {
                  const gNum = student.groupNumber || student.group_number;
                  return (
                    <div
                      key={student.mobile || i}
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: '#f9fafb', fontSize: 17, fontWeight: 700, margin: 0 }}>
                          👤 {student.name}
                        </h4>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                          Group {gNum}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#9ca3af' }}>
                        <span>Department: <strong style={{ color: '#e5e7eb' }}>{student.department}</strong></span>
                        <span style={{ fontFamily: 'monospace' }}>{student.mobile}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          {student.registeredDate || '—'}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditModal({ student }); setEditForm({ name: student.name, department: student.department }); }} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#818cf8' }}><Edit2 style={{ width: 16, height: 16 }} /></button>
                          <button onClick={() => { setMoveModal({ student }); setMoveGroup(String(gNum)); }} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#fbbf24' }}><MoveRight style={{ width: 16, height: 16 }} /></button>
                          <button onClick={() => setDeleteModal({ student })} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#f87171' }}><Trash2 style={{ width: 16, height: 16 }} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Premium Delete Confirmation Modal ── */}
      {deleteModal && (
        <div
          onClick={() => setDeleteModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 24,
              padding: 36,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Red glow background accent */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Warning Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 0 24px rgba(239,68,68,0.15)',
            }}>
              <Trash2 style={{ width: 28, height: 28, color: '#ef4444' }} />
            </div>

            {/* Title */}
            <h3 style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              margin: '0 0 10px',
              lineHeight: 1.2,
            }}>
              Delete Student Record
            </h3>

            {/* Student info pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 16,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {deleteModal.student.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.2 }}>{deleteModal.student.name}</p>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{deleteModal.student.mobile} · Group {deleteModal.student.groupNumber || deleteModal.student.group_number}</p>
              </div>
            </div>

            {/* Warning message */}
            <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              This action is <strong style={{ color: '#fca5a5' }}>permanent and cannot be undone</strong>. The student's group slot will be freed up.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteModal(null)}
                disabled={actionLoading}
                style={{
                  flex: 1, height: 50, borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e5e7eb', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                style={{
                  flex: 1, height: 50, borderRadius: 14,
                  border: 'none',
                  background: actionLoading
                    ? 'rgba(239,68,68,0.4)'
                    : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: '#ffffff', fontSize: 15, fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: actionLoading ? 'none' : '0 4px 20px rgba(239,68,68,0.4)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)' }
              >
                {actionLoading ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Deleting...</>
                ) : (
                  <><Trash2 style={{ width: 16, height: 16 }} /> Delete Student</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Student Record">
        <div className="space-y-[24px] mb-6">
          <Input label="FULL NAME" value={editForm.name || ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <Select
            label="DEPARTMENT"
            value={editForm.department || ''}
            onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
            options={deptOptions}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setEditModal(null)} fullWidth>Cancel</Button>
          <Button onClick={handleEdit} loading={actionLoading} fullWidth>Save Changes</Button>
        </div>
      </Modal>

      <Modal isOpen={!!moveModal} onClose={() => setMoveModal(null)} title={`Move ${moveModal?.student.name}`}>
        <div className="mb-6">
          <Select
            label="MOVE TO GROUP"
            value={moveGroup}
            onChange={(e) => setMoveGroup(e.target.value)}
            options={groupOptions.map((g) => ({ value: g, label: `Group ${g}` }))}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setMoveModal(null)} fullWidth>Cancel</Button>
          <Button onClick={handleMove} loading={actionLoading} fullWidth>Move Student</Button>
        </div>
      </Modal>

      {/* Redesigned Add Student Modal */}
      <AddStudentModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onAdd={handleAdd}
        deptOptions={deptOptions}
      />
    </AdminLayout>
  );
}
