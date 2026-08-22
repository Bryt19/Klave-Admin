/**
 * Klavora Internal Error Logger
 * ─────────────────────────────
 * Captures uncaught errors, unhandled promise rejections, and manual
 * log calls. Stores them in IndexedDB so they survive offline.
 * Flushes to /api/logs on the backend whenever the device is online.
 *
 * Usage:
 *   import { logger } from '@/utils/errorLogger';
 *   logger.error('Something broke', { context: 'sell-page', extra: { drugId } });
 *   logger.warn('Unexpected state', { context: 'AppContext' });
 *   logger.info('Sale completed', { context: 'executeSale' });
 */

import { getApiBaseUrl } from './api';

export type LogLevel = 'error' | 'warn' | 'info';

export interface LogEntry {
  id?: number;
  level: LogLevel;
  message: string;
  context?: string;
  stack?: string;
  extra?: Record<string, any>;
  url: string;
  userAgent: string;
  pharmacyId?: string;
  userId?: string;
  timestamp: string;
  flushed: boolean;
}

// ── IndexedDB helpers ──────────────────────────────────────────────────────

const DB_NAME = 'klavora_logs';
const DB_VERSION = 1;
const STORE_NAME = 'error_logs';

function openLogsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-flushed', 'flushed');
        store.createIndex('by-timestamp', 'timestamp');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeLog(entry: Omit<LogEntry, 'id'>): Promise<void> {
  try {
    const db = await openLogsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB not available (e.g., private mode) — silently skip
  }
}

async function getPendingLogs(): Promise<LogEntry[]> {
  try {
    const db = await openLogsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by-flushed');
      const req = index.getAll(IDBKeyRange.only(false));
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function markLogsAsFlushed(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const db = await openLogsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach(id => {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) {
            store.put({ ...req.result, flushed: true });
          }
        };
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Don't break on mark failure
    });
  } catch {
    // Silently fail
  }
}

/** Prune flushed logs older than 7 days to avoid unbounded growth */
async function pruneOldLogs(): Promise<void> {
  try {
    const db = await openLogsDB();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by-timestamp');
      const range = IDBKeyRange.upperBound(cutoff);
      const req = index.openCursor(range);
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (cursor.value.flushed) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

// ── User context (set by AppContext after login) ───────────────────────────

let _userId: string | undefined;
let _pharmacyId: string | undefined;

export function setLoggerUserContext(userId?: string, pharmacyId?: string) {
  _userId = userId;
  _pharmacyId = pharmacyId;
}

// ── Core log function ──────────────────────────────────────────────────────

async function writeLog(
  level: LogLevel,
  message: string,
  opts: { context?: string; stack?: string; extra?: Record<string, any> } = {}
): Promise<void> {
  const entry: Omit<LogEntry, 'id'> = {
    level,
    message: String(message).slice(0, 2000),
    context: opts.context,
    stack: opts.stack?.slice(0, 3000),
    extra: opts.extra,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    pharmacyId: _pharmacyId,
    userId: _userId,
    timestamp: new Date().toISOString(),
    flushed: false,
  };

  // Always mirror to the browser console in development
  if (import.meta.env.DEV) {
    const args = [
      `[Klavora ${level.toUpperCase()}]`,
      opts.context ? `[${opts.context}]` : '',
      message,
      opts.extra || '',
    ].filter(Boolean);
    if (level === 'error') console.error(...args);
    else if (level === 'warn') console.warn(...args);
    else console.info(...args);
  }

  await storeLog(entry);

  // Attempt an immediate flush if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    flushLogs().catch(() => {});
  }
}

// ── Flush to backend ───────────────────────────────────────────────────────

let _isFlushing = false;

export async function flushLogs(): Promise<void> {
  if (_isFlushing) return;
  _isFlushing = true;
  try {
    const pending = await getPendingLogs();
    if (pending.length === 0) return;

    // Get auth token for the request
    let token: string | null = null;
    try {
      const { getMeta } = await import('./offlineDB');
      token = await getMeta('auth_token');
    } catch {}

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${getApiBaseUrl()}/logs`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ logs: pending }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const ids = pending.map(l => l.id!).filter(Boolean);
      await markLogsAsFlushed(ids);
    }
  } catch {
    // Network failure — logs stay in IndexedDB for next flush
  } finally {
    _isFlushing = false;
  }
}

// ── Global error capture ───────────────────────────────────────────────────

let _globalHandlersAttached = false;

export function attachGlobalErrorHandlers(): void {
  if (_globalHandlersAttached || typeof window === 'undefined') return;
  _globalHandlersAttached = true;

  window.addEventListener('error', (event) => {
    // Ignore cross-origin script errors (no useful info)
    if (!event.message || event.message === 'Script error.') return;

    writeLog('error', event.message, {
      context: 'uncaught-error',
      stack: event.error?.stack,
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : JSON.stringify(reason);

    // Don't log aborted fetches (they're intentional)
    if (message?.includes('AbortError') || message?.includes('signal')) return;

    writeLog('error', `Unhandled Promise Rejection: ${message}`, {
      context: 'unhandled-rejection',
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  // Flush any pending logs when the browser goes online
  window.addEventListener('online', () => {
    flushLogs().catch(() => {});
    pruneOldLogs().catch(() => {});
  });

  // Flush before the user closes the tab
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushLogs().catch(() => {});
    }
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export const logger = {
  error(message: string, opts: { context?: string; error?: Error | unknown; extra?: Record<string, any> } = {}) {
    const err = opts.error;
    const stack = err instanceof Error ? err.stack : undefined;
    const extra = err instanceof Error
      ? { ...opts.extra, errorName: err.name }
      : opts.extra;
    return writeLog('error', message, { context: opts.context, stack, extra });
  },

  warn(message: string, opts: { context?: string; extra?: Record<string, any> } = {}) {
    return writeLog('warn', message, opts);
  },

  info(message: string, opts: { context?: string; extra?: Record<string, any> } = {}) {
    return writeLog('info', message, opts);
  },
};
