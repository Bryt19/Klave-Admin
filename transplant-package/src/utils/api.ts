let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Safety check: If the URL doesn't start with http/https and isn't localhost, prepend https://
if (API_BASE_URL && !API_BASE_URL.startsWith('http') && !API_BASE_URL.includes('localhost')) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}

export const getApiBaseUrl = () => API_BASE_URL;

function getCachedGETResponse(endpoint: string): any {
  if (endpoint === '/transactions/history') {
    try {
      const cached = localStorage.getItem('klavora-cached-transactions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }
  if (endpoint.startsWith('/staff')) {
    try {
      const cached = localStorage.getItem('klavora-cached-staff');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }
  if (endpoint === '/alerts') {
    return [];
  }
  if (endpoint.startsWith('/insights/dashboard')) {
    return {
      revenue: 0,
      salesCount: 0,
      lowStockCount: 0,
      expiringCount: 0,
      recentTransactions: []
    };
  }
  if (endpoint.startsWith('/kpi/')) {
    // Return empty stubs to prevent crashes; KPI page handles its own full-page cache
    if (endpoint.includes('inventory-value')) return { totalValue: 0, breakdown: {} };
    if (endpoint.includes('sales-performance')) return { grossSales: 0, transactionCount: 0 };
    if (endpoint.includes('gross-margin')) return { totalRevenue: 0, totalCost: 0, marginPercentage: 0 };
    if (endpoint.includes('stock-movement')) return { saleVolume: 0, restockVolume: 0, writeOffVolume: 0 };
    if (endpoint.includes('loss-tracking')) return { totalLossValue: 0, totalLossUnits: 0 };
    if (endpoint.includes('staff-performance')) return [];
    return null;
  }
  if (endpoint === '/pharmacy') {
    try {
      const cached = localStorage.getItem('klavora-cached-pharmacy-settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
  if (endpoint === '/notifications') {
    return [];
  }
  if (endpoint === '/backups/logs') {
    return [];
  }
  return null;
}

// In-flight GET request deduplication cache
const inFlightGetRequests = new Map<string, Promise<any>>();

const GLOBAL_REQUEST_TIMEOUT_MS = 15000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();

  // Request deduplication for concurrent identical GET requests
  if (method === 'GET' && !options.signal) {
    const cacheKey = endpoint;
    const existing = inFlightGetRequests.get(cacheKey);
    if (existing) {
      return existing;
    }

    const promise = executeRequestWithRetry(endpoint, options, 3)
      .finally(() => {
        inFlightGetRequests.delete(cacheKey);
      });

    inFlightGetRequests.set(cacheKey, promise);
    return promise;
  }

  return executeRequestWithRetry(endpoint, options, method === 'GET' ? 3 : 1);
}

async function executeRequestWithRetry(endpoint: string, options: RequestInit, maxAttempts: number): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  let attempt = 0;
  let delay = 500;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await executeSingleRequest(endpoint, options);
    } catch (err: any) {
      const isRetryable = method === 'GET' && (
        err?.message?.includes('network') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('timeout') ||
        err?.message?.includes('503') ||
        err?.message?.includes('NetworkError')
      );

      if (isRetryable && attempt < maxAttempts) {
        await sleep(delay);
        delay *= 2; // Exponential backoff: 500ms -> 1000ms -> 2000ms
        continue;
      }
      throw err;
    }
  }
}

async function executeSingleRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();

  // Persist / read auth token and user from IndexedDB app_meta
  let token = null;
  let userRole = '';
  try {
    const { getMeta } = await import('./offlineDB');
    token = await getMeta('auth_token');
    const cachedUser = await getMeta('cached_user');
    if (cachedUser) {
      userRole = cachedUser.role?.toUpperCase() || '';
    }
  } catch (err) {
    console.error('Failed to get auth data from IndexedDB:', err);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Block Staff CRUD for non-Owner/Manager regardless of online/offline
  if (endpoint.startsWith('/staff') && method !== 'GET') {
    if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
      throw new Error('Access Denied: Only Owners and Managers can modify staff records.');
    }
  }

  // STEP 1 & 5 — Intercept when offline
  let HeartbeatModule;
  try {
    HeartbeatModule = await import('./heartbeat');
  } catch (e) {
    console.error('Failed to load HeartbeatService module:', e);
  }
  const isOnline = HeartbeatModule?.HeartbeatService ? HeartbeatModule.HeartbeatService.isCurrentlyOnline : navigator.onLine;
  const isAuthEndpoint = endpoint.startsWith('/auth/');

  if (!isOnline && !isAuthEndpoint) {
    if (method !== 'GET') {
      // POST/PUT/PATCH -> Offline Intercept & Queue!
      let operationType = '';
      let payload = null;

      try {
        payload = options.body ? JSON.parse(options.body as string) : {};
      } catch {
        payload = {};
      }

      if (endpoint === '/transactions/sale') {
        operationType = 'SALE';
      } else if (endpoint === '/drugs') {
        operationType = 'CREATE_DRUG';
      } else if (endpoint.startsWith('/drugs/') && endpoint.endsWith('/batches')) {
        operationType = 'ADD_BATCH';
        const drugId = endpoint.split('/')[2];
        payload = { ...payload, drugId };
      } else if (endpoint.startsWith('/drugs/') && method === 'PUT') {
        operationType = 'UPDATE_DRUG';
        const drugId = endpoint.split('/')[2];
        payload = { ...payload, drugId };
      } else {
        operationType = `${method}_${endpoint.replace(/\//g, '_').toUpperCase()}`;
      }

      const { addToSyncQueue, applyLocallyToIndexedDB } = await import('./offlineDB');
      await addToSyncQueue(operationType, payload);
      await applyLocallyToIndexedDB(operationType, payload);

      return { success: true, offline: true, message: 'Saved locally. Will sync when online.' };
    } else {
      // GET -> read directly from IndexedDB drugs cache or localStorage fallback
      if (endpoint.startsWith('/drugs')) {
        const { getCachedDrugs } = await import('./offlineDB');
        const cached = await getCachedDrugs();
        if (cached && cached.length > 0) {
          return cached;
        }
      } else {
        const cached = getCachedGETResponse(endpoint);
        if (cached !== null) {
          return cached;
        }
      }
      throw new Error('Offline: No cached data available.');
    }
  }

  // 15-second Global Request Timeout Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, GLOBAL_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal || controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Dispatch network failure to immediately toggle offline indicators
    window.dispatchEvent(new CustomEvent('klavora-network-error'));
    
    // Intercept network failure for write operations
    if (method !== 'GET' && !isAuthEndpoint) {
      let operationType = '';
      let payload = null;

      try {
        payload = options.body ? JSON.parse(options.body as string) : {};
      } catch {
        payload = {};
      }

      if (endpoint === '/transactions/sale') {
        operationType = 'SALE';
      } else if (endpoint === '/drugs') {
        operationType = 'CREATE_DRUG';
      } else if (endpoint.startsWith('/drugs/') && endpoint.endsWith('/batches')) {
        operationType = 'ADD_BATCH';
        const drugId = endpoint.split('/')[2];
        payload = { ...payload, drugId };
      } else if (endpoint.startsWith('/drugs/') && method === 'PUT') {
        operationType = 'UPDATE_DRUG';
        const drugId = endpoint.split('/')[2];
        payload = { ...payload, drugId };
      } else {
        operationType = `${method}_${endpoint.replace(/\//g, '_').toUpperCase()}`;
      }

      const { addToSyncQueue, applyLocallyToIndexedDB } = await import('./offlineDB');
      await addToSyncQueue(operationType, payload);
      await applyLocallyToIndexedDB(operationType, payload);

      return { success: true, offline: true, message: 'Saved locally. Will sync when online.' };
    } else {
      if (endpoint.startsWith('/drugs')) {
        const { getCachedDrugs } = await import('./offlineDB');
        const cached = await getCachedDrugs();
        if (cached && cached.length > 0) {
          return cached;
        }
      } else {
        const cached = getCachedGETResponse(endpoint);
        if (cached !== null) {
          return cached;
        }
      }
      if (err.name === 'AbortError') {
        throw new Error('Request timed out after 15 seconds. Please check your network.');
      }
      throw new Error('No internet connection. Please check your network and try again.');
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 503) {
      let errorBody: any = {};
      try { errorBody = await response.clone().json(); } catch {}
      if (errorBody && errorBody.maintenance) {
        window.dispatchEvent(new CustomEvent('klavora-maintenance-on', { detail: errorBody.message }));
        throw new Error(errorBody.message || 'System is currently undergoing a scheduled system upgrade.');
      }
    }
    let error: any = { message: 'Something went wrong. Please try again.' };
    try { 
      error = await response.json(); 
    } catch {
      error = { message: response.statusText || 'Something went wrong. Please try again.' };
    }
    let userMessage = error?.message || error?.error || 'Something went wrong. Please try again.';
    if (typeof userMessage === 'object') {
      userMessage = 'An unexpected error occurred. Please try again.';
    }
    throw new Error(userMessage);
  }

  window.dispatchEvent(new CustomEvent('klavora-network-success'));
  
  const result = await response.json();

  // Cache fresh drugs list to IndexedDB drugs on successful fetch
  if (endpoint.startsWith('/drugs') && method === 'GET') {
    try {
      const { cacheDrugs } = await import('./offlineDB');
      if (Array.isArray(result)) {
        await cacheDrugs(result.map(mapDrug));
      }
    } catch (e) {
      console.error('Failed to cache drugs to IndexedDB:', e);
    }
  }

  return result;
}

async function download(endpoint: string) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {},
      credentials: 'include',
    });
  } catch {
    window.dispatchEvent(new CustomEvent('klavora-network-error'));
    throw new Error('No internet connection. Please check your network and try again.');
  }

  if (!response.ok) {
    let error = { error: 'Download failed' };
    try { error = await response.json(); } catch {}
    throw new Error((error as any).message || (error as any).error || 'Download failed');
  }

  window.dispatchEvent(new CustomEvent('klavora-network-success'));
  return response.blob();
}

