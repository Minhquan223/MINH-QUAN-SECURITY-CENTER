import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { NetworkView } from './components/NetworkView';
import { SecurityEventsView } from './components/SecurityEventsView';
import { ServicesView } from './components/ServicesView';
import { LogsView } from './components/LogsView';
import { ForensicsView } from './components/ForensicsView';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { apiService } from './services/api';
import type {
  SystemMetrics,
  NetworkData,
  ServiceDaemon,
  SecurityEvent,
  LogEntry,
  ConnectionState,
} from './types/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('RECONNECTING');

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [services, setServices] = useState<ServiceDaemon[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    setConnectionState('RECONNECTING');
    setLoadError(null);

    try {
      const [sys, net, svcs, events, logItems] = await Promise.all([
        apiService.getSystemMetrics(),
        apiService.getNetworkData(),
        apiService.getServices(),
        apiService.getSecurityEvents(),
        apiService.getLogs(),
      ]);

      setSystemMetrics(sys);
      setNetworkData(net);
      setServices(svcs);
      setSecurityEvents(events);
      setLogs(logItems);
      setConnectionState('LIVE');
    } catch (err) {
      console.error('[App] Error loading real API data:', err);
      setConnectionState('OFFLINE');
      setLoadError('Unable to connect to the Security Center API.');
    }
  }, []);

  useEffect(() => {
    loadAllData();

    const unsubscribe = apiService.subscribeToStream({
      onStatusChange: (status) => {
        setConnectionState(status);
      },

      onMetrics: (metricsDelta) => {
        setSystemMetrics((prev) => {
          if (!prev) return prev;

          const updated = { ...prev };

          if (metricsDelta.cpu) {
            updated.cpu = { ...updated.cpu, ...metricsDelta.cpu };
          }

          if (metricsDelta.ram) {
            updated.ram = { ...updated.ram, ...metricsDelta.ram };
          }

          if (metricsDelta.loadAvg) {
            updated.loadAvg = metricsDelta.loadAvg;
          }

          if (metricsDelta.timestamp) {
            updated.lastSync = metricsDelta.timestamp;
            updated.heartbeatAgeSeconds = 0;
          }

          return updated;
        });
      },

      onEvent: (streamEvt) => {
        if (streamEvt.type === 'security_event' && streamEvt.data) {
          const newEvent = streamEvt.data as SecurityEvent;

          setSecurityEvents((prev) => {
            if (prev.some((e) => e.id === newEvent.id)) return prev;
            return [newEvent, ...prev];
          });
        }
      },
    });

    return unsubscribe;
  }, [loadAllData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAlertsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadAlertsCount = securityEvents.filter(
    (event) =>
      event.severity === 'CRITICAL' || event.severity === 'WARNING',
  ).length;

  /*
   * Never render mock telemetry.
   * Until the real API responds, show a simple loading/offline state.
   */
  if (!systemMetrics || !networkData) {
    return (
      <div className="min-h-screen bg-surface text-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-400 mb-3">
            MINH QUAN SECURITY CENTER
          </div>

          {connectionState === 'OFFLINE' ? (
            <>
              <div className="text-xl font-semibold mb-2">
                Security API Offline
              </div>
              <div className="text-sm text-slate-400 mb-5">
                {loadError || 'Unable to load real server telemetry.'}
              </div>
              <button
                onClick={loadAllData}
                className="px-4 py-2 rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition"
              >
                Reconnect
              </button>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold mb-2">
                Connecting to homesv...
              </div>
              <div className="text-sm text-slate-400">
                Loading live security telemetry
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadAlertsCount={unreadAlertsCount}
        heartbeatTime={systemMetrics.lastSync}
        heartbeatAge={systemMetrics.heartbeatAgeSeconds}
      />

      <div className="pl-72">
        <Header
          activeTab={activeTab}
          connectionState={connectionState}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          loadAvg={systemMetrics.loadAvg}
          unreadAlertsCount={unreadAlertsCount}
          onReconnect={loadAllData}
        />

        <main className="relative pt-16 bg-surface min-h-screen w-full px-gutter py-space-lg">
          {activeTab === 'overview' && (
            <OverviewView
              metrics={systemMetrics}
              network={networkData}
              services={services}
              liveEvents={securityEvents}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === 'network' && (
            <NetworkView network={networkData} />
          )}

          {activeTab === 'security-events' && (
            <SecurityEventsView
              events={securityEvents}
              onNavigateTab={(t) => setActiveTab(t)}
              onRefreshFeed={loadAllData}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView services={services} />
          )}

          {activeTab === 'logs' && <LogsView logs={logs} />}

          {activeTab === 'forensics' && <ForensicsView />}

          {activeTab === 'settings' && (
            <SettingsView
              connectionState={connectionState}
              onRefreshAll={loadAllData}
            />
          )}
        </main>
      </div>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={securityEvents}
        services={services}
        onNavigateTab={(t) => setActiveTab(t)}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={securityEvents}
        onNavigateTab={(t) => {
          setIsAlertsOpen(false);
          setActiveTab(t);
        }}
      />
    </div>
  );
}
