// src/features/dashboard/useDashboard.js

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from './dashboardApi';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, trendData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getTrend()
      ]);
      setStats(statsData);
      setTrend(trendData.trend || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { stats, trend, loading, error, refresh: fetchDashboard };
};