// src/features/tasks/useTasks.js

import { useState, useEffect, useCallback } from 'react';
import { taskApi } from './taskApi';

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  const fetchTasks = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await taskApi.getAll({ ...filters, ...params });
      setTasks(response.tasks);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err.error?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (taskData) => {
    try {
      const newTask = await taskApi.create(taskData);
      await fetchTasks();
      return newTask;
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to create task');
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const updated = await taskApi.update(id, taskData);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to update task');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const updated = await taskApi.updateStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: updated.status } : t));
      return updated;
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to update status');
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    refreshTasks: fetchTasks,
  };
};