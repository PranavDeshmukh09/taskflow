// src/components/Task/ConfirmDeleteTask.jsx

import Button from '../../shared/ui/Button';

const ConfirmDeleteTask = ({ task, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Task?
          </h2>
        </div>

        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "<strong>{task?.title}</strong>"?
          </p>
          <p className="text-sm text-red-500 mt-2">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 p-4 pt-0">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteTask;