import { api } from './api';
import { getPendingSyncItems, removeSyncItems, updateSyncItemStatus } from './offlineDB';
import { toast } from 'sonner';
import { HeartbeatService } from './heartbeat';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
type SyncCallback = (status: SyncStatus, pendingCount: number) => void;

class SyncManager {
  private listeners: Set<SyncCallback> = new Set();
  private isSyncing: boolean = false;
  private isOnline: boolean = HeartbeatService.isCurrentlyOnline;

  constructor() {
    HeartbeatService.subscribe((status) => {
      const wasOffline = !this.isOnline;
      this.isOnline = status === 'online';
      
      if (this.isOnline && wasOffline) {
        // Just came back online
        this._emitStatus('idle');
        if (!this.isSyncing) {
          this.sync();
        }
      } else if (!this.isOnline && !wasOffline) {
        // Just went offline
        this._emitStatus('offline');
      }
    });
  }

  // ─── Public API ────────────────────────────────────────────────

  /** Force-sync the offline queue immediately. Used by the UI's manual sync button. */
  public async syncNow() {
    return this.sync(true, true);
  }

  /** Returns current online state. */
  public getOnlineStatus() {
    return this.isOnline;
  }

  /** Subscribe to sync status changes. Returns an unsubscribe function. */
  public subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    // Immediately emit current state to new subscriber
    this._emitStatus(this.isOnline ? 'idle' : 'offline');
    return () => { this.listeners.delete(callback); };
  }

  // ─── Connectivity ───────────────────────────────────────────────

  public async checkConnectivity(): Promise<boolean> {
    const isNowOnline = await HeartbeatService.forcePing();
    this.isOnline = isNowOnline;
    return isNowOnline;
  }



  // ─── Sync Queue ─────────────────────────────────────────────────

  /**
   * Process the offline sync queue.
   * @param force  If true, verify connectivity first and throw on failure.
   * @param showToast  Show a success toast after sync (default: only for manual syncs).
   */
  public async sync(force = false, showToast = force) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // If forced, verify connectivity first
      if (force) {
        const online = await this.checkConnectivity();
        if (!online) {
          throw new Error('Cannot sync: You are currently offline.');
        }
      } else if (!this.isOnline) {
        return;
      }

      const items = await getPendingSyncItems();
      if (items.length === 0) {
        this._emitStatus('idle');
        return;
      }

      this._emitStatus('syncing');

      let syncedCount = 0;

      // Process one at a time — never in parallel (prevents duplicate sales)
      for (const item of items) {
        if ((item.retry_count || 0) >= 5) {
          await updateSyncItemStatus(item.id!, 'failed', 'Max retry limit reached.');
          continue;
        }

        await updateSyncItemStatus(item.id!, 'syncing');

        try {
          let success = false;

          if (item.operation_type === 'SALE') {
            const saleItems = Array.isArray(item.payload)
              ? item.payload
              : (item.payload?.items || item.payload);
            await api.transactions.createSale(saleItems);
            success = true;
          } else if (item.operation_type === 'MULTI_SALE') {
            await api.transactions.createSale(item.payload);
            success = true;
          } else if (item.operation_type === 'CREATE_DRUG') {
            await api.drugs.create(item.payload);
            success = true;
          } else if (item.operation_type === 'ADD_BATCH') {
            await api.drugs.addBatch(item.payload.drugId, item.payload);
            success = true;
          } else if (item.operation_type === 'UPDATE_DRUG') {
            await api.drugs.update(item.payload.drugId, item.payload);
            success = true;
          } else if (item.operation_type === 'DELETE_DRUG') {
            await api.drugs.remove(item.payload.drugId || item.payload.id);
            success = true;
          } else if (item.operation_type === 'POST__STAFF') {
            await api.staff.create(item.payload);
            success = true;
          } else if (item.operation_type.startsWith('PUT__STAFF_')) {
            const staffId = item.operation_type.split('_').pop();
            await api.staff.update(staffId!, item.payload);
            success = true;
          } else if (item.operation_type.startsWith('DELETE__STAFF_')) {
            const staffId = item.operation_type.split('_').pop();
            await api.staff.remove(staffId!);
            success = true;
          } else if (item.operation_type === 'PUT__PHARMACY') {
            await api.pharmacy.update(item.payload);
            success = true;
          } else {
            // Generic batch sync fallback
            const batchRes = await api.sync.batch([{
              id: item.id,
              type: item.operation_type,
              payload: item.payload,
              data: item.payload,
              timestamp: new Date(item.timestamp).toISOString()
            }]);
            success = !!(batchRes.success || batchRes.results);
          }

          if (success) {
            await removeSyncItems([item.id!]);
            syncedCount++;
          } else {
            throw new Error('Server returned false success.');
          }

        } catch (err: any) {
          console.error(`[SyncManager] Syncing item ${item.id} failed:`, err);
          const msg = err.message || '';

          if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
            await updateSyncItemStatus(item.id!, 'failed', 'Unauthorized (401).');
            if (force) throw new Error('Authentication required. Please log in again.');
            break;
          } else if (msg.includes('409') || msg.toLowerCase().includes('conflict') || err?.status === 409) {
            await updateSyncItemStatus(item.id!, 'failed', 'Conflict (409).');
            window.dispatchEvent(new CustomEvent('klavora-sync-conflict', { detail: { item, error: err } }));
            break; // Pause queue until user resolves
          } else if (/50[0-9]/.test(msg)) {
            // 5xx server error — keep as pending, let retry_count increment
            await updateSyncItemStatus(item.id!, 'pending', `Server error: ${msg}`);
            // Don't break — continue with other items
          } else {
            // Network error — stop and wait for next connectivity event
            await updateSyncItemStatus(item.id!, 'pending', msg || 'Network error');
            this._emitStatus('error');
            if (force) throw err;
            break;
          }
        }
      }

      // ── Post-sync ──────────────────────────────────────────────
      const remaining = await getPendingSyncItems();
      if (remaining.length === 0) {
        this._emitStatus('idle');

        if (syncedCount > 0 && showToast) {
          toast.success(
            `Offline data synchronized! Synced ${syncedCount} operation(s) successfully.`
          );
        }

        // Notify AppContext to refresh drugs + transactions from server
        if (syncedCount > 0) {
          window.dispatchEvent(new CustomEvent('klavora-sync-complete'));
        }
      } else {
        this._emitStatus('error');
      }

    } catch (err: any) {
      console.error('[SyncManager] Sync process crashed:', err);
      this._emitStatus('error');
      if (force) throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  // ─── Internal ───────────────────────────────────────────────────

  private async _emitStatus(status: SyncStatus) {
    try {
      const items = await getPendingSyncItems();
      this.listeners.forEach(listener => listener(status, items.length));
    } catch {
      this.listeners.forEach(listener => listener(status, 0));
    }
  }
}

export const syncManager = new SyncManager();
