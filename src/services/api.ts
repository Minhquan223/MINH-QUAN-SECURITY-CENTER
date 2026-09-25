/**
 * Dedicated API Service Layer
 * Clean abstraction layer for consuming backend Debian Linux SOC endpoints:
 *   GET /api/system
 *   GET /api/network
 *   GET /api/services
 *   GET /api/security/events
 *   GET /api/logs
 *   GET /api/events/stream (Server-Sent Events)
 *
 * Supports switching between live Debian backend and mock provider during development.
 */

import {
  SystemMetrics,
  NetworkData,
  ServiceDaemon,
  SecurityEvent,
  LogEntry,
  StreamEvent,
  ConnectionState,
} from '../types/api';
import * as mockProvider from './mockProvider';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY_BASE_URL = 'minhquan_api_base_url';
const STORAGE_KEY_USE_MOCK = 'minhquan_use_mock';

class ApiService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = localStorage.getItem(STORAGE_KEY_BASE_URL) || DEFAULT_API_BASE;
    // By default, if VITE_USE_MOCK_API is explicitly set to 'false', start with mock disabled;
    // otherwise fallback to false if backend is responding or true if purely static preview.
    const savedMockSetting = localStorage.getItem(STORAGE_KEY_USE_MOCK);
    if (savedMockSetting !== null) {
      this.useMock = savedMockSetting === 'true';
    } else {
      this.useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_BASE_URL, this.baseUrl);
  }

  public isMockEnabled(): boolean {
    return this.useMock;
  }

  public setMockEnabled(enabled: boolean) {
    this.useMock = enabled;
    localStorage.setItem(STORAGE_KEY_USE_MOCK, String(enabled));
  }

  private async request<T>(endpoint: string, fallbackMockData: T): Promise<T> {
    if (this.useMock) {
      // Small simulated latency for realism
      await new Promise((r) => setTimeout(r, 60));
      return fallbackMockData;
    }

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (err) {
      console.error(`[ApiService] Request to ${endpoint} failed.`, err);
      throw err;
    }
  }

  public async getSystemMetrics(): Promise<SystemMetrics> {
    return this.request<SystemMetrics>('/system', mockProvider.mockSystemMetrics);
  }

  public async getNetworkData(): Promise<NetworkData> {
    return this.request<NetworkData>('/network', mockProvider.mockNetworkData);
  }

  public async getServices(): Promise<ServiceDaemon[]> {
    return this.request<ServiceDaemon[]>('/services', mockProvider.mockServices);
  }

  public async getSecurityEvents(filters?: {
    query?: string;
    severity?: string;
    subsystem?: string;
  }): Promise<SecurityEvent[]> {
    let endpoint = '/security/events';
    const params = new URLSearchParams();
    if (filters?.query) params.set('q', filters.query);
    if (filters?.severity && filters.severity !== 'ALL') params.set('severity', filters.severity);
    if (filters?.subsystem) params.set('subsystem', filters.subsystem);

    const qs = params.toString();
    if (qs) endpoint += `?${qs}`;

    let events = await this.request<SecurityEvent[]>(endpoint, mockProvider.mockSecurityEvents);

    if (this.useMock && filters) {
      if (filters.severity && filters.severity !== 'ALL') {
        events = events.filter((e) => e.severity === filters.severity);
      }
      if (filters.subsystem) {
        events = events.filter((e) => e.subsystem === filters.subsystem);
      }
      if (filters.query) {
        const q = filters.query.toLowerCase();
        events = events.filter(
          (e) =>
            e.source.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.diagnosis && e.diagnosis.toLowerCase().includes(q)),
        );
      }
    }

    return events;
  }

  public async getLogs(filters?: {
    service?: string;
    severity?: string;
    regex?: string;
  }): Promise<LogEntry[]> {
    let endpoint = '/logs';
    const params = new URLSearchParams();
    if (filters?.service && filters.service !== 'ALL') params.set('service', filters.service);
    if (filters?.severity && filters.severity !== 'ALL') params.set('severity', filters.severity);
    if (filters?.regex) params.set('regex', filters.regex);

    const qs = params.toString();
    if (qs) endpoint += `?${qs}`;

    let logs = await this.request<LogEntry[]>(endpoint, mockProvider.mockLogs);

    if (this.useMock && filters) {
      if (filters.service && filters.service !== 'ALL') {
        logs = logs.filter((l) => l.service.toLowerCase().includes(filters.service!.toLowerCase()));
      }
      if (filters.severity && filters.severity !== 'ALL') {
        logs = logs.filter((l) => l.severity === filters.severity);
      }
      if (filters.regex) {
        try {
          const reg = new RegExp(filters.regex, 'i');
          logs = logs.filter((l) => reg.test(l.message) || reg.test(l.service));
        } catch {
          // ignore invalid regex
        }
      }
    }

    return logs;
  }

  /**
   * Realtime Stream via Server-Sent Events (SSE)
   * Connects to GET /api/events/stream
   * Auto-reconnects with exponential backoff on drop
   * Exposes LIVE / RECONNECTING / OFFLINE connection states
   */
  public subscribeToEventStream(callbacks: {
    onEvent?: (event: StreamEvent) => void;
    onMetrics?: (metrics: Partial<SystemMetrics>) => void;
    onStatusChange: (status: ConnectionState) => void;
  }): () => void {
    let isDisposed = false;
    let eventSource: EventSource | null = null;
    let mockInterval: number | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;
    const maxBackoffMs = 15000;

    const connectSSE = () => {
      if (isDisposed) return;

      if (this.useMock) {
        // Mock SSE stream emitter simulation
        callbacks.onStatusChange('LIVE');
        let counter = 0;
        mockInterval = window.setInterval(() => {
          if (isDisposed) return;
          counter++;

          // 1. Emit metrics jitter tick every 3 seconds
          if (counter % 3 === 0) {
            const cpuJitter = Math.floor(22 + Math.random() * 6);
            const ramJitter = +(14.2 + (Math.random() * 0.4 - 0.2)).toFixed(1);
            callbacks.onMetrics?.({
              cpu: {
                loadPercent: cpuJitter,
                model: 'AMD Ryzen 7 5700G @ 3.80GHz',
                packageTemp: 41 + Math.floor(Math.random() * 3),
                cores: '8C/16T',
              },
              ram: {
                usedGb: ramJitter,
                totalGb: 32.0,
                usedPercent: Math.round((ramJitter / 32) * 100),
              },
            });
          }

          // 2. Emit occasional real-time security events
          if (counter % 7 === 0) {
            const syntheticEvent: SecurityEvent = {
              id: `sec-${Date.now()}`,
              timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
              severity: counter % 14 === 0 ? 'WARNING' : 'NOTICE',
              category: counter % 14 === 0 ? 'Firewall / nftables' : 'Access / SSH Session',
              subsystem: 'SSH / Auth',
              source: counter % 14 === 0 ? '194.26.29.112 (Tor Exit)' : '100.92.14.2 (MacBook)',
              destination: '192.168.1.100:22',
              process: 'pam_sshd',
              summary:
                counter % 14 === 0
                  ? 'Repeated failed key auth for invalid user test'
                  : 'Automated telemetry poll verified ed25519 fingerprint',
            };

            callbacks.onEvent?.({
              type: 'security_event',
              data: syntheticEvent,
              timestamp: new Date().toISOString(),
            });
          }
        }, 1000);

        return;
      }

      // Live SSE Connection
      callbacks.onStatusChange('RECONNECTING');
      const streamUrl = `${this.baseUrl}/events/stream`;

      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          reconnectAttempts = 0;
          callbacks.onStatusChange('LIVE');
        };

        eventSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data) as StreamEvent;
            if (parsed.type === 'metrics_tick' && parsed.data) {
              callbacks.onMetrics?.(parsed.data);
            }
            callbacks.onEvent?.(parsed);
          } catch (err) {
            console.error('[ApiService SSE Parse Error]', err);
          }
        };

        // Specific named event listener
        eventSource.addEventListener('security_event', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            callbacks.onEvent?.({
              type: 'security_event',
              data,
              timestamp: new Date().toISOString(),
            });
          } catch (err) {
            console.error('[ApiService SSE event err]', err);
          }
        });

        eventSource.addEventListener('metrics', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            callbacks.onMetrics?.(data);
          } catch (err) {
            console.error('[ApiService SSE metrics err]', err);
          }
        });

        eventSource.onerror = () => {
          if (isDisposed) return;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          reconnectAttempts++;
          if (reconnectAttempts > 3) {
            callbacks.onStatusChange('OFFLINE');
          } else {
            callbacks.onStatusChange('RECONNECTING');
          }

          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), maxBackoffMs);
          reconnectTimeout = window.setTimeout(() => {
            connectSSE();
          }, delay);
        };
      } catch (err) {
        console.error('[ApiService SSE Init Error]', err);
        callbacks.onStatusChange('OFFLINE');
      }
    };

    connectSSE();

    return () => {
      isDisposed = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };
  }
}

export const apiService = new ApiService();
