// src/components/Layout/Sidebar.jsx - WITH ACTIVITY

import { NavLink } from 'react-router-dom';
import { useProjects } from '../../features/projects/useProjects';

const Sidebar = () => {
  const { projects } = useProjects();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/activity', label: 'Activity', icon: '📋' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-500">TaskFlow</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
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

      {/* Projects section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Projects
          </h3>
          <NavLink to="/projects" className="text-xs text-blue-500 hover:text-blue-600">
            Manage
          </NavLink>
        </div>
        <div className="space-y-1">
          {projects.slice(0, 5).map(project => (
            <NavLink
              key={project.id}
              to={`/tasks?projectId=${project.id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.colour }}
              />
              <span className="truncate">{project.name}</span>
            </NavLink>
          ))}
          {projects.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
              No projects yet
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;