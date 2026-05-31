import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API error:', error.response?.data ?? error.message);
    return Promise.reject(error);
  },
);
