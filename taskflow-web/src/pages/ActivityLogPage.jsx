// src/pages/ActivityLogPage.jsx - FIXED

import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Spinner from '../shared/ui/Spinner';
import apiClient from '../shared/lib/axios';

const actionIcons = {
  LOGIN_SUCCESS: '🔓',
  LOGIN_FAILED: '🔒',
  LOGOUT: '🚪',
  REGISTER: '📝',
  PASSWORD_RESET_REQUEST: '📧',
  PASSWORD_RESET_COMPLETE: '🔑',
  PASSWORD_CHANGE: '🔐',
  PROFILE_UPDATE: '👤',
  TASK_CREATE: '➕',
  TASK_UPDATE: '✏️',
  TASK_DELETE: '🗑️',
  TASK_STATUS_CHANGE: '🔄',
  PROJECT_CREATE: '📁',
  PROJECT_UPDATE: '📂',
  PROJECT_DELETE: '❌',
  TAG_CREATE: '🏷️',
  TAG_UPDATE: '🔖',
  TAG_DELETE: '🗑️',
};

const actionColors = {
  LOGIN_SUCCESS: 'text-green-600 dark:text-green-400',
  LOGIN_FAILED: 'text-red-600 dark:text-red-400',
  REGISTER: 'text-blue-600 dark:text-blue-400',
  TASK_CREATE: 'text-green-600 dark:text-green-400',
  TASK_UPDATE: 'text-yellow-600 dark:text-yellow-400',
  TASK_DELETE: 'text-red-600 dark:text-red-400',
  PROJECT_CREATE: 'text-blue-600 dark:text-blue-400',
  PROJECT_DELETE: 'text-red-600 dark:text-red-400',
};

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/activity/my-logs');
      console.log('Activity response:', response);
      setLogs(response.logs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setError(err.error?.message || 'Failed to load activity logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const formatAction = (action) => {
    if (!action) return 'Unknown';
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your recent activities and actions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Activity Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your activities will appear here once you start using TaskFlow
              </p>
              <div className="mt-4 text-sm text-gray-400">
                Try: Creating a task, project, or updating your profile
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`flex items-center gap-1 ${actionColors[log.action] || 'text-gray-600 dark:text-gray-300'}`}>
                          <span>{actionIcons[log.action] || '📋'}</span>
                          <span>{formatAction(log.action)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {log.entityType && (
                          <span className="text-xs">
                            {log.entityType}: {log.entityId?.slice(-8) || 'N/A'}
                          </span>
                        )}
                        {log.errorMessage && (
                          <span className="text-red-500 text-xs block">
                            Error: {log.errorMessage}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          log.status === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {log.status || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing last {logs.length} activities
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ActivityLogPage;