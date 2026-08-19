import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // Needed for the auth session cookie (cross-origin in dev — 5173 -> API port).
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API error:', error.response?.data ?? error.message);
    return Promise.reject(error);
  },
);
