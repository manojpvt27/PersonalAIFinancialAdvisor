import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // In production browser environment, use relative path so Next rewrites or same-domain API handles it
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) => api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  googleAuth: (data: any) => api.post('/auth/google', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const expenseAPI = {
  list: (params?: any) => api.get('/expenses', { params }),
  get: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
  categories: (params?: any) => api.get('/expenses/categories', { params }),
  trends: (months?: number) => api.get('/expenses/trends', { params: { months } }),
};

export const incomeAPI = {
  list: (params?: any) => api.get('/income', { params }),
  get: (id: string) => api.get(`/income/${id}`),
  create: (data: any) => api.post('/income', data),
  update: (id: string, data: any) => api.put(`/income/${id}`, data),
  delete: (id: string) => api.delete(`/income/${id}`),
  breakdown: (params?: any) => api.get('/income/breakdown', { params }),
};

export const budgetAPI = {
  list: () => api.get('/budgets'),
  get: (id: string) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export const goalAPI = {
  list: () => api.get('/goals'),
  get: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  contribute: (id: string, amount: number, note?: string) => api.post(`/goals/${id}/contribute`, { amount, note }),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  healthScore: () => api.get('/analytics/health-score'),
  trends: (months?: number) => api.get('/analytics/trends', { params: { months } }),
  categories: () => api.get('/analytics/categories'),
};

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  chatHistory: () => api.get('/ai/chat/history'),
  insights: () => api.get('/ai/insights'),
  recommendations: () => api.get('/ai/recommendations'),
};

export const notificationAPI = {
  list: (unreadOnly?: boolean) => api.get('/notifications', { params: { unreadOnly } }),
  count: () => api.get('/notifications/count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export default api;
