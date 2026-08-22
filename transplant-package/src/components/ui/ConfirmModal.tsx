import React from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  itemType?: string;
  message?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  itemName,
  itemType,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark p-6 animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${
            isDanger
              ? 'bg-danger-50 dark:bg-danger-500/10 text-danger-500 border-danger-200 dark:border-danger-500/20'
              : isWarning
              ? 'bg-warning-50 dark:bg-warning-500/10 text-warning-500 border-warning-200 dark:border-warning-500/20'
              : 'bg-primary-50 dark:bg-primary-500/10 text-primary-500 border-primary-200 dark:border-primary-500/20'
          }`}
        >
          <i
            className={`text-2xl ${
              isDanger
                ? 'ri-delete-bin-line'
                : isWarning
                ? 'ri-error-warning-line'
                : 'ri-information-line'
            }`}
          ></i>
        </div>

        <h3 className="text-lg font-heading font-700 text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h3>

        {itemName && (
          <div className="text-center mb-3">
            <span className="inline-block bg-gray-100 dark:bg-white/5 border border-border-light dark:border-border-dark text-gray-800 dark:text-gray-200 font-semibold px-3 py-1 rounded-lg text-sm">
              {itemType ? `${itemType}: ` : ''}
              {itemName}
            </span>
          </div>
        )}

        <div className="text-xs text-gray-600 dark:text-gray-400 font-body text-center mb-6 leading-relaxed">
          {message || (
            <p>
              Are you sure you want to proceed with this action? This action is
              irreversible and cannot be undone.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-10 border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-xs font-semibold font-body transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-10 text-white rounded-xl text-xs font-semibold font-body transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-danger-500 hover:bg-danger-600'
                : isWarning
                ? 'bg-warning-500 hover:bg-warning-600 text-gray-900'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {isLoading ? (
              <i className="ri-loader-4-line animate-spin text-base"></i>
            ) : isDanger ? (
              <i className="ri-delete-bin-line"></i>
            ) : null}
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
