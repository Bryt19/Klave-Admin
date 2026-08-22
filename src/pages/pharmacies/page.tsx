import { useState } from 'react';
import Badge from '@/components/base/Badge';
import ConfirmModal from '@/components/base/ConfirmModal';
import SelectDropdown from '@/components/base/SelectDropdown';
import Pagination from '@/components/base/Pagination';
import PharmacyCard from './components/PharmacyCard';
import PharmacyDrawer from './components/PharmacyDrawer';
import AddPharmacyModal from './components/AddPharmacyModal';
import { pharmacies as allPharmacies, type Pharmacy, type PharmacyStatus } from '@/mocks/pharmacies';

const statuses = ['All Statuses', 'Trial', 'Active', 'Suspended'];
const regions = ['All Regions', 'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo', 'Western North', 'Ahafo', 'Bono East', 'North East', 'Savannah', 'Oti'];

type SortKey = keyof Pharmacy;

export default function PharmaciesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [search, setSearch] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterRegion, setFilterRegion] = useState('All Regions');
  
  const [sortKey, setSortKey] = useState<SortKey>('joined');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  const [suspendTarget, setSuspendTarget] = useState<Pharmacy | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<Pharmacy | null>(null);
  
  const [pharmacyList, setPharmacyList] = useState(allPharmacies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Table Action Menu State
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = pharmacyList
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (!q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q) || p.phone.includes(q)) &&
        (filterStatus === 'All Statuses' || p.status === filterStatus) &&
        (filterRegion === 'All Regions' || p.region === filterRegion)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedList = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSuspend = (_reason?: string) => {
    if (!suspendTarget) return;
    setPharmacyList(prev => prev.map(p => p.id === suspendTarget.id ? { ...p, status: 'Suspended' as PharmacyStatus } : p));
    showToast(`${suspendTarget.name} has been suspended.`);
    setSuspendTarget(null);
  };

  const handleReactivate = () => {
    if (!reactivateTarget) return;
    setPharmacyList(prev => prev.map(p => p.id === reactivateTarget.id ? { ...p, status: 'Active' as PharmacyStatus } : p));
    showToast(`${reactivateTarget.name} has been reactivated.`);
    setReactivateTarget(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <i className={`ml-1 text-[10px] ${sortKey === k ? 'text-primary' : ''} ${sortKey === k && sortDir === 'desc' ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}`} />
  );

  return (
    <div className="p-4 sm:p-6 space-y-5" onClick={() => setActionMenuOpen(null)}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success shadow-lg">{toast}</div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Pharmacies</h1>
          <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>{pharmacyList.length} pharmacies on the platform</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-body font-medium transition-colors hover:brightness-110 cursor-pointer shrink-0"
        >
          Add Pharmacy
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search pharmacies..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-sm font-body outline-none focus:ring-1 focus:ring-primary"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="w-[180px]">
          <SelectDropdown
            value={filterStatus}
            onChange={(v) => handleFilterChange(setFilterStatus, v)}
            options={statuses.map(s => ({ label: s, value: s }))}
          />
        </div>
        <div className="w-[200px]">
          <SelectDropdown
            value={filterRegion}
            onChange={(v) => handleFilterChange(setFilterRegion, v)}
            options={regions.map(r => ({ label: r, value: r }))}
          />
        </div>
        <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-9 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-primary/10 text-primary' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="ri-grid-fill text-lg"></i>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`w-9 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-primary/10 text-primary' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="ri-list-check-3 text-lg"></i>
          </button>
        </div>
      </div>

      {/* Grid / Table View */}
      {viewMode === 'grid' ? (
        filtered.length === 0 ? (
          <div className="py-12 text-center rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[13px] font-body" style={{ color: 'var(--text-muted)' }}>
              No pharmacies match your filters. Try adjusting the search or filters above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedList.map(p => (
                <PharmacyCard 
                  key={p.id} 
                  pharmacy={p} 
                  onView={() => setSelectedPharmacy(p)} 
                />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )
      ) : (
        <div className="rounded-xl overflow-visible space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-visible">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
                  {[
                    { label: 'Pharmacy Name', key: 'name' },
                    { label: 'Owner', key: 'owner' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Region', key: 'region' },
                    { label: 'Status', key: 'status' },
                    { label: 'Joined', key: 'joined' },
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
                ) : paginatedList.map(p => (
                  <tr
                    key={p.id}
                    className="table-row-hover cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelectedPharmacy(p)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary text-[10px] font-mono font-600">{p.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <span className="text-[13px] font-medium font-body whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.owner}</td>
                    <td className="px-4 py-4 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.phone}</td>
                    <td className="px-4 py-4 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.region}</td>
                    <td className="px-4 py-4"><Badge label={p.status} /></td>
                    <td className="px-4 py-4 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.joined}</td>
                    <td className="px-4 py-4 text-right relative">
                      <button 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg)] cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === p.id ? null : p.id);
                        }}
                      >
                        <i className="ri-more-2-fill text-lg"></i>
                        
                        {/* Action Dropdown Menu */}
                        {actionMenuOpen === p.id && (
                          <div 
                            className="absolute z-50 top-full right-0 mt-1 w-36 rounded-lg shadow-lg py-1 flex flex-col text-left animate-in fade-in zoom-in-95 duration-100"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                          >
                            <span 
                              className="px-3 py-1.5 text-[12px] font-body text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
                              onClick={() => setSelectedPharmacy(p)}
                            >
                              View Details
                            </span>
                            {p.status === 'Trial' && (
                              <span 
                                className="px-3 py-1.5 text-[12px] font-body text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
                                onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); }}
                              >
                                Extend Trial
                              </span>
                            )}
                            {(p.status === 'Trial' || p.status === 'Active') && (
                              <span 
                                className="px-3 py-1.5 text-[12px] font-body text-danger hover:bg-danger/10 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setSuspendTarget(p); setActionMenuOpen(null); }}
                              >
                                Suspend
                              </span>
                            )}
                            {p.status === 'Suspended' && (
                              <span 
                                className="px-3 py-1.5 text-[12px] font-body text-success hover:bg-success/10 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setReactivateTarget(p); setActionMenuOpen(null); }}
                              >
                                Reactivate
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}

      {selectedPharmacy && (
        <PharmacyDrawer 
          pharmacy={selectedPharmacy} 
          onClose={() => setSelectedPharmacy(null)} 
        />
      )}

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
      
      <ConfirmModal
        isOpen={!!reactivateTarget}
        title={`Reactivate ${reactivateTarget?.name}?`}
        description="This will immediately restore the pharmacy's access to Klavora."
        confirmLabel="Reactivate Pharmacy"
        confirmVariant="primary"
        onConfirm={handleReactivate}
        onCancel={() => setReactivateTarget(null)}
      />

      <AddPharmacyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
