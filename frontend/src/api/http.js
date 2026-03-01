import axios from 'axios';
import { isTokenExpired } from '../utils/jwtUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        // Token is expired, clear it and redirect to login
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Don't make the request if token is expired
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log successful responses
http.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Success Response:', {
      url: response.config?.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    
    // Ensure response.data exists
    if (response.data === undefined && response.status === 200) {
      console.warn('Warning: Response status is 200 but response.data is undefined');
      console.warn('Full response object:', response);
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // Log error details for debugging
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        headers: error.response.headers
      });
      
      // 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
      // 403 Forbidden - insufficient permissions
      if (error.response.status === 403) {
        // Could redirect to access denied page
        console.error('Access denied');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error - No response:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      // Error setting up request
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default http;
