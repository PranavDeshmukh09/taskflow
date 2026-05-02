// src/pages/TaskListPage.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import TaskCard from '../components/Task/TaskCard';
import TaskForm from '../components/Task/TaskForm';
import FilterPanel from '../components/Task/FilterPanel';
import ConfirmDeleteTask from '../components/Task/ConfirmDeleteTask';
import { useTasks } from '../features/tasks/useTasks';
import { useProjects } from '../features/projects/useProjects';
import { useTags } from '../features/tags/useTags';
import Button from '../shared/ui/Button';
import Spinner from '../shared/ui/Spinner';
import Input from '../shared/ui/Input';

const TaskListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    projectId: searchParams.get('projectId') || '',
    dueDate: searchParams.get('dueDate') || '',
    tagId: searchParams.get('tagId') || '',
    search: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const { tasks, loading, pagination, createTask, updateTask, updateStatus, deleteTask, refreshTasks } = useTasks(filters);
  const { projects } = useProjects();
  const { tags } = useTags();

  useEffect(() => {
    const params = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    refreshTasks(params);
  }, [filters, sortBy, sortOrder]);

  const handleSearch = (search) => {
    setFilters({ ...filters, search });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ status: '', priority: '', projectId: '', dueDate: '', tagId: '', search: '' });
    setSearchParams({});
  };

  const handleCreateTask = async (data) => {
    await createTask(data);
  };

  const handleUpdateTask = async (data) => {
    await updateTask(editingTask.id, data);
    setEditingTask(null);
  };
  // Add this inside TaskListPage component, after state declarations
const debounceTimeout = useRef(null);

const handleSearchChange = (e) => {
  const value = e.target.value;
  
  if (debounceTimeout.current) {
    clearTimeout(debounceTimeout.current);
  }
  
  debounceTimeout.current = setTimeout(() => {
    setFilters(prev => ({ ...prev, search: value }));
  }, 500);
};

  if (loading && tasks.length === 0) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your tasks
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            + New Task
          </Button>
        </div>

        {/* Search Bar */}
        {/* Search Bar - Updated with debounce */}
        <div className="relative">
        <input
            type="text"
            placeholder="Search tasks by title or description..."
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            defaultValue={filters.search}
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          projects={projects}
          tags={tags}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {/* Sort Options */}
        <div className="flex justify-end gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800"
          >
            <option value="createdAt">Created Date</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'ASC' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filters.search || filters.status || filters.priority 
                ? "Try changing your filters" 
                : "Create your first task to get started"}
            </p>
            <Button onClick={() => setShowForm(true)}>
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
                onStatusToggle={updateStatus}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => refreshTasks({ page })}
                className={`px-3 py-1 rounded ${
                  page === pagination.page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          projects={projects}
          tags={tags}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingTask && (
        <ConfirmDeleteTask
          task={deletingTask}
          onConfirm={async () => {
            await deleteTask(deletingTask.id);
            setDeletingTask(null);
          }}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </Layout>
  );
};

export default TaskListPage;