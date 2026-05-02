// src/features/projects/useProjects.js - FIXED

import { useState, useEffect, useCallback } from 'react';
import { projectApi } from './projectApi';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      console.log('Projects loaded:', data); // Debug log
      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData) => {
    try {
      const newProject = await projectApi.create(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to create project');
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updated = await projectApi.update(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to update project');
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error(err.error?.message || 'Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
};