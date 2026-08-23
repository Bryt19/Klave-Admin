import { useState } from 'react';
import Badge from '@/components/base/Badge';
import { activityFeed, type MovementType } from '@/mocks/activity';

const PAGE_SIZES = [10, 25, 'All'] as const;

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const pharmacyNames: string[] = Array.from(new Set(activityFeed.map(a => a.pharmacyName)));
const movementTypes: MovementType[] = ['Sell', 'Edit', 'Restock', 'Delete'];

export default function ActivityPage() {
  const [filterPharmacy, setFilterPharmacy] = useState('');
  const [filterMovement, setFilterMovement] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZES[number]>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = activityFeed.filter(a =>
    (!filterPharmacy || a.pharmacyName === filterPharmacy) &&
    (!filterMovement || a.movement === filterMovement) &&
    (!filterDate || a.timestamp.startsWith(filterDate))
  );

  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filtered.length / pageSize);
  const paginated = pageSize === 'All'
    ? filtered
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Activity Feed</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Global stock movements across all pharmacies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterPharmacy} onChange={e => { setFilterPharmacy(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Pharmacies</option>
          {pharmacyNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterMovement} onChange={e => { setFilterMovement(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Movements</option>
          {movementTypes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {(filterPharmacy || filterMovement || filterDate) && (
          <button onClick={() => { setFilterPharmacy(''); setFilterMovement(''); setFilterDate(''); setCurrentPage(1); }}
            className="h-9 px-3 rounded-lg text-[12px] font-body font-medium cursor-pointer transition-colors hover:bg-danger/10 text-danger whitespace-nowrap"
            style={{ border: '1px solid var(--border)' }}>
            Clear filters
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Per page</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value) as 10 | 25); setCurrentPage(1); }}
            className="h-9 px-2.5 rounded-lg text-[12px] font-mono font-600 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            {PAGE_SIZES.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
                {['Pharmacy', 'Drug', 'Movement', 'Qty', 'Staff', 'Timestamp'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-body font-600 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>No activity matches your filters.</td></tr>
              ) : paginated.map(a => (
                <tr key={a.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-[10px] font-mono font-700">{a.pharmacyName.slice(0,2).toUpperCase()}</span>
                      </div>
                      <span className="text-[13px] font-body font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.pharmacyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{a.drugName}</td>
                  <td className="px-4 py-3"><Badge label={a.movement} /></td>
                  <td className="px-4 py-3 text-[13px] font-mono font-700 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.quantity}</td>
                  <td className="px-4 py-3 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{a.staffName}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{formatTime(a.timestamp)}</td>
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
            Showing {((currentPage - 1) * (pageSize as number)) + 1}–{Math.min(currentPage * (pageSize as number), filtered.length)} of {filtered.length}
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
    </div>
  );
}
