import React, { useState } from 'react';
import {
  SystemMetrics,
  NetworkData,
  ServiceDaemon,
  SecurityEvent,
} from '../types/api';
import { NavTab } from './Sidebar';

interface OverviewViewProps {
  metrics: SystemMetrics;
  network: NetworkData;
  services: ServiceDaemon[];
  liveEvents: SecurityEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectEvent?: (event: SecurityEvent) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  network,
  services,
  liveEvents,
  onNavigateTab,
  onSelectEvent,
}) => {
  const [selectedInterface, setSelectedInterface] = useState<'ALL' | 'enp2s0' | 'wlp3s0' | 'tail0'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'5m' | '15m' | '1h'>('5m');
  const [serviceCategory, setServiceCategory] = useState<string>('ALL');
  const [isStreamPaused, setIsStreamPaused] = useState(false);

  const filteredServices = services.filter((s) => {
    if (serviceCategory === 'ALL') return true;
    return s.category === serviceCategory;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg select-none">
      {/* System Operational Banner / Quick Meta */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low px-space-lg py-space-sm rounded-lg shadow-sm border border-surface-container/40">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-code-label text-code-label text-secondary font-bold uppercase tracking-wider">
              SYSTEM ONLINE
            </span>
          </div>
          <span className="text-outline-variant font-code-body">//</span>
          <div className="flex items-center gap-space-xs font-code-body text-code-body text-on-surface-variant">
            <span className="text-outline">HOSTNAME:</span>
            <span className="text-on-surface font-semibold font-mono">{metrics.hostname}</span>
          </div>
          <span className="text-outline-variant font-code-body hidden sm:inline">//</span>
          <div className="hidden sm:flex items-center gap-space-xs font-code-body text-code-body text-on-surface-variant">
            <span className="text-outline">UPTIME:</span>
            <span className="text-primary font-medium font-mono">{metrics.uptime}</span>
          </div>
          <span className="text-outline-variant font-code-body hidden md:inline">//</span>
          <div className="hidden md:flex items-center gap-space-xs font-code-body text-code-body text-on-surface-variant">
            <span className="text-outline">BASE ARCH:</span>
            <span className="text-on-surface font-mono">{metrics.baseArch}</span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs bg-surface-container-highest px-space-sm py-0.5 rounded text-on-surface font-code-label text-code-label">
            <span className="material-symbols-outlined text-[14px] text-secondary">memory</span>
            <span>ZFS POOL: {metrics.zfsPoolStatus}</span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-highest px-space-sm py-0.5 rounded text-on-surface font-code-label text-code-label">
            <span className="material-symbols-outlined text-[14px] text-primary">security</span>
            <span>NFTABLES: {metrics.nftablesStatus}</span>
          </div>
          <div className="flex items-center gap-space-xs bg-primary-container px-space-sm py-0.5 rounded text-on-primary-container font-code-label text-code-label font-bold">
            <span>SYNC {metrics.lastSync}</span>
          </div>
        </div>
      </div>

      {/* 1. Top Telemetry Status Grid (4 dense status cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1: System Telemetry */}
        <div className="flex flex-col justify-between bg-surface-container-low p-space-lg rounded-lg shadow-sm border border-surface-container/30">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                SYSTEM TELEMETRY
              </span>
              <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-high text-secondary font-mono">
                PACKAGE {metrics.cpu.packageTemp}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-space-xs">
              <span className="font-code-label text-code-label text-outline uppercase">
                CPU LOAD ({metrics.cpu.cores})
              </span>
              <span className="font-code-metric-lg text-code-metric-lg text-primary font-bold">
                {metrics.cpu.loadPercent}%
              </span>
            </div>
            {/* CPU Progress Bar */}
            <div className="w-full h-1 bg-surface-container-highest rounded-none overflow-hidden mb-space-sm">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, metrics.cpu.loadPercent))}%` }}
              />
            </div>
            <p className="font-code-body text-code-body text-on-surface-variant truncate mb-space-md font-mono">
              {metrics.cpu.model}
            </p>
            {/* RAM & Disk Submetrics */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center justify-between font-code-body text-code-body">
                <span className="text-on-surface-variant">RAM Total</span>
                <span className="text-on-surface font-medium font-mono">
                  {metrics.ram.usedGb.toFixed(1)} / {metrics.ram.totalGb.toFixed(1)} GB{' '}
                  <span className="text-primary font-bold">({metrics.ram.usedPercent}%)</span>
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-none overflow-hidden">
                <div
                  className="h-full bg-secondary-container transition-all duration-500 ease-out"
                  style={{ width: `${metrics.ram.usedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-code-body text-code-body mt-space-xs">
                <span className="text-on-surface-variant">NVMe Pool (ext4)</span>
                <span className="text-on-surface font-medium font-mono">
                  {metrics.storage.nvmeUsedTb} / {metrics.storage.nvmeTotalTb} TB{' '}
                  <span className="text-outline">({metrics.storage.nvmePercent}%)</span>
                </span>
              </div>
              <div className="flex items-center justify-between font-code-body text-code-body">
                <span className="text-on-surface-variant">ZFS Tank (RaidZ2)</span>
                <span className="text-on-surface font-medium font-mono">
                  {metrics.storage.zfsUsedTb} / {metrics.storage.zfsTotalTb} TB{' '}
                  <span className="text-secondary font-bold">({metrics.storage.zfsPercent}%)</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs bg-surface-container px-space-sm py-space-xs rounded">
            <span className="font-code-label text-code-label text-outline uppercase">NVMe Temp</span>
            <span className="font-code-label text-code-label text-secondary font-semibold font-mono">
              {metrics.storage.nvmeStatus}
            </span>
          </div>
        </div>

        {/* Card 2: Network Throughput & Topology */}
        <div className="flex flex-col justify-between bg-surface-container-low p-space-lg rounded-lg shadow-sm border border-surface-container/30">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                NETWORK THROUGHPUT
              </span>
              <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-bold">
                WAN FIBER
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-sm mb-space-sm">
              <div className="flex flex-col bg-surface-container p-space-sm rounded">
                <span className="font-code-label text-code-label text-outline uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-secondary">
                    arrow_downward
                  </span>{' '}
                  INGRESS (RX)
                </span>
                <span className="font-code-metric-lg text-code-metric-lg text-secondary font-bold mt-0.5 font-mono">
                  {network.ingressRxMbps}{' '}
                  <span className="text-xs font-normal font-sans">MB/s</span>
                </span>
              </div>
              <div className="flex flex-col bg-surface-container p-space-sm rounded">
                <span className="font-code-label text-code-label text-outline uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
                    arrow_upward
                  </span>{' '}
                  EGRESS (TX)
                </span>
                <span className="font-code-metric-lg text-code-metric-lg text-on-surface font-bold mt-0.5 font-mono">
                  {network.egressTxMbps}{' '}
                  <span className="text-xs font-normal font-sans">MB/s</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs font-code-body text-code-body pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Active Sockets</span>
                <span className="text-on-surface font-semibold font-mono">
                  {network.activeSockets.established} established{' '}
                  <span className="text-outline font-normal">/ {network.activeSockets.timeWait} tw</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Default Route</span>
                <span className="text-secondary font-medium font-mono">{network.defaultRoute.device} · {network.defaultRoute.gateway}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Primary Device</span>
                <span className="text-on-surface font-mono">{network.primaryDevice}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs bg-surface-container px-space-sm py-space-xs rounded">
            <span className="font-code-label text-code-label text-outline uppercase">WAN Peak 24h</span>
            <span className="font-code-label text-code-label text-primary font-mono">
              {network.wanPeak24h.rxMbps} RX / {network.wanPeak24h.txMbps} TX Mbps
            </span>
          </div>
        </div>

        {/* Card 3: Security & Threat Level */}
        <div className="flex flex-col justify-between bg-surface-container-low p-space-lg rounded-lg shadow-sm border border-surface-container/30">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                SECURITY TELEMETRY
              </span>
              <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-high text-secondary flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> DEFCON {metrics.securityTelemetry.defcon}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-space-xs">
              <span className="font-code-label text-code-label text-outline uppercase">BLOCKED TODAY</span>
              <span className="font-code-metric-lg text-code-metric-lg text-error font-bold font-mono">
                {metrics.securityTelemetry.blockedTodayDrops}{' '}
                <span className="text-xs font-normal text-on-surface-variant font-sans">drops</span>
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-none overflow-hidden mb-space-sm">
              <div className="h-full bg-error" style={{ width: '38%' }} />
            </div>
            <div className="flex flex-col gap-space-xs font-code-body text-code-body pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Threat Posture</span>
                <span className="text-secondary font-semibold font-mono">
                  {metrics.securityTelemetry.threatPosture}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Fail2ban Jails</span>
                <span className="text-on-surface font-semibold font-mono">
                  {metrics.securityTelemetry.fail2banJailsActive} IPs active{' '}
                  <span className="text-error font-normal">
                    ({metrics.securityTelemetry.fail2banFailedAttempts} failed)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">CrowdSec Decisions</span>
                <span className="text-on-surface font-mono">
                  {metrics.securityTelemetry.crowdsecDecisionsBounces} Active Bounces
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs bg-surface-container px-space-sm py-space-xs rounded">
            <span className="font-code-label text-code-label text-outline uppercase">
              Analyzed Events (24h)
            </span>
            <span className="font-code-label text-code-label text-on-surface font-bold font-mono">
              {metrics.securityTelemetry.analyzedEvents24h.toLocaleString()} SEC_LOGS
            </span>
          </div>
        </div>

        {/* Card 4: Services Status */}
        <div className="flex flex-col justify-between bg-surface-container-low p-space-lg rounded-lg shadow-sm border border-surface-container/30">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                DAEMON STATE
              </span>
              <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-mono uppercase">
                DOCKER {metrics.daemonState.dockerVersion}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-space-xs">
              <span className="font-code-label text-code-label text-outline uppercase">
                SYSTEM CONTAINERS
              </span>
              <span className="font-code-metric-lg text-code-metric-lg text-secondary font-bold font-mono">
                {metrics.daemonState.containersRunning}{' '}
                <span className="text-xs text-on-surface-variant font-normal font-sans">
                  / {metrics.daemonState.containersTotal} OK
                </span>
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-none overflow-hidden mb-space-sm">
              <div className="h-full bg-secondary" style={{ width: '92%' }} />
            </div>
            <div className="flex flex-col gap-space-xs font-code-body text-code-body pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Active Services</span>
                <span className="text-on-surface font-semibold font-mono">
                  11 Healthy, <span className="text-secondary font-normal">1 Warning</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Systemd Degraded</span>
                <span className="text-secondary font-medium font-mono">
                  {metrics.daemonState.systemdDegradedUnits} Units failed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Notice</span>
                <span className="text-on-surface truncate font-mono">
                  {metrics.daemonState.notice}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs bg-surface-container px-space-sm py-space-xs rounded">
            <span className="font-code-label text-code-label text-outline uppercase">
              Container Runtime
            </span>
            <span className="font-code-label text-code-label text-secondary font-semibold font-mono">
              {metrics.daemonState.runtimeState}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Section Two-Column Architecture (65% / 35%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Main Area (65% = 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Real-Time Network Traffic Graph Card */}
          <div className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col border border-surface-container/30">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-label text-code-label text-secondary font-semibold uppercase tracking-wider">
                    LIVE INTERFACE TRAFFIC
                  </span>
                  <span className="text-outline font-code-body">//</span>
                  <span className="font-code-body text-code-body text-on-surface-variant text-xs font-mono">
                    enp2s0 + wlp3s0 + tailscale0
                  </span>
                </div>
                <div className="flex items-center gap-space-md mt-1 flex-wrap font-mono">
                  <span className="font-code-body text-code-body text-secondary font-bold">
                    RX: {network.ingressRxMbps} MB/s{' '}
                    <span className="text-xs text-outline font-normal">
                      (PEAK: {network.ingressPeakMbps})
                    </span>
                  </span>
                  <span className="font-code-body text-code-body text-on-surface-variant font-bold">
                    TX: {network.egressTxMbps} MB/s{' '}
                    <span className="text-xs text-outline font-normal">
                      (PEAK: {network.egressPeakMbps})
                    </span>
                  </span>
                  <span className="font-code-body text-code-body text-primary text-xs hidden sm:inline">
                    RTT: {network.pingRtt}
                  </span>
                </div>
              </div>

              {/* Controls / Filter Tabs */}
              <div className="flex items-center gap-space-xs">
                <div className="flex bg-surface-container p-0.5 rounded">
                  {(['ALL', 'enp2s0', 'wlp3s0', 'tail0'] as const).map((iface) => (
                    <button
                      key={iface}
                      onClick={() => setSelectedInterface(iface)}
                      className={`px-space-sm py-0.5 font-code-label text-code-label rounded font-mono transition-colors ${
                        selectedInterface === iface
                          ? 'bg-primary text-on-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {iface}
                    </button>
                  ))}
                </div>
                <div className="flex bg-surface-container p-0.5 rounded">
                  {(['5m', '15m', '1h'] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeframe(time)}
                      className={`px-space-sm py-0.5 font-code-label text-code-label rounded font-mono transition-colors ${
                        selectedTimeframe === time
                          ? 'bg-surface-container-highest text-secondary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inline SVG Multi-Line / Area Chart */}
            <div className="w-full h-64 bg-surface-container-lowest rounded p-space-sm relative overflow-hidden flex flex-col justify-end border border-surface-container/40">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 240">
                <defs>
                  <linearGradient id="rxGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#7bd0ff" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7bd0ff" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="txGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#89ceff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#89ceff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line stroke="#191f2f" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="800" y1="40" y2="40" />
                <line stroke="#191f2f" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="800" y1="90" y2="90" />
                <line stroke="#191f2f" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="800" y1="140" y2="140" />
                <line stroke="#191f2f" strokeDasharray="4,4" strokeWidth="1" x1="0" x2="800" y1="190" y2="190" />

                {/* RX Fill and Line (Cyan/Secondary) */}
                <polygon
                  fill="url(#rxGrad)"
                  points="0,200 40,180 80,185 120,160 160,165 200,120 240,140 280,110 320,130 360,70 400,90 440,85 480,120 520,110 560,95 600,105 640,60 680,80 720,70 760,45 800,55 800,220 0,220"
                />
                <polyline
                  fill="none"
                  points="0,200 40,180 80,185 120,160 160,165 200,120 240,140 280,110 320,130 360,70 400,90 440,85 480,120 520,110 560,95 600,105 640,60 680,80 720,70 760,45 800,55"
                  stroke="#7bd0ff"
                  strokeWidth="2"
                />

                {/* TX Fill and Line (Tertiary/Subdued) */}
                <polygon
                  fill="url(#txGrad)"
                  points="0,210 40,205 80,198 120,190 160,195 200,180 240,175 280,170 320,175 360,150 400,160 440,155 480,165 520,160 560,150 600,155 640,140 680,145 720,135 760,125 800,130 800,220 0,220"
                />
                <polyline
                  fill="none"
                  points="0,210 40,205 80,198 120,190 160,195 200,180 240,175 280,170 320,175 360,150 400,160 440,155 480,165 520,160 560,150 600,155 640,140 680,145 720,135 760,125 800,130"
                  stroke="#89ceff"
                  strokeDasharray="3,2"
                  strokeWidth="1.5"
                />

                {/* Current position indicator circle */}
                <circle cx="800" cy="55" fill="#7bd0ff" r="4" />
                <circle cx="800" cy="130" fill="#89ceff" r="3" />
              </svg>

              {/* Time Ticks Floor */}
              <div className="flex items-center justify-between text-outline font-code-label text-code-label pt-space-xs font-mono">
                <span>-5m 00s</span>
                <span>-4m 00s</span>
                <span>-3m 00s</span>
                <span>-2m 00s</span>
                <span>-1m 00s</span>
                <span className="text-secondary font-bold">T=0 (NOW)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between mt-space-sm pt-space-xs font-code-body text-code-body text-outline">
              <div className="flex items-center gap-space-md">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-secondary inline-block" /> Ingress RX (Fiber Eth)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-primary inline-block" /> Egress TX (Encrypted + LAN)
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-xs">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  check_circle
                </span>
                <span className="text-on-surface-variant">
                  0 Packet Drops Detected across all ringbuffers
                </span>
              </div>
            </div>
          </div>

          {/* Network Interfaces Detailed Panel (3 High-Density Rows) */}
          <div className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col gap-space-sm border border-surface-container/30">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  PHYSICAL & VIRTUAL INTERFACES
                </span>
                <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary">
                  MULTI-HOMED DUAL-ACTIVE
                </span>
              </div>
              <span className="font-code-label text-code-label text-outline uppercase">
                MTU 1500 / TCP BBR ENABLED
              </span>
            </div>

            {network.interfaces.map((iface) => (
              <div
                key={iface.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md bg-surface-container rounded gap-space-sm hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-md">
                  <div
                    className={`w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center ${
                      iface.state === 'UP' ? 'text-secondary' : iface.state === 'ACTIVE' ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{iface.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs flex-wrap font-mono">
                      <span className="font-code-body text-code-body text-on-surface font-bold">
                        {iface.name}
                      </span>
                      <span className="font-code-label text-code-label px-1 py-0.2 bg-surface-container-highest text-secondary rounded">
                        {iface.tag}
                      </span>
                      <span className="font-code-label text-code-label text-outline">
                        {iface.speedDesc}
                      </span>
                    </div>
                    <span className="font-code-label text-code-label text-on-surface-variant font-mono">
                      {iface.ip} • {iface.gatewayOrSsid}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-lg font-code-body text-code-body text-right font-mono">
                  <div className="flex flex-col">
                    <span className="text-outline text-xs">RX: {iface.rxBytes}</span>
                    <span className="text-on-surface">TX: {iface.txBytes}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-secondary font-bold">{iface.ping}</span>
                    <span className="font-code-label text-code-label text-outline uppercase">
                      {iface.pingType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Secondary Area (35% = 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Live Security Activity Feed */}
          <div className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col h-full border border-surface-container/30">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold">
                  LIVE ACTIVITY STREAM
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button
                  onClick={() => setIsStreamPaused(!isStreamPaused)}
                  className={`px-space-xs py-0.5 rounded font-code-label text-code-label transition-colors font-mono uppercase ${
                    isStreamPaused
                      ? 'bg-error-container text-on-error-container font-bold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                  title="Pause auto-scroll"
                >
                  {isStreamPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <span className="font-code-label text-code-label text-primary font-bold font-mono">
                  BUFFER: {liveEvents.length}
                </span>
              </div>
            </div>

            {/* Chronological Event Stream */}
            <div className="flex flex-col gap-space-xs overflow-y-auto max-h-[620px] pr-1">
              {liveEvents.slice(0, 15).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(evt);
                    onNavigateTab('security-events');
                  }}
                  className="p-space-sm bg-surface-container rounded hover:bg-surface-container-high transition-colors flex flex-col gap-1 cursor-pointer border border-transparent hover:border-surface-container-highest"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-label text-code-label text-outline font-mono">
                      {evt.timestamp}
                    </span>
                    <span
                      className={`font-code-label text-code-label px-1 rounded uppercase font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-error-container text-on-error-container'
                          : evt.severity === 'WARNING'
                          ? 'bg-error-container/60 text-on-error-container'
                          : evt.severity === 'NOTICE'
                          ? 'bg-surface-container-highest text-secondary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>
                  <p
                    className={`font-code-body text-code-body leading-tight ${
                      evt.severity === 'CRITICAL' || evt.severity === 'WARNING'
                        ? 'text-error'
                        : 'text-on-surface'
                    }`}
                  >
                    {evt.summary}
                  </p>
                  <div className="flex items-center justify-between font-code-label text-code-label text-outline pt-0.5 font-mono">
                    <span className="truncate max-w-[200px]">SRC: {evt.source}</span>
                    <span>{evt.process || evt.subsystem}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container/40">
              <span className="font-code-label text-code-label text-outline font-mono">
                LOGGING DAEMON: RSYSLOGD 8.23
              </span>
              <button
                onClick={() => onNavigateTab('logs')}
                className="font-code-label text-code-label text-primary hover:underline uppercase font-bold"
              >
                RAW_STREAM →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Server Services Matrix (12 Container Daemons) */}
      <section className="bg-surface-container-low p-space-lg rounded-lg shadow-sm flex flex-col gap-space-md border border-surface-container/30">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase tracking-wider">
              HOST SERVICES & CONTAINER DAEMONS
            </span>
            <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary font-bold">
              {services.length} ACTIVE
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-space-xs flex-wrap">
            {[
              { id: 'ALL', label: `ALL (${services.length})` },
              { id: 'SYSTEM', label: 'SYSTEM (3)' },
              { id: 'WEB/PROXY', label: 'WEB/PROXY (2)' },
              { id: 'MEDIA/STORAGE', label: 'MEDIA/STORAGE (4)' },
              { id: 'DATABASE', label: 'DATABASE (3)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setServiceCategory(cat.id)}
                className={`px-space-sm py-1 font-code-label text-code-label rounded font-mono transition-colors uppercase ${
                  serviceCategory === cat.id
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-space-sm">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              onClick={() => onNavigateTab('services')}
              className="p-space-md bg-surface-container rounded flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-surface-container-highest"
            >
              <div className="flex items-center justify-between mb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      svc.statusTone === 'primary' ? 'text-primary' : 'text-secondary'
                    }`}
                  >
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
              <span className="font-code-label text-code-label text-on-surface-variant truncate font-mono">
                {svc.portOrEdge}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
