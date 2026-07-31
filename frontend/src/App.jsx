// App.jsx — Main router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminGroups from './pages/AdminGroups';
import AdminStudents from './pages/AdminStudents';
import AdminSettings from './pages/AdminSettings';
import AdminQRCode from './pages/AdminQRCode';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 15, 35, 0.95)',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/groups"
            element={<ProtectedRoute><AdminGroups /></ProtectedRoute>}
          />
          <Route
            path="/admin/students"
            element={<ProtectedRoute><AdminStudents /></ProtectedRoute>}
          />
          <Route
            path="/admin/settings"
            element={<ProtectedRoute><AdminSettings /></ProtectedRoute>}
          />
          <Route
            path="/admin/qrcode"
            element={<ProtectedRoute><AdminQRCode /></ProtectedRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
