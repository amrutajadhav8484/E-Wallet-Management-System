import http from './http';

export const signup = async (userData) => {
  const response = await http.post('/api/v1/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await http.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const getProfile = async (userId) => {
  const response = await http.get(`/api/v1/auth/profile`);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await http.put(`/api/v1/auth/profile`, profileData);
  return response.data;
};

export const changePassword = async (userId, passwordData) => {
  const response = await http.put(`/api/v1/auth/change-password`, passwordData);
  return response.data;
};

export const forgotPassword = async (mobile) => {
  const response = await http.post('/api/v1/auth/forgot-password', { mobile });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await http.post('/api/v1/auth/reset-password', { token, newPassword });
  return response.data;
};
