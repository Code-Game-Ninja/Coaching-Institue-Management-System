import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Students
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Courses
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Batches
export const batchesAPI = {
  getAll: (params) => api.get('/batches', { params }),
  getOne: (id) => api.get(`/batches/${id}`),
  getStudents: (id) => api.get(`/batches/${id}/students`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
};

// Payments
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getPending: () => api.get('/payments/pending'),
  create: (data) => api.post('/payments', data),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Reports
export const reportsAPI = {
  exportStudents: () => api.get('/reports/students', { responseType: 'blob' }),
  exportPayments: () => api.get('/reports/payments', { responseType: 'blob' }),
};

export default api;

// Email
export const emailAPI = {
  sendReminder: (data) => api.post('/email/fee-reminder', data),
  bulkReminder: (data) => api.post('/email/bulk-fee-reminder', data),
};
