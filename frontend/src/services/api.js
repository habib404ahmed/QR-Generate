// Axios API client with dynamic Vite proxy routing for seamless Wi-Fi Mobile & Production support
import axios from 'axios';

// Calculate Base URL:
// Always use relative '/api/' in development and production (proxied via Vite on dev server)
// so mobile Wi-Fi devices never get blocked by Windows Firewall on port 5000!
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    if (!url.endsWith('/api')) url += '/api';
    return url + '/';
  }
  return '/api/';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token for admin routes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('auth/login', credentials),
  verify: () => api.get('auth/verify'),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentsAPI = {
  register: (data) => api.post('students/register', data),
  getAll: () => api.get('students'),
  update: (mobile, data) => api.put(`students/${mobile}`, data),
  delete: (mobile) => api.delete(`students/${mobile}`),
  move: (mobile, newGroupNumber) => api.post('students/move', { mobile, newGroupNumber }),
  add: (data) => api.post('students/add', data),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('settings'),
  update: (data) => api.put('settings', data),
  reset: () => api.post('settings/reset'),
};

// ─── Network ──────────────────────────────────────────────────────────────────
export const networkAPI = {
  getInfo: () => api.get('network/info'),
  pingHealth: () => api.get('health'),
};

export default api;
