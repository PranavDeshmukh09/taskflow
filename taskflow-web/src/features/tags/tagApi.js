// src/features/tags/tagApi.js

import apiClient from '../../shared/lib/axios';

export const tagApi = {
  getAll: (search) => apiClient.get('/tags', { params: { q: search } }),
  getById: (id) => apiClient.get(`/tags/${id}`),
  create: (data) => apiClient.post('/tags', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  delete: (id) => apiClient.delete(`/tags/${id}`),
};