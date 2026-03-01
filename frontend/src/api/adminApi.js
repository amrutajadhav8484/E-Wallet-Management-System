import http from './http';

export const getAllUsers = async () => {
  const response = await http.get('/api/v1/admin/users');
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await http.get(`/api/v1/admin/users/${userId}`);
  return response.data;
};

export const assignAdminRole = async (userId) => {
  const response = await http.post(`/api/v1/admin/users/${userId}/assign-admin`);
  return response.data;
};

export const removeAdminRole = async (userId) => {
  const response = await http.post(`/api/v1/admin/users/${userId}/remove-admin`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await http.post(`/api/v1/admin/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await http.post(`/api/v1/admin/users/${userId}/unblock`);
  return response.data;
};