async function upload(endpoint: string, formData: FormData) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {},
      credentials: 'include',
    });
  } catch {
    window.dispatchEvent(new CustomEvent('klavora-network-error'));
    throw new Error('No internet connection. Please check your network and try again.');
  }

  if (!response.ok) {
    let error = { error: 'Upload failed' };
    try { error = await response.json(); } catch {}
    throw new Error((error as any).message || (error as any).error || 'Upload failed');
  }

  window.dispatchEvent(new CustomEvent('klavora-network-success'));
  return response.json();

}

// Maps a raw backend drug object to the frontend Drug shape
function mapDrug(d: any) {
  let totalQuantity = 0;
  let activeQuantity = 0;
  let isExpiringSoon = false;

  // Compute threshold first so per-batch status also respects the drug's threshold
  const threshold = d.lowStockThreshold !== undefined && d.lowStockThreshold !== null ? d.lowStockThreshold : 10;

  const batches = (d.batches || []).map((b: any) => {
    const expiryDate = new Date(b.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);

    let status: 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Out of Stock' | 'Expired' = 'In Stock';
    if (b.quantity === 0) status = 'Out of Stock';
    else if (daysUntilExpiry <= 0) status = 'Expired';
    else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) status = 'Expiring Soon';
    else if (threshold > 0 && b.quantity <= threshold) status = 'Low Stock';

    if (b.quantity > 0) {
      totalQuantity += b.quantity;
      if (expiryDate > new Date()) {
        activeQuantity += b.quantity;
      }
    }
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0 && b.quantity > 0) {
      isExpiringSoon = true;
    }

    return {
      ...b,
      expiry: expiryDate.toISOString().split('T')[0],
      supplier: b.supplier || 'Unknown',
      status,
    };
  });

  let drugStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' = 'In Stock';
  if (totalQuantity === 0) drugStatus = 'Out of Stock';
  else if (activeQuantity === 0) drugStatus = 'Expired';
  else if (threshold > 0 && activeQuantity <= threshold) drugStatus = 'Low Stock';

  // Derive unit price from first batch (cheapest / oldest) or 0
  const unitPrice = Number(batches[0]?.unitPrice ?? d.unitPrice ?? 0);

  return {
    ...d,
    unitPrice,
    categories: d.categories ?? (d.category ? [d.category] : []),
    dosageForm: d.dosageForm ?? '',
    strength: d.strength ?? '',
    manufacturer: d.manufacturer ?? '',
    batches,
    totalQuantity,
    status: drugStatus,
    isExpiringSoon,
  };
}

