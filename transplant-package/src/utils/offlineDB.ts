import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface KlavoraDB extends DBSchema {
  drugs: {
    key: string;
    value: any;
  };
  batches: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: number;
    value: {
      id?: number;
      operation_id: string;
      operation_type: string;
      payload: any;
      timestamp: number;
      user_id?: string;
      status: 'pending' | 'syncing' | 'failed' | 'synced';
      retry_count: number;
      error?: string;
    };
    indexes: { 'by-status': string };
  };
  app_meta: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<KlavoraDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<KlavoraDB>('klavora_offline', 2, {
      upgrade(db, oldVersion) {
        // v1: create all base stores
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('drugs')) {
            db.createObjectStore('drugs', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('batches')) {
            db.createObjectStore('batches', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('sync_queue')) {
            const store = db.createObjectStore('sync_queue', {
              keyPath: 'id',
              autoIncrement: true,
            });
            store.createIndex('by-status', 'status');
          }
          if (!db.objectStoreNames.contains('app_meta')) {
            db.createObjectStore('app_meta', { keyPath: 'key' });
          }
        }
        // v2: no schema changes – version bump just to ensure clean upgrades
      },
    });
  }
  return dbPromise;
};

// Queue operations
export const addToSyncQueue = async (operationType: string, payload: any) => {
  const db = await initDB();
  const tx = db.transaction(['sync_queue', 'app_meta'], 'readwrite');
  const store = tx.objectStore('sync_queue');
  const metaStore = tx.objectStore('app_meta');
  
  let userId = undefined;
  const cachedUser = await metaStore.get('cached_user');
  if (cachedUser && cachedUser.value) {
    userId = cachedUser.value.id;
  }
  
  await store.add({
    operation_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
    operation_type: operationType,
    payload,
    timestamp: Date.now(),
    user_id: userId,
    status: 'pending',
    retry_count: 0
  });
  
  await tx.done;
};

export const getSyncQueue = async () => {
  const db = await initDB();
  return db.getAll('sync_queue');
};

export const getPendingSyncItems = async () => {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readonly');
  const store = tx.objectStore('sync_queue');
  const index = store.index('by-status');
  
  const pending = await index.getAll('pending');
  const failed = await index.getAll('failed');
  
  // Sort by timestamp
  return [...pending, ...failed].sort((a, b) => a.timestamp - b.timestamp);
};

export const updateSyncItemStatus = async (
  id: number,
  status: 'pending' | 'syncing' | 'failed' | 'synced',
  error?: string
) => {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  
  const item = await store.get(id);
  if (item) {
    item.status = status;
    if (error) item.error = error;
    // Increment retry count on every failure (both 'failed' and re-queued 'pending' for 5xx)
    if (status === 'failed' || (status === 'pending' && error)) {
      item.retry_count = (item.retry_count || 0) + 1;
    }
    await store.put(item);
  }
  
  await tx.done;
};

export const removeSyncItems = async (ids: number[]) => {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  
  await Promise.all(ids.map(id => store.delete(id)));
  
  await tx.done;
};

export const clearSyncQueue = async () => {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  await tx.objectStore('sync_queue').clear();
  await tx.done;
};

// Metadata helpers
export const saveMeta = async (key: string, value: any) => {
  const db = await initDB();
  const tx = db.transaction('app_meta', 'readwrite');
  await tx.objectStore('app_meta').put({ key, value });
  await tx.done;
};

export const getMeta = async (key: string) => {
  const db = await initDB();
  const res = await db.get('app_meta', key);
  return res ? res.value : null;
};

export const deleteMeta = async (key: string) => {
  const db = await initDB();
  const tx = db.transaction('app_meta', 'readwrite');
  await tx.objectStore('app_meta').delete(key);
  await tx.done;
};

// Cache helpers for drugs and batches
export const cacheDrugs = async (drugs: any[]) => {
  const db = await initDB();
  const tx = db.transaction('drugs', 'readwrite');
  const store = tx.objectStore('drugs');
  await store.clear();
  for (const drug of drugs) {
    await store.put(drug);
  }
  await tx.done;
};

export const getCachedDrugs = async () => {
  const db = await initDB();
  return db.getAll('drugs');
};

export const cacheBatches = async (batches: any[]) => {
  const db = await initDB();
  const tx = db.transaction('batches', 'readwrite');
  const store = tx.objectStore('batches');
  await store.clear();
  for (const batch of batches) {
    await store.put(batch);
  }
  await tx.done;
};

export const getCachedBatches = async () => {
  const db = await initDB();
  return db.getAll('batches');
};

