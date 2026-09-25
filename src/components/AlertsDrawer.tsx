import React from 'react';
import { SecurityEvent } from '../types/api';
import { NavTab } from './Sidebar';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: SecurityEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectEvent?: (event: SecurityEvent) => void;
  onClearAlerts?: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onNavigateTab,
  onSelectEvent,
  onClearAlerts,
}) => {
  if (!isOpen) return null;

  const alertEvents = events.filter((e) => e.severity === 'CRITICAL' || e.severity === 'WARNING');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end select-none">
      <div
        className="w-full max-w-md bg-surface-container-low h-full shadow-2xl border-l border-surface-container-high flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-space-lg bg-surface-container flex items-center justify-between border-b border-surface-container-high font-mono">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-error text-[20px]">
                notifications_active
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">
                Host Security Alerts
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* List of critical/warning alerts */}
          <div className="p-space-md flex flex-col gap-space-sm overflow-y-auto max-h-[calc(100vh-140px)]">
            {alertEvents.length === 0 ? (
              <div className="p-space-lg text-center font-code-body text-outline font-mono">
                No active critical or warning triage alerts.
              </div>
            ) : (
              alertEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(evt);
                    onNavigateTab('security-events');
                    onClose();
                  }}
                  className="p-space-md bg-surface-container rounded hover:bg-surface-container-high transition-colors flex flex-col gap-1 cursor-pointer border border-transparent hover:border-error/30"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-code-label text-code-label text-outline">
                      {evt.timestamp}
                    </span>
                    <span
                      className={`font-code-label text-code-label px-1 py-0.5 rounded font-bold uppercase ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-error text-on-error'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>
                  <h4 className="font-code-body text-code-body text-error font-bold leading-tight">
                    {evt.summary}
                  </h4>
                  <div className="flex items-center justify-between font-code-label text-code-label text-outline font-mono pt-1">
                    <span>SRC: {evt.source}</span>
                    <span>{evt.process || evt.subsystem}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container border-t border-surface-container-high flex items-center justify-between font-mono">
          <button
            onClick={() => {
              if (onClearAlerts) onClearAlerts();
              onClose();
            }}
            className="text-on-surface-variant hover:text-on-surface text-[12px] uppercase font-semibold"
          >
            Mark All as Reviewed
          </button>
          <button
            onClick={() => {
              onNavigateTab('security-events');
              onClose();
            }}
            className="px-space-md py-1 bg-primary-container text-on-primary-container font-bold rounded text-[12px] uppercase"
          >
            View Triage Dock →
          </button>
        </div>
      </div>
    </div>
  );
};
