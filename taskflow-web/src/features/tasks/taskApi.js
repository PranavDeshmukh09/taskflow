// src/features/tasks/taskApi.js

import apiClient from '../../shared/lib/axios';

export const taskApi = {
  getAll: (params) => apiClient.get('/tasks', { params }),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
};