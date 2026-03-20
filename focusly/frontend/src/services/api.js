import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Clear local cache on auth failure
      localStorage.removeItem('focusly_user')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err.response?.data || err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
  changePassword: (data) => api.patch('/auth/password', data),
}

// ── Tasks ─────────────────────────────────────────────
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  bulkDelete: (ids) => api.delete('/tasks/bulk-delete', { data: { ids } }),
  toggleSubtask: (taskId, subtaskId) => api.patch(`/tasks/${taskId}/subtask/${subtaskId}`),
}

// ── Timers ────────────────────────────────────────────
export const timersApi = {
  start: (taskId) => api.post(`/timers/${taskId}/start`),
  stop: (taskId) => api.post(`/timers/${taskId}/stop`),
  getActive: () => api.get('/timers/active'),
}

// ── Analytics ─────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  weekly: () => api.get('/analytics/weekly'),
  trend: () => api.get('/analytics/trend'),
  categories: () => api.get('/analytics/categories'),
  heatmap: () => api.get('/analytics/heatmap'),
}

export default api
