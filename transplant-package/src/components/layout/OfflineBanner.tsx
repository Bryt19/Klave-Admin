import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export const OfflineBanner: React.FC = () => {
  const { isOnline, syncStatus, pendingSyncCount, syncOfflineQueue } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-dismiss banner when online and nothing is pending
  if (isOnline && pendingSyncCount === 0 && syncStatus !== 'syncing') return null;

  const handleManualSync = async () => {
    if (isSyncing || syncStatus === 'syncing') return;
    setIsSyncing(true);
    try {
      await toast.promise(syncOfflineQueue(true), {
        loading: 'Syncing pending operations...',
        success: 'Sync complete!',
        error: (err) => err?.message || 'Sync failed. Please verify connection and try again.'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div 
      className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-white transition-all duration-300 shadow-sm border-b border-black/10 animate-in fade-in slide-in-from-top-1 duration-200
      ${!isOnline ? 'bg-amber-600 dark:bg-amber-600' : syncStatus === 'syncing' ? 'bg-emerald-600 dark:bg-emerald-600' : 'bg-primary-600'}
    `}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <i className="ri-wifi-off-line text-sm animate-pulse"></i>
            <span>You are offline. Sales and changes are saved locally and will sync once reconnected.</span>
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <i className="ri-loader-4-line animate-spin text-sm"></i>
            <span className="flex items-center gap-1.5">
              Back online — syncing your data... 
              <span className="bg-emerald-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                <span key={pendingSyncCount} className="animate-in slide-in-from-top-2 fade-in duration-300 font-bold">
                  {pendingSyncCount}
                </span>
                operations remaining
              </span>
            </span>
          </>
        ) : (
          <>
            <i className="ri-cloud-line text-sm"></i>
            <span>{pendingSyncCount} offline operations pending sync.</span>
          </>
        )}
      </div>

      {isOnline && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing || syncStatus === 'syncing'}
          className="px-3 py-1 text-[10px] font-semibold bg-white text-gray-900 rounded-lg hover:bg-white/95 disabled:opacity-50 cursor-pointer transition-all shadow-sm whitespace-nowrap ml-4 flex items-center gap-1"
        >
          {isSyncing || syncStatus === 'syncing' ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              Syncing...
            </>
          ) : (
            <>
              <i className="ri-refresh-line"></i>
              Sync Now
            </>
          )}
        </button>
      )}
    </div>
  );
};
