// src/components/Task/FilterPanel.jsx

import { useState } from 'react';
import Button from '../../shared/ui/Button';

const priorityOptions = ['', 'Low', 'Medium', 'High', 'Critical'];
const statusOptions = ['', 'To-Do', 'In Progress', 'Done'];
const dueDateOptions = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'overdue', label: 'Overdue' },
];

const FilterPanel = ({ filters, projects, tags, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const emptyFilters = { status: '', priority: '', projectId: '', dueDate: '', tagId: '', search: '' };
    setLocalFilters(emptyFilters);
    onClear();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border rounded-lg dark:bg-gray-900"
          >
            {statusOptions.map(s => (
              <option key={s || 'all'} value={s}>{s || 'All'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={localFilters.priority}
            onChange={(e) => setLocalFilters({ ...localFilters, priority: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border rounded-lg dark:bg-gray-900"
          >
            {priorityOptions.map(p => (
              <option key={p || 'all'} value={p}>{p || 'All'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project
          </label>
          <select
            value={localFilters.projectId}
            onChange={(e) => setLocalFilters({ ...localFilters, projectId: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border rounded-lg dark:bg-gray-900"
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <select
            value={localFilters.dueDate}
            onChange={(e) => setLocalFilters({ ...localFilters, dueDate: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border rounded-lg dark:bg-gray-900"
          >
            {dueDateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag
          </label>
          <select
            value={localFilters.tagId}
            onChange={(e) => setLocalFilters({ ...localFilters, tagId: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border rounded-lg dark:bg-gray-900"
          >
            <option value="">All</option>
            {tags.map(t => (
              <option key={t.id} value={t.id}>#{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" size="sm" onClick={handleClear}>
          Clear All
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;