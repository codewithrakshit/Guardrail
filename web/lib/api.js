import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('guardrail_token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname.startsWith('/login');
      if (!isAuthPage) {
        localStorage.removeItem('guardrail_token');
        localStorage.removeItem('guardrail_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
