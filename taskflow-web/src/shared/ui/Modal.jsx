// src/shared/ui/Modal.jsx

import { useEffect } from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
        
        {onConfirm && (
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;