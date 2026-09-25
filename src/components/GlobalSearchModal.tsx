import React, { useState, useEffect } from 'react';
import { SecurityEvent, ServiceDaemon } from '../types/api';
import { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SecurityEvent[];
  services: ServiceDaemon[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectEvent?: (event: SecurityEvent) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  events,
  services,
  onNavigateTab,
  onSelectEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent, but prevent default
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = searchTerm.toLowerCase();

  const matchingServices = q
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.portOrEdge.toLowerCase().includes(q),
      )
    : [];

  const matchingEvents = q
    ? events.filter(
        (e) =>
          e.source.toLowerCase().includes(q) ||
          e.destination.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.incidentId && e.incidentId.toLowerCase().includes(q)),
      )
    : events.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 select-none">
      <div
        className="w-full max-w-2xl bg-surface-container-low rounded-xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-space-md bg-surface-container flex items-center gap-space-sm border-b border-surface-container-high font-mono">
          <span className="material-symbols-outlined text-outline text-[20px]">search</span>
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search IPs (e.g. 185.220), containers, services, CVEs, logs..."
            className="flex-1 bg-transparent text-on-surface font-code-body placeholder:text-outline focus:outline-none"
          />
          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-surface-container-highest text-outline text-[11px] uppercase hover:text-on-surface"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-space-md flex flex-col gap-space-md font-mono text-[12px]">
          {/* Services Matches */}
          {matchingServices.length > 0 && (
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase font-sans">
                Container Daemons & Services ({matchingServices.length})
              </span>
              {matchingServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => {
                    onNavigateTab('services');
                    onClose();
                  }}
                  className="p-space-sm bg-surface-container rounded hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {svc.icon}
                    </span>
                    <span className="text-on-surface font-bold">{svc.name}</span>
                    <span className="text-outline">({svc.category})</span>
                  </div>
                  <span className="text-secondary font-bold">{svc.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Security Events Matches */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase font-sans">
              {q ? `Security Events (${matchingEvents.length})` : 'Recent Security Alerts'}
            </span>
            {matchingEvents.length === 0 ? (
              <div className="text-outline p-space-sm text-center">
                No matching records for "{searchTerm}".
              </div>
            ) : (
              matchingEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(evt);
                    onNavigateTab('security-events');
                    onClose();
                  }}
                  className="p-space-sm bg-surface-container rounded hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`px-1 rounded text-[10px] uppercase font-bold ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-error-container text-on-error-container'
                            : evt.severity === 'WARNING'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-secondary'
                        }`}
                      >
                        {evt.severity}
                      </span>
                      <span className="text-on-surface font-semibold truncate">
                        {evt.summary}
                      </span>
                    </div>
                    <span className="text-outline text-[11px] truncate mt-0.5">
                      {evt.source} ➔ {evt.destination}
                    </span>
                  </div>
                  <span className="text-outline shrink-0">{evt.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
