// src/components/Layout/MobileDrawer.jsx - WITH ACTIVITY

import { NavLink } from 'react-router-dom';
import { useProjects } from '../../features/projects/useProjects';

const MobileDrawer = ({ isOpen, onClose }) => {
  const { projects } = useProjects();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/activity', label: 'Activity', icon: '📋' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-50 shadow-xl lg:hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-500">TaskFlow</h1>
          <button onClick={onClose} className="p-1 text-gray-500">✕</button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Projects
          </h3>
          <div className="space-y-1">
            {projects.slice(0, 5).map(project => (
              <NavLink
                key={project.id}
                to={`/tasks?projectId=${project.id}`}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.colour }}
                />
                <span className="truncate">{project.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;