// Maps a raw backend transaction to the frontend Transaction shape.
// Backend returns one Transaction with multiple items; we flatten per-item.
function mapTransaction(t: any) {
  const type = (() => {
    switch (t.type) {
      case 'SALE': return 'Sale';
      case 'RESTOCK': return 'Restock';
      case 'EDIT': return 'Edit';
      case 'RECONCILIATION': return 'Reconciliation';
      default: return t.type.charAt(0) + t.type.slice(1).toLowerCase();
    }
  })() as any;

  const items: any[] = t.items || [];
  const firstItem = items[0];
  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);

  const uniqueDrugNames = [...new Set(items.map(i => i.batch?.drug?.name).filter(Boolean))];
  const drugName = uniqueDrugNames.length > 0 ? uniqueDrugNames.join(', ') : 'No items';

  return {
    id: t.id,
    type,
    drugId: firstItem?.batch?.drugId || firstItem?.batch?.drug?.id || '',
    drugName,
    batchId: firstItem?.batchId || '',
    batchExpiry: firstItem?.batch?.expiryDate
      ? new Date(firstItem.batch.expiryDate).toISOString().split('T')[0]
      : '',
    quantity: type === 'Sale' ? -totalQty : totalQty,
    unitPrice: Number(firstItem?.priceAtSale ?? 0),
    totalAmount: Number(t.totalAmount ?? 0),
    staffId: t.staffId || '',
    staffName: t.staff?.name || 'Unknown',
    timestamp: t.createdAt,
    stockBefore: 0,
    stockAfter: 0,
    pharmacyId: t.pharmacyId || '',
    notes: t.notes || undefined,
    sale_type: t.sale_type || t.saleType || undefined,
    amount_tendered: t.amount_tendered || t.amountTendered ? Number(t.amount_tendered || t.amountTendered) : undefined,
    payment_reference: t.payment_reference || t.paymentReference || undefined,
    insurance_provider: t.insurance_provider || t.insuranceProvider || undefined,
    insurance_number: t.insurance_number || t.insuranceNumber || undefined,
    _items: items,
    _totalQty: totalQty,
  };
}

