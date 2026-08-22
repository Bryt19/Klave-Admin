import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api';
import { useApp } from '@/context/AppContext';
import Skeleton from '@/components/ui/Skeleton';

interface LogEntry {
  id?: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: string;
  stack?: string;
  extra?: Record<string, any>;
  url?: string;
  userAgent?: string;
  pharmacyId?: string;
  userId?: string;
  timestamp: string;
  receivedAt?: string;
}

const LEVEL_CONFIG = {
  error: { label: 'Error', bg: 'bg-danger-50 dark:bg-danger-500/10', border: 'border-danger-200 dark:border-danger-500/30', text: 'text-danger-600 dark:text-danger-400', badge: 'bg-danger-100 dark:bg-danger-500/20 text-danger-600 dark:text-danger-400', icon: 'ri-close-circle-fill' },
  warn:  { label: 'Warning', bg: 'bg-warning-50 dark:bg-warning-500/10', border: 'border-warning-200 dark:border-warning-500/30', text: 'text-warning-600 dark:text-warning-400', badge: 'bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400', icon: 'ri-error-warning-fill' },
  info:  { label: 'Info', bg: 'bg-primary-50 dark:bg-primary-500/10', border: 'border-primary-200 dark:border-primary-500/30', text: 'text-primary-600 dark:text-primary-400', badge: 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400', icon: 'ri-information-fill' },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ErrorLogViewer() {
  const { user } = useApp();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'errors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Load available log dates
  useEffect(() => {
    api.logs.getDates().then((res: any) => {
      const d: string[] = res?.dates || [];
      setDates(d);
      if (d.length > 0) setSelectedDate(d[0]);
    }).catch(() => {});
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    try {
      const res: any = await api.logs.get({ date: selectedDate, level: levelFilter, limit: 500 });
      setLogs(res?.logs || []);
      setTotal(res?.total || 0);
    } catch (err) {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, levelFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="p-6 text-center text-sm text-gray-400 font-body">
        <i className="ri-lock-line text-2xl block mb-2" />
        Owner access only.
      </div>
    );
  }

  const filtered = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.message?.toLowerCase().includes(term) ||
      log.context?.toLowerCase().includes(term) ||
      log.url?.toLowerCase().includes(term) ||
      log.stack?.toLowerCase().includes(term)
    );
  });

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;
  const infoCount = logs.filter(l => l.level === 'info').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-heading font-700 text-gray-900 dark:text-white flex items-center gap-2">
            <i className="ri-bug-line text-danger-500" /> Error Log Viewer
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-0.5">
            Internal system logs — automatically captured from the frontend
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm font-body text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <i className="ri-refresh-line" /> Refresh
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-xs font-body text-danger-600 dark:text-danger-400">
          <i className="ri-close-circle-fill" /> {errorCount} Errors
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20 text-xs font-body text-warning-600 dark:text-warning-400">
          <i className="ri-error-warning-fill" /> {warnCount} Warnings
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-xs font-body text-primary-600 dark:text-primary-400">
          <i className="ri-information-fill" /> {infoCount} Info
        </div>
        {total > 0 && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-xs font-body text-gray-500">{total} total entries today</div>}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-body font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Date</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            {dates.length === 0 && <option value="">No log files yet</option>}
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-body font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Level</label>
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value as any)}
            className="w-full h-10 px-3 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="errors">Errors Only</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-body font-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Search</label>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by message, context..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-light dark:border-border-dark p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark p-8 text-center">
            <i className="ri-shield-check-line text-3xl text-success-500 block mb-2" />
            <p className="text-sm font-body text-gray-500 dark:text-gray-400">
              {logs.length === 0 ? 'No logs for this date.' : 'No entries match your search.'}
            </p>
          </div>
        ) : (
          filtered.map((log, idx) => {
            const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
            const key = `${log.timestamp}-${idx}`;
            const isExpanded = expandedId === key;

            return (
              <div
                key={key}
                className={`rounded-xl border ${cfg.border} ${cfg.bg} transition-all`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : key)}
                  className="w-full text-left p-3.5 flex items-start gap-3"
                >
                  <i className={`${cfg.icon} ${cfg.text} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                      <span className={`text-[10px] font-body font-600 px-1.5 py-0.5 rounded ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {log.context && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                          {log.context}
                        </span>
                      )}
                      <span className="text-[10px] font-body text-gray-400 ml-auto">
                        {timeAgo(log.receivedAt || log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-body text-gray-900 dark:text-white truncate">
                      {log.message}
                    </p>
                  </div>
                  <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-gray-400 flex-shrink-0 mt-0.5`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-current/10">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-3">
                      <div>
                        <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-0.5">Timestamp</div>
                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                      {log.url && (
                        <div>
                          <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-0.5">Page URL</div>
                          <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{log.url.replace(/^https?:\/\/[^/]+/, '')}</div>
                        </div>
                      )}
                      {log.userId && (
                        <div>
                          <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-0.5">User ID</div>
                          <div className="text-xs font-mono text-gray-700 dark:text-gray-300">{log.userId.slice(0, 8)}…</div>
                        </div>
                      )}
                    </div>

                    {log.stack && (
                      <div>
                        <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-1">Stack Trace</div>
                        <pre className="text-[11px] font-mono bg-black/5 dark:bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-48 leading-relaxed">
                          {log.stack}
                        </pre>
                      </div>
                    )}

                    {log.extra && Object.keys(log.extra).length > 0 && (
                      <div>
                        <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-1">Extra Data</div>
                        <pre className="text-[11px] font-mono bg-black/5 dark:bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 max-h-32">
                          {JSON.stringify(log.extra, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.userAgent && (
                      <div>
                        <div className="text-[10px] font-body text-gray-400 uppercase tracking-wider mb-0.5">Browser</div>
                        <div className="text-xs font-body text-gray-500 dark:text-gray-400 truncate">{log.userAgent}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 font-body">
          Showing {filtered.length} of {logs.length} entries
        </p>
      )}
    </div>
  );
}
