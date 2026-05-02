// src/features/tags/useTags.js

import { useState, useEffect } from 'react';
import apiClient from '../../shared/lib/axios';

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await apiClient.get('/tags');
        setTags(data);
      } catch (error) {
        console.error('Failed to load tags:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  return { tags, loading };
};