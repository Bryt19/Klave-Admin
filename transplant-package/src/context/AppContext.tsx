// @refresh reset
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { AuthUser, Drug, Transaction, BasketItem, FailedItem, HeldCart, Pharmacy } from '@/types';
import { api, getApiBaseUrl } from '@/utils/api';
import { toast } from 'sonner';
import { syncManager } from '@/utils/syncManager';
import { addToSyncQueue } from '@/utils/offlineDB';
import { getNearestExpiry } from '@/utils/inventory';
import { HeartbeatService } from '@/utils/heartbeat';
import { setLoggerUserContext, flushLogs, logger } from '@/utils/errorLogger';
import { getStaffAvatarColor } from '@/utils/formatters';

export type Theme = 'light' | 'dark';
export type SubscriptionPlan = 'starter' | 'premium' | 'trial';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  user: AuthUser | null;
  login: (u: any, token?: string) => void;
  logout: () => void;
  pharmacySettings: Pharmacy | null;
  refreshPharmacySettings: () => Promise<void>;
  drugs: Drug[];
  setDrugs: (d: Drug[]) => void;
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  pendingSales: any[];
  addPendingSale: (sale: any, opType?: string) => void;
  syncOfflineQueue: (force?: boolean) => Promise<void>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (p: SubscriptionPlan) => void;
  refreshData: (options?: { showSkeletons?: boolean; invalidateAllCaches?: boolean }) => Promise<void>;
  refreshUser: () => Promise<void>;
  syncing: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  initialized: boolean;
  notifications: AppNotification[];
  unreadNotifications: number;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  // PWA Support
  pwaInstallable: boolean;
  pwaInstalled: boolean;
  showPwaBanner: boolean;
  installPwa: () => Promise<void>;
  dismissPwaPrompt: () => void;
  staff: any[];
  setStaff: (s: any[]) => void;
  // Offline sync states
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  pendingSyncCount: number;
  isOnline: boolean;
  // Global Basket State
  showBasketDrawer: boolean;
  setShowBasketDrawer: (v: boolean) => void;
  basket: BasketItem[];
  failedItems: FailedItem[];
  setFailedItems: React.Dispatch<React.SetStateAction<FailedItem[]>>;
  notes: string;
  setNotes: (n: string) => void;
  isProcessingSale: boolean;
  addDrugToBasket: (drug: Drug, qty: number, forceExpired?: boolean) => Promise<{success: boolean, reason?: string}>;
  editBasketItemQuantity: (drugId: string, itemToEdit: BasketItem, newQty: number) => Promise<boolean>;
  updateDrugQuantity: (drugId: string, newTotalQty: number) => Promise<boolean>;
  removeBasketItem: (drugId: string, batchId: string) => Promise<void>;
  removeDrugFromBasket: (drugId: string) => Promise<void>;
  clearBasket: () => Promise<void>;
  executeSale: (
    controlledDetails?: { patientName: string; prescriberName: string; prescriberLicense: string },
    paymentDetails?: { method: string; amountTendered?: string; reference?: string; insuranceProvider?: string; insuranceNumber?: string }
  ) => Promise<{ success: boolean; receiptRef?: string; receiptTx?: any; completedBasket?: BasketItem[] }>;
  expiredDrugAttempt: { drug: Drug; qty: number } | null;
  setExpiredDrugAttempt: (val: { drug: Drug; qty: number } | null) => void;
  // Queue / Held Carts
  heldCarts: HeldCart[];
  holdCurrentCart: () => Promise<void>;
  resumeHeldCart: (id: string) => Promise<void>;
  swapHeldCart: (id: string) => Promise<void>;
  discardHeldCart: (id: string) => Promise<void>;
}

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const s = localStorage.getItem('klavora-theme');
    if (s === 'dark' || s === 'light') return s;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [drugs, setDrugsState] = useState<Drug[]>(() => {
    try {
      const cached = localStorage.getItem('klavora-cached-drugs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const cached = localStorage.getItem('klavora-cached-transactions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [pendingSales, setPendingSales] = useState<any[]>(() => {
    try {
      const queue = localStorage.getItem('klavora-pending-sales');
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  });
  const [staff, setStaffState] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('klavora-cached-staff');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [pharmacySettings, setPharmacySettingsState] = useState<Pharmacy | null>(() => {
    try {
      const cached = localStorage.getItem('klavora-cached-pharmacy-settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const refreshPharmacySettings = useCallback(async () => {
    try {
      const details = await api.pharmacy.getDetails();
      if (details) {
        setPharmacySettingsState(details);
        try {
          localStorage.setItem('klavora-cached-pharmacy-settings', JSON.stringify(details));
        } catch {}
      }
    } catch (err) {
      console.error('[AppContext] Failed to refresh pharmacy settings:', err);
    }
  }, []);

  const setStaff = useCallback((s: any[]) => {
    setStaffState(s);
    try {
      localStorage.setItem('klavora-cached-staff', JSON.stringify(s));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlanState] = useState<SubscriptionPlan>('premium');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const refreshInFlightRef = useRef(false);
  const [expiredDrugAttempt, setExpiredDrugAttempt] = useState<{ drug: Drug, qty: number } | null>(null);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'offline'>('idle');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isOnline, setIsOnline] = useState(HeartbeatService.isCurrentlyOnline);

  // Global Basket State
  const [showBasketDrawer, setShowBasketDrawer] = useState(false);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Load basket & held carts on mount or when user changes
  useEffect(() => {
    if (!user?.pharmacyId) return;
    
    const loadDraft = async () => {
      try {
        const { getMeta } = await import('@/utils/offlineDB');
        const draft = await getMeta(`basket_draft_${user.pharmacyId}`);
        if (draft && Array.isArray(draft)) {
          setBasket(draft);
        } else {
          setBasket([]);
        }
        const savedHeld = await getMeta(`held_carts_${user.pharmacyId}`);
        if (savedHeld && Array.isArray(savedHeld)) {
          setHeldCarts(savedHeld);
        } else {
          setHeldCarts([]);
        }
      } catch (err) {
        console.error('Failed to load basket draft:', err);
      }
    };
    loadDraft();
  }, [user?.pharmacyId]);

  const updateBasket = useCallback(async (newBasket: BasketItem[]) => {
    setBasket(newBasket);
    if (!user?.pharmacyId) return;
    try {
      const { saveMeta, deleteMeta } = await import('@/utils/offlineDB');
      if (newBasket.length > 0) {
        await saveMeta(`basket_draft_${user.pharmacyId}`, newBasket);
      } else {
        await deleteMeta(`basket_draft_${user.pharmacyId}`);
      }
    } catch (err) {
      console.error('Failed to persist basket draft:', err);
    }
  }, [user?.pharmacyId]);

  const resolveFEFOForDrug = useCallback((drug: Drug, qty: number, forceExpired: boolean = false) => {
    const now = new Date();
    const activeBatches = (drug.batches || [])
      .filter(b => b.quantity > 0 && new Date(b.expiry) > now)
      .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

    const expiredBatches = (drug.batches || [])
      .filter(b => b.quantity > 0 && new Date(b.expiry) <= now)
      .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

    const totalActive = activeBatches.reduce((sum, b) => sum + b.quantity, 0);
    const totalExpired = expiredBatches.reduce((sum, b) => sum + b.quantity, 0);
    const totalOverall = totalActive + totalExpired;

    if (qty > totalActive && !forceExpired) {
        if (totalOverall >= qty && totalExpired > 0) {
            return {
                success: false,
                reason: 'EXPIRED',
                error: 'This drug has expired and cannot be dispensed.',
                resolvedItems: []
            };
        } else {
            return {
                success: false,
                reason: 'OUT_OF_STOCK',
                error: 'This drug is currently out of stock.',
                resolvedItems: []
            };
        }
    }

    if (qty > totalOverall) {
      return {
        success: false,
        reason: 'OUT_OF_STOCK',
        error: 'This drug is currently out of stock.',
        resolvedItems: []
      };
    }

    let remaining = qty;
    const resolvedItems = [];

    for (const batch of activeBatches) {
      if (remaining <= 0) break;
      const deduct = Math.min(batch.quantity, remaining);
      resolvedItems.push({
        batch_id: batch.id,
        batch_number: (batch as any).manufacturer_batch_number || batch.batchNumber || batch.batchNo || 'Auto-Assigned',
        expiry_date: batch.expiry,
        quantity: deduct,
        unit_price: Number(batch.unitPrice || drug.unitPrice || 0),
        subtotal: deduct * Number(batch.unitPrice || drug.unitPrice || 0),
        isExpired: false
      });
      remaining -= deduct;
    }

    if (remaining > 0 && forceExpired) {
      for (const batch of expiredBatches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.quantity, remaining);
        resolvedItems.push({
          batch_id: batch.id,
          batch_number: (batch as any).manufacturer_batch_number || batch.batchNumber || batch.batchNo || 'Auto-Assigned',
          expiry_date: batch.expiry,
          quantity: deduct,
          unit_price: Number(batch.unitPrice || drug.unitPrice || 0),
          subtotal: deduct * Number(batch.unitPrice || drug.unitPrice || 0),
          isExpired: true
        });
        remaining -= deduct;
      }
    }

    return {
      success: true,
      resolvedItems
    };
  }, []);

  const removeBasketItem = useCallback(async (drugId: string, batchId: string) => {
    const updated = basket.filter(item => !(item.drug_id === drugId && item.batch_id === batchId));
    setFailedItems(prev => prev.filter(f => !(f.drugId === drugId && f.batchId === batchId)));
    await updateBasket(updated);
  }, [basket, updateBasket]);

  const addDrugToBasket = useCallback(async (drug: Drug, qty: number, forceExpired: boolean = false): Promise<{success: boolean, reason?: string}> => {
    const existingQty = basket
      .filter(item => item.drug_id === drug.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalQty = existingQty + qty;

    const res = resolveFEFOForDrug(drug, totalQty, forceExpired);
    if (!res.success) {
      // If expired and user allows it, show the global modal instead of this toast
      if (res.reason === 'EXPIRED' && user?.allowDispensingExpired && !forceExpired) {
        setExpiredDrugAttempt({ drug, qty });
      } else {
        toast.error(res.error || 'Requested quantity exceeds stock.');
      }
      return { success: false, reason: res.reason };
    }

    setFailedItems(prev => prev.filter(f => f.drugId !== drug.id));

    const otherDrugs = basket.filter(item => item.drug_id !== drug.id);
    const newItems = res.resolvedItems.map(row => ({
      drug_id: drug.id,
      drug_name: drug.name,
      isControlled: drug.isControlled,
      ...row
    }));

    await updateBasket([...otherDrugs, ...newItems]);
    return { success: true };
  }, [basket, resolveFEFOForDrug, updateBasket, user]);

  const editBasketItemQuantity = useCallback(async (drugId: string, itemToEdit: BasketItem, newQty: number): Promise<boolean> => {
    const drug = (drugs || []).find(d => d.id === drugId);
    if (!drug) return false;

    if (newQty <= 0) {
      await removeBasketItem(drugId, itemToEdit.batch_id);
      return true;
    }

    const batch = drug.batches?.find(b => b.id === itemToEdit.batch_id);
    if (!batch) {
      toast.error('Batch not found.');
      return false;
    }

    if (newQty > batch.quantity) {
      toast.error(`Only ${batch.quantity} units available in this batch.`);
      return false;
    }

    const updatedBasket = basket.map(item => {
      if (item.drug_id === drugId && item.batch_id === itemToEdit.batch_id) {
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price
        };
      }
      return item;
    });

    await updateBasket(updatedBasket);
    return true;
  }, [drugs, basket, updateBasket, removeBasketItem]);

  const updateDrugQuantity = useCallback(async (drugId: string, newTotalQty: number): Promise<boolean> => {
    const drug = (drugs || []).find(d => d.id === drugId);
    if (!drug) return false;

    if (newTotalQty <= 0) {
      const updated = basket.filter(item => item.drug_id !== drugId);
      setFailedItems(prev => prev.filter(f => f.drugId !== drugId));
      await updateBasket(updated);
      return true;
    }

    const now = new Date();
    const allowExpired = !!user?.allowDispensingExpired;
    const activeBatches = (drug.batches || []).filter(b => b.quantity > 0 && new Date(b.expiry) > now);
    const expiredBatches = (drug.batches || []).filter(b => b.quantity > 0 && new Date(b.expiry) <= now);
    
    const totalActive = activeBatches.reduce((sum, b) => sum + b.quantity, 0);
    const totalExpired = expiredBatches.reduce((sum, b) => sum + b.quantity, 0);
    const maxStock = allowExpired ? (totalActive + totalExpired) : totalActive;

    let qtyToProcess = newTotalQty;
    if (newTotalQty > maxStock) {
      qtyToProcess = maxStock;
      toast.warning(`Quantity adjusted to maximum available stock (${maxStock}).`);
    }

    if (qtyToProcess <= 0) {
      toast.error(allowExpired ? 'This drug is currently out of stock.' : 'This drug has expired and cannot be dispensed.');
      return false;
    }

    const res = resolveFEFOForDrug(drug, qtyToProcess, allowExpired);
    if (!res.success) {
      toast.error(res.error || 'Requested quantity exceeds stock.');
      return false;
    }

    setFailedItems(prev => prev.filter(f => f.drugId !== drugId));

    const otherDrugs = basket.filter(item => item.drug_id !== drugId);
    const newItems = res.resolvedItems.map(row => ({
      drug_id: drugId,
      drug_name: drug.name,
      isControlled: drug.isControlled,
      ...row
    }));

    await updateBasket([...otherDrugs, ...newItems]);
    return true;
  }, [drugs, basket, resolveFEFOForDrug, updateBasket, user]);

  const removeDrugFromBasket = useCallback(async (drugId: string) => {
    const updated = basket.filter(item => item.drug_id !== drugId);
    setFailedItems(prev => prev.filter(f => f.drugId !== drugId));
    await updateBasket(updated);
  }, [basket, updateBasket]);

  const clearBasket = useCallback(async () => {
    setNotes('');
    setFailedItems([]);
    await updateBasket([]);
  }, [updateBasket]);

  const updateHeldCarts = useCallback(async (newHeld: HeldCart[]) => {
    setHeldCarts(newHeld);
    if (!user?.pharmacyId) return;
    try {
      const { saveMeta, deleteMeta } = await import('@/utils/offlineDB');
      if (newHeld.length > 0) {
        await saveMeta(`held_carts_${user.pharmacyId}`, newHeld);
      } else {
        await deleteMeta(`held_carts_${user.pharmacyId}`);
      }
    } catch (err) {
      console.error('Failed to persist held carts:', err);
    }
  }, [user?.pharmacyId]);

  const holdCurrentCart = useCallback(async () => {
    if (basket.length === 0) return;
    const newCart: HeldCart = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      items: [...basket],
      notes,
      label: `Cart #${heldCarts.length + 1}`
    };
    await updateHeldCarts([...heldCarts, newCart]);
    await clearBasket();
  }, [basket, notes, heldCarts, updateHeldCarts, clearBasket]);

  const resumeHeldCart = useCallback(async (id: string) => {
    const cart = heldCarts.find(c => c.id === id);
    if (!cart) return;
    
    // Resume the cart
    await updateBasket(cart.items);
    setNotes(cart.notes || '');
    setFailedItems([]);
    
    // Remove it from queue
    const remaining = heldCarts.filter(c => c.id !== id);
    await updateHeldCarts(remaining);
  }, [heldCarts, updateBasket, updateHeldCarts]);

  const swapHeldCart = useCallback(async (id: string) => {
    const targetCart = heldCarts.find(c => c.id === id);
    if (!targetCart) return;

    let newHeld = heldCarts.filter(c => c.id !== id);
    
    if (basket.length > 0) {
       const newCart: HeldCart = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        items: [...basket],
        notes,
        label: `Cart #${heldCarts.length + 1}`
      };
      newHeld.push(newCart);
    }
    
    await updateHeldCarts(newHeld);
    
    // Now resume targetCart
    await updateBasket(targetCart.items);
    setNotes(targetCart.notes || '');
    setFailedItems([]);
  }, [basket, notes, heldCarts, updateHeldCarts, updateBasket]);

  const discardHeldCart = useCallback(async (id: string) => {
    const remaining = heldCarts.filter(c => c.id !== id);
    await updateHeldCarts(remaining);
  }, [heldCarts, updateHeldCarts]);

  const setDrugs = useCallback((d: Drug[]) => {
    setDrugsState(d);
    try {
      localStorage.setItem('klavora-cached-drugs', JSON.stringify(d));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addPendingSale = useCallback(async (sale: any, opType = 'SALE') => {
    setPendingSales(prev => {
      const next = [sale, ...prev];
      localStorage.setItem('klavora-pending-sales', JSON.stringify(next));
      return next;
    });
    
    // Add to IndexedDB sync queue
    await addToSyncQueue(opType, opType === 'MULTI_SALE' ? sale : sale.items);
    syncManager.sync();
  }, []);

  const executeSale = useCallback(async (
    controlledDetails?: { patientName: string; prescriberName: string; prescriberLicense: string },
    paymentDetails?: { method: string; amountTendered?: string; reference?: string; insuranceProvider?: string; insuranceNumber?: string }
  ) => {
    if (basket.length === 0) {
      return { success: false, error: 'empty_cart' };
    }

    const totalAmount = basket.reduce((sum, item) => sum + item.subtotal, 0);
    if (paymentDetails?.method === 'cash' && paymentDetails?.amountTendered) {
      const tendered = parseFloat(paymentDetails.amountTendered);
      if (tendered < totalAmount) {
        return { success: false, error: 'Amount tendered is less than the total due. Sale cannot be completed.' };
      }
    }

    setIsProcessingSale(true);
    const savedBasket = [...basket];
    const savedNotes = notes;

    const salePayload = {
      items: savedBasket.map(item => ({
        drugId: item.drug_id,
        batchId: item.batch_id,
        quantity: item.quantity,
        unitPrice: item.unit_price
      })),
      sale_type: paymentDetails?.method || 'cash',
      notes: savedNotes || undefined,
      patient_name: controlledDetails?.patientName || undefined,
      prescriber_name: controlledDetails?.prescriberName || undefined,
      prescriber_license: controlledDetails?.prescriberLicense || undefined,
      amount_tendered: paymentDetails?.amountTendered ? parseFloat(paymentDetails.amountTendered) : undefined,
      payment_reference: paymentDetails?.reference || undefined,
      insurance_provider: paymentDetails?.insuranceProvider || undefined,
      insurance_number: paymentDetails?.insuranceNumber || undefined
    };

    // Prepare offline fallback data just in case
    const optimisticId = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const optimisticTx = {
      id: optimisticId,
      totalAmount: savedBasket.reduce((sum, item) => sum + item.subtotal, 0),
      createdAt: new Date().toISOString(),
      notes: `Sale Type: ${(paymentDetails?.method || 'CASH').toUpperCase()}` + 
             (controlledDetails?.patientName ? ` | Patient: ${controlledDetails.patientName} | Prescriber: ${controlledDetails.prescriberName} (Lic: ${controlledDetails.prescriberLicense})` : '') +
             (savedNotes ? ` | Notes: ${savedNotes}` : '')
    };

    // 2. Await API confirmation: Cart is not cleared until server confirms success
    try {
      const response = await api.transactions.createSale(salePayload);
      
      const { deleteMeta } = await import('@/utils/offlineDB');
      await deleteMeta('basket_draft').catch(() => {});

      if (response && response.offline) {
        // Handled by api.ts offline interceptor
        setBasket([]);
        setNotes('');
        return { 
          success: true, 
          receiptRef: optimisticId, 
          receiptTx: optimisticTx, 
          completedBasket: savedBasket 
        };
      }

      if (response && response.id) {
        // Confirmed on server
        setBasket([]);
        setNotes('');
        try {
          const transData = await api.transactions.getHistory();
          if (Array.isArray(transData)) {
            setTransactions(transData);
            localStorage.setItem('klavora-cached-transactions', JSON.stringify(transData));
          }
          
          // Re-fetch accurate drug inventory from server after successful sale
          const freshDrugs = await api.drugs.getAll();
          if (Array.isArray(freshDrugs)) {
            setDrugs(freshDrugs);
          }
        } catch {}

        return { 
          success: true, 
          receiptRef: response.id, 
          receiptTx: { ...response, notes: savedNotes || undefined }, 
          completedBasket: savedBasket 
        };
      }

      // Fallback for cases where it returns success without ID (e.g. mocked)
      setBasket([]);
      setNotes('');
      return { 
        success: true, 
        receiptRef: optimisticId, 
        receiptTx: optimisticTx, 
        completedBasket: savedBasket 
      };
    } catch (err: any) {
      const isOfflineError = !navigator.onLine || 
                             (err.message && (err.message.includes('No internet') || err.message.includes('Failed to fetch') || err.message.includes('Offline')));
      
      if (isOfflineError) {
        // Offline: save to queue and allow offline dispensing
        await addPendingSale({
          tempId: optimisticId,
          ...salePayload
        }, 'MULTI_SALE');
        
        const { applyLocallyToIndexedDB, deleteMeta } = await import('@/utils/offlineDB');
        await applyLocallyToIndexedDB('MULTI_SALE', salePayload);
        await deleteMeta('basket_draft').catch(() => {});

        setBasket([]);
        setNotes('');
        return { 
          success: true, 
          receiptRef: optimisticId, 
          receiptTx: optimisticTx, 
          completedBasket: savedBasket, 
          offline: true 
        };
      } else {
        // Real server failure / stock collision: Keep cart intact so user can retry
        console.error('[POS Sale Error]:', err.message);
        
        // Re-fetch accurate drug inventory from server
        try {
          const freshDrugs = await api.drugs.getAll();
          if (Array.isArray(freshDrugs)) {
            setDrugs(freshDrugs);
          }
        } catch {}

        if (err.failedItem) {
          setFailedItems(prev => [...prev, err.failedItem]);
          toast.error(err.message || 'Sale failed due to a stock conflict. Cart has been restored.');
        } else {
          toast.error(err.message || 'Sale failed to complete on the server. Your cart has been restored.');
        }
        
        window.dispatchEvent(new CustomEvent('klavora-sale-failed', { detail: err.message }));
        return { success: false, error: err.message || 'sale_failed' };
      }
    } finally {
      setIsProcessingSale(false);
    }
  }, [basket, notes, drugs, setDrugs, addPendingSale]);

  useEffect(() => {
    // Subscribe to heartbeat to drive UI online/offline indicator
    const unsubscribeHeartbeat = HeartbeatService.subscribe((status) => {
      setIsOnline(status === 'online');
    });

    // Subscribe to sync manager for pending sync counts
    const unsubscribeSync = syncManager.subscribe((status, count) => {
      setSyncStatus(status);
      setPendingSyncCount(count);
    });
    
    return () => {
      unsubscribeHeartbeat();
      unsubscribeSync();
    };
  }, []);

  // PWA state
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setPwaInstalled(true);
    }

    // Register listeners unconditionally so that after uninstall,
    // when the browser re-fires beforeinstallprompt, we capture it
    // and offer re-installation seamlessly.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Always mark as not-installed and show banner when browser fires this
      // (browser only fires it when the app is genuinely installable / uninstalled)
      const running = window.matchMedia('(display-mode: standalone)').matches
        || (navigator as any).standalone;
      if (!running) {
        setPwaInstalled(false);
        setShowPwaBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setPwaInstalled(true);
      setShowPwaBanner(false);
      setDeferredPrompt(null);
      toast.success('Klavora has been installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async () => {
    if (!deferredPrompt) return;
    const promptRef = deferredPrompt;
    // Clear the stored prompt first (Chrome only allows it to be used once)
    setDeferredPrompt(null);
    setShowPwaBanner(false);
    try {
      await promptRef.prompt();
      const { outcome } = await promptRef.userChoice;
      console.log(`PWA install choice: ${outcome}`);
      if (outcome === 'accepted') {
        setPwaInstalled(true);
      }
      // If dismissed, Chrome will re-fire beforeinstallprompt later
      // — the handler above will capture it and show the banner again.
    } catch (err) {
      console.error('Failed to trigger PWA installation:', err);
    }
  }, [deferredPrompt]);

  // Dismiss just hides the banner — deferredPrompt is preserved so
  // the Settings install button still works.
  const dismissPwaPrompt = useCallback(() => {
    setShowPwaBanner(false);
  }, []);

  const sanitizeLocalStorage = useCallback(() => {
    const sensitiveKeys = [
      'klavora-auth', 
      'klavora-temp-token', 
      'klavora-drug-schedules', 
      'klavora-patient-names', 
      'klavora-wholesale-prices'
    ];
    sensitiveKeys.forEach(key => localStorage.removeItem(key));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('klavora-theme', next);
      return next;
    });
  }, []);

  // Apply theme effect
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Re-fetches fresh user data from /api/auth/me and updates context
  const refreshUser = useCallback(async () => {
    try {
      const [userData, pharmacyData] = await Promise.all([
        api.auth.getMe(),
        api.pharmacy.getDetails().catch(() => null)
      ]);
      if (userData) {
        setUser(userData);
        const { saveMeta } = await import('@/utils/offlineDB');
        await saveMeta('cached_user', userData);
      }
      if (pharmacyData) {
        setPharmacySettingsState(pharmacyData);
        try {
          localStorage.setItem('klavora-cached-pharmacy-settings', JSON.stringify(pharmacyData));
        } catch {}
      }
    } catch (err) {
      console.error('[AppContext] Failed to refresh user:', err);
    }
  }, []);

  const login = useCallback((u: any, token?: string) => {
    setUser(u);
    import('@/utils/offlineDB').then(({ saveMeta }) => {
      saveMeta('cached_user', u);
      if (token) {
        saveMeta('auth_token', token);
      }
    });

    // Feed user context into error logger so all logs are tagged
    setLoggerUserContext(u?.id, u?.pharmacyId);
    logger.info('User logged in', { context: 'AppContext', extra: { role: u?.role } });

    // Remove any leftover sensitive data on login just in case
    sanitizeLocalStorage();

    // Synchronize full system state
    refreshUser();
  }, [sanitizeLocalStorage, refreshUser]);

  const setSubscriptionPlan = useCallback((p: SubscriptionPlan) => {
    setSubscriptionPlanState(p);
    localStorage.setItem('klavora-plan', p);
  }, []);

  const logout = useCallback(async () => {
    // Flush any pending logs before clearing auth
    flushLogs().catch(() => {});
    try {
      await api.auth.logout();
    } catch (e) {
      console.error('Logout API failed:', e);
    }
    setUser(null);
    setPharmacySettingsState(null);
    setDrugsState([]);
    setTransactions([]);
    setStaffState([]);
    try {
      localStorage.removeItem('klavora-cached-staff');
      localStorage.removeItem('klavora-cached-pharmacy-settings');
    } catch {}
    try {
      const { deleteMeta } = await import('@/utils/offlineDB');
      await deleteMeta('auth_token');
      await deleteMeta('cached_user');
      await deleteMeta('basket_draft'); // Clean legacy global key
      await deleteMeta('held_carts');   // Clean legacy global key
    } catch (err) {
      console.error('Failed to delete token from IndexedDB:', err);
    }
    // Clear user context from logger
    setLoggerUserContext(undefined, undefined);
    sanitizeLocalStorage();
  }, [sanitizeLocalStorage]);

  // Restore session on mount
  useEffect(() => {

    const restoreSession = async () => {
      let cachedUser: AuthUser | null = null;
      try {
        const { getMeta } = await import('@/utils/offlineDB');
        cachedUser = await getMeta('cached_user');
      } catch (e) {
        console.error('Failed to read cached_user from IndexedDB:', e);
      }

      try {
        const [userData, pharmacyData] = await Promise.all([
          api.auth.getMe(),
          api.pharmacy.getDetails().catch(() => null)
        ]);
        if (userData) {
          setUser(userData);
          setLoggerUserContext(userData.id, userData.pharmacyId);
          const { saveMeta } = await import('@/utils/offlineDB');
          await saveMeta('cached_user', userData);
        }
        if (pharmacyData) {
          setPharmacySettingsState(pharmacyData);
          try {
            localStorage.setItem('klavora-cached-pharmacy-settings', JSON.stringify(pharmacyData));
          } catch {}
        }

      } catch (err: any) {
        const errMsg = err?.message || '';
        const isOfflineOrNetworkError = 
          !navigator.onLine || 
          errMsg.includes('Offline') || 
          errMsg.includes('network') || 
          errMsg.includes('Failed to fetch') ||
          errMsg.includes('No internet connection') ||
          errMsg.includes('NetworkError');

        if (isOfflineOrNetworkError && cachedUser) {
          console.log('[AppContext] Restored user session from offline cache');
          setUser(cachedUser);
          setLoggerUserContext(cachedUser.id, cachedUser.pharmacyId);
        } else {
          // Not logged in or session expired on server (401 / 403)
          console.log("No active session found or session expired.");
          setUser(null);
          setLoggerUserContext(undefined, undefined);
          try {
            const { deleteMeta } = await import('@/utils/offlineDB');
            await deleteMeta('cached_user');
            await deleteMeta('auth_token');
          } catch {}
        }
      } finally {
        setInitialized(true);
        // Clean up any old sensitive data
        sanitizeLocalStorage();
      }
    };
    restoreSession();
  }, [sanitizeLocalStorage]);




  const syncOfflineQueue = useCallback(async (force = false) => {
    await syncManager.sync(force);
    // After sync, we should also refresh the data from backend to ensure consistency
    if (syncManager.getOnlineStatus()) {
      try {
        const [drugsData, transData] = await Promise.all([
          api.drugs.getAll(),
          api.transactions.getHistory()
        ]);
        setDrugsState(drugsData);
        setTransactions(transData);
        localStorage.setItem('klavora-cached-drugs', JSON.stringify(drugsData));
        localStorage.setItem('klavora-cached-transactions', JSON.stringify(transData));
        setPendingSales([]); // Clear old localstorage queue once synced
        localStorage.setItem('klavora-pending-sales', JSON.stringify([]));
      } catch (e) {
        console.error("Failed to fetch fresh data after sync", e);
        if (force) {
          throw e;
        }
      }
    }
  }, []);

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => {
      const next = [t, ...prev];
      localStorage.setItem('klavora-cached-transactions', JSON.stringify(next));
      return next;
    });
  }, []);

  const [syncing, setSyncing] = useState(false);

  const refreshData = useCallback(async (options?: { showSkeletons?: boolean; invalidateAllCaches?: boolean }) => {
    if (!user?.id || refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    if (options?.showSkeletons) {
      setSyncing(true);
    }
    try {
      if (options?.invalidateAllCaches) {
        try {
          ['all', 'today', 'week', 'month', '3months'].forEach(p => {
            localStorage.removeItem(`klavora-kpi-${p}`);
          });
        } catch {}
      }

      const isOwnerOrManager = user?.role?.toUpperCase() === 'OWNER' || user?.role?.toUpperCase() === 'MANAGER';

      const [userData, pharmacyData, drugsData, transData, staffData, notifsData] = await Promise.all([
        api.auth.getMe().catch(() => null),
        api.pharmacy.getDetails().catch(() => null),
        api.drugs.getAll().catch(() => []),
        api.transactions.getHistory().catch(() => []),
        isOwnerOrManager ? api.staff.getAll().catch(() => []) : Promise.resolve(null),
        api.notifications.getAll({ limit: 50 }).catch(() => [])
      ]);

      if (userData) {
        setUser(userData);
        try {
          const { saveMeta } = await import('@/utils/offlineDB');
          await saveMeta('cached_user', userData);
        } catch {}
      }

      if (pharmacyData) {
        setPharmacySettingsState(pharmacyData);
        try {
          localStorage.setItem('klavora-cached-pharmacy-settings', JSON.stringify(pharmacyData));
        } catch {}
      }

      if (Array.isArray(drugsData)) {
        setDrugsState(drugsData);
        try {
          localStorage.setItem('klavora-cached-drugs', JSON.stringify(drugsData));
        } catch {}
      }

      if (Array.isArray(transData)) {
        setTransactions(transData);
        try {
          localStorage.setItem('klavora-cached-transactions', JSON.stringify(transData));
        } catch {}
      }

      if (Array.isArray(staffData)) {
        const mappedStaff = staffData.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role ? s.role.toUpperCase() : 'STAFF',
          staffRole: (s.role ? s.role.toLowerCase() : 'staff') as any,
          initials: s.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
          color: getStaffAvatarColor(s.id || s.name),
          lastActive: s.createdAt,
        }));
        setStaffState(mappedStaff);
        try {
          localStorage.setItem('klavora-cached-staff', JSON.stringify(mappedStaff));
        } catch {}
      }

      if (Array.isArray(notifsData)) {
        setNotifications(notifsData);
      }

      // Propagate global refresh event to all mounted page components only if it's a manual refresh
      if (options?.invalidateAllCaches || options?.showSkeletons) {
        window.dispatchEvent(new CustomEvent('klavora-manual-refresh', { 
          detail: { timestamp: Date.now(), invalidateAllCaches: options?.invalidateAllCaches } 
        }));
      }

      // Attempt background sync of offline queue
      syncOfflineQueue();
    } catch (error) {
      console.error("Failed to sync with backend:", error);
    } finally {
      refreshInFlightRef.current = false;
      setSyncing(false);
    }
  }, [user?.id, user?.role, syncOfflineQueue]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api.notifications.getAll({ limit: 50 });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [user?.id]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await api.notifications.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  // Fetch data from real backend when user is logged in (initiates skeleton loaders)
  useEffect(() => {
    if (user?.id) {
      refreshData({ showSkeletons: true });
    }
  }, [user?.id, refreshData]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Silent auto-poll when visible to reduce background load (every 10 seconds silently)
  useEffect(() => {
    if (!user?.id) return;

    const tick = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        refreshData(); // silent background refresh!
      }
    };

    tick();
    const interval = setInterval(() => {
      tick();
    }, 300_000); // silent auto-refresh every 5 minutes!
    return () => clearInterval(interval);
  }, [user?.id, refreshData]);

  // Refresh data when offline sync queue fully drains (dispatched by syncManager)
  useEffect(() => {
    const handleSyncComplete = () => {
      if (user?.id) {
        refreshData({ showSkeletons: false });
      }
    };
    window.addEventListener('klavora-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('klavora-sync-complete', handleSyncComplete);
  }, [user?.id, refreshData]);

  useEffect(() => {
    if (!user?.id) return;

    const streamUrl = `${getApiBaseUrl()}/notifications/stream`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.addEventListener('notification', (evt: MessageEvent) => {
      try {
        const incoming = JSON.parse(evt.data) as AppNotification;
        setNotifications(prev => {
          if (prev.some(item => item.id === incoming.id)) return prev;
          return [incoming, ...prev].slice(0, 100);
        });

        toast(incoming.title, {
          description: incoming.message,
        });
      } catch (error) {
        console.error('Failed to parse notification event:', error);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
      // Auto-reload notifications after stream failure to avoid stale UI.
      loadNotifications();
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id, loadNotifications]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;


  return (
    <AppContext.Provider value={{ 
      theme, toggleTheme, user, login, logout, 
      pharmacySettings, refreshPharmacySettings,
      drugs, setDrugs, transactions, addTransaction, 
      pendingSales, addPendingSale, syncOfflineQueue,
      sidebarCollapsed, setSidebarCollapsed, 
      subscriptionPlan, setSubscriptionPlan, 
      refreshData, refreshUser, syncing,
      mobileSidebarOpen, setMobileSidebarOpen,
      initialized,
      notifications,
      unreadNotifications,
      markNotificationRead,
      deleteNotification,
      markAllNotificationsRead,
      clearNotifications,
      pwaInstallable: !!deferredPrompt,
      pwaInstalled,
      showPwaBanner,
      installPwa,
      dismissPwaPrompt,
      staff,
      setStaff,
      syncStatus,
      pendingSyncCount,
      isOnline,
      showBasketDrawer,
      setShowBasketDrawer,
      basket,
      failedItems,
      setFailedItems,
      notes,
      setNotes,
      isProcessingSale,
      addDrugToBasket,
      editBasketItemQuantity,
      updateDrugQuantity,
      removeBasketItem,
      removeDrugFromBasket,
      clearBasket,
      executeSale,
      expiredDrugAttempt,
      setExpiredDrugAttempt,
      heldCarts,
      holdCurrentCart,
      resumeHeldCart,
      swapHeldCart,
      discardHeldCart,
    }}>
      {children}
      
      {/* Global Expired Drug Warning Modal */}
      {expiredDrugAttempt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark border border-warning-200 dark:border-warning-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
              <div className="w-9 h-9 rounded-lg bg-warning-50 dark:bg-warning-500/10 text-warning-500 flex items-center justify-center">
                <i className="ri-alert-fill text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-heading font-700 text-gray-900 dark:text-white">
                  Expired Drug Warning
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed">
                <strong className="text-gray-900 dark:text-white">{expiredDrugAttempt.drug.name}</strong> expired on <strong className="text-gray-900 dark:text-white">{getNearestExpiry(expiredDrugAttempt.drug)}</strong>. You are about to add an expired drug to this sale. This action will be recorded in your dispensing log.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpiredDrugAttempt(null)}
                className="flex-1 h-10 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-lg text-xs font-heading font-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { drug, qty } = expiredDrugAttempt;
                  setExpiredDrugAttempt(null);
                  addDrugToBasket(drug, qty, true).then((res) => {
                    if (res.success) {
                      toast.success(`Added ${drug.name} (Expired) to cart`);
                    }
                  });
                }}
                className="flex-1 h-10 bg-warning-500 hover:bg-warning-600 text-white rounded-lg text-xs font-heading font-600 transition-colors cursor-pointer"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

