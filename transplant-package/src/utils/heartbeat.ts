import { getApiBaseUrl } from './api';

type HeartbeatStatus = 'online' | 'offline';
type StatusListener = (status: HeartbeatStatus) => void;

class HeartbeatServiceClass {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<StatusListener> = new Set();
  
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private readonly MAX_FAILURES = 3;
  private readonly REQUIRED_SUCCESSES = 2;
  private readonly PING_INTERVAL_MS = 20_000;
  private readonly PING_TIMEOUT_MS = 4_000;
  private readonly MIN_STATE_DURATION_MS = 10_000;
  
  private lastStateChangeTime = 0;
  private isRunning = false;
  private checkInFlight = false;

  constructor() {
    if (typeof window === 'undefined') return;
    
    // Listen for browser online/offline events
    window.addEventListener('online', () => {
      this.forcePing();
    });

    window.addEventListener('offline', () => {
      this.setOnlineState(false);
    });

    // Listen for custom network failure events from api.ts
    window.addEventListener('klavora-network-error', () => {
      this.handlePingFailure();
    });
  }

  public get isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Initial ping
    this.ping();
    
    // Set up regular interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL_MS);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async forcePing(): Promise<boolean> {
    await this.ping();
    return this.isOnline;
  }

  public setOfflineFromNetworkError() {
    this.handlePingFailure();
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state to new subscriber
    listener(this.isOnline ? 'online' : 'offline');
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async isInternetReachable(): Promise<boolean> {
    // 1. If browser definitely says offline, return false
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.')
    );

    // If on localhost, ping an external probe to verify true internet reachability
    // (since localhost backend continues to respond 200 OK even without internet)
    if (isLocalhost) {
      try {
        const extController = new AbortController();
        const extTimeout = setTimeout(() => extController.abort(), 3000);
        // Use a lightweight, high-availability public endpoint
        await fetch(`https://dns.google/resolve?name=example.com&_t=${Date.now()}`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          signal: extController.signal
        });
        clearTimeout(extTimeout);
      } catch {
        // External probe failed -> no true internet connection
        return false;
      }
    }

    // 2. Ping backend health
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.PING_TIMEOUT_MS);
      
      await fetch(`${getApiBaseUrl()}/health`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache, no-store' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Any HTTP response (even 500) means the server/network is reachable.
      // Only exceptions (like timeouts or DNS failures) should return false.
      return true;
    } catch {
      return false;
    }
  }

  private async ping() {
    if (this.checkInFlight) return;
    this.checkInFlight = true;
    
    try {
      const reachable = await this.isInternetReachable();
      if (reachable) {
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses += 1;
        if (this.consecutiveSuccesses >= this.REQUIRED_SUCCESSES) {
          this.setOnlineState(true);
        }
      } else {
        this.handlePingFailure();
      }
    } finally {
      this.checkInFlight = false;
    }
  }
  
  private handlePingFailure() {
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.MAX_FAILURES) {
      this.setOnlineState(false);
    }
  }

  private setOnlineState(online: boolean) {
    if (this.isOnline !== online) {
      const now = Date.now();
      if (this.lastStateChangeTime !== 0 && now - this.lastStateChangeTime < this.MIN_STATE_DURATION_MS) {
        // Too soon to change state again, ignore
        return;
      }

      this.isOnline = online;
      this.lastStateChangeTime = now;
      
      if (!online) {
        this.consecutiveFailures = this.MAX_FAILURES;
        this.consecutiveSuccesses = 0;
      } else {
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = this.REQUIRED_SUCCESSES;
      }
      
      const status: HeartbeatStatus = online ? 'online' : 'offline';
      this.listeners.forEach(listener => listener(status));
    }
  }
}

export const HeartbeatService = new HeartbeatServiceClass();
