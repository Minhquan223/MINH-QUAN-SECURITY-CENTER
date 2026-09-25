import React, { useState } from 'react';
import { ServiceDaemon } from '../types/api';

interface ServicesViewProps {
  services: ServiceDaemon[];
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<ServiceDaemon>(services[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestart = (id: string, name: string) => {
    setRestartingId(id);
    setTimeout(() => {
      setRestartingId(null);
      showToast(`Service [${name}] restart signal dispatched successfully.`);
    }, 1200);
  };

  const filtered = services.filter((s) => {
    if (categoryFilter === 'ALL') return true;
    return s.category === categoryFilter;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-primary text-on-surface px-space-md py-space-sm rounded shadow-xl flex items-center gap-space-sm font-code-body animate-fade-in">
          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded border border-surface-container-high/40">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-outline font-mono">
            <span className="font-code-label text-code-label tracking-widest uppercase">
              Host Platform & Daemons
            </span>
            <span className="font-code-body text-code-body">//</span>
            <span className="font-code-label text-code-label text-primary font-bold uppercase tracking-widest">
              SYSTEMD + MOBY ENGINE
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold uppercase">
            HOST SERVICES & CONTAINER DAEMONS // 12 ACTIVE
          </h1>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-space-xs flex-wrap font-mono">
          {['ALL', 'SYSTEM', 'WEB/PROXY', 'MEDIA/STORAGE', 'DATABASE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-space-sm py-1 font-code-label text-code-label rounded transition-colors uppercase ${
                categoryFilter === cat
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Left Service Cards Grid, Right Service Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left 8 cols: Service Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              onClick={() => setSelectedService(svc)}
              className={`p-space-md rounded-lg flex flex-col justify-between transition-all cursor-pointer border ${
                selectedService.id === svc.id
                  ? 'bg-surface-container ring-1 ring-primary border-primary/50 shadow-md'
                  : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-space-xs font-mono">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {svc.icon}
                    </span>
                    <span className="font-code-body text-code-body text-on-surface font-bold">
                      {svc.name}
                    </span>
                  </div>
                  <span
                    className={`font-code-label text-code-label px-1 rounded uppercase font-semibold ${
                      svc.statusBadge === 'WARNING'
                        ? 'bg-surface-container-highest text-secondary font-bold'
                        : 'bg-surface-container-highest text-secondary'
                    }`}
                  >
                    {svc.statusBadge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-xs font-code-body text-code-body text-outline my-space-xs font-mono">
                  <div>
                    CPU: <span className="text-on-surface">{svc.cpu}</span>
                  </div>
                  <div>
                    MEM: <span className="text-on-surface">{svc.mem}</span>
                  </div>
                  <div>
                    UPTIME: <span className="text-on-surface">{svc.uptime}</span>
                  </div>
                  <div>
                    REST:{' '}
                    <span
                      className={`font-bold ${
                        svc.restarts > 0 ? 'text-on-surface' : 'text-secondary'
                      }`}
                    >
                      {svc.restarts}
                    </span>
                  </div>
                </div>
              </div>
              <span className="font-code-label text-code-label text-on-surface-variant truncate font-mono mt-1">
                {svc.portOrEdge}
              </span>
            </div>
          ))}
        </div>

        {/* Right 4 cols: Detailed Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm flex flex-col gap-space-md border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {selectedService.icon}
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {selectedService.name}
                </span>
              </div>
              <span className="font-code-label text-code-label bg-surface-container px-space-xs py-0.5 rounded text-secondary font-mono font-bold">
                {selectedService.status}
              </span>
            </div>

            <div className="flex flex-col gap-space-xs font-code-body text-code-body font-mono">
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Category:</span>
                <span className="text-on-surface font-semibold">{selectedService.category}</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">CPU Utilization:</span>
                <span className="text-primary font-bold">{selectedService.cpu}</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Memory Allocated:</span>
                <span className="text-secondary font-bold">{selectedService.mem}</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Uptime:</span>
                <span className="text-on-surface">{selectedService.uptime}</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Restarts (30d):</span>
                <span
                  className={
                    selectedService.restarts > 0 ? 'text-error font-bold' : 'text-secondary'
                  }
                >
                  {selectedService.restarts}
                </span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Bind / Interface:</span>
                <span className="text-on-surface truncate max-w-[200px]">
                  {selectedService.portOrEdge}
                </span>
              </div>
            </div>

            {selectedService.notice && (
              <div className="p-space-sm bg-surface-container rounded border border-secondary/30 text-secondary font-code-body text-[12px] font-mono">
                NOTICE: {selectedService.notice}
              </div>
            )}

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <button
                onClick={() => handleRestart(selectedService.id, selectedService.name)}
                disabled={restartingId === selectedService.id}
                className="h-9 bg-primary-container hover:bg-primary text-on-primary-container font-body-sm font-semibold rounded transition-colors flex items-center justify-center gap-space-xs cursor-pointer font-mono"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    restartingId === selectedService.id ? 'animate-spin' : ''
                  }`}
                >
                  sync
                </span>
                <span>
                  {restartingId === selectedService.id
                    ? 'Restarting Container...'
                    : 'Graceful Restart (SIGHUP)'}
                </span>
              </button>
              <button
                onClick={() =>
                  showToast(`Fetched latest stdout logs for ${selectedService.name}`)
                }
                className="h-9 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm rounded transition-colors flex items-center justify-center gap-space-xs cursor-pointer font-mono"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>Tail Container Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
