// src/components/Task/TaskCard.jsx

import { useState } from 'react';

const priorityColors = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusColors = {
  'To-Do': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const TaskCard = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Checkbox for quick status toggle */}
        <input
          type="checkbox"
          checked={task.status === 'Done'}
          onChange={() => onStatusToggle(task.id, task.status === 'Done' ? 'To-Do' : 'Done')}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`font-medium text-gray-900 dark:text-white ${task.status === 'Done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Priority badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            {/* Status badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700'}`}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue!)'}
              </span>
            )}

            {/* Project */}
            {task.project && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${task.project.colour}20`, color: task.project.colour }}
              >
                📁 {task.project.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map(tag => (
                <span 
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${tag.colour}20`, color: tag.colour }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;