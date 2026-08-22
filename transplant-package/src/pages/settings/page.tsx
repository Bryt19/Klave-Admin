// Offline Status: Needs Offline Support
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useActionLock } from '@/hooks/useActionLock';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import ErrorLogViewer from '@/components/admin/ErrorLogViewer';

type SettingsTab = 'preferences' | 'account' | 'backup' | 'deleted-batches' | 'error-logs';
type PlanModal = 'renew' | 'cancel' | 'delete' | 'restore' | null;

type CleanupPreviewBatch = {
  id: string;
  drugId: string;
  drugName: string;
  category?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  unitPrice: number;
  writeOffValue: number;
  status: 'expired' | 'expiring-soon';
  remainingDays: number;
};

type CleanupSummary = {
  total_batches: number;
  expired_batches: number;
  expiring_batches: number;
  total_value: number;
};

export default function SettingsPage() {
  const { user, pharmacySettings, refreshPharmacySettings, setSubscriptionPlan, refreshUser, refreshData, pwaInstallable, pwaInstalled, installPwa, staff, setStaff } = useApp();
  const { withActionLock } = useActionLock();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab as SettingsTab || 'account';
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [planModal, setPlanModal] = useState<PlanModal>(null);
  const [planActionDone, setPlanActionDone] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const verifyAttempted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = user?.role?.toUpperCase() || '';
    if (user && role !== 'OWNER' && role !== 'MANAGER') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Deleted batches state
  const [deletedBatches, setDeletedBatches] = useState<any[]>([]);
  const [deletedSummary, setDeletedSummary] = useState<{ total_batches_deleted: number; total_value_written_off: number }>({ total_batches_deleted: 0, total_value_written_off: 0 });
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [deletedPage, setDeletedPage] = useState(1);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCleanupLoading, setIsCleanupLoading] = useState(false);
  const [expiredCleanupPreview, setExpiredCleanupPreview] = useState<CleanupPreviewBatch[]>([]);
  const [expiredCleanupSummary, setExpiredCleanupSummary] = useState<CleanupSummary>({ total_batches: 0, expired_batches: 0, expiring_batches: 0, total_value: 0 });
  const rowsPerPage = 20;

  const fetchDeletedBatches = async () => {
    setIsLoadingDeleted(true);
    try {
      const res = await api.drugs.getDeletedBatches();
      const records = Array.isArray(res) ? res : (res.records || []);
      setDeletedBatches(records.map((record: any) => ({
        ...record,
        createdAt: record.createdAt || record.deletedAt,
        totalValue: record.totalValue ?? record.writeOffValue ?? 0,
      })));
      setDeletedSummary(Array.isArray(res) ? {
        total_batches_deleted: res.length,
        total_value_written_off: res.reduce((sum: number, record: any) => sum + Number(record.totalValue ?? record.writeOffValue ?? 0), 0),
      } : (res.summary || { total_batches_deleted: 0, total_value_written_off: 0 }));
    } catch (err) {
      console.error('Failed to fetch deleted batches:', err);
    } finally {
      setIsLoadingDeleted(false);
    }
  };

  const loadExpiredCleanupPreview = async () => {
    setIsCleanupLoading(true);
    try {
      const res = await api.drugs.previewExpiredBatches();
      setExpiredCleanupPreview(Array.isArray(res.records) ? res.records : []);
      setExpiredCleanupSummary(res.summary || { total_batches: 0, expired_batches: 0, expiring_batches: 0, total_value: 0 });
      setIsCleanupModalOpen(true);
    } catch (err) {
      console.error('Failed to load expired batch cleanup preview:', err);
    } finally {
      setIsCleanupLoading(false);
    }
  };

  const handleCleanupExpiredBatches = withActionLock(async () => {
    setIsCleanupLoading(true);
    try {
      const res = await api.drugs.cleanupExpiredBatches();
      setIsCleanupModalOpen(false);
      await Promise.all([refreshData(), fetchDeletedBatches()]);
      setExpiredCleanupPreview([]);
      setExpiredCleanupSummary(res.summary || { total_batches: 0, expired_batches: 0, expiring_batches: 0, total_value: 0 });
      if (tab === 'deleted-batches') {
        setDeletedPage(1);
      }
    } catch (err: any) {
      console.error('Failed to remove expired batches:', err);
      toast.error(err.message || 'Failed to remove expired batches');
    } finally {
      setIsCleanupLoading(false);
    }
  });

  const subscriptionExpiry = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const now = new Date();
  // Active = status is 'active' AND not yet expired
  const isActiveAndNotDue = !!(user?.subscriptionStatus === 'active' && subscriptionExpiry && subscriptionExpiry > now);
  // Can renew = expired OR (active but date already passed), within 72h grace
  const isExpiredByDate = !!(subscriptionExpiry && subscriptionExpiry <= now);
  const canRenewNow = !!(
    (user?.subscriptionStatus === 'expired' || isExpiredByDate) &&
    subscriptionExpiry &&
    now <= new Date(subscriptionExpiry.getTime() + 72 * 60 * 60 * 1000)
  );

  // Backup & Restore state
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [backupFrequency, setBackupFrequency] = useState('NONE');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [isSavingBackupSettings, setIsSavingBackupSettings] = useState(false);
  const [backupSettingsSaved, setBackupSettingsSaved] = useState(false);
  const [pendingFrequency, setPendingFrequency] = useState('NONE');
  const [pharmacyDetails, setPharmacyDetails] = useState<any>(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', phone: '', address: '' });
  const [planDetails, setPlanDetails] = useState<{ amount: number, currency: string, name: string, interval?: string } | null>(null);

  // Preferences state
  const [autoCreateBatch, setAutoCreateBatch] = useState(() => {
    return localStorage.getItem('klavora-auto-batch') === 'true';
  });
  const [profitMargin, setProfitMargin] = useState(() => {
    return Number(localStorage.getItem('klavora-profit-margin')) || 25;
  });
  const [enableShortcuts, setEnableShortcuts] = useState(() => {
    return localStorage.getItem('klavora-shortcuts-enabled') !== 'false';
  });
  const [prefSaved, setPrefSaved] = useState(false);
  const [allowDispensingExpired, setAllowDispensingExpired] = useState(false);
  const [showExpiredDispensingModal, setShowExpiredDispensingModal] = useState(false);
  const [isSavingDispensingControl, setIsSavingDispensingControl] = useState(false);
  const [showShortcutsGuide, setShowShortcutsGuide] = useState(false);

  // Auto-reset post-expiry dispensing to OFF for compliance if loaded as ON
  useEffect(() => {
    if (pharmacySettings?.allowDispensingExpired || user?.allowDispensingExpired) {
      api.pharmacy.update({ allowDispensingExpired: false })
        .then(async () => {
          setAllowDispensingExpired(false);
          await refreshPharmacySettings();
          await refreshUser();
        })
        .catch(console.error);
    }
  }, [pharmacySettings?.allowDispensingExpired, user?.allowDispensingExpired, refreshPharmacySettings, refreshUser]);

  // Ensure staff list is loaded for role validation
  useEffect(() => {
    const isOwnerOrManager = user?.role?.toUpperCase() === 'OWNER' || user?.role?.toUpperCase() === 'MANAGER';
    if ((!staff || staff.length === 0) && isOwnerOrManager) {
      api.staff.getAll().then(res => {
        if (Array.isArray(res)) setStaff(res);
      }).catch(console.error);
    }
  }, [staff, setStaff, user?.role]);


  const handleToggleDispensingExpired = withActionLock(async (confirmed = false) => {
    if (!allowDispensingExpired && !confirmed) {
      setShowExpiredDispensingModal(true);
      return;
    }
    
    setShowExpiredDispensingModal(false);
    setIsSavingDispensingControl(true);
    const newValue = confirmed ? true : false;
    
    try {
      await api.pharmacy.update({ allowDispensingExpired: newValue });
      setAllowDispensingExpired(newValue);
      await refreshPharmacySettings();
      await refreshUser();
      toast.success(newValue ? 'Supervised dispensing of post-expiry stock enabled' : 'Supervised dispensing of post-expiry stock disabled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update dispensing controls');
    } finally {
      setIsSavingDispensingControl(false);
    }
  });


  const handleSavePreferences = withActionLock(() => {
    localStorage.setItem('klavora-auto-batch', autoCreateBatch.toString());
    localStorage.setItem('klavora-profit-margin', profitMargin.toString());
    localStorage.setItem('klavora-shortcuts-enabled', enableShortcuts.toString());
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  });

  const fetchBackupData = async () => {
    try {
      const [logs, pharmacy] = await Promise.all([
        api.backups.getLogs(),
        api.pharmacy.getDetails()
      ]);
      setBackupLogs(logs);
      setBackupFrequency(pharmacy.backupFrequency || 'NONE');
      setPendingFrequency(pharmacy.backupFrequency || 'NONE');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPharmacyDetails = async () => {
    try {
      const details = await api.pharmacy.getDetails();
      setPharmacyDetails(details);
      setAccountForm({ name: details?.name || '', phone: details?.phone || '', address: details?.address || '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    setBackupSuccessMessage(null);
    try {
      const blob = await api.backups.trigger();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klavora_backup_${user?.pharmacyId}_${new Date().toISOString().split('T')[0]}.backup`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setBackupSuccessMessage('Backup complete! Please store this file safely (e.g., Google Drive).');
      fetchBackupData();
    } catch (err: any) {
      toast.error(err.message || 'Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSaveBackupSettings = withActionLock(async () => {
    setIsSavingBackupSettings(true);
    try {
      await api.backups.updateSettings(pendingFrequency);
      setBackupFrequency(pendingFrequency);
      setBackupSettingsSaved(true);
      setTimeout(() => setBackupSettingsSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update backup settings');
    } finally {
      setIsSavingBackupSettings(false);
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFile(file);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const preview = await api.backups.previewRestore(content);
        setRestorePreview(preview);
      } catch (err) {
        toast.error('Invalid or corrupted backup file');
        setRestoreFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = withActionLock(async () => {
    if (!restoreFile || restoreConfirmation !== 'RESTORE') return;

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        await api.backups.restore({ 
          encryptedData: content, 
          confirmation: restoreConfirmation 
        });
        toast.success('Restore successful! The system will now refresh.');
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || 'Restore failed');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(restoreFile);
  });

  useEffect(() => {
    api.pharmacy.getPlanDetails()
      .then((res: any) => setPlanDetails(res))
      .catch((err: any) => console.error('Failed to fetch plan details', err));
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasSuccess = urlParams.get('payment') === 'success';
    const hasCancel = urlParams.get('payment') === 'cancel' || urlParams.get('status') === 'cancelled';
    
    if (hasSuccess && !verifyAttempted.current) {
      setPlanActionDone('Verifying your payment...');
      const ref = urlParams.get('reference') || urlParams.get('trxref');
      
      if (ref) {
        verifyAttempted.current = true;
        api.pharmacy.verifyPayment(ref)
          .then(async (res: any) => {
            if (res.status === 'success') {
              await refreshUser(); // Fetch fresh subscription data from server
              setSubscriptionPlan('premium');
              setPlanActionDone('Payment successful! Your subscription is now active.');
            } else {
              setPlanActionDone('Payment pending or failed.');
            }
          })
          .catch((err: any) => {
            setPlanActionDone(err.message || 'Error verifying payment.');
          })
          .finally(() => {
            setTimeout(() => setPlanActionDone(null), 6000);
            window.history.replaceState({}, '', window.location.pathname);
          });
      }
    } else if (hasCancel) {
      setPlanActionDone('Payment was canceled. Your plan remains unchanged.');
      setTimeout(() => setPlanActionDone(null), 6000);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (tab === 'backup') {
      fetchBackupData();
    }
    if (tab === 'account') {
      fetchPharmacyDetails();
    }
    if (tab === 'deleted-batches') {
      fetchDeletedBatches();
    }
  }, [tab]);

  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchPharmacyDetails();
      fetchBackupData();
      fetchDeletedBatches();
    };
    window.addEventListener('klavora-manual-refresh', handleGlobalRefresh);
    return () => window.removeEventListener('klavora-manual-refresh', handleGlobalRefresh);
  }, []);

  const handlePlanAction = async (action: 'renew' | 'cancel' | 'delete' | 'revoke') => {
    if (action === 'renew' && isActiveAndNotDue) {
      setPlanActionDone(`Renewal opens after ${subscriptionExpiry?.toLocaleDateString()}.`);
      setTimeout(() => setPlanActionDone(null), 6000);
      return;
    }

    setIsProcessing(true);
    try {
      const response: any = await api.pharmacy.updatePlan({ action });
      
      if (response && response.access_code && response.publicKey) {
        const initPaystack = () => {
          if (!(window as any).PaystackPop) {
            setPlanActionDone('Payment system is still loading. Please wait a moment and try again.');
            setIsProcessing(false);
            return;
          }
          const handler = (window as any).PaystackPop.setup({
            key: response.publicKey,
            access_code: response.access_code,
            onClose: () => {
              setIsProcessing(false);
              setPlanActionDone('Payment window closed. Action canceled.');
              setTimeout(() => setPlanActionDone(null), 5000);
            },
            callback: (transaction: any) => {
              setPlanActionDone('Verifying your payment...');
              api.pharmacy.verifyPayment(transaction.reference)
                .then(async (res: any) => {
                  if (res.status === 'success') {
                    await refreshUser(); // Fetch fresh subscription data from server
                    setSubscriptionPlan('premium');
                    setPlanActionDone('Payment successful! Your subscription is now active.');
                  } else {
                    setPlanActionDone('Payment pending or failed.');
                  }
                })
                .catch(() => {
                  setPlanActionDone('Error verifying payment.');
                })
                .finally(() => {
                  setTimeout(() => setPlanActionDone(null), 6000);
                  setIsProcessing(false);
                });
            }
          });
          handler.openIframe();
        };

        initPaystack();
        return;
      } else if (response.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      }

      if (action === 'delete') {
        setPlanModal(null);
        setPlanActionDone('Account scheduled for deletion in 14 days.');
        setTimeout(() => {
          setPlanActionDone(null);
          window.location.reload();
        }, 3000);
        return;
      }

      if (action === 'revoke') {
        setPlanModal(null);
        setPlanActionDone('Account deletion has been revoked.');
        setTimeout(() => {
          setPlanActionDone(null);
          window.location.reload();
        }, 3000);
        return;
      }

      setPlanModal(null);
      setPlanActionDone(response.message);
      
      if (action === 'renew') {
        setSubscriptionPlan('premium');
      }
      
      setTimeout(() => setPlanActionDone(null), 6000);
    } catch (err: any) {
      toast.error(err.message || 'Subscription update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed the isDeletingData loading screen because they are no longer logged out immediately.

  if (user?.role?.toUpperCase() !== 'OWNER' && user?.role?.toUpperCase() !== 'MANAGER') {
    return <div className="p-6 text-sm text-gray-400 font-body">Managers and Owners access only.</div>;
  }

  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-700 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-0.5">Owner-only operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar nav */}
        <div className="lg:col-span-1">
          <nav className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark overflow-hidden">
            <div className="p-3 border-b border-border-light dark:border-border-dark">
              <p className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body">Operations</p>
            </div>
            {[
              { key: 'account', label: 'Account & Plan', icon: 'ri-vip-crown-line', color: 'text-amber-500', desc: 'Subscription and pharmacy info' },
              { key: 'backup', label: 'Backup & Restore', icon: 'ri-database-2-line', color: 'text-indigo-500', desc: 'Secure your pharmacy data' },
              { key: 'preferences', label: 'Inventory Preferences', icon: 'ri-settings-4-line', color: 'text-primary-500', desc: 'Configure inventory behaviour' },
              { key: 'deleted-batches', label: 'Deleted Batches', icon: 'ri-delete-bin-line', color: 'text-danger-500', desc: 'View records of deleted expiring batches' },
              ...(user?.role === 'OWNER' ? [{ key: 'error-logs', label: 'Error Logs', icon: 'ri-bug-line', color: 'text-danger-500', desc: 'Internal system error logs' }] : []),
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key as SettingsTab)}
                className={`w-full text-left p-4 border-b border-border-light dark:border-border-dark last:border-0 transition-all cursor-pointer
                  ${tab === item.key
                    ? 'bg-bg-light dark:bg-bg-dark border-l-2 border-l-primary-500'
                    : 'hover:bg-bg-light dark:hover:bg-bg-dark'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${tab === item.key ? 'bg-primary-50 dark:bg-primary-500/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                    <i className={`${item.icon} ${tab === item.key ? 'text-primary-500' : item.color} text-sm`}></i>
                  </div>
                  <div>
                    <p className={`text-sm font-body font-medium ${tab === item.key ? 'text-primary-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 font-body mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Right content area */}
        <div className="lg:col-span-3">

          {tab === 'account' && (
            <div className="space-y-4">
              {/* Current plan card */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark">
                <div className="p-5 border-b border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2">
                    <i className="ri-vip-crown-line text-amber-500"></i>
                    <h2 className="text-base font-heading font-600 text-gray-900 dark:text-white">Account &amp; Plan</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">Manage your subscription and pharmacy account.</p>
                </div>
                <div className="p-5 space-y-4">
                  {/* Plan status message */}
                  {planActionDone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-success-50 dark:bg-success-500/10 border border-success-500/20 animate-in fade-in slide-in-from-top-2">
                      <i className="ri-checkbox-circle-line text-success-500"></i>
                      <p className="text-sm font-body text-success-600 dark:text-success-400">{planActionDone}</p>
                    </div>
                  )}

                  <div className={`p-4 rounded-lg border bg-amber-50 dark:bg-amber-500/10 border-amber-400/30`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="2" width="6" height="20" rx="1.5" fill="#10B981" />
                            <rect x="2" y="9" width="20" height="6" rx="1.5" fill="#0EA5E9" />
                            <rect x="9" y="9" width="6" height="6" fill="#0284C7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium text-gray-900 dark:text-white capitalize">
                            {user?.subscriptionPlan === 'trial' ? 'Free Trial' : (planDetails?.name || 'Premium Plan')}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
                            {user?.subscriptionPlan === 'trial' ? 'Full access during 14-day trial period' : (planDetails ? `${planDetails.currency} ${Number(planDetails.amount || 0).toFixed(2)}/${planDetails.interval} · All features unlocked` : 'GHC 250.00/month · All features unlocked')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400`}>
                        {(user?.subscriptionStatus || 'active').toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-white/10 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-body">
                      <i className="ri-calendar-line"></i>
                      <span>
                        {subscriptionExpiry ? 'Current cycle ends:' : 'Cycle status unavailable:'} <span className="font-mono">{subscriptionExpiry ? subscriptionExpiry.toLocaleDateString() : 'Unknown'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Plan actions */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setPlanModal('renew')}
                      disabled={isActiveAndNotDue}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/5 transition-all cursor-pointer text-left group"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10 flex-shrink-0">
                        <i className="ri-refresh-line text-primary-500"></i>
                      </div>
                      <div>
                        <p className="text-sm font-body font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">Renew Subscription</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
                          {isActiveAndNotDue
                            ? `Available after ${subscriptionExpiry?.toLocaleDateString()}`
                            : (canRenewNow ? 'Renew now within 72-hour grace period' : `Extend access for ${planDetails ? `${planDetails.currency} ${Number(planDetails.amount || 0).toFixed(2)}` : 'GHC 250.00'}`)}
                        </p>
                      </div>
                    </button>
                  </div>
                  
                  {/* PWA App Installation Card */}
                  <div className="p-4 rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                          <i className="ri-download-line text-lg text-primary-500"></i>
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium text-gray-900 dark:text-white">Desktop &amp; Mobile App</p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
                            {pwaInstalled 
                              ? 'App is installed and running natively.' 
                              : 'Install Klavora as a native standalone app on your device.'}
                          </p>
                        </div>
                      </div>
                      
                      {pwaInstalled ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Installed
                        </span>
                      ) : pwaInstallable ? (
                        <button
                          onClick={installPwa}
                          className="h-8 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-body font-medium cursor-pointer transition-colors"
                        >
                          Install App
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-body">
                          Already installed or not supported
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-0 overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 border-b border-border-light dark:border-border-dark">
                      <div className="flex items-center gap-2">
                        <i className="ri-id-card-line text-primary-500 text-lg"></i>
                        <h3 className="text-sm font-heading font-600 text-gray-900 dark:text-white">Account Details</h3>
                      </div>
                      {/* Only allow editing if the specific flag is enabled by support/admin */}
                      <button 
                        onClick={withActionLock(() => pharmacyDetails?.canEditDetails && setIsEditingAccount(true))} 
                        disabled={!pharmacyDetails?.canEditDetails}
                        title={!pharmacyDetails?.canEditDetails ? "Editing disabled. Please contact support to activate." : "Edit pharmacy details"}
                        className={`h-8 px-3 border rounded-md text-xs font-medium font-body transition-colors
                          ${pharmacyDetails?.canEditDetails 
                            ? "bg-white dark:bg-bg-dark hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-border-dark cursor-pointer" 
                            : "bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-border-dark cursor-not-allowed opacity-70"}`}
                      >
                        Edit Details
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {isEditingAccount ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-body mb-1">Pharmacy Name</label>
                            <input value={accountForm.name} onChange={e => setAccountForm(s => ({ ...s, name: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-bg-dark text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-body mb-1">Phone</label>
                            <input value={accountForm.phone} onChange={e => setAccountForm(s => ({ ...s, phone: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-bg-dark text-sm" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-body mb-1">Address</label>
                            <input value={accountForm.address} onChange={e => setAccountForm(s => ({ ...s, address: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-bg-dark text-sm" />
                          </div>
                          <div className="md:col-span-2 flex items-center gap-2 pt-2 border-t border-border-light dark:border-border-dark mt-2">
                            <button onClick={async () => {
                              try {
                                const resp: any = await api.pharmacy.update(accountForm);
                                setPharmacyDetails(resp.pharmacy || { ...pharmacyDetails, ...accountForm });
                                setIsEditingAccount(false);
                              } catch (err: any) { toast.error(err.message || 'Update failed'); }
                            }} className="h-9 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium font-body transition-colors cursor-pointer">Save Changes</button>
                            <button onClick={() => { setIsEditingAccount(false); setAccountForm({ name: pharmacyDetails?.name || '', phone: pharmacyDetails?.phone || '', address: pharmacyDetails?.address || '' }); }} className="h-9 px-4 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium font-body transition-colors cursor-pointer">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-body">Pharmacy Name</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body mt-0.5">{pharmacyDetails?.name || user?.pharmacyName || 'Not available'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-body">Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body mt-0.5">{pharmacyDetails?.phone || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-body">Owner Name</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body mt-0.5 flex items-center gap-1.5">
                              {pharmacyDetails?.owner?.name || user?.name || 'Not available'}
                              <i className="ri-verified-badge-fill text-primary-500 text-xs"></i>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-body">Owner Email</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body mt-0.5 truncate">{pharmacyDetails?.owner?.email || user?.email || 'Not available'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-body">Address</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body mt-0.5">{pharmacyDetails?.address || 'Not set'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  </div>
                </div>

              {/* Danger zone */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-danger-500/20">
                <div className="p-5 border-b border-danger-500/20">
                  <div className="flex items-center gap-2">
                    <i className="ri-error-warning-line text-danger-500"></i>
                    <h2 className="text-base font-heading font-600 text-gray-900 dark:text-white">Danger Zone</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">Irreversible actions. Proceed with caution.</p>
                </div>
                <div className="p-5 space-y-3">


                  <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                    <div>
                      <p className="text-sm font-body font-medium text-gray-900 dark:text-white">Cancel Subscription</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 font-body"><span className="text-gray-900 dark:text-white font-medium">Premium Plan</span> will remain active until the end of the billing period. No refunds are issued.</p>
                    </div>
                    <button
                      onClick={() => setPlanModal('cancel')}
                      className="h-8 px-4 flex-shrink-0 border border-danger-500/40 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg text-xs font-body font-medium cursor-pointer whitespace-nowrap transition-colors"
                    >
                      Cancel Plan
                    </button>
                  </div>

                  {user?.isDeleted ? (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-500/20">
                      <div>
                        <p className="text-sm font-body font-medium text-emerald-600 dark:text-emerald-400">Revoke Deletion</p>
                        <p className="text-xs text-emerald-500/70 dark:text-emerald-400/60 font-body">Your account is scheduled for deletion. Cancel this to keep your data.</p>
                      </div>
                      <button
                        onClick={() => handlePlanAction('revoke')}
                        className="h-8 px-4 flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-body font-medium cursor-pointer whitespace-nowrap transition-colors"
                      >
                        Revoke Deletion
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-danger-50 dark:bg-danger-500/5 border border-danger-500/20">
                      <div>
                        <p className="text-sm font-body font-medium text-danger-600 dark:text-danger-400">Delete Account</p>
                        <p className="text-xs text-danger-500/70 dark:text-danger-400/60 font-body">Permanently deletes all data after 14 days. No refunds will be provided.</p>
                      </div>
                      <button
                        onClick={() => setPlanModal('delete')}
                        className="h-8 px-4 flex-shrink-0 bg-danger-500 hover:bg-danger-600 text-white rounded-lg text-xs font-body font-medium cursor-pointer whitespace-nowrap transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {tab === 'backup' && (
            <div className="space-y-6">
              {/* Backup Section */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark">
                <div className="p-5 border-b border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2">
                    <i className="ri-database-2-line text-indigo-500"></i>
                    <h2 className="text-base font-heading font-600 text-gray-900 dark:text-white">Backup Platform</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">Generate and download secure snapshots of your data.</p>
                </div>
                <div className="p-5 space-y-6">
                  {backupSuccessMessage && (
                    <div className="p-4 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <i className="ri-checkbox-circle-line text-success-500 mt-0.5"></i>
                      <div>
                        <p className="text-sm font-body font-medium text-success-700 dark:text-success-400">Backup Successful</p>
                        <p className="text-xs text-success-600/80 dark:text-success-400/60 mt-0.5 font-body">{backupSuccessMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                      <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Manual Backup</p>
                      <button
                        onClick={handleManualBackup}
                        disabled={isBackingUp}
                        className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium font-body transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-500/20"
                      >
                        {isBackingUp ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-download-cloud-2-line"></i>}
                        {isBackingUp ? 'Processing Backup...' : 'Generate New Backup'}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                      <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Auto-Backup Frequency</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].map(f => (
                          <button
                            key={f}
                            onClick={() => setPendingFrequency(f)}
                            className={`h-9 rounded-lg text-xs font-body font-medium transition-all border ${
                              pendingFrequency === f 
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                                : 'border-border-light dark:border-border-dark text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        {backupSettingsSaved && (
                          <span className="text-[10px] text-success-500 font-body flex items-center gap-1">
                            <i className="ri-check-line"></i> Settings saved
                          </span>
                        )}
                        {!backupSettingsSaved && <span />}
                        <button
                          onClick={handleSaveBackupSettings}
                          disabled={isSavingBackupSettings || pendingFrequency === backupFrequency}
                          className="h-8 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-xs font-medium font-body transition-all cursor-pointer"
                        >
                          {isSavingBackupSettings ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div>
                    <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Recent Backup Logs</p>
                    <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-white/5">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Date</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Type</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Status</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body text-right">Size</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark font-body">
                          {backupLogs.slice(0, 5).map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 font-mono">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-xs">
                                <span className="capitalize text-gray-500">{log.backupType}</span>
                              </td>
                              <td className="px-4 py-3 text-xs">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  log.status === 'SUCCESS' ? 'bg-success-50 dark:bg-success-500/10 text-success-600' : 'bg-danger-50 dark:bg-danger-500/10 text-danger-600'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-400 text-right font-mono">
                                {(log.fileSize / 1024).toFixed(1)} KB
                              </td>
                            </tr>
                          ))}
                          {backupLogs.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs italic">No backup logs found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restore Section */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-indigo-500/20">
                <div className="p-5 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <i className="ri-history-line text-indigo-500"></i>
                    <h2 className="text-base font-heading font-600 text-gray-900 dark:text-white">Restore Data</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">Recover your data from a previously downloaded .backup file.</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="relative overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl hover:border-indigo-500/50 transition-all group bg-bg-light/50 dark:bg-bg-dark/50">
                    <i className="ri-upload-cloud-2-line text-4xl text-gray-300 dark:text-gray-700 group-hover:text-indigo-500 transition-colors mb-3"></i>
                    <p className="text-sm font-body font-medium text-gray-700 dark:text-gray-300">Click to upload backup file</p>
                    <p className="text-xs text-gray-400 font-body mt-1">.backup files only</p>
                    <input
                      type="file"
                      accept=".backup"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {restoreFile && restorePreview && (
                    <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                          <i className="ri-file-info-line text-xl"></i>
                        </div>
                        <div>
                          <p className="text-sm font-body font-bold text-gray-900 dark:text-white">Backup Preview</p>
                          <p className="text-xs text-gray-500 font-body">Snapshot from {new Date(restorePreview.backupDate).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-body">Drugs</p>
                          <p className="text-xl font-heading font-700 text-indigo-600 dark:text-indigo-400">{restorePreview.totalDrugs}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-body">Transactions</p>
                          <p className="text-xl font-heading font-700 text-indigo-600 dark:text-indigo-400">{restorePreview.totalSales}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 mb-6">
                        <p className="text-xs font-body font-bold text-danger-600 dark:text-danger-400 flex items-center gap-2">
                          <i className="ri-alert-line"></i>
                          CRITICAL WARNING
                        </p>
                        <p className="text-xs text-danger-600/80 dark:text-danger-400/80 mt-1 font-body leading-relaxed">
                          This will replace ALL current pharmacy data with the data from this backup. This action cannot be easily undone.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-body font-medium text-gray-500 dark:text-gray-400">Type <span className="font-mono font-700 text-gray-900 dark:text-white">RESTORE</span> to confirm</label>
                        <input
                          type="text"
                          value={restoreConfirmation}
                          onChange={e => setRestoreConfirmation(e.target.value)}
                          placeholder="RESTORE"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-bg-dark text-sm font-mono focus:outline-none focus:border-indigo-500 transition-all dark:text-white"
                        />
                        <button
                          onClick={handleRestore}
                          disabled={restoreConfirmation !== 'RESTORE' || isRestoring}
                          className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium font-body transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                        >
                          {isRestoring && <i className="ri-loader-4-line animate-spin"></i>}
                          {isRestoring ? 'Restoring System...' : 'Proceed with Restore'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'preferences' && (
            <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark">
              <div className="p-5 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <i className="ri-settings-4-line text-primary-500"></i>
                  <h2 className="text-base font-heading font-600 text-gray-900 dark:text-white">Inventory Preferences</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">Configure how inventory and restocking behaves.</p>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                  <div className="flex-1">
                    <p className="text-sm font-body font-medium text-gray-900 dark:text-white mb-0.5">Auto-create new batch on restock</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-body leading-relaxed">
                      When enabled, the restock flow skips the question asking if this is a new delivery and automatically creates a new batch every time.
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoCreateBatch(v => !v)}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${autoCreateBatch ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoCreateBatch ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                  <div className="flex-1">
                    <p className="text-sm font-body font-medium text-gray-900 dark:text-white mb-0.5">Default Gross Profit Margin (%)</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-body leading-relaxed">
                      This percentage is used to estimate gross profit on the sales metrics page when precise cost prices are unavailable.
                    </p>
                  </div>
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-20 h-9 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 text-right"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                  <div className="flex-1">
                    <p className="text-sm font-body font-medium text-gray-900 dark:text-white mb-0.5">Enable Keyboard Shortcuts</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-body leading-relaxed">
                      Allow using keyboard combinations like Ctrl+Enter to navigate and checkout faster on the POS page.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEnableShortcuts((v) => {
                        const nextVal = !v;
                        if (nextVal) {
                          setShowShortcutsGuide(true);
                        }
                        return nextVal;
                      });
                    }}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${enableShortcuts ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enableShortcuts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-shield-keyhole-line text-warning-500"></i>
                    <h3 className="text-sm font-heading font-600 text-gray-900 dark:text-white">Dispensing Controls</h3>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                    <div className="flex-1">
                      <p className="text-sm font-body font-medium text-gray-900 dark:text-white mb-0.5">Enable Supervised Dispensing of Post-Expiry Stock</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 font-body leading-relaxed">
                        When enabled, staff may dispense drugs past their expiry date under pharmacist supervision. All such transactions are individually recorded in the dispensing log for compliance review.
                      </p>
                    </div>
                    <button
                      disabled={isSavingDispensingControl}
                      onClick={() => handleToggleDispensingExpired(false)}
                      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${allowDispensingExpired ? 'bg-danger-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${allowDispensingExpired ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {prefSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-success-500 font-body">
                      <i className="ri-check-line"></i>Preferences saved
                    </span>
                  )}
                  {!prefSaved && <span />}
                  <button
                    onClick={handleSavePreferences}
                    className="h-btn px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}


          {tab === 'deleted-batches' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl border border-warning-200 dark:border-warning-500/20 bg-warning-50/40 dark:bg-warning-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-warning-100 dark:bg-warning-500/20 text-warning-500 flex-shrink-0">
                    <i className="ri-scissors-cut-line text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-600 text-gray-900 dark:text-white">Auto remove expired batches</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">Preview the expired batches that will be deleted, then confirm to remove and log them individually.</p>
                  </div>
                </div>
                <button
                  onClick={loadExpiredCleanupPreview}
                  disabled={isCleanupLoading}
                  className="h-btn px-5 bg-warning-500 hover:bg-warning-600 disabled:opacity-50 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isCleanupLoading ? 'Loading...' : 'Review & Remove'}
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-danger-200 dark:border-danger-500/20 bg-danger-50/40 dark:bg-danger-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-danger-100 dark:bg-danger-500/20 text-danger-500">
                      <i className="ri-delete-bin-3-line text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Batches Written Off</p>
                      <p className="text-2xl font-heading font-700 text-gray-900 dark:text-white mt-1">
                        {isLoadingDeleted ? '...' : deletedSummary.total_batches_deleted}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-danger-200 dark:border-danger-500/20 bg-danger-50/40 dark:bg-danger-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-danger-100 dark:bg-danger-500/20 text-danger-500">
                      <i className="ri-money-dollar-circle-line text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs font-body font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value Written Off</p>
                      <p className="text-2xl font-mono font-700 text-danger-600 dark:text-danger-400 mt-1">
                        {isLoadingDeleted ? '...' : `GHS ${Number(deletedSummary.total_value_written_off).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark overflow-hidden">
                <div className="p-5 border-b border-border-light dark:border-border-dark">
                  <h2 className="text-sm font-heading font-600 text-gray-900 dark:text-white">Expiry Batch Deletion Logs</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">A record of expired or expiring drug batches deleted from the inventory system.</p>
                </div>

                <div className="overflow-x-auto">
                  {isLoadingDeleted ? (
                    <div className="p-8 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : deletedBatches.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <i className="ri-archive-line text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-sm font-body font-medium text-gray-700 dark:text-gray-300">No batches have been deleted yet.</p>
                    </div>
                  ) : (
                    <>
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-border-light dark:border-border-dark">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Date Deleted</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Drug Name</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Batch Number</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Expiry Date</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body text-center">Qty Deleted</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body text-right">Cost Value</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body text-center">Source</th>
                            <th className="px-4 py-3 text-[10px] font-700 text-gray-400 uppercase tracking-widest font-body">Deleted By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark font-body">
                          {deletedBatches.slice((deletedPage - 1) * rowsPerPage, deletedPage * rowsPerPage).map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 font-mono">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">
                                {log.drugName}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                {log.batchNumber}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                {new Date(log.expiryDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-center font-mono">
                                {log.quantity}
                              </td>
                              <td className="px-4 py-3 text-xs text-danger-500 text-right font-mono font-semibold">
                                GHS {Number(log.totalValue).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] ${String(log.deletedBy || '').toLowerCase().includes('cleanup') ? 'bg-warning-50 dark:bg-warning-500/10 text-warning-500' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                  {String(log.deletedBy || '').toLowerCase().includes('cleanup') ? 'System' : 'Manual'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">
                                {log.deletedBy}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination footer */}
                      {Math.ceil(deletedBatches.length / rowsPerPage) > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-white/[0.01]">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-body">
                            Showing page <strong className="font-semibold text-gray-900 dark:text-white">{deletedPage}</strong> of <strong className="font-semibold text-gray-900 dark:text-white">{Math.ceil(deletedBatches.length / rowsPerPage)}</strong> ({deletedBatches.length} total)
                          </span>
                          <div className="flex gap-2">
                            <button
                              disabled={deletedPage === 1}
                              onClick={() => setDeletedPage(p => Math.max(1, p - 1))}
                              className="h-8 px-3 border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <button
                              disabled={deletedPage === Math.ceil(deletedBatches.length / rowsPerPage)}
                              onClick={() => setDeletedPage(p => Math.min(Math.ceil(deletedBatches.length / rowsPerPage), p + 1))}
                              className="h-8 px-3 border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {planModal === 'renew' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-border-dark animate-in zoom-in duration-200">
            <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white mb-4 capitalize">Renew Subscription</h2>
            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-3 p-4 bg-primary-50 dark:bg-primary-500/5 border border-primary-500/10 rounded-xl">
                <div className="flex justify-between items-center border-b border-primary-500/10 pb-2">
                  <span className="text-xs font-heading font-700 text-primary-600 dark:text-primary-400 uppercase tracking-wider">{planDetails?.name || 'Premium Plan'}</span>
                  <span className="text-sm font-mono font-700 text-primary-500">{planDetails ? `${planDetails.currency} ${Number(planDetails.amount || 0).toFixed(2)}` : 'GHC 250.00'}<span className="text-[10px] text-gray-400 font-normal ml-1">/{planDetails?.interval === 'monthly' ? 'mo' : planDetails?.interval || 'mo'}</span></span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Full Inventory Tracking',
                    'Sales & Analytics',
                    'Expiry Date Notifications',
                    'Secure Cloud Backups',
                    'Multi-staff Accounts',
                    'Audit Logs & History'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-body text-gray-600 dark:text-gray-400">
                      <i className="ri-checkbox-circle-fill text-primary-500 text-xs"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">
                You will enter your payment details directly on Paystack. No number is required here.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPlanModal(null)} className="flex-1 h-11 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium font-body cursor-pointer transition-colors">Cancel</button>
              <button
                disabled={isProcessing}
                onClick={() => handlePlanAction('renew')}
                className="flex-1 h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium font-body cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing && <i className="ri-loader-4-line animate-spin"></i>}
                {isProcessing ? 'Processing...' : 'Confirm Renewal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCleanupModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-border-light dark:border-border-dark flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white">Confirm expired batch cleanup</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-1">These batches are already expired. Confirm to delete them and log each one separately.</p>
              </div>
              <button onClick={() => setIsCleanupModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {expiredCleanupPreview.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-body">
                  No expired batches were found.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-1">Expired batches to remove</p>
                      <p className="text-2xl font-heading font-700 text-gray-900 dark:text-white">{expiredCleanupSummary.expired_batches || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-1">Expiring soon detected</p>
                      <p className="text-2xl font-mono font-700 text-warning-500">{expiredCleanupSummary.expiring_batches || 0}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-warning-200 dark:border-warning-500/20 bg-warning-50/50 dark:bg-warning-500/5 text-xs text-gray-600 dark:text-gray-300 font-body">
                    Only expired batches are removed by this action. Expiring batches are shown so the pharmacy can review them early.
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-heading font-700 uppercase tracking-widest text-danger-500">Expired now</h3>
                        <span className="text-[10px] font-mono text-gray-400">{expiredCleanupPreview.filter((batch: any) => batch.status === 'expired').length} batches</span>
                      </div>
                      {expiredCleanupPreview.filter((batch: any) => batch.status === 'expired').length === 0 ? (
                        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm text-gray-500 dark:text-gray-400 font-body">
                          No expired batches are ready for deletion.
                        </div>
                      ) : (
                        expiredCleanupPreview.filter((batch: any) => batch.status === 'expired').map((batch: any) => (
                          <div key={batch.id} className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-white/[0.02] p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-heading font-600 text-gray-900 dark:text-white">{batch.drugName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Batch {batch.batchNumber} · Expired {new Date(batch.expiryDate).toLocaleDateString()} · {batch.quantity} units</p>
                            </div>
                            <span className="text-xs font-mono font-600 text-danger-500">GHS {Number(batch.writeOffValue || 0).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-heading font-700 uppercase tracking-widest text-warning-500">Expiring soon</h3>
                        <span className="text-[10px] font-mono text-gray-400">{expiredCleanupPreview.filter((batch: any) => batch.status === 'expiring-soon').length} batches</span>
                      </div>
                      {expiredCleanupPreview.filter((batch: any) => batch.status === 'expiring-soon').length === 0 ? (
                        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm text-gray-500 dark:text-gray-400 font-body">
                          No expiring batches detected.
                        </div>
                      ) : (
                        expiredCleanupPreview.filter((batch: any) => batch.status === 'expiring-soon').map((batch: any) => (
                          <div key={batch.id} className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-white/[0.02] p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-heading font-600 text-gray-900 dark:text-white">{batch.drugName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Batch {batch.batchNumber} · {batch.remainingDays}d left · {batch.quantity} units</p>
                            </div>
                            <span className="text-xs font-mono font-600 text-warning-500">GHS {Number(batch.writeOffValue || 0).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setIsCleanupModalOpen(false)}
                className="h-btn px-5 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanupExpiredBatches}
                disabled={isCleanupLoading || expiredCleanupPreview.filter((batch: any) => batch.status === 'expired').length === 0}
                className="h-btn px-5 bg-danger-500 hover:bg-danger-600 disabled:opacity-50 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
              >
                {isCleanupLoading ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {planModal === 'cancel' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-border-dark animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center mb-4">
              <i className="ri-error-warning-line text-danger-500 text-2xl"></i>
            </div>
            <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white mb-2">Cancel Subscription?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6 leading-relaxed">
              You will continue to have access until the end of your billing cycle. <strong>No refunds are provided for cancellations.</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPlanModal(null)} className="flex-1 h-11 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium font-body cursor-pointer transition-colors">Go Back</button>
              <button
                disabled={isProcessing}
                onClick={() => handlePlanAction('cancel')}
                className="flex-1 h-11 bg-danger-500 hover:bg-danger-600 text-white rounded-xl text-sm font-medium font-body cursor-pointer transition-colors"
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {planModal === 'delete' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-border-dark animate-in zoom-in duration-200">
            <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white mb-2">Delete Account?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-4 leading-relaxed">
              All data will be kept for <strong>30 days</strong> before permanent removal. You can reactivate your plan during this time. <strong>No refunds will be provided.</strong>
            </p>
            <div className="mb-6">
              <label className="block text-xs font-body font-medium text-gray-500 dark:text-gray-400 mb-1.5">Type <span className="font-mono font-600">DELETE</span> to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-bg-dark text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:border-danger-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPlanModal(null); setDeleteConfirmText(''); }} className="flex-1 h-11 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium font-body cursor-pointer transition-colors">Cancel</button>
              <button
                disabled={isProcessing || deleteConfirmText !== 'DELETE'}
                onClick={() => handlePlanAction('delete')}
                className="flex-1 h-11 bg-danger-500 hover:bg-danger-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium font-body cursor-pointer transition-colors"
              >
                {isProcessing ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpiredDispensingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-warning-200 dark:border-warning-500/30 animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-warning-50 dark:bg-warning-500/10 rounded-full flex items-center justify-center mb-4">
              <i className="ri-alert-fill text-warning-500 text-2xl"></i>
            </div>
            <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white mb-2">Enable Supervised Dispensing of Post-Expiry Stock?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6 leading-relaxed">
              When enabled, staff may dispense drugs past their expiry date under pharmacist supervision. All such transactions are individually recorded in the dispensing log for compliance review.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowExpiredDispensingModal(false)} 
                className="flex-1 h-11 border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-sm font-medium font-body cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSavingDispensingControl}
                onClick={() => handleToggleDispensingExpired(true)}
                className="flex-1 h-11 bg-danger-500 hover:bg-danger-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium font-body cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isSavingDispensingControl && <i className="ri-loader-4-line animate-spin"></i>}
                Enable Supervised Dispensing
              </button>
            </div>
          </div>
        </div>
      )}

      {showShortcutsGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowShortcutsGuide(false)}>
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 border border-border-light dark:border-border-dark animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center">
                <i className="ri-keyboard-line text-primary-500 text-xl"></i>
              </div>
              <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Focus Search</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instantly focus the search bar.</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">K</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Toggle App Drawer</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open or close the right app drawer.</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">B</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Hold Cart</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Put the current sale on hold.</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">H</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Checkout</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Execute the sale immediately.</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Clear / Cancel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Clear search or close drawer.</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded text-xs font-mono shadow-sm">Esc</kbd>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowShortcutsGuide(false)}
              className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium font-body cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Error Logs Tab ─────────────────────────────── */}
      {tab === 'error-logs' && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-5">
          <ErrorLogViewer />
        </div>
      )}
    </div>
  );
}


