// src/shared/lib/constants.js

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: '#10B981' },
  { value: 'Medium', label: 'Medium', color: '#F59E0B' },
  { value: 'High', label: 'High', color: '#F97316' },
  { value: 'Critical', label: 'Critical', color: '#EF4444' },
];

export const STATUSES = {
  TODO: 'To-Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const STATUS_OPTIONS = [
  { value: 'To-Do', label: 'To-Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

export const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];

export const DUE_DATE_FILTERS = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'overdue', label: 'Overdue' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];