// Apply writes locally to keep offline state accurate
export const applyLocallyToIndexedDB = async (operationType: string, payload: any) => {
  const db = await initDB();
  
  if (operationType === 'SALE' || operationType === 'MULTI_SALE') {
    const items = Array.isArray(payload) ? payload : (payload.items || [payload]);
    const txDrugs = db.transaction('drugs', 'readwrite');
    const drugStore = txDrugs.objectStore('drugs');
    
    for (const item of items) {
      const drugId = item.drugId || item.drug_id;
      if (!drugId) continue;
      const drug = await drugStore.get(drugId);
      if (drug) {
        drug.totalQuantity = Math.max(0, (drug.totalQuantity || 0) - item.quantity);
        if (drug.totalQuantity === 0) {
          drug.status = 'Out of Stock';
        }
        
        if (drug.batches) {
          let remaining = item.quantity;
          const itemBatchId = item.batchId || item.batch_id;
          if (itemBatchId) {
            const b = drug.batches.find((b: any) => b.id === itemBatchId);
            if (b) {
              b.quantity = Math.max(0, b.quantity - remaining);
              remaining = 0;
            }
          }
          if (remaining > 0) {
            for (const batch of drug.batches) {
              if (batch.quantity >= remaining) {
                batch.quantity -= remaining;
                remaining = 0;
                break;
              } else {
                remaining -= batch.quantity;
                batch.quantity = 0;
              }
            }
          }
        }
        await drugStore.put(drug);
      }
    }
    await txDrugs.done;
  } else if (operationType === 'RESTOCK' || operationType === 'ADD_BATCH') {
    const txDrugs = db.transaction('drugs', 'readwrite');
    const drugStore = txDrugs.objectStore('drugs');
    const drugId = payload.drugId;
    
    if (drugId) {
      const drug = await drugStore.get(drugId);
      if (drug) {
        drug.totalQuantity = (drug.totalQuantity || 0) + (payload.quantity || 0);
        drug.status = 'In Stock';
        
        if (!drug.batches) drug.batches = [];
        const existingBatch = drug.batches.find((b: any) => b.id === payload.id || b.expiryDate === payload.expiryDate);
        if (existingBatch) {
          existingBatch.quantity += (payload.quantity || 0);
        } else {
          drug.batches.push({
            id: payload.id || Math.random().toString(),
            quantity: payload.quantity || 0,
            expiryDate: payload.expiryDate || new Date().toISOString(),
            unitPrice: payload.unitPrice || 0,
            costPrice: payload.costPrice || 0,
            supplier: payload.supplier || 'Unknown',
            status: 'In Stock'
          });
        }
        await drugStore.put(drug);
      }
    }
    await txDrugs.done;
  } else if (operationType === 'CREATE_DRUG') {
    const txDrugs = db.transaction('drugs', 'readwrite');
    const drugStore = txDrugs.objectStore('drugs');
    await drugStore.put({
      id: payload.id || Math.random().toString(),
      name: payload.name,
      genericName: payload.genericName || payload.name,
      totalQuantity: 0,
      status: 'Out of Stock',
      batches: [],
      categories: payload.categories || [payload.category].filter(Boolean),
      unitOfMeasurement: payload.unitOfMeasurement || 'tablets'
    });
    await txDrugs.done;
  } else if (operationType === 'UPDATE_DRUG') {
    const txDrugs = db.transaction('drugs', 'readwrite');
    const drugStore = txDrugs.objectStore('drugs');
    const drugId = payload.drugId || payload.id;
    if (drugId) {
      const drug = await drugStore.get(drugId);
      if (drug) {
        Object.assign(drug, payload);
        await drugStore.put(drug);
      }
    }
    await txDrugs.done;
  } else if (operationType === 'DELETE_DRUG') {
    const txDrugs = db.transaction('drugs', 'readwrite');
    const drugStore = txDrugs.objectStore('drugs');
    const drugId = payload.drugId || payload.id;
    if (drugId) {
      await drugStore.delete(drugId);
    }
    await txDrugs.done;
  } else if (operationType === 'POST__STAFF') {
    try {
      const cached = localStorage.getItem('klavora-cached-staff');
      const staffList = cached ? JSON.parse(cached) : [];
      staffList.push({ id: payload.id || Math.random().toString(), ...payload });
      localStorage.setItem('klavora-cached-staff', JSON.stringify(staffList));
    } catch (e) {}
  } else if (operationType.startsWith('PUT__STAFF_')) {
    try {
      const cached = localStorage.getItem('klavora-cached-staff');
      const staffList = cached ? JSON.parse(cached) : [];
      const staffId = operationType.split('_').pop();
      const idx = staffList.findIndex((s: any) => s.id === staffId || s.id === parseInt(staffId || '0'));
      if (idx !== -1) {
        staffList[idx] = { ...staffList[idx], ...payload };
        localStorage.setItem('klavora-cached-staff', JSON.stringify(staffList));
      }
    } catch (e) {}
  } else if (operationType.startsWith('DELETE__STAFF_')) {
    try {
      const cached = localStorage.getItem('klavora-cached-staff');
      let staffList = cached ? JSON.parse(cached) : [];
      const staffId = operationType.split('_').pop();
      staffList = staffList.filter((s: any) => s.id !== staffId && s.id !== parseInt(staffId || '0'));
      localStorage.setItem('klavora-cached-staff', JSON.stringify(staffList));
    } catch (e) {}
  } else if (operationType === 'PUT__PHARMACY') {
    try {
      const cached = localStorage.getItem('klavora-cached-pharmacy-settings');
      let settings = cached ? JSON.parse(cached) : {};
      settings = { ...settings, ...payload };
      localStorage.setItem('klavora-cached-pharmacy-settings', JSON.stringify(settings));
    } catch (e) {}
  }
};
