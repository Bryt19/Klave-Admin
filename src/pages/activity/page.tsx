import { useState } from 'react';
import Badge from '@/components/base/Badge';
import { activityFeed, type MovementType } from '@/mocks/activity';

const movementConfig: Record<MovementType, { icon: string; iconColor: string; bg: string }> = {
  Sale: { icon: 'ri-shopping-cart-line', iconColor: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300/80 dark:border-sky-800/60' },
  Restock: { icon: 'ri-add-circle-line', iconColor: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/60' },
  Reversal: { icon: 'ri-arrow-go-back-line', iconColor: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/60' },
  Reconciliation: { icon: 'ri-equalizer-line', iconColor: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-950/80 border border-purple-300/80 dark:border-purple-800/60' },
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const pharmacyNames: string[] = Array.from(new Set(activityFeed.map(a => a.pharmacyName)));
const movementTypes: MovementType[] = ['Sale', 'Restock', 'Reversal', 'Reconciliation'];

export default function ActivityPage() {
  const [filterPharmacy, setFilterPharmacy] = useState('');
  const [filterMovement, setFilterMovement] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filtered = activityFeed.filter(a =>
    (!filterPharmacy || a.pharmacyName === filterPharmacy) &&
    (!filterMovement || a.movement === filterMovement) &&
    (!filterDate || a.timestamp.startsWith(filterDate))
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Activity Feed</h1>
        <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Global stock movements across all pharmacies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterPharmacy} onChange={e => setFilterPharmacy(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Pharmacies</option>
          {pharmacyNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterMovement} onChange={e => setFilterMovement(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Movements</option>
          {movementTypes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm font-body font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {(filterPharmacy || filterMovement || filterDate) && (
          <button onClick={() => { setFilterPharmacy(''); setFilterMovement(''); setFilterDate(''); }}
            className="h-9 px-3 rounded-lg text-[12px] font-body font-medium cursor-pointer transition-colors hover:bg-danger/10 text-danger whitespace-nowrap"
            style={{ border: '1px solid var(--border)' }}>
            Clear filters
          </button>
        )}
        <div className="flex items-center px-3 rounded-lg text-[12px] font-mono font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {filtered.length} entries
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
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>No activity matches your filters.</td></tr>
              ) : filtered.map(a => (
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${movementConfig[a.movement].bg}`}>
                        <i className={`${movementConfig[a.movement].icon} text-[13px] ${movementConfig[a.movement].iconColor}`} />
                      </div>
                      <Badge label={a.movement} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono font-700 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.quantity}</td>
                  <td className="px-4 py-3 text-[13px] font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{a.staffName}</td>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{formatTime(a.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
