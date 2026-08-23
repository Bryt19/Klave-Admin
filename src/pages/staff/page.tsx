import { useState, useRef, useEffect } from 'react';
import Badge from '@/components/base/Badge';
import ConfirmModal from '@/components/base/ConfirmModal';
import { staffMembers as initialStaff, type StaffMember, type StaffRole, type StaffStatus } from '@/mocks/staff';

const roles: StaffRole[] = ['Super Admin', 'Admin'];
const statuses: StaffStatus[] = ['Active', 'Inactive', 'Suspended'];

const ITEMS_PER_PAGE = 10;

type SortKey = keyof StaffMember;

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<StaffMember | null>(null);
  const [staffList, setStaffList] = useState(initialStaff);
  const [toast, setToast] = useState('');

  // Add Staff form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('Admin');
  const [formPharmacies, setFormPharmacies] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = staffList
    .filter(s => {
      const q = search.toLowerCase();
      return (
        (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)) &&
        (!filterRole || s.role === filterRole) &&
        (!filterStatus || s.status === filterStatus)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const handleAddStaff = () => {
    if (!formName || !formEmail || !formPhone) return;
    const newStaff: StaffMember = {
      id: `AD${String(staffList.length + 1).padStart(3, '0')}`,
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      status: 'Active',
      assignedPharmacies: formPharmacies ? formPharmacies.split(',').map(p => p.trim()) : [],
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStaffList(prev => [...prev, newStaff]);
    showToast(`${formName} has been added as ${formRole}.`);
    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Admin');
    setFormPharmacies('');
  };

  const handleSuspend = (_reason?: string) => {
    if (!suspendTarget) return;
    setStaffList(prev => prev.map(s => s.id === suspendTarget.id ? { ...s, status: 'Suspended' as StaffStatus } : s));
    showToast(`${suspendTarget.name} has been suspended.`);
    setSuspendTarget(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <i className={`ml-1 text-[10px] ${sortKey === k ? 'text-primary' : ''} ${sortKey === k && sortDir === 'desc' ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}`} />
  );

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success shadow-lg">{toast}</div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Staff Management</h1>
          <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Manage Super Admin and Admin roles with RBAC</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-4 rounded-lg text-[13px] font-body font-600 cursor-pointer transition-colors bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
        >
          <i className="ri-user-add-line text-[15px]" />
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search staff..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-sm font-body outline-none focus:ring-1 focus:ring-primary"
            style={inputStyle}
          />
        </div>
        {[
          { label: 'Role', value: filterRole, set: setFilterRole, options: roles },
          { label: 'Status', value: filterStatus, set: setFilterStatus, options: statuses },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => { f.set(e.target.value); setCurrentPage(1); }}
            className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            style={inputStyle}
          >
            <option value="">All {f.label === 'Role' ? 'Roles' : 'Statuses'}</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <div className="flex items-center gap-1 px-3 rounded-lg text-[12px] font-mono font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {filtered.length} results
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
                {[
                  { label: 'Staff Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Role', key: 'role' },
                  { label: 'Status', key: 'status' },
                  { label: 'Assigned', key: null },
                  { label: 'Last Active', key: 'lastActive' },
                  { label: 'Actions', key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={() => col.key && handleSort(col.key as SortKey)}
                    className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-body font-600 whitespace-nowrap ${col.key ? 'cursor-pointer hover:text-primary' : ''}`}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {col.label}{col.key && <SortIcon k={col.key as SortKey} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] font-body" style={{ color: 'var(--text-muted)' }}>
                    No staff members match your filters.
                  </td>
                </tr>
              ) : paginated.map(s => (
                <tr
                  key={s.id}
                  className="table-row-hover"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.role === 'Super Admin' ? 'bg-primary/20' : 'bg-purple-500/10'}`}>
                        <span className={`text-[11px] font-mono font-700 ${s.role === 'Super Admin' ? 'text-primary' : 'text-purple-600 dark:text-purple-400'}`}>
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-body font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                        <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{s.phone}</td>
                  <td className="px-4 py-3"><Badge label={s.role} /></td>
                  <td className="px-4 py-3"><Badge label={s.status} /></td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {s.role === 'Super Admin' ? (
                      <span className="text-primary font-semibold">All ({s.assignedPharmacies.length})</span>
                    ) : (
                      <span>{s.assignedPharmacies.length} pharmacies</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(s.lastActive).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="relative" ref={openActionId === s.id ? actionMenuRef : undefined}>
                      <button
                        onClick={() => setOpenActionId(openActionId === s.id ? null : s.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-primary/10"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <i className="ri-more-2-fill text-[16px]" />
                      </button>
                      {openActionId === s.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-44 py-1 rounded-xl shadow-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                          <button
                            onClick={() => { setOpenActionId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-body font-medium transition-colors hover:bg-primary/10"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <i className="ri-eye-line text-[14px]" style={{ color: 'var(--text-secondary)' }} />
                            View Details
                          </button>
                          <button
                            onClick={() => { setOpenActionId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-body font-medium transition-colors hover:bg-primary/10"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <i className="ri-edit-line text-[14px]" style={{ color: 'var(--text-secondary)' }} />
                            Edit Staff
                          </button>
                          {s.status !== 'Suspended' && (
                            <button
                              onClick={() => { setSuspendTarget(s); setOpenActionId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-body font-medium transition-colors hover:bg-danger/10 text-danger"
                            >
                              <i className="ri-forbid-line text-[14px]" />
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-body cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <i className="ri-arrow-left-s-line text-[16px]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-mono font-600 cursor-pointer transition-colors"
                style={{
                  background: currentPage === page ? 'var(--primary)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: currentPage === page ? '#fff' : 'var(--text-primary)',
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-body cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <i className="ri-arrow-right-s-line text-[16px]" />
            </button>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="font-heading font-700 text-[16px]" style={{ color: 'var(--text-primary)' }}>Add Staff Member</h2>
                <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>Assign a role and pharmacy access</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-primary/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <i className="ri-close-line text-[18px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body outline-none focus:ring-1 focus:ring-primary"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address *</label>
                <input
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="name@klavora.io"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary"
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[12px] font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary"
                  style={inputStyle}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[12px] font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role *</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as StaffRole)}
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  style={inputStyle}
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-[11px] font-body mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {formRole === 'Super Admin' ? 'Full platform access — can manage all pharmacies, staff, and settings.' : 'Limited access — can manage assigned pharmacies and view reports.'}
                </p>
              </div>

              {/* Assigned Pharmacies */}
              {formRole === 'Admin' && (
                <div>
                  <label className="block text-[12px] font-body font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assigned Pharmacies</label>
                  <input
                    value={formPharmacies}
                    onChange={e => setFormPharmacies(e.target.value)}
                    placeholder="PH001, PH002, PH003 (comma-separated)"
                    className="w-full h-10 px-3 rounded-lg text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary"
                    style={inputStyle}
                  />
                  <p className="text-[11px] font-body mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    Comma-separated pharmacy IDs. Leave empty to assign later.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-9 px-4 rounded-lg text-[13px] font-body font-medium cursor-pointer transition-colors hover:bg-primary/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={!formName || !formEmail || !formPhone}
                className="h-9 px-5 rounded-lg text-[13px] font-body font-600 cursor-pointer transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation */}
      <ConfirmModal
        isOpen={!!suspendTarget}
        title={`Suspend ${suspendTarget?.name}?`}
        description="This will immediately restrict their access to the Klavora admin panel."
        confirmLabel="Suspend Staff"
        confirmVariant="danger"
        requireReason
        reasonLabel="Reason for suspension"
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
}
