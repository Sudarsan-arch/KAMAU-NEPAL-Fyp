import axios from 'axios';

/**
 * Centralized API Service for Kamau Nepal
 * Best Practice: Using an axios instance allows for global configuration 
 * (base URL, headers, interceptors) in one place.
 */

// Use environment variable with fallback to backend port 5001
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
