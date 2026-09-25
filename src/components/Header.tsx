import React from 'react';
import { ConnectionState } from '../types/api';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  connectionState: ConnectionState;
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  loadAvg?: [number, number, number];
  unreadAlertsCount?: number;
  onReconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  connectionState,
  onOpenSearch,
  onOpenAlerts,
  loadAvg = [0.42, 0.38, 0.31],
  unreadAlertsCount = 3,
  onReconnect,
}) => {
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'SYSTEM OVERVIEW // LIVE TELEMETRY';
      case 'network':
        return 'NETWORK TOPOLOGY // MULTI-HOMED THROUGHPUT';
      case 'security-events':
        return 'SECURITY EVENTS // INCIDENT INVESTIGATION';
      case 'services':
        return 'HOST SERVICES // CONTAINER DAEMONS';
      case 'logs':
        return 'JOURNALCTL & CONTAINER LOG DEMUXER';
      case 'forensics':
        return 'DIGITAL FORENSICS // CASE-2025-05-HOMESV-04';
      case 'settings':
        return 'DEBIAN SOC CONFIGURATION // API ENDPOINTS';
      default:
        return 'SYSTEM OVERVIEW // LIVE TELEMETRY';
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 px-gutter border-b border-surface-container/60 select-none">
      <div className="h-16 w-full flex items-center justify-between gap-space-md">
        {/* Breadcrumb Module */}
        <div className="flex items-center gap-space-sm min-w-max">
          <span className="font-code-label text-code-label tracking-widest text-outline uppercase font-semibold">
            Console
          </span>
          <span className="text-outline font-code-body">//</span>
          <span className="font-code-body text-code-body text-primary font-medium tracking-wide">
            {getBreadcrumbTitle()}
          </span>
        </div>

        {/* Global Grep Search Bar */}
        <div className="flex-1 max-w-xl">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-surface-container-lowest px-space-md py-space-xs rounded hover:border hover:border-surface-container-high transition-all text-left group"
          >
            <div className="flex items-center flex-1 mr-space-sm">
              <span className="font-code-label text-code-label text-outline mr-space-sm">
                grep:
              </span>
              <span className="font-code-body text-code-body text-outline group-hover:text-on-surface-variant transition-colors truncate">
                Search IPs, services, CVEs, container IDs...
              </span>
            </div>
            <span className="font-code-label text-code-label text-on-surface-variant bg-surface-container-high px-space-xs py-0.5 rounded shadow-sm shrink-0">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-space-sm">
          {/* Connection Status Badge (LIVE / RECONNECTING / OFFLINE) */}
          <div className="hidden xl:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded border border-surface-container/40">
            {connectionState === 'LIVE' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-code-label text-code-label text-on-surface-variant">
                  SSE STREAM:{' '}
                  <strong className="text-secondary font-bold">LIVE (12ms)</strong>
                </span>
              </>
            )}
            {connectionState === 'RECONNECTING' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-code-label text-code-label text-amber-300">
                  SSE STREAM:{' '}
                  <strong className="font-bold">RECONNECTING...</strong>
                </span>
              </>
            )}
            {connectionState === 'OFFLINE' && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-error" />
                <span className="font-code-label text-code-label text-error font-semibold">
                  SSE STREAM: <strong>OFFLINE</strong>
                </span>
                {onReconnect && (
                  <button
                    onClick={onReconnect}
                    className="ml-1 text-[10px] text-primary hover:underline font-code-label uppercase"
                  >
                    Retry
                  </button>
                )}
              </>
            )}
          </div>

          {/* Linux Load Average */}
          <div className="hidden lg:flex items-center bg-surface-container-low px-space-sm py-space-xs rounded border border-surface-container/40">
            <span className="font-code-label text-code-label text-on-surface-variant">
              LOAD AVG:{' '}
              <strong className="text-on-surface font-code-body font-mono">
                {loadAvg[0].toFixed(2)}, {loadAvg[1].toFixed(2)}, {loadAvg[2].toFixed(2)}
              </strong>
            </span>
          </div>

          {/* Alert Notification Button */}
          <button
            onClick={onOpenAlerts}
            aria-label="Alert Notifications"
            className="relative p-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title={`${unreadAlertsCount} unread security notifications`}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error animate-pulse" />
            )}
          </button>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-space-sm bg-surface-container-low pl-space-sm pr-space-md py-space-xs rounded border border-surface-container/40">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-code-body text-code-body text-on-surface font-semibold leading-tight font-mono">
                quan@homesv
              </span>
              <span className="font-code-label text-code-label text-secondary tracking-widest leading-tight uppercase font-bold">
                SEC_ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
