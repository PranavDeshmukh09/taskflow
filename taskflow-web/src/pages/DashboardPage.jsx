// src/pages/DashboardPage.jsx - SIMPLIFIED (no external charts)

import { useAuth } from '../features/auth/useAuth';
import { useDashboard } from '../features/dashboard/useDashboard';
import Layout from '../components/Layout/Layout';
import Spinner from '../shared/ui/Spinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboard();

  const priorityColors = {
    Critical: 'bg-red-500',
    High: 'bg-orange-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-green-500',
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

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load dashboard: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.stats?.totalTasks || 0}
                  </p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.stats?.completionRate || 0}%
                  </p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.stats?.dueTodayTasks || 0}
                  </p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.stats?.overdueTasks || 0}
                  </p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Progress
            </h3>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Tasks completed</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {stats.stats?.completedTasks || 0} / {stats.stats?.totalTasks || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.stats?.completionRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {stats && stats.priorityDistribution && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Priority Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.priorityDistribution).map(([priority, count]) => (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{priority}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${priorityColors[priority]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stats.stats?.totalTasks > 0 ? (count / stats.stats.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Tasks */}
        {stats && stats.upcomingTasks && stats.upcomingTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <a href="/tasks" className="text-sm text-blue-500 hover:text-blue-600">
                View all →
              </a>
            </div>
            <div className="space-y-3">
              {stats.upcomingTasks.slice(0, 5).map(task => (
                <a
                  key={task.id}
                  href={`/tasks`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;