// src/components/Project/ProjectCard.jsx

import { useState } from 'react';
import Button from '../../shared/ui/Button';

const ProjectCard = ({ project, onEdit, onDelete, taskCount = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Color circle */}
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.colour || '#3B82F6' }}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Menu dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ⋮
            </button>
            {showMenu && (
              <>
                {/* Click outside to close */}
                <div 
                  className="fixed inset-0" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(project);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(project);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task count */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;