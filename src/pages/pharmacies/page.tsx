import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/base/Badge';
import ConfirmModal from '@/components/base/ConfirmModal';
import { pharmacies as allPharmacies, type Pharmacy, type Plan, type PharmacyStatus, type Region } from '@/mocks/pharmacies';

const plans: Plan[] = ['Starter', 'Growth', 'Scale', 'Trial'];
const statuses: PharmacyStatus[] = ['Active', 'Trial', 'Churned', 'Suspended'];
const regions: Region[] = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Volta', 'Central', 'Brong-Ahafo'];

type SortKey = keyof Pharmacy;

export default function PharmaciesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('joined');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [suspendTarget, setSuspendTarget] = useState<Pharmacy | null>(null);
  const [pharmacyList, setPharmacyList] = useState(allPharmacies);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = pharmacyList
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (!q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q) || p.phone.includes(q)) &&
        (!filterPlan || p.plan === filterPlan) &&
        (!filterStatus || p.status === filterStatus) &&
        (!filterRegion || p.region === filterRegion)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleSuspend = (_reason?: string) => {
    if (!suspendTarget) return;
    setPharmacyList(prev => prev.map(p => p.id === suspendTarget.id ? { ...p, status: 'Suspended' as PharmacyStatus } : p));
    showToast(`${suspendTarget.name} has been suspended.`);
    setSuspendTarget(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <i className={`ml-1 text-[10px] ${sortKey === k ? 'text-primary' : ''} ${sortKey === k && sortDir === 'desc' ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}`} />
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success shadow-lg">{toast}</div>
      )}
      <div>
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Pharmacies</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>{pharmacyList.length} pharmacies on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pharmacies..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-sm font-body outline-none focus:ring-1 focus:ring-primary"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        {[
          { label: 'Plan', value: filterPlan, set: setFilterPlan, options: plans },
          { label: 'Status', value: filterStatus, set: setFilterStatus, options: statuses },
          { label: 'Region', value: filterRegion, set: setFilterRegion, options: regions },
        ].map(f => (
          <select
            key={f.label}
            value={f.value}
            onChange={e => f.set(e.target.value)}
            className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">All {f.label}s</option>
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
                  { label: 'Pharmacy Name', key: 'name' },
                  { label: 'Owner', key: 'owner' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Region', key: 'region' },
                  { label: 'Plan', key: 'plan' },
                  { label: 'Status', key: 'status' },
                  { label: 'Joined', key: 'joined' },
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] font-body" style={{ color: 'var(--text-muted)' }}>
                    No pharmacies match your filters. Try adjusting the search or filters above.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr
                  key={p.id}
                  className="table-row-hover cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => navigate(`/pharmacies/${p.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-[10px] font-mono font-600">{p.name.slice(0,2).toUpperCase()}</span>
                      </div>
                      <span className="text-[13px] font-medium font-body whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.owner}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.phone}</td>
                  <td className="px-4 py-3 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.region}</td>
                  <td className="px-4 py-3"><Badge label={p.plan} /></td>
                  <td className="px-4 py-3"><Badge label={p.status} /></td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.joined}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.lastActive}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/pharmacies/${p.id}`)} className="h-7 px-2.5 rounded-md text-[11px] font-body font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-primary/10 text-primary">View</button>
                      {p.status !== 'Suspended' && (
                        <button onClick={() => setSuspendTarget(p)} className="h-7 px-2.5 rounded-md text-[11px] font-body font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-danger/10 text-danger">Suspend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!suspendTarget}
        title={`Suspend ${suspendTarget?.name}?`}
        description="This will immediately restrict the pharmacy's access to Klavora. They will be notified."
        confirmLabel="Suspend Pharmacy"
        confirmVariant="danger"
        requireReason
        reasonLabel="Reason for suspension"
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
}
