/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { SecurityEventsView } from './components/SecurityEventsView';
import { LogsView } from './components/LogsView';
import { ForensicsView } from './components/ForensicsView';
import { NetworkView } from './components/NetworkView';
import { ServicesView } from './components/ServicesView';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { apiService } from './services/api';
import {
  SystemMetrics,
  NetworkData,
  ServiceDaemon,
  SecurityEvent,
  LogEntry,
  ConnectionState,
} from './types/api';
import * as mockProvider from './services/mockProvider';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [connectionState, setConnectionState] = useState<ConnectionState>('LIVE');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(mockProvider.mockSystemMetrics);
  const [networkData, setNetworkData] = useState<NetworkData>(mockProvider.mockNetworkData);
  const [services, setServices] = useState<ServiceDaemon[]>(mockProvider.mockServices);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(
    mockProvider.mockSecurityEvents,
  );
  const [logs, setLogs] = useState<LogEntry[]>(mockProvider.mockLogs);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Fetch initial data
  const loadAllData = useCallback(async () => {
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
    } catch (err) {
      console.warn('[App] Error loading initial metrics', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Subscribe to Realtime SSE Event Stream
  useEffect(() => {
    const unsubscribe = apiService.subscribeToEventStream({
      onStatusChange: (status) => {
        setConnectionState(status);
      },
      onMetrics: (metricsDelta) => {
        setSystemMetrics((prev) => {
          const updated = { ...prev };
          if (metricsDelta.cpu) {
            updated.cpu = { ...prev.cpu, ...metricsDelta.cpu };
          }
          if (metricsDelta.ram) {
            updated.ram = { ...prev.ram, ...metricsDelta.ram };
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

    return () => {
      unsubscribe();
    };
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadAlertsCount = securityEvents.filter(
    (e) => e.severity === 'CRITICAL' || e.severity === 'WARNING',
  ).length;

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar Navigation */}
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

      {/* Main View Area Offset by Sidebar (72 = 18rem = 288px) */}
      <div className="pl-72">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          connectionState={connectionState}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          loadAvg={systemMetrics.loadAvg}
          unreadAlertsCount={unreadAlertsCount}
          onReconnect={() => loadAllData()}
        />

        {/* View Content */}
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

          {activeTab === 'network' && <NetworkView network={networkData} />}

          {activeTab === 'security-events' && (
            <SecurityEventsView
              events={securityEvents}
              onNavigateTab={(t) => setActiveTab(t)}
              onRefreshFeed={() => loadAllData()}
            />
          )}

          {activeTab === 'services' && <ServicesView services={services} />}

          {activeTab === 'logs' && <LogsView logs={logs} />}

          {activeTab === 'forensics' && <ForensicsView />}

          {activeTab === 'settings' && (
            <SettingsView
              connectionState={connectionState}
              onRefreshAll={() => loadAllData()}
            />
          )}
        </main>
      </div>

      {/* Global Search Dialog Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={securityEvents}
        services={services}
        onNavigateTab={(t) => setActiveTab(t)}
      />

      {/* Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={securityEvents}
        onNavigateTab={(t) => setActiveTab(t)}
        onClearAlerts={() => {
          // optional clear
        }}
      />
    </div>
  );
}
