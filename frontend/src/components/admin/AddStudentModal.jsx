// AddStudentModal — Premium Dialog Component
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onAdd, deptOptions = ['BCA', 'B.Tech'] }) {
  const [form, setForm] = useState({ name: '', department: deptOptions[0] || 'BCA', mobile: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', department: deptOptions[0] || 'BCA', mobile: '' });
      setErrors({});
      setLoading(false);
    }
  }, [isOpen, deptOptions]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } catch {
      // Error handled by parent toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(20px)' }}
          onClick={() => !loading && onClose()}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '95%',
            maxWidth: 720,
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.25)',
            color: '#f9fafb',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Right Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            title="Close dialog (Esc)"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#9ca3af',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>

          {/* ── Header ── */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
              👨‍🎓 Add Student Manually
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500, marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
              Manually register a student and automatically assign them to an available group.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* FULL NAME */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
              <label style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter student's full name..."
                style={{
                  width: '100%',
                  height: 56,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: errors.name ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f9fafb',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.name && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  ❌ {errors.name}
                </motion.div>
              )}
            </div>

            {/* DEPARTMENT */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
              <label style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                DEPARTMENT
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                style={{
                  width: '100%',
                  height: 56,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 14,
                  background: '#1f2937',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f9fafb',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {deptOptions.map((dept) => (
                  <option key={dept} value={dept} style={{ background: '#111827', color: '#f9fafb' }}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* MOBILE NUMBER */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 32 }}>
              <label style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                MOBILE NUMBER
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Enter 10-digit mobile number..."
                style={{
                  width: '100%',
                  height: 56,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: errors.mobile ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f9fafb',
                  fontSize: 16,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.mobile ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.mobile && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  ❌ {errors.mobile}
                </motion.div>
              )}
            </div>

            {/* ── Buttons Section ── */}
            <div className="add-student-modal-buttons">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  height: 58,
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#9ca3af',
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 58,
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255, 255, 255, 0.4)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Adding & Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus style={{ width: 20, height: 20 }} />
                    <span>Add & Assign Group</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </motion.div>

        {/* Responsive CSS for buttons */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }

          .add-student-modal-buttons {
            display: flex;
            gap: 16px;
          }
          .add-student-modal-buttons > button:nth-child(1) {
            flex: 1;
            width: 48%;
          }
          .add-student-modal-buttons > button:nth-child(2) {
            flex: 1;
            width: 48%;
          }

          @media (max-width: 640px) {
            .add-student-modal-buttons {
              flex-direction: column-reverse !important;
              gap: 16px !important;
            }
            .add-student-modal-buttons > button {
              width: 100% !important;
              flex: none !important;
            }
          }
        `}</style>

      </div>
    </AnimatePresence>
  );
}
