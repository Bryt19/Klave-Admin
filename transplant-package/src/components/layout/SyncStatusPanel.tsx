import React from 'react';
import { useApp } from '@/context/AppContext';

export const SyncStatusPanel: React.FC = () => {
  const { pendingSyncCount, syncStatus, isOnline } = useApp();

  if (pendingSyncCount === 0) return null;

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 rounded-xl shadow-lg flex items-center gap-3 w-64 mb-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!isOnline ? 'bg-danger-500/10 text-danger-500' : syncStatus === 'syncing' ? 'bg-warning-500/10 text-warning-500' : 'bg-primary-500/10 text-primary-500'}`}>
        {!isOnline ? (
          <i className="ri-wifi-off-line"></i>
        ) : syncStatus === 'syncing' ? (
          <i className="ri-loader-4-line animate-spin"></i>
        ) : (
          <i className="ri-cloud-line"></i>
        )}
      </div>
      <div>
        <p className="text-xs font-heading font-700 text-gray-900 dark:text-white">
          {!isOnline ? 'Offline Mode' : syncStatus === 'syncing' ? 'Syncing...' : 'Pending Sync'}
        </p>
        <p className="text-[10px] text-gray-500 font-body">
          {pendingSyncCount} operation{pendingSyncCount !== 1 ? 's' : ''} waiting
        </p>
      </div>
    </div>
  );
};
