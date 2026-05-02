// src/components/Dashboard/UpcomingTasks.jsx

import { Link } from 'react-router-dom';

const priorityColors = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const UpcomingTasks = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No upcoming tasks
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <Link
          key={task.id}
          to={`/tasks`}
          className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {task.title}
              </p>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UpcomingTasks;