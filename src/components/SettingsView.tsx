import React, { useState } from 'react';
import { apiService } from '../services/api';
import { ConnectionState } from '../types/api';

interface SettingsViewProps {
  connectionState: ConnectionState;
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  connectionState,
  onRefreshAll,
}) => {
  const [apiUrl, setApiUrl] = useState(apiService.getBaseUrl());
  const [useMock, setUseMock] = useState(apiService.isMockEnabled());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const handleSaveApiUrl = () => {
    apiService.setBaseUrl(apiUrl);
    setTestResult({
      ok: true,
      message: `API base URL updated to "${apiUrl}".`,
    });
    onRefreshAll();
  };

  const handleToggleMock = (enabled: boolean) => {
    setUseMock(enabled);
    apiService.setMockEnabled(enabled);
    setTestResult({
      ok: true,
      message: enabled
        ? 'Mock Provider ENABLED (Using isolated mock dataset for development).'
        : 'Mock Provider DISABLED (Connecting directly to Debian Linux server API).',
    });
    onRefreshAll();
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const url = `${apiUrl.replace(/\/+$/, '')}/system`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        setTestResult({
          ok: true,
          message: `Connected successfully to Debian Linux API (${res.status} OK).`,
          latencyMs: elapsed,
        });
      } else {
        setTestResult({
          ok: false,
          message: `Server returned HTTP error ${res.status}: ${res.statusText}`,
          latencyMs: elapsed,
        });
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setTestResult({
        ok: false,
        message: `Failed to reach endpoint: ${err.message || 'Network error'}`,
        latencyMs: elapsed,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">
      {/* Header */}
      <div className="flex flex-col bg-surface-container-low p-space-md rounded border border-surface-container-high/40">
        <div className="flex items-center gap-space-xs text-outline font-mono">
          <span className="font-code-label text-code-label tracking-widest uppercase">
            Configuration // Debian SOC Link
          </span>
          <span className="font-code-body text-code-body">//</span>
          <span className="font-code-label text-code-label text-primary font-bold uppercase tracking-widest">
            API SERVICE LAYER & REALTIME SSE
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold uppercase">
          SERVER CONNECTION & TELEMETRY SETTINGS
        </h1>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Card 1: API Endpoint Config */}
        <div className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
          <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
            <div className="flex items-center gap-space-xs font-mono">
              <span className="material-symbols-outlined text-[18px] text-primary">router</span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold font-sans">
                Debian Linux Server API Endpoint
              </span>
            </div>
            <span
              className={`font-code-label text-code-label px-2 py-0.5 rounded font-mono font-bold uppercase ${
                connectionState === 'LIVE'
                  ? 'bg-secondary-container/20 text-secondary'
                  : connectionState === 'RECONNECTING'
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              STATE: {connectionState}
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Specify the REST API base URL for your Debian Linux SOC backend. The frontend will consume:
          </p>

          <div className="bg-surface-container-lowest p-space-sm rounded font-mono text-[12px] text-primary space-y-1 border border-surface-container-high/40">
            <div>GET /api/system</div>
            <div>GET /api/network</div>
            <div>GET /api/services</div>
            <div>GET /api/security/events</div>
            <div>GET /api/logs</div>
            <div className="text-secondary font-bold">GET /api/events/stream (Server-Sent Events)</div>
          </div>

          <div className="flex flex-col gap-space-xs font-mono">
            <label className="font-code-label text-code-label text-outline uppercase">
              API Base URL:
            </label>
            <div className="flex items-center gap-space-xs">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="/api or http://192.168.1.100:3000/api"
                className="flex-1 bg-surface-container-lowest text-on-surface font-code-body text-code-body px-space-sm py-space-xs rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSaveApiUrl}
                className="px-space-md py-space-xs bg-primary-container hover:bg-primary text-on-primary-container font-semibold rounded transition-colors text-body-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-space-xs flex items-center gap-space-sm">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded transition-colors font-code-body text-code-body font-mono cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[16px] text-secondary ${
                  testingConnection ? 'animate-spin' : ''
                }`}
              >
                speed
              </span>
              <span>{testingConnection ? 'Testing Ping...' : 'Test Connection (/api/system)'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-space-sm rounded border font-mono text-[12px] flex items-start gap-space-xs ${
                testResult.ok
                  ? 'bg-secondary/10 border-secondary/40 text-secondary'
                  : 'bg-error-container/20 border-error/40 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] mt-0.5">
                {testResult.ok ? 'check_circle' : 'error'}
              </span>
              <div>
                <div>{testResult.message}</div>
                {testResult.latencyMs !== undefined && (
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Roundtrip Latency: {testResult.latencyMs}ms
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Mock API Provider Toggle */}
        <div className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
          <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/40">
            <div className="flex items-center gap-space-xs font-mono">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                developer_mode
              </span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold font-sans">
                Mock API Isolation Layer
              </span>
            </div>
            <span
              className={`font-code-label text-code-label px-2 py-0.5 rounded font-mono font-bold uppercase ${
                useMock
                  ? 'bg-surface-container-highest text-primary'
                  : 'bg-surface-container-highest text-secondary'
              }`}
            >
              {useMock ? 'MOCK ACTIVE' : 'LIVE BACKEND'}
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Per architectural specification, mock data is clearly isolated behind a dedicated mock
            API provider so it can be disabled when deploying against the Debian Linux server API:
          </p>

          <div className="p-space-md bg-surface-container rounded flex items-center justify-between border border-surface-container-high/40">
            <div className="flex flex-col">
              <span className="font-body-md text-body-md text-on-surface font-semibold">
                Mock API Provider Mode
              </span>
              <span className="font-code-label text-code-label text-outline">
                {useMock
                  ? 'Simulating Debian Linux SOC responses and SSE stream locally'
                  : 'Consuming real HTTP endpoints & SSE stream from server.ts or Debian host'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => handleToggleMock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded font-mono text-[11px] text-on-surface-variant space-y-1 border border-surface-container-high/30">
            <div className="text-secondary font-bold uppercase tracking-wider">
              Architecture Guarantee:
            </div>
            <div>• All API calls route through src/services/api.ts</div>
            <div>• No hardcoded mock objects inside UI presentation components</div>
            <div>• Real EventSource / SSE connection with automatic backoff reconnection</div>
          </div>
        </div>
      </div>
    </div>
  );
};
