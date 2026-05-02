// src/features/dashboard/dashboardApi.js

import apiClient from '../../shared/lib/axios';

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getTrend: () => apiClient.get('/dashboard/trend'),
};