import type { StaffStats } from '@/pages/staff/page';

interface Props {
  stats: StaffStats;
  timeAgo: (ts: string) => string;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export default function StaffCard({ stats, timeAgo, onView, onEdit, onRemove }: Props) {
  const { member, totalSalesToday, totalUnitsToday, totalUnitsAllTime, recentTransactions, lastActive } = stats;

  const lastTxn = recentTransactions[0];
  const isActiveToday = totalSalesToday > 0;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4 flex flex-col gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-heading font-700 text-sm"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            {isActiveToday && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-500 border-2 border-surface-light dark:border-surface-dark"></span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-heading font-600 text-gray-900 dark:text-white truncate">{member.name}</p>
            {member.role && (
              <span className="text-[10px] uppercase tracking-widest font-mono text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                {member.role}
              </span>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-600 font-body mt-0.5">
              Last active <span className="font-mono">{timeAgo(lastActive)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <i className="ri-pencil-line text-sm"></i>
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-700 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-bg-light dark:bg-bg-dark">
          <p className="text-base font-mono font-700 text-gray-900 dark:text-white">{totalSalesToday}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-body leading-tight">sales today</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-bg-light dark:bg-bg-dark">
          <p className="text-base font-mono font-700 text-gray-900 dark:text-white">{totalUnitsToday}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-body leading-tight">units today</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-bg-light dark:bg-bg-dark">
          <p className="text-base font-mono font-700 text-gray-900 dark:text-white">{totalUnitsAllTime}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-body leading-tight">all time</p>
        </div>
      </div>

      {/* Last transaction */}
      {lastTxn ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${lastTxn.type === 'Sale' ? 'bg-primary-500' : lastTxn.type === 'Restock' ? 'bg-success-500' : 'bg-warning-500'}`}></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body text-gray-700 dark:text-gray-300 truncate">{lastTxn.drugName}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 font-body">
              <span className="font-mono">{lastTxn.quantity}</span> units · {timeAgo(lastTxn.timestamp)}
            </p>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${lastTxn.type === 'Sale' ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500' : lastTxn.type === 'Restock' ? 'bg-success-50 dark:bg-success-500/10 text-success-500' : 'bg-warning-50 dark:bg-warning-500/10 text-warning-500'}`}>
            {lastTxn.type}
          </span>
        </div>
      ) : (
        <div className="px-3 py-2 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark">
          <p className="text-xs text-gray-400 dark:text-gray-600 font-body text-center">No activity yet</p>
        </div>
      )}

      {/* View activity button */}
      <button
        onClick={onView}
        className="w-full h-8 border border-border-light dark:border-border-dark rounded-lg text-xs font-body font-medium text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer whitespace-nowrap"
      >
        <i className="ri-bar-chart-line mr-1.5"></i>View Activity Log
      </button>
    </div>
  );
}