/**
 * Enriches mapped transactions with real stockBefore/stockAfter values.
 * Strategy: the current DB drug stock is the ground truth (post-all-transactions).
 * We sort transactions oldest→newest, then work backwards from current stock
 * to reconstruct each snapshot.
 */
function enrichWithStockLevels(transactions: any[], drugs: any[]) {
  // Build a map of drugId -> current total stock & metadata
  const stockMap: Record<string, number> = {};
  const drugMetaMap: Record<string, any> = {};
  for (const drug of drugs) {
    const total = (drug.batches || []).reduce((s: number, b: any) => s + (b.quantity || 0), 0);
    stockMap[drug.id] = total;
    drugMetaMap[drug.id] = drug;
  }

  // Sort newest→oldest (they come from API newest first, keep that order)
  // We traverse newest→oldest and "undo" each transaction to find stockBefore
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // running stock = current stock (after all txns)
  const runningStock = { ...stockMap };
  const result = sorted.map(tx => {
    const rawItems: any[] = tx._items || [];
    
    // Group transaction items by drugId
    const drugItemsMap: Record<string, any[]> = {};
    if (rawItems.length > 0) {
      for (const item of rawItems) {
        const dId = item.batch?.drugId || item.batch?.drug?.id || tx.drugId;
        if (!dId) continue;
        if (!drugItemsMap[dId]) drugItemsMap[dId] = [];
        drugItemsMap[dId].push(item);
      }
    } else if (tx.drugId) {
      drugItemsMap[tx.drugId] = [{
        quantity: Math.abs(tx.quantity),
        priceAtSale: tx.unitPrice,
        batchId: tx.batchId,
        batch: {
          id: tx.batchId,
          batchNumber: tx.batchId ? (tx.batchId.slice(0, 8)) : 'Default',
          expiryDate: tx.batchExpiry,
          drug: { id: tx.drugId, name: tx.drugName }
        }
      }];
    }

    const drugLines: any[] = [];

    // Calculate per-drug stock snapshot for this transaction
    for (const [dId, items] of Object.entries(drugItemsMap)) {
      const drug = drugMetaMap[dId];
      const dName = items[0]?.batch?.drug?.name || drug?.name || tx.drugName || 'Unknown Medicine';
      const dCategory = items[0]?.batch?.drug?.category || drug?.category || 'General';
      const dTotalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const stockAfter = runningStock[dId] !== undefined ? runningStock[dId] : (drug ? (drug.batches || []).reduce((s: number, b: any) => s + (b.quantity || 0), 0) : 0);
      
      let stockBefore: number;
      if (tx.type === 'Sale') {
        stockBefore = stockAfter + dTotalQty;
      } else if (tx.type === 'Restock') {
        stockBefore = Math.max(0, stockAfter - dTotalQty);
      } else {
        stockBefore = stockAfter;
      }

      // Undo this drug's portion to get the stock that existed before it
      runningStock[dId] = stockBefore;

      const batches = items.map(item => ({
        batchId: item.batchId || item.batch?.id || '',
        batchNumber: item.batch?.batchNumber || item.batchId || 'N/A',
        expiryDate: item.batch?.expiryDate ? new Date(item.batch.expiryDate).toISOString().split('T')[0] : (tx.batchExpiry || undefined),
        quantity: item.quantity || 0,
        priceAtSale: Number(item.priceAtSale ?? tx.unitPrice ?? 0)
      }));

      const unitPrice = Number(items[0]?.priceAtSale ?? tx.unitPrice ?? 0);
      const totalAmount = items.reduce((sum, item) => sum + ((item.quantity || 0) * Number(item.priceAtSale ?? unitPrice)), 0);

      drugLines.push({
        drugId: dId,
        drugName: dName,
        category: dCategory,
        quantity: dTotalQty,
        stockBefore,
        stockAfter,
        unitPrice,
        totalAmount,
        batches
      });
    }

    const firstDrugLine = drugLines[0];
    const isSingleDrug = drugLines.length <= 1;

    return {
      ...tx,
      stockBefore: isSingleDrug && firstDrugLine ? firstDrugLine.stockBefore : 0,
      stockAfter: isSingleDrug && firstDrugLine ? firstDrugLine.stockAfter : 0,
      drugLines
    };
  });

  // Re-sort back to newest-first for the UI
  return result.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export const api = {
  auth: {
    login: (credentials: { email?: string; password?: string; pin?: string; rememberMe?: boolean }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    initRegistrationPayment: (data: any) =>
      request('/auth/init-registration-payment', { method: 'POST', body: JSON.stringify(data) }),
    reinitPayment: (email: string) =>
      request('/auth/reinit-payment', { method: 'POST', body: JSON.stringify({ email }) }),
    completeRegistration: (data: any) =>
      request('/auth/complete-registration', { method: 'POST', body: JSON.stringify(data) }),
    registerTrial: (data: any) =>
      request('/auth/register-trial', { method: 'POST', body: JSON.stringify(data) }),
    requestOTP: (email: string) =>
      request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOTP: (email: string, code: string) =>
      request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) }),
    resetPassword: (data: any) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    forcePasswordChange: (data: { newPassword: string }) =>
      request('/auth/force-password-change', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request(`/auth/me?t=${Date.now()}`, { method: 'GET' }),
  },

  pharmacy: {
    getDetails: () => request('/pharmacy', { method: 'GET' }),
    getPlanDetails: () => request('/pharmacy/plan-details', { method: 'GET' }),
    update: (data: { name?: string; phone?: string; address?: string; allowDispensingExpired?: boolean; enableShiftTracking?: boolean; shiftMode?: string; shiftManagementMode?: string }) =>
      request('/pharmacy', { method: 'PUT', body: JSON.stringify(data) }),
    updatePlan: (data: { plan?: string; momoNumber?: string; action: 'renew' | 'downgrade' | 'upgrade' | 'cancel' | 'delete' | 'revoke' }) =>
      request('/pharmacy/plan', { method: 'PUT', body: JSON.stringify(data) }),
    reactivate: () =>
      request('/pharmacy/reactivate', { method: 'POST' }),
    verifyPayment: (reference: string) =>
      request(`/pharmacy/verify-payment/${reference}`, { method: 'GET' }),
  },

  drugs: {
    getAll: async () => {
      const drugs = await request('/drugs');
      if (!Array.isArray(drugs)) return [];
      if (drugs.length > 0 && drugs[0].isExpiringSoon !== undefined) {
        return drugs;
      }
      return drugs.map(mapDrug);
    },
    create: (data: any) =>
      request('/drugs', { method: 'POST', body: JSON.stringify(data) }),
    addBatch: (drugId: string, data: any) =>
      request(`/drugs/${drugId}/batches`, { method: 'POST', body: JSON.stringify(data) }),
    update: (drugId: string, data: any) =>
      request(`/drugs/${drugId}`, { method: 'PUT', body: JSON.stringify(data) }),
    searchMaster: (q: string) =>
      request(`/drugs/master/search?q=${encodeURIComponent(q)}`, { method: 'GET' }),
    suggest: (drugName: string) =>
      request('/drugs/master/suggest', { method: 'POST', body: JSON.stringify({ drugName }) }),
    bulkUpdateExpiry: (drugId: string, updates: { id: string, expiryDate: string }[]) =>
      request(`/drugs/${drugId}/batches/bulk-expiry`, { method: 'PATCH', body: JSON.stringify({ updates }) }),
    remove: (drugId: string) =>
      request(`/drugs/${drugId}`, { method: 'DELETE' }),
    removeBatch: (drugId: string, batchId: string) =>
      request(`/drugs/${drugId}/batches/${batchId}`, { method: 'DELETE' }),
    cleanupExpiredBatches: () =>
      request('/drugs/expired-batches/cleanup', { method: 'POST' }),
    previewExpiredBatches: () =>
      request('/drugs/expired-batches/preview', { method: 'GET' }),
    getDeletedBatches: () =>
      request('/drugs/deleted-batches', { method: 'GET' }),
  },

  transactions: {
    createSale: (data: any) => {
      const payload = Array.isArray(data) ? { items: data } : data;
      return request('/transactions/sale', { method: 'POST', body: JSON.stringify(payload) });
    },
    getHistory: async () => {
      const [history, drugsRaw] = await Promise.all([
        request('/transactions/history'),
        request('/drugs'),
      ]);
      if (!Array.isArray(history)) return [];
      if (history.length > 0 && history[0]._items !== undefined) {
        return history;
      }
      const mappedDrugs = (Array.isArray(drugsRaw) ? drugsRaw : []).map(d => d.isExpiringSoon !== undefined ? d : mapDrug(d));
      const mappedTxns = history.map(mapTransaction);
      return enrichWithStockLevels(mappedTxns, mappedDrugs);
    },
  },

  staff: {
    getAll: () => request('/staff'),
    create: (data: { name: string; email: string; password?: string; role?: string }) =>
      request('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; email?: string; password?: string; role?: string }) =>
      request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request(`/staff/${id}`, { method: 'DELETE' }),
  },

  alerts: {
    get: () => request('/alerts'),
  },

  notifications: {
    getAll: (params?: { unread?: boolean; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.unread) q.set('unread', 'true');
      if (params?.limit) q.set('limit', String(params.limit));
      const suffix = q.toString() ? `?${q.toString()}` : '';
      return request(`/notifications${suffix}`, { method: 'GET' });
    },
    markRead: (id: string) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' }),
    delete: (id: string) =>
      request(`/notifications/${id}`, { method: 'DELETE' }),
    markAllRead: () =>
      request('/notifications/read-all', { method: 'PATCH' }),
    clearAll: () =>
      request('/notifications', { method: 'DELETE' }),
  },

  insights: {
    getDashboard: () => request('/insights/dashboard'),
  },

  backups: {
    trigger: () => download('/backups/trigger'),
    getLogs: () => request('/backups/logs'),
    updateSettings: (frequency: string) => request('/backups/settings', { method: 'PATCH', body: JSON.stringify({ frequency }) }),
    previewRestore: (encryptedData: string) => request('/backups/preview-restore', { method: 'POST', body: JSON.stringify({ encryptedData }) }),
    restore: (data: { encryptedData: string; confirmation: string }) => request('/backups/restore', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  inventory: {
    export: () => download('/inventory/export'),
    previewImport: (formData: FormData) => upload('/inventory/import/preview', formData),
    confirmImport: (data: { items: any[]; fileName: string }) => request('/inventory/import/confirm', { method: 'POST', body: JSON.stringify(data) }),
    getImportLogs: () => request('/inventory/import/logs'),
    
    // MedImport flow
    medbimport: {
      parse: (formData: FormData) => upload('/inventory/medbimport/parse', formData),
      process: (data: { mapping: any; rawRows: any[]; defaultValues?: any }) =>
        request('/inventory/medbimport/process', { method: 'POST', body: JSON.stringify(data) }),
      confirm: (data: { items: any[]; fileName: string }) =>
        request('/inventory/medbimport/confirm', { method: 'POST', body: JSON.stringify(data) }),
      undo: (sessionId: string) =>
        request(`/inventory/medbimport/${sessionId}`, { method: 'DELETE' }),
      downloadTemplate: () => download('/inventory/medbimport/template'),
    }
  },

  sync: {
    batch: (operations: any[]) =>
      request('/sync/batch', { method: 'POST', body: JSON.stringify({ operations }) }),
  },

  kpi: {
    getInventoryValue: () => request('/kpi/inventory-value'),
    getSalesPerformance: (q: string) => request(`/kpi/sales-performance${q}`),
    getGrossMargin: (q: string) => request(`/kpi/gross-margin${q}`),
    getStockMovement: (q: string) => request(`/kpi/stock-movement${q}`),
    getLossTracking: (q: string) => request(`/kpi/loss-tracking${q}`),
    getStaffPerformance: (q: string) => request(`/kpi/staff-performance${q}`)
  },

  shifts: {
    getActive: () => request('/shifts/active'),
    getActiveStaff: () => request('/shifts/active-staff'),
    openSelf: (data: { openingFloat?: number; notes?: string }) =>
      request('/shifts/open-self', { method: 'POST', body: JSON.stringify(data) }),
    closeSelf: (data: { closingFloat?: number; actualCard?: number; actualMomo?: number; notes?: string }) =>
      request('/shifts/close-self', { method: 'POST', body: JSON.stringify(data) }),
    logoutUnclosed: () =>
      request('/shifts/logout-unclosed', { method: 'POST' }),
    openManager: (data: { staffId: string; managerEmail: string; managerPassword: string; openingFloat?: number; notes?: string }) =>
      request('/shifts/open-manager', { method: 'POST', body: JSON.stringify(data) }),
    closeManager: (data: { staffId: string; managerEmail: string; managerPassword: string; closingFloat?: number; actualCard?: number; actualMomo?: number; notes?: string }) =>
      request('/shifts/close-manager', { method: 'POST', body: JSON.stringify(data) }),
    openCashierSession: (data: { openingFloat: number; notes?: string }) =>
      request('/shifts/open-cashier-session', { method: 'POST', body: JSON.stringify(data) }),
    openStaffByCashier: (data: { staffId: string; openingFloat?: number; notes?: string }) =>
      request('/shifts/open-staff-by-cashier', { method: 'POST', body: JSON.stringify(data) }),
    closeCashierSession: (data: { shiftId?: string; staffId?: string; closingFloat: number; actualCard?: number; actualMomo?: number; notes?: string }) =>
      request('/shifts/close-cashier-session', { method: 'POST', body: JSON.stringify(data) }),
    getMyHistory: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/shifts/my-history${queryStr}`);
    },
    getHistory: (params?: { startDate?: string; endDate?: string; staffId?: string; role?: string; status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.staffId) q.append('staffId', params.staffId);
      if (params?.role) q.append('role', params.role);
      if (params?.status) q.append('status', params.status);
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/shifts/history${queryStr}`);
    },
    exportCsv: (params?: { startDate?: string; endDate?: string; staffId?: string; role?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.staffId) q.append('staffId', params.staffId);
      if (params?.role) q.append('role', params.role);
      if (params?.status) q.append('status', params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return download(`/shifts/export-csv${queryStr}`);
    },
    getActivities: (id: string) => request(`/shifts/${id}/activities`),
  },

  logs: {
    post: (logs: any[]) =>
      request('/logs', { method: 'POST', body: JSON.stringify({ logs }) }),
    get: (params?: { date?: string; level?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.date) q.set('date', params.date);
      if (params?.level) q.set('level', params.level);
      if (params?.limit) q.set('limit', String(params.limit));
      const suffix = q.toString() ? `?${q.toString()}` : '';
      return request(`/logs${suffix}`, { method: 'GET' });
    },
    getDates: () => request('/logs/dates', { method: 'GET' }),
  },
};
