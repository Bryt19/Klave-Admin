import React from 'react';
import { removeSyncItems, updateSyncItemStatus } from '@/utils/offlineDB';
import { syncManager } from '@/utils/syncManager';

export default function SyncConflictModal() {
  const [conflictItem, setConflictItem] = React.useState<any>(null);

  React.useEffect(() => {
    const handleConflict = (e: any) => {
      setConflictItem(e.detail.item);
    };

    window.addEventListener('klavora-sync-conflict', handleConflict);
    return () => window.removeEventListener('klavora-sync-conflict', handleConflict);
  }, []);

  if (!conflictItem) return null;

  const handleKeepLocal = async () => {
    // In a real implementation, you'd add a "force: true" flag to the payload or endpoint
    // For now, we simulate forcing it by marking it pending again (perhaps backend accepts if retried with flag)
    await updateSyncItemStatus(conflictItem.id, 'pending');
    setConflictItem(null);
    syncManager.syncNow();
  };

  const handleAcceptServer = async () => {
    // Discard local change
    await removeSyncItems([conflictItem.id]);
    setConflictItem(null);
    window.dispatchEvent(new CustomEvent('klavora-sync-complete'));
    syncManager.syncNow();
  };

  const handleSkipForNow = async () => {
    // Skip without applying, log to audit log theoretically
    await removeSyncItems([conflictItem.id]);
    setConflictItem(null);
    syncManager.syncNow();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-card border border-border-light dark:border-border-dark shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
              <i className="ri-error-warning-line text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white">Sync Conflict Detected</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Another device modified this data.</p>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 dark:bg-white/5 flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-body mb-2">
              The operation <strong className="font-heading font-700">{conflictItem.operation_type.replace(/_/g, ' ')}</strong> created on {new Date(conflictItem.timestamp).toLocaleString()} conflicts with recent changes on the server.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-body">
              How would you like to resolve this?
            </p>
          </div>
        </div>
        
        <div className="p-5 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-3 bg-surface-light dark:bg-surface-dark">
          <button
            onClick={handleSkipForNow}
            className="flex-1 h-11 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-sm font-heading font-600 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleAcceptServer}
            className="flex-1 h-11 border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-sm font-heading font-600 transition-colors"
          >
            Accept Server
          </button>
          <button
            onClick={handleKeepLocal}
            className="flex-1 h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-heading font-600 transition-colors"
          >
            Keep Local
          </button>
        </div>
      </div>
    </div>
  );
}
