import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import { printHtml } from '@/utils/print';
import { toast } from 'sonner';
import { isAccountReadOnly } from '@/utils/routeUtils';
import { useHotkeys } from '@/hooks/useHotkeys';
import Sidebar from './Sidebar';
import { OfflineBanner } from './OfflineBanner';
import { SyncStatusPanel } from './SyncStatusPanel';
import type { BasketItem } from '@/types';
import ReceiptPreviewPanel from '@/components/receipt/ReceiptPreviewPanel';
import SyncConflictModal from '@/components/SyncConflictModal';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export default function AppShell() {
  const {
    user,
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    initialized,
    notifications,
    unreadNotifications,
    markNotificationRead,
    deleteNotification,
    markAllNotificationsRead,
    clearNotifications,
    refreshUser,
    setSubscriptionPlan,
    refreshData,
    syncing,
    syncOfflineQueue,
    syncStatus,
    pendingSyncCount,
    basket,
    removeBasketItem,
    editBasketItemQuantity,
    clearBasket,
    executeSale,
    notes,
    setNotes,
    isProcessingSale,
    showBasketDrawer,
    setShowBasketDrawer
  } = useApp();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [modalInitialized, setModalInitialized] = useState(false);



  const renderBasketContent = (closeAction: () => void) => {
    return (
      <div className="w-full flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <i className="ri-shopping-cart-2-line text-primary-500 text-lg"></i>
            <span className="text-xs font-heading font-700 text-gray-900 dark:text-white">Cart</span>
            <span className="font-mono text-[10px] px-1.5 py-0.25 rounded bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              {basket.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); closeAction(); }}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xs"></i>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5">
          {basket.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 text-gray-400 dark:text-gray-600">
                <i className="ri-shopping-cart-2-line text-xl"></i>
              </div>
              <p className="text-xs font-body font-semibold text-gray-600 dark:text-gray-400">Your cart is empty</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] mx-auto">Add drugs from the Inventory page or Sell Terminal.</p>
            </div>
          ) : (
            basket.map((item) => (
              <div 
                key={`${item.drug_id}-${item.batch_id}`} 
                className="p-3 rounded-xl border border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5 flex flex-col gap-2 relative group"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); removeBasketItem(item.drug_id, item.batch_id); }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all cursor-pointer"
                  title="Remove item"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>

                <div>
                  <div className="flex items-center gap-1.5 pr-6">
                    <span className="text-xs font-heading font-600 text-gray-900 dark:text-white truncate max-w-[180px]" title={item.drug_name}>
                      {item.drug_name}
                    </span>
                    {item.isControlled && (
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-danger-100 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 flex-shrink-0">
                        Controlled
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 block">
                    Batch: {item.batch_number} (Exp: {item.expiry_date})
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); editBasketItemQuantity(item.drug_id, item, item.quantity - 1); }}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-white dark:hover:bg-surface-dark transition-all cursor-pointer"
                    >
                      <i className="ri-subtract-line text-xs"></i>
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-600 text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); editBasketItemQuantity(item.drug_id, item, item.quantity + 1); }}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-white dark:hover:bg-surface-dark transition-all cursor-pointer"
                    >
                      <i className="ri-add-line text-xs"></i>
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-body">Subtotal</p>
                    <p className="text-xs font-mono font-600 text-gray-900 dark:text-white">₵{item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notes & Footer */}
        {basket.length > 0 && (
          <div className="p-4 border-t border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5 space-y-3">
            <div>
              <label className="block text-[10px] font-heading font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Sale Notes
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter customer details, prescription ref, etc."
                className="w-full h-12 p-2 text-xs font-body rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-b border-dashed border-border-light dark:border-border-dark">
              <span className="text-xs font-heading font-600 text-gray-600 dark:text-gray-400">Total Price</span>
              <span className="text-base font-mono font-700 text-primary-500 dark:text-primary-400">
                ₵{basket.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); clearBasket(); }}
                className="flex-1 h-9 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-xs font-medium font-body transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  closeAction();
                  handleCheckoutClick();
                }}
                disabled={isProcessingSale}
                className="flex-[2] h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium font-body transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessingSale ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-shopping-bag-line"></i>}
                {isProcessingSale ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [isReactivating, setIsReactivating] = useState(false);
  const [widgetExpanded, setWidgetExpanded] = useState(false);

  useHotkeys([
    {
      keys: 'ctrl+b',
      callback: (e) => {
        e.preventDefault();
        setWidgetExpanded((prev) => !prev);
      },
      enableInInput: false
    },
    {
      keys: 'ctrl+k',
      callback: (e) => {
        if (window.location.pathname !== '/sell') {
          e.preventDefault();
          navigate('/sell?focusSearch=true');
        }
      },
      enableInInput: false
    },
    {
      keys: '/',
      callback: (e) => {
        if (window.location.pathname !== '/sell') {
          e.preventDefault();
          navigate('/sell?focusSearch=true');
        }
      },
      enableInInput: false
    },
    {
      keys: 'escape',
      callback: () => {
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
        if (widgetExpanded) setWidgetExpanded(false);
        if (showNotifications) setShowNotifications(false);
        if (showBasketDrawer) setShowBasketDrawer(false);
      },
      enableInInput: true
    }
  ]);  // Global Basket UI States
  const [showControlledModal, setShowControlledModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptRef: string;
    receiptTx: any;
    completedBasket: BasketItem[];
  } | null>(null);

  // Controlled drug details
  const [patientName, setPatientName] = useState('');
  const [prescriberName, setPrescriberName] = useState('');
  const [prescriberLicense, setPrescriberLicense] = useState('');

  const hasControlledDrug = basket.some(item => item.isControlled);

  const handleCheckoutClick = () => {
    if (basket.length === 0) return;
    if (hasControlledDrug) {
      setShowControlledModal(true);
    } else {
      processCheckout();
    }
  };

  const processCheckout = async (controlledDetails?: { patientName: string; prescriberName: string; prescriberLicense: string }) => {
    const res = await executeSale(controlledDetails);
    if (res.success) {
      toast.success("Sale completed successfully!");
      setReceiptData({
        receiptRef: res.receiptRef!,
        receiptTx: res.receiptTx,
        completedBasket: res.completedBasket!
      });
      setShowReceiptModal(true);
      setShowBasketDrawer(false);
      setShowControlledModal(false);
      // Reset details
      setPatientName('');
      setPrescriberName('');
      setPrescriberLicense('');
    }
  };

  useEffect(() => {
    if (initialized && user && !modalInitialized) {
      const hasSeenModal = sessionStorage.getItem('hasSeenDeactivatedModal');
      if (!hasSeenModal && isAccountReadOnly(user)) {
        setShowDeactivatedModal(true);
        sessionStorage.setItem('hasSeenDeactivatedModal', 'true');
      }
      setModalInitialized(true);
    }
  }, [initialized, user, modalInitialized]);


  const handleManualRefresh = async () => {
    try {
      await refreshData({ showSkeletons: true, invalidateAllCaches: true });
      toast.success('Application state refreshed', {
        description: 'Dashboard, inventory, sales metrics, staff, audit log, and KPIs are now up-to-date.',
      });
    } catch (err) {
      toast.error('Sync failed', {
        description: 'Could not fetch latest data from the server. Please check your network connection.',
      });
    }
  };

  const handleRenew = async () => {
    setIsReactivating(true);
    try {
      const response: any = await api.pharmacy.updatePlan({ action: 'renew' });
      
      if (response && response.access_code && response.publicKey) {
        const initPaystack = () => {
          if (!(window as any).PaystackPop) {
            toast.info('Payment system is loading. Please try again.');
            setIsReactivating(false);
            return;
          }
          const handler = (window as any).PaystackPop.setup({
            key: response.publicKey,
            access_code: response.access_code,
            onClose: () => {
              setIsReactivating(false);
            },
            callback: (transaction: any) => {
              setIsReactivating(true);
              api.pharmacy.verifyPayment(transaction.reference)
                .then(async (res: any) => {
                  if (res.status === 'success') {
                    await refreshUser();
                    setSubscriptionPlan('premium');
                    setShowDeactivatedModal(false);
                    toast.success('Account reactivated successfully!');
                  } else {
                    toast.error('Payment pending or failed. Please contact support.');
                  }
                })
                .catch(() => toast.error('Verification error. Please contact support.'))
                .finally(() => setIsReactivating(false));
            }
          });
          handler.openIframe();
        };
        initPaystack();
        return;
      } else if (response && response.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      } else if (response && response.message && response.message.includes('Simulation')) {
        await refreshUser();
        setSubscriptionPlan('premium');
        setShowDeactivatedModal(false);
        toast.success('Account reactivated successfully (Simulation).');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate. Please contact support.');
    } finally {
      setIsReactivating(false);
    }
  };

  useEffect(() => {
    if (initialized && !user) {
      navigate('/');
    }
    // Deactivated users are allowed in — they see a readonly dashboard with a reactivation banner
  }, [user, navigate, initialized]);

  // Handle Paystack Redirect Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('payment') === 'success';
    const reference = params.get('reference');

    if (isSuccess && reference) {
      setIsReactivating(true);
      api.pharmacy.verifyPayment(reference)
        .then(async (res: any) => {
          if (res.status === 'success') {
            await refreshUser();
            setSubscriptionPlan('premium');
            setShowDeactivatedModal(false);
            window.history.replaceState({}, '', window.location.pathname);
            toast.success('Account reactivated successfully!');
          } else {
            toast.error('Payment pending or failed. Please contact support.');
          }
        })
        .catch(() => toast.error('Verification error. Please contact support.'))
        .finally(() => setIsReactivating(false));
    }
  }, [refreshUser, setSubscriptionPlan]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-primary-500/10 rounded-2xl blur-xl animate-pulse"></div>
            <svg className="w-16 h-16 relative z-10 animate-bounce [animation-duration:2.5s]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="2" width="6" height="20" rx="1.5" fill="#10B981" />
              <rect x="2" y="9" width="20" height="6" rx="1.5" fill="#0EA5E9" />
              <rect x="9" y="9" width="6" height="6" fill="#0284C7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-heading font-800 text-gray-900 dark:text-white tracking-tight leading-none mb-2">
            Klavora
          </h1>
          <p className="text-xs font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-6">
            Smart Pharmacy Inventory Management
          </p>
          
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading {
            0% { left: -50%; width: 30%; }
            50% { width: 60%; }
            100% { left: 120%; width: 30%; }
          }
        `}} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-6">
          <i className="ri-logout-box-line text-3xl text-primary-500"></i>
        </div>
        <h2 className="text-xl font-heading font-700 text-gray-900 dark:text-white mb-2">Signing you out</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Safely closing your workspace...</p>
        <div className="mt-8 flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  const marginLeft = isDesktop ? (sidebarCollapsed ? 64 : 240) : 0;

  const recentNotifications = notifications.slice(0, 12);

  const openNotification = async (n: any) => {
    if (!n.isRead) await markNotificationRead(n.id);
    setShowNotifications(false);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      {/* Mobile Top Bar */}
      {!isDesktop && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 z-[300]">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <i className="ri-menu-2-line text-xl"></i>
          </button>

          <div className="flex-1" />

          {pendingSyncCount > 0 && (
            <button
              onClick={async () => {
                try {
                  await toast.promise(syncOfflineQueue(true), {
                    loading: 'Syncing pending operations...',
                    success: 'Sync complete!',
                    error: (err) => err?.message || 'Sync failed. Please verify connection and try again.'
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
              disabled={syncStatus === 'syncing'}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg text-amber-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer mr-2"
              title="Sync Pending Operations"
            >
              <i className={`ri-refresh-line text-xl ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}></i>
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center">
                {pendingSyncCount}
              </span>
            </button>
          )}

          <button
            onClick={handleManualRefresh}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-transform mr-2 ${syncing ? 'animate-spin opacity-50' : ''}`}
            disabled={syncing}
            title="Refresh Data"
          >
            <i className="ri-refresh-line text-xl"></i>
          </button>

          <button
            onClick={() => {
              setShowNotifications(false);
              setShowBasketDrawer(!showBasketDrawer);
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer mr-2"
            title="Cart"
          >
            <i className="ri-shopping-cart-2-line text-xl"></i>
            {basket.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[10px] font-mono flex items-center justify-center animate-pulse">
                {basket.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <i className="ri-notification-3-line text-xl"></i>
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger-500 text-white text-[10px] font-mono flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </header>
      )}

      {showNotifications && (
        <>
          {/* Transparent Backdrop to close notifications when clicking outside */}
          <div 
            onClick={() => setShowNotifications(false)}
            className="fixed inset-0 z-[310] bg-transparent"
          />
          <div className={`fixed z-[320] ${isDesktop ? 'top-4 right-4 w-[360px]' : 'top-14 left-0 right-0 mx-3'}`}>
            <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/5">
                <p className="text-sm font-heading font-700 text-gray-900 dark:text-white">Notifications</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] font-body text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <div className="w-px h-3 bg-border-light dark:bg-border-dark" />
                  <button
                    onClick={() => clearNotifications()}
                    className="text-[11px] font-body text-danger-500 hover:text-danger-600 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                  <div className="w-px h-3 bg-border-light dark:bg-border-dark" />
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                    title="Close"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              </div>
              <div className="max-h-[65vh] overflow-y-auto divide-y divide-border-light dark:divide-border-dark">
                {recentNotifications.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500 font-body">
                    No notifications yet.
                  </div>
                )}
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!n.isRead ? 'bg-primary-50/40 dark:bg-primary-500/5' : ''}`}
                  >
                    <button
                      onClick={() => openNotification(n)}
                      className="w-full text-left px-4 py-3 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 pr-8">
                        <div className="min-w-0">
                          <p className="text-sm font-body font-semibold text-gray-900 dark:text-white truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                      className="absolute right-3 top-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sidebar - handles both mobile and desktop internaly now */}
      <Sidebar />

      {isDesktop && (
        <div className={`fixed top-1/4 right-0 z-[300] flex items-start transition-transform duration-300 ease-in-out ${widgetExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-24px)]'}`}>
          {/* Tab Button (Toggle click trigger only) */}
          <button
            onClick={() => setWidgetExpanded(!widgetExpanded)}
            className="relative w-6 h-12 mt-4 bg-surface-light dark:bg-surface-dark border-y border-l border-border-light dark:border-border-dark rounded-l-lg flex items-center justify-center text-gray-400 hover:text-primary-500 shadow-md cursor-pointer transition-colors"
            title="Toggle panel"
          >
            <i className={`ri-arrow-${widgetExpanded ? 'right' : 'left'}-s-line text-lg`}></i>
            {!widgetExpanded && (
              <>
                {basket.length > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[9px] font-mono flex items-center justify-center shadow-md animate-pulse z-10">
                    {basket.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
                {unreadNotifications > 0 && (
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-danger-500 border border-surface-light dark:border-surface-dark shadow-md z-10 animate-bounce"></span>
                )}
              </>
            )}
          </button>
          
          {/* Panel container */}
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-2 rounded-l-xl shadow-lg flex flex-col gap-2 relative right-[-1px]">
            {pendingSyncCount > 0 && (
              <button
                onClick={async () => {
                  try {
                    await toast.promise(syncOfflineQueue(true), {
                      loading: 'Syncing pending operations...',
                      success: 'Sync complete!',
                      error: (err) => err?.message || 'Sync failed. Please verify connection and try again.'
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                disabled={syncStatus === 'syncing'}
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all cursor-pointer relative animate-pulse"
                title="Sync Pending Operations"
              >
                <i className={`ri-refresh-line text-xl ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}></i>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center shadow-sm">
                  {pendingSyncCount}
                </span>
              </button>
            )}

            <button
              onClick={handleManualRefresh}
              className={`w-11 h-11 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-bg-dark border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer ${syncing ? 'animate-spin opacity-50' : ''}`}
              disabled={syncing}
              title="Refresh Data"
            >
              <i className="ri-refresh-line text-xl"></i>
            </button>
            
            <button
              onClick={() => {
                setShowNotifications(false);
                setShowBasketDrawer(!showBasketDrawer);
              }}
              className="relative w-11 h-11 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-bg-dark border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Cart"
            >
              <i className="ri-shopping-cart-2-line text-xl"></i>
              {basket.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-mono flex items-center justify-center shadow-sm animate-pulse">
                  {basket.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>



            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative w-11 h-11 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-bg-dark border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Notifications"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-mono flex items-center justify-center shadow-sm">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Deactivated or Deletion account banner */}
      {(isAccountReadOnly(user) || user?.isDeleted) && (
        <div className={`fixed left-0 right-0 z-[250] flex items-center justify-between gap-3 px-4 py-2.5 text-white shadow-lg ${user?.isDeleted && !isAccountReadOnly(user) ? 'bg-danger-500' : 'bg-warning-500'} ${isDesktop ? 'top-0' : 'top-14'}`} style={{ marginLeft: isDesktop ? marginLeft : 0 }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <i className="ri-error-warning-line text-lg flex-shrink-0" />
            <p className="text-xs sm:text-sm font-body font-medium truncate">
              {isAccountReadOnly(user)
                ? 'Your subscription has expired. Please renew your subscription.'
                : 'Your account is scheduled for deletion in 14 days — recover it before your data is lost.'}
              {isAccountReadOnly(user) && <span className="ml-1.5 text-white/70 hidden sm:inline">Dashboard is in read-only mode.</span>}
            </p>
          </div>
          <Link
            to={isAccountReadOnly(user) ? '/renew-subscription' : '/settings'}
            className="flex-shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium font-body transition-colors whitespace-nowrap"
          >
            {isAccountReadOnly(user) ? 'Renew Subscription' : 'Review in Settings'}
            <i className="ri-arrow-right-s-line" />
          </Link>
        </div>
      )}

      {/* Main content */}
      <main
        className="transition-all duration-200 min-h-screen flex flex-col"
        style={{ 
          marginLeft,
          paddingTop: !isDesktop 
            ? ((isAccountReadOnly(user) || user?.isDeleted) ? 96 : 56) 
            : ((isAccountReadOnly(user) || user?.isDeleted) ? 40 : 0)
        }}
      >
        <OfflineBanner />
        <div className="flex-1 w-full">
          <Outlet />
        </div>
        <SyncConflictModal />
      </main>

      {/* Deactivation Modal on Login */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-border-light dark:border-border-dark animate-in zoom-in duration-300 relative">
            <button 
              onClick={() => setShowDeactivatedModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
            <div className="w-16 h-16 bg-warning-50 dark:bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-warning-400">
              <i className="ri-alert-line text-warning-500 text-3xl"></i>
            </div>
            <h2 className="text-xl font-heading font-700 text-gray-900 dark:text-white text-center mb-2">Subscription Ended</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-body mb-6">
              Your subscription has ended and your account is in read-only mode. Renew now to access all functionalities.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRenew}
                disabled={isReactivating}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium font-body transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isReactivating ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-vip-crown-line"></i>}
                {isReactivating ? 'Processing...' : 'Reactived Now'}
              </button>
              <button
                onClick={() => setShowDeactivatedModal(false)}
                className="w-full h-11 border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium font-body transition-colors cursor-pointer"
              >
                Ignore for now
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Controlled Substance Verification Modal */}
      {showControlledModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-border-light dark:border-border-dark animate-in zoom-in duration-300 relative">
            <button 
              onClick={() => setShowControlledModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <i className="ri-close-line"></i>
            </button>
            
            <div className="w-12 h-12 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-danger-200">
              <i className="ri-shield-user-line text-danger-500 text-2xl"></i>
            </div>
            
            <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white text-center mb-1">Controlled Substance Checkout</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-body mb-5">
              This cart contains controlled drugs. Law requires recording patient and prescriber details.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!patientName.trim() || !prescriberName.trim() || !prescriberLicense.trim()) {
                  toast.error("Please fill in all required verification fields.");
                  return;
                }
                processCheckout({ patientName, prescriberName, prescriberLicense });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-heading font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Patient Name <span className="text-danger-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Richard Doe"
                  className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Prescriber Name <span className="text-danger-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={prescriberName}
                  onChange={(e) => setPrescriberName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Prescriber License <span className="text-danger-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={prescriberLicense}
                  onChange={(e) => setPrescriberLicense(e.target.value)}
                  placeholder="e.g. MDC-12345-A"
                  className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowControlledModal(false)}
                  className="flex-1 h-10 border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium font-body transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingSale}
                  className="flex-1 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium font-body transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingSale ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
                  Verify & Sell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300 relative flex flex-col">
            <button
              onClick={() => {
                setShowReceiptModal(false);
                setReceiptData(null);
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 dark:bg-surface-dark/90 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer print:hidden shadow-sm"
            >
              <i className="ri-close-line"></i>
            </button>

            <div id="klavora-receipt-print" className="max-h-[80vh] overflow-y-auto p-4">
              <ReceiptPreviewPanel
                receiptId="printable-receipt-modal"
                pharmacyName={user.pharmacyName || 'Klavora Pharmacy'}
                receiptRef={receiptData.receiptRef}
                date={receiptData.receiptTx?.createdAt || Date.now()}
                items={receiptData.completedBasket}
                staffName={user.name}
                notes={receiptData.receiptTx?.notes}
                showHeading={false}
              />
            </div>

            <div className="flex gap-3 p-4 bg-white dark:bg-surface-dark rounded-b-2xl border-t border-slate-200 dark:border-border-dark print:hidden">
              <button
                onClick={() => {
                  const printContent = document.getElementById('printable-receipt-modal')?.innerHTML;
                  if (printContent) {
                    printHtml(printContent);
                  }
                }}
                className="flex-1 h-10 border border-slate-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold font-body transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="ri-printer-line text-sm"></i>
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptData(null);
                }}
                className="flex-1 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold font-body transition-colors shadow-sm cursor-pointer flex items-center justify-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basket Drawer Overlay */}
      {showBasketDrawer && (
        <div className="fixed inset-0 z-[330] flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowBasketDrawer(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
          />
          
          {/* Panel */}
          <div className="relative w-full sm:w-[440px] h-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-l border-border-light dark:border-border-dark shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {renderBasketContent(() => setShowBasketDrawer(false))}
          </div>
        </div>
      )}




      {isDesktop && (
        <div className="fixed bottom-4 left-72 z-50 transition-all duration-300">
          <SyncStatusPanel />
        </div>
      )}
      
    </div>
  );
}


