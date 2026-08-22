import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { StaffStats } from '@/pages/staff/page';
import type { Transaction } from '@/types';

interface Props {
  stats: StaffStats;
  timeAgo: (ts: string) => string;
  onClose: () => void;
}

type FilterType = 'All' | 'Sale' | 'Restock';

const PAGE_SIZE = 8;

const typeBadge: Record<string, string> = {
  Sale: 'bg-primary-50 dark:bg-primary-500/10 text-primary-500',
  Restock: 'bg-success-50 dark:bg-success-500/10 text-success-500',
};

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-primary-500/70 transition-all duration-300"
            style={{ height: `${Math.max(2, (d.value / max) * 40)}px` }}
          />
          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StaffActivityDrawer({ stats, timeAgo, onClose }: Props) {
  const { transactions } = useApp();
  const { member, totalSalesToday, totalUnitsToday, totalSalesAllTime, totalUnitsAllTime, lastActive } = stats;

  const [filter, setFilter] = useState<FilterType>('All');
  const [page, setPage] = useState(1);

  // All transactions for this staff member from global state
  const allMemberTxns = useMemo(() =>
    transactions
      .filter(t => t.staffId === member.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions, member.id]
  );

  const filtered = useMemo(() =>
    filter === 'All' ? allMemberTxns : allMemberTxns.filter(t => t.type === filter),
    [allMemberTxns, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Last 7 days bar chart data
  const last7Days = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
      const units = allMemberTxns
        .filter(t => t.type === 'Sale' && t.timestamp.startsWith(dateStr))
        .reduce((s, t) => s + Math.abs(t.quantity), 0);
      days.push({ label, value: units });
    }
    return days;
  }, [allMemberTxns]);

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" />

      {/* Drawer */}
      <div
        className="w-full max-w-md h-full bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading font-700 text-sm flex-shrink-0"
            style={{ backgroundColor: member.color }}
          >
            {member.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-600 text-gray-900 dark:text-white">{member.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
              Last active <span className="font-mono">{timeAgo(lastActive)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Stats */}
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <p className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-1">Today</p>
                <p className="text-xl font-mono font-700 text-gray-900 dark:text-white">{totalSalesToday}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-body">sales · <span className="font-mono">{totalUnitsToday}</span> units</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
                <p className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-1">All Time</p>
                <p className="text-xl font-mono font-700 text-gray-900 dark:text-white">{totalSalesAllTime}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-body">sales · <span className="font-mono">{totalUnitsAllTime}</span> units</p>
              </div>
            </div>

            {/* 7-day chart */}
            <div>
              <p className="text-label uppercase tracking-widest text-gray-400 dark:text-gray-600 font-body mb-2">Units Sold — Last 7 Days</p>
              <MiniBarChart data={last7Days} />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-5 pt-4 pb-2 flex-shrink-0">
            <div className="flex gap-1 bg-gray-100 dark:bg-bg-dark rounded-lg p-1">
              {(['All', 'Sale', 'Restock'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`flex-1 h-7 rounded-md text-xs font-body font-medium transition-all cursor-pointer whitespace-nowrap
                    ${filter === f
                      ? 'bg-white dark:bg-surface-dark text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <div className="px-5 pb-4">
            {paginated.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 mx-auto mb-3">
                  <i className="ri-inbox-line text-gray-400 text-lg"></i>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-600 font-body">No {filter !== 'All' ? filter.toLowerCase() : ''} activity found</p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {paginated.map((txn: Transaction) => (
                  <div
                    key={txn.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${txn.type === 'Sale' ? 'bg-primary-500' : txn.type === 'Restock' ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-body font-medium text-gray-900 dark:text-white truncate">
                          {txn.drugLines && txn.drugLines.length > 0
                            ? txn.drugLines.map((l: any) => l.drugName).join(', ')
                            : txn.drugName}
                        </p>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeBadge[txn.type] || 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                          {txn.type}
                        </span>
                      </div>
                      
                      {txn.drugLines && txn.drugLines.length > 0 ? (
                        <div className="space-y-1 my-1.5 pl-2 border-l-2 border-primary-500/20">
                          {txn.drugLines.map((l: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-body text-gray-600 dark:text-gray-400">
                              <span>{l.drugName} (×{l.quantity})</span>
                              <span className="font-mono text-[11px]">{l.stockBefore} → {l.stockAfter}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
                            <span className="font-mono font-600 text-gray-700 dark:text-gray-300">{txn.quantity > 0 ? '+' : ''}{txn.quantity}</span> units
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 font-body">
                            <span className="font-mono">{txn.stockBefore}</span> → <span className="font-mono">{txn.stockAfter}</span>
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">
                        {new Date(txn.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {timeAgo(txn.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light dark:border-border-dark">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 border border-border-light dark:border-border-dark rounded-lg text-xs font-body text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-s-line mr-1"></i>Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-mono transition-colors cursor-pointer
                        ${p === page
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 border border-border-light dark:border-border-dark rounded-lg text-xs font-body text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Next<i className="ri-arrow-right-s-line ml-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
