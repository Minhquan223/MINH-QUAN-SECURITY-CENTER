import React from 'react';
import { ShieldLogo } from './ShieldLogo';

export type NavTab =
  | 'overview'
  | 'network'
  | 'security-events'
  | 'services'
  | 'logs'
  | 'forensics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadAlertsCount?: number;
  heartbeatTime?: string;
  heartbeatAge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadAlertsCount = 3,
  heartbeatTime = '14:28:02 UTC',
  heartbeatAge = 2,
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between select-none border-r border-surface-container/60">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-space-lg bg-surface-container-low border-b border-surface-container/40">
          <div className="flex items-center gap-space-sm">
            <ShieldLogo className="h-9 w-9 object-contain shrink-0" size={36} />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface font-bold leading-none">
                  Minh Quan
                </span>
              </div>
              <span className="font-code-label text-code-label tracking-widest text-primary uppercase font-medium mt-0.5">
                Security Center
              </span>
            </div>
          </div>
          <div className="mt-space-md flex items-center justify-between bg-surface-container px-space-sm py-space-xs rounded">
            <span className="font-code-label text-code-label text-on-surface-variant uppercase">
              Host Platform
            </span>
            <span className="font-code-label text-code-label text-primary font-bold tracking-wider">
              DEBIAN 12 / SOC
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-space-xs p-space-md mt-space-xs">
          {/* Overview */}
          <button
            onClick={() => onTabChange('overview')}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'overview'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="font-body-md text-body-md">Overview</span>
            </div>
            <span
              className={`font-code-label text-code-label uppercase px-space-xs py-0.5 rounded ${
                activeTab === 'overview'
                  ? 'bg-surface-container-lowest/80 text-primary-fixed'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              RT
            </span>
          </button>

          {/* Network */}
          <button
            onClick={() => onTabChange('network')}
            aria-current={activeTab === 'network' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'network'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="font-body-md text-body-md">Network</span>
            </div>
            <span
              className={`font-code-label text-code-label uppercase px-space-xs py-0.5 rounded ${
                activeTab === 'network'
                  ? 'bg-surface-container-lowest/80 text-primary-fixed'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              1Gbps
            </span>
          </button>

          {/* Security Events */}
          <button
            onClick={() => onTabChange('security-events')}
            aria-current={activeTab === 'security-events' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'security-events'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span className="font-body-md text-body-md">Security Events</span>
            </div>
            <span className="font-code-label text-code-label uppercase px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-bold">
              {unreadAlertsCount} unread
            </span>
          </button>

          {/* Services */}
          <button
            onClick={() => onTabChange('services')}
            aria-current={activeTab === 'services' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'services'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">memory</span>
              <span className="font-body-md text-body-md">Services</span>
            </div>
            <span
              className={`font-code-label text-code-label uppercase px-space-xs py-0.5 rounded ${
                activeTab === 'services'
                  ? 'bg-surface-container-lowest/80 text-primary-fixed'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              12 active
            </span>
          </button>

          {/* Logs */}
          <button
            onClick={() => onTabChange('logs')}
            aria-current={activeTab === 'logs' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'logs'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span className="font-body-md text-body-md">Logs</span>
            </div>
            <span
              className={`font-code-label text-code-label uppercase px-space-xs py-0.5 rounded ${
                activeTab === 'logs'
                  ? 'bg-surface-container-lowest/80 text-primary-fixed'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              syslog
            </span>
          </button>

          {/* Forensics */}
          <button
            onClick={() => onTabChange('forensics')}
            aria-current={activeTab === 'forensics' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'forensics'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
              <span className="font-body-md text-body-md">Forensics</span>
            </div>
            <span className="font-code-label text-code-label uppercase px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">
              CASE-04
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onTabChange('settings')}
            aria-current={activeTab === 'settings' ? 'page' : undefined}
            className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left w-full ${
              activeTab === 'settings'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="font-body-md text-body-md">Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Host Status Footer */}
      <div className="p-space-md bg-surface-container-lowest flex flex-col gap-space-xs border-t border-surface-container/40">
        <div className="bg-surface-container-low p-space-sm rounded flex flex-col gap-space-xs shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-code-label text-code-label font-bold text-on-surface truncate">
              HOMESV (debian-x86_64)
            </span>
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-code-label text-code-label text-secondary">
                STATUS: NOMINAL
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between font-code-label text-code-label text-on-surface-variant">
            <span className="text-outline">Kernel</span>
            <span className="text-on-surface font-mono">6.1.0-21-amd64</span>
          </div>
          <div className="flex items-center justify-between font-code-label text-code-label text-on-surface-variant">
            <span className="text-outline">Heartbeat</span>
            <span className="text-on-surface font-mono">
              {heartbeatTime} ({heartbeatAge}s ago)
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
