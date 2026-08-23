// Offline Status: Needs Offline Support
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import type { Staff, Transaction, Role } from '@/types';
import StaffCard from '@/pages/staff/components/StaffCard';
import StaffActivityDrawer from '@/pages/staff/components/StaffActivityDrawer';


import Skeleton from '@/components/ui/Skeleton';
import { useActionLock } from '@/hooks/useActionLock';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { timeAgo } from '@/utils/formatters';

export interface StaffStats {
  member: Staff;
  totalSalesToday: number;
  totalUnitsToday: number;
  totalSalesAllTime: number;
  totalUnitsAllTime: number;
  recentTransactions: Transaction[];
  lastActive: string;
}

export { timeAgo };

function StaffPage() {
  const { user, transactions, staff, refreshData, syncing } = useApp();
  const { withActionLock } = useActionLock();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showGenPassword, setShowGenPassword] = useState(false);
  const [newRole, setNewRole] = useState<Role>('STAFF');
  
  const [formError, setFormError] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);


  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setShowGenPassword(true);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const staffStats: StaffStats[] = useMemo(() => {
    return staff.map(member => {
      const memberTxns = transactions.filter(t => t.staffId === member.id);
      const todayTxns = memberTxns.filter(t => t.timestamp.startsWith(todayStr) && t.type === 'Sale');
      const allSales = memberTxns.filter(t => t.type === 'Sale');
      const mostRecent = memberTxns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const lastActive = mostRecent ? mostRecent.timestamp : member.lastActive;

      return {
        member,
        totalSalesToday: todayTxns.length,
        totalUnitsToday: todayTxns.reduce((s, t) => s + Math.abs(t.quantity), 0),
        totalSalesAllTime: allSales.length,
        totalUnitsAllTime: allSales.reduce((s, t) => s + Math.abs(t.quantity), 0),
        recentTransactions: memberTxns.slice(0, 10),
        lastActive,
      };
    });
  }, [staff, transactions, todayStr]);

  const totalUnitsToday = staffStats.reduce((s, st) => s + st.totalUnitsToday, 0);
  const totalSalesToday = staffStats.reduce((s, st) => s + st.totalSalesToday, 0);
  const mostActiveMember = staffStats.reduce((best, cur) =>
    cur.totalUnitsAllTime > (best?.totalUnitsAllTime ?? -1) ? cur : best, staffStats[0]);

  if (!user?.role || !['OWNER', 'MANAGER'].includes(user.role.toUpperCase())) {
    return <div className="p-6 text-sm text-gray-400 font-body">Managers and Owners access only.</div>;
  }

  const handleSave = withActionLock(async () => {
    setFormError('');
    if (!newName.trim()) { setFormError('Name is required.'); return; }
    if (!newEmail.trim()) { setFormError('Email is required.'); return; }
    if (!editingId && !newPassword.trim()) { setFormError('Password is required.'); return; }

    setIsSaving(true);
    try {
      if (editingId) {
        await api.staff.update(editingId, {
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim() || undefined,
          role: newRole,
        });
      } else {
        await api.staff.create({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
        });
      }
      await refreshData();
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save staff member.');
    } finally {
      setIsSaving(false);
    }
  });

  const openAddForm = withActionLock(() => {

    setEditingId(null);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('STAFF');
    setFormError('');
    setShowGenPassword(false);
    setShowForm(true);
  });

  const openEditForm = withActionLock((member: Staff) => {

    setEditingId(member.id);
    setNewName(member.name);
    setNewEmail(member.email || '');
    setNewPassword('');
    setNewRole((member as any).role || 'STAFF');
    setFormError('');
    setShowGenPassword(false);
    setShowForm(true);
  });

  const confirmRemove = withActionLock((id: string) => {

    setRemoveId(id);
  });

  const handleRemove = withActionLock(async (id: string) => {
    setIsRemoving(true);
    try {
      await api.staff.remove(id);
      await refreshData();
      toast.success('Staff member removed successfully', {
        description: 'Their access has been revoked.'
      });
      setRemoveId(null);
      if (selectedStaff?.member.id === id) setSelectedStaff(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff member.');
    } finally {
      setIsRemoving(false);
    }
  });

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-700 text-gray-900 dark:text-white">Staff</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-0.5">
            <span className="font-mono">{staff.length}</span> staff members
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="h-btn px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line mr-2"></i>Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body">Sales Today</span>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10">
              <i className="ri-shopping-bag-line text-primary-500 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-mono font-700 text-gray-900 dark:text-white">{totalSalesToday}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-body mt-0.5">transactions across all staff</p>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body">Units Sold Today</span>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-success-50 dark:bg-success-500/10">
              <i className="ri-stack-line text-success-500 text-sm"></i>
            </div>
          </div>
          <p className="text-2xl font-mono font-700 text-gray-900 dark:text-white">{totalUnitsToday}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-body mt-0.5">units dispensed today</p>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body">Top Performer</span>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <i className="ri-award-line text-amber-500 text-sm"></i>
            </div>
          </div>
          {mostActiveMember ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-heading font-700 flex-shrink-0" style={{ backgroundColor: mostActiveMember.member.color }}>
                  {mostActiveMember.member.initials}
                </div>
                <p className="text-sm font-heading font-600 text-gray-900 dark:text-white truncate">{mostActiveMember.member.name}</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 font-body mt-0.5">
                <span className="font-mono">{mostActiveMember.totalUnitsAllTime}</span> units all time
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 font-body">No data yet</p>
          )}
        </div>
      </div>

      {syncing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-2/3 h-4" />
                  <Skeleton className="w-1/3 h-3" />
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Skeleton className="w-12 h-2" />
                  <Skeleton className="w-16 h-5" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="w-16 h-2 ml-auto" />
                  <Skeleton className="w-12 h-5 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : staffStats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffStats.map(stats => (
            <StaffCard
              key={stats.member.id}
              stats={stats}
              timeAgo={timeAgo}
              onView={() => setSelectedStaff(stats)}
              onEdit={() => openEditForm(stats.member)}
              onRemove={() => confirmRemove(stats.member.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-light dark:bg-surface-dark rounded-xl border-2 border-dashed border-border-light dark:border-border-dark animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mb-4 relative">
            <i className="ri-team-line text-4xl text-primary-500"></i>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center">
                <i className="ri-sparkling-line text-lg"></i>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-heading font-700 text-gray-900 dark:text-white mb-2">No Staff Members Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 font-body">
            You haven't added any staff members. Add your team to track their sales performance, manage access, and collaborate seamlessly.
          </p>
          <button
            onClick={openAddForm}
            className="h-11 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium font-body transition-colors cursor-pointer shadow-sm shadow-primary-500/20 flex items-center gap-2"
          >
            <i className="ri-user-add-line"></i> Add Your First Staff
          </button>
        </div>
      )}

      {selectedStaff && (
        <StaffActivityDrawer
          stats={selectedStaff}
          timeAgo={timeAgo}
          onClose={() => setSelectedStaff(null)}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={() => setShowForm(false)}>
          <div className="w-full md:max-w-md bg-surface-light dark:bg-surface-dark rounded-t-2xl md:rounded-card border border-border-light dark:border-border-dark p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-heading font-700 text-gray-900 dark:text-white mb-5">
              {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Ama Owusu"
                  className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="staff@pharmacy.com"
                  className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="STAFF">Staff (Default)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
              
              <div className="pt-2">
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                  {editingId ? 'Reset Password (Optional)' : 'Password'}
                </label>
                <div className="flex gap-2">
                  <input
                    type={showGenPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder={editingId ? '••••••••' : 'Enter password'}
                    className="flex-1 h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={generatePassword}
                    className="h-btn px-3 bg-gray-100 dark:bg-white/5 border border-border-light dark:border-border-dark rounded-btn text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
                    title="Generate Random Password"
                  >
                    <i className="ri-refresh-line"></i> Gen
                  </button>
                </div>
                {showGenPassword && (
                  <p className="text-[10px] text-primary-500 mt-1 font-body">Copy and share this password with the staff member.</p>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-danger-500 text-sm font-body bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 rounded-lg px-3 py-2">
                  <i className="ri-error-warning-line flex-shrink-0"></i>
                  <span>{formError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 h-btn border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-btn text-sm font-medium font-body transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-btn bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving && <i className="ri-loader-4-line animate-spin"></i>}
                {isSaving ? 'Saving...' : (editingId ? 'Update Staff' : 'Create Staff')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!removeId}
        title="Remove Staff Member"
        itemName={staff.find(s => s.id === removeId)?.name}
        itemType="Staff"
        message={
          <p>
            Are you sure you want to remove <strong className="text-gray-900 dark:text-white font-semibold">"{staff.find(s => s.id === removeId)?.name}"</strong> from your pharmacy team? Their system access and permissions will be revoked immediately.
          </p>
        }
        confirmLabel="Remove Staff Member"
        variant="danger"
        isLoading={isRemoving}
        onConfirm={() => {
          if (removeId) {
            handleRemove(removeId);
          }
        }}
        onCancel={() => setRemoveId(null)}
      />

    </div>
  );
}

export default StaffPage;
