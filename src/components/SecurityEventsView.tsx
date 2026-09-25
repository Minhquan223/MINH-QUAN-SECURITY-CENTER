import React, { useState } from 'react';
import { SecurityEvent } from '../types/api';
import { NavTab } from './Sidebar';

interface SecurityEventsViewProps {
  events: SecurityEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onRefreshFeed?: () => Promise<void> | void;
}

export const SecurityEventsView: React.FC<SecurityEventsViewProps> = ({
  events,
  onNavigateTab,
  onRefreshFeed,
}) => {
  const [searchQuery, setSearchQuery] = useState('185.220.101.42');
  const [timeRange, setTimeRange] = useState('24h');
  const [ipFilter, setIpFilter] = useState('185.220.101.*');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('SSH / Auth');
  const [expandedEventId, setExpandedEventId] = useState<string | null>('sec-98402');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [synShieldActive, setSynShieldActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshFeed) {
      await onRefreshFeed();
    }
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live security stream buffer refreshed');
    }, 800);
  };

  // Filter events based on selections
  const filteredEvents = events.filter((e) => {
    if (selectedSeverity !== 'ALL' && e.severity !== selectedSeverity) return false;
    if (selectedSubsystem && e.subsystem !== selectedSubsystem) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.source.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg select-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-primary/50 text-on-surface px-space-md py-space-sm rounded shadow-xl flex items-center gap-space-sm font-code-body animate-bounce">
          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CONSOLE CONTROL & TITLE BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded border border-surface-container/40">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-outline font-mono">
            <span className="font-code-label text-code-label tracking-widest uppercase">
              Console / Triage
            </span>
            <span className="font-code-body text-code-body">//</span>
            <span className="font-code-label text-code-label text-primary font-bold uppercase tracking-widest">
              MODULE: SEC_EVENT_STREAM
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold uppercase">
            SECURITY EVENTS // INCIDENT INVESTIGATION
          </h1>
        </div>

        {/* Quick Toolset Actions */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `security_events_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              showToast('Exported security events JSON snapshot');
            }}
            className="flex items-center gap-space-xs px-space-md h-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface rounded transition-colors font-body-sm text-body-sm"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV / JSON</span>
          </button>
          <button
            onClick={() => onNavigateTab('forensics')}
            className="flex items-center gap-space-xs px-space-md h-8 bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary rounded transition-colors font-body-sm text-body-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">add_moderator</span>
            <span>Create Incident Case</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-space-xs px-space-md h-8 bg-primary hover:bg-secondary-fixed text-on-primary rounded transition-colors font-body-sm text-body-sm font-semibold cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* THREAT METRICS HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        {/* Total Incidents */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between relative overflow-hidden shadow-sm border border-surface-container/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Total Logged Incidents
            </span>
            <span className="material-symbols-outlined text-outline text-[18px]">stream</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs font-mono">
            <span className="font-code-metric-xl text-code-metric-xl text-on-surface">1,842</span>
            <span className="font-code-label text-code-label text-on-surface-variant">
              events / 24h
            </span>
          </div>
          <div className="mt-space-sm w-full bg-surface-container-highest h-1 rounded overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Mitigated */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between relative overflow-hidden shadow-sm border border-surface-container/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-secondary">
              Mitigated Realtime
            </span>
            <span className="inline-flex items-center gap-1 font-code-label text-code-label text-secondary font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> NOMINAL
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs font-mono">
            <span className="font-code-metric-xl text-code-metric-xl text-secondary">1,828</span>
            <span className="font-code-label text-code-label text-secondary font-bold">
              (99.2%)
            </span>
          </div>
          <div className="mt-space-sm w-full bg-surface-container-highest h-1 rounded overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '99.2%' }} />
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between relative overflow-hidden shadow-sm border border-surface-container/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-error">
              Under Triage Review
            </span>
            <span className="material-symbols-outlined text-error text-[18px]">warning</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs font-mono">
            <span className="font-code-metric-xl text-code-metric-xl text-error">14</span>
            <span className="font-code-label text-code-label text-error-container font-semibold">
              Priority P1/P2
            </span>
          </div>
          <div className="mt-space-sm w-full bg-surface-container-highest h-1 rounded overflow-hidden">
            <div className="bg-error h-full" style={{ width: '18%' }} />
          </div>
        </div>

        {/* Jailed IPs */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between relative overflow-hidden shadow-sm border border-surface-container/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary">
              Jailed IP Subnets (nftables)
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs font-mono">
            <span className="font-code-metric-xl text-code-metric-xl text-primary">42</span>
            <span className="font-code-label text-code-label text-on-surface-variant">
              active leasetime
            </span>
          </div>
          <div className="mt-space-sm w-full bg-surface-container-highest h-1 rounded overflow-hidden">
            <div className="bg-primary-container h-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* MULTI-STAGE QUERY & FILTER DOCK */}
      <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-md shadow-sm border border-surface-container/30">
        {/* First Row: Search + Time Picker + Direct IP input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm">
          <div className="flex-1 flex items-center bg-surface-container-lowest px-space-md py-space-xs rounded h-9 border border-surface-container">
            <span className="font-code-label text-code-label text-outline mr-space-sm uppercase font-mono">
              query:
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by query, IP, CIDR, user, rule ID, or CVE..."
              className="w-full bg-transparent font-code-body text-code-body text-on-surface placeholder:text-outline focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Time Range Quick Pick */}
          <div className="flex items-center bg-surface-container-lowest px-space-sm py-1 rounded gap-space-xs border border-surface-container">
            <span className="material-symbols-outlined text-outline text-[16px] ml-1">
              schedule
            </span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent font-code-label text-code-label text-on-surface focus:outline-none cursor-pointer pr-2 py-1 font-mono"
            >
              <option className="bg-surface-container" value="15m">Last 15 Minutes</option>
              <option className="bg-surface-container" value="1h">Last 1 Hour</option>
              <option className="bg-surface-container" value="6h">Last 6 Hours</option>
              <option className="bg-surface-container" value="24h">Last 24 Hours</option>
              <option className="bg-surface-container" value="7d">Last 7 Days</option>
            </select>
          </div>

          {/* IP Direct Input */}
          <div className="flex items-center bg-surface-container-lowest px-space-sm py-space-xs rounded h-9 border border-surface-container">
            <span className="material-symbols-outlined text-outline text-[16px] mr-1">
              network_node
            </span>
            <input
              type="text"
              value={ipFilter}
              onChange={(e) => {
                setIpFilter(e.target.value);
                setSearchQuery(e.target.value.replace('*', ''));
              }}
              placeholder="Filter by IP (e.g. 185.220.101.*)"
              className="w-48 bg-transparent font-code-body text-code-body text-on-surface placeholder:text-outline focus:outline-none text-[12px] font-mono"
            />
          </div>
        </div>

        {/* Second Row: Severity pills + Event Type categorization */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-sm pt-space-xs">
          {/* Severities */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-label-caps text-label-caps text-outline uppercase mr-1">
              Severity:
            </span>
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-space-sm py-0.5 rounded font-code-label text-code-label uppercase transition-colors font-mono ${
                selectedSeverity === 'ALL'
                  ? 'bg-surface-container-highest text-on-surface font-bold ring-1 ring-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All <span className="text-outline font-semibold ml-1">1,842</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`px-space-sm py-0.5 rounded font-code-label text-code-label font-bold flex items-center gap-1 font-mono uppercase ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-error-container text-on-error-container ring-1 ring-error'
                  : 'bg-surface-container-high text-error hover:bg-error-container/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              Critical <span className="opacity-80">14</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('WARNING')}
              className={`px-space-sm py-0.5 rounded font-code-label text-code-label flex items-center gap-1 font-mono uppercase ${
                selectedSeverity === 'WARNING'
                  ? 'bg-secondary-container text-on-secondary-container font-bold ring-1 ring-secondary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
              Warning <span className="text-outline">68</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('NOTICE')}
              className={`px-space-sm py-0.5 rounded font-code-label text-code-label flex items-center gap-1 font-mono uppercase ${
                selectedSeverity === 'NOTICE'
                  ? 'bg-surface-container-highest text-primary font-bold ring-1 ring-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
              Notice <span className="text-outline">312</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('INFO')}
              className={`px-space-sm py-0.5 rounded font-code-label text-code-label font-mono uppercase ${
                selectedSeverity === 'INFO'
                  ? 'bg-surface-container-highest text-on-surface font-bold ring-1 ring-outline'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Info <span className="text-outline">1,448</span>
            </button>
          </div>

          {/* Engine / Subsystem Badges */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-label-caps text-label-caps text-outline uppercase mr-1">
              Engine / Subsystem:
            </span>
            {[
              'SSH / Auth',
              'Firewall / nftables',
              'Port Scans',
              'Docker audit',
              'DNS / AdGuard',
              'Integrity / AIDE',
            ].map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedSubsystem(selectedSubsystem === sys ? '' : sys)}
                className={`px-space-xs py-0.5 rounded font-code-label text-code-label font-mono transition-colors ${
                  selectedSubsystem === sys
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN EVENT INVESTIGATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT: CHRONOLOGICAL EVENT TABLE (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold tracking-wider">
                Telemetric Event Stream
              </span>
              <span className="font-code-label text-code-label px-space-xs py-0.5 bg-surface-container-highest rounded text-primary font-mono">
                REALTIME BUFFER: {filteredEvents.length} ROWS ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-outline font-code-label text-code-label font-mono">
              <span>Sort: DESC</span>
              <span>•</span>
              <span>Timezone: UTC</span>
            </div>
          </div>

          {/* Events Container List */}
          <div className="flex flex-col gap-space-xs">
            {filteredEvents.map((evt) => {
              const isExpanded = expandedEventId === evt.id;

              if (isExpanded) {
                return (
                  <div
                    key={evt.id}
                    className="bg-surface-container-low rounded overflow-hidden shadow-md border border-surface-container/60"
                  >
                    {/* Main summary clickable strip */}
                    <div
                      onClick={() => setExpandedEventId(null)}
                      className="p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-space-sm flex-wrap font-mono">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          keyboard_arrow_down
                        </span>
                        <span className="font-code-body text-code-body text-on-surface font-semibold">
                          {evt.timestamp}
                        </span>
                        <span
                          className={`px-space-xs py-0.5 rounded font-code-label text-code-label font-bold uppercase ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-error text-on-error'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {evt.severity}
                        </span>
                        <span className="px-space-xs py-0.5 rounded font-code-label text-code-label bg-surface-container-highest text-primary font-semibold">
                          {evt.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        <span className="font-code-label text-code-label text-error bg-surface-container-lowest px-space-sm py-0.5 rounded font-mono">
                          {evt.incidentId || 'INCIDENT #SEC-98402'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                      </div>
                    </div>

                    {/* Quick Context Bar */}
                    <div className="px-space-md py-space-xs bg-surface-container-high flex flex-wrap items-center justify-between gap-space-xs font-code-label text-code-label text-on-surface-variant font-mono">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="text-outline">SRC:</span>
                        <span className="text-secondary font-bold">{evt.source}</span>
                        <span className="text-outline">➔</span>
                        <span className="text-outline">DST:</span>
                        <span className="text-on-surface">{evt.destination}</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="text-outline">PROC:</span>
                        <span className="text-on-surface">{evt.process}</span>
                      </div>
                    </div>

                    {/* Expanded Inspector Body */}
                    <div className="p-space-lg flex flex-col gap-space-md bg-surface-container-low">
                      <div>
                        <div className="font-label-caps text-label-caps uppercase text-outline mb-1">
                          Incident Diagnosis
                        </div>
                        <p className="font-body-md text-body-md text-on-surface">
                          {evt.diagnosis || evt.summary}
                        </p>
                      </div>

                      {/* Syslog & Kernel Telemetry Snippet */}
                      {evt.rawBuffer && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-code-label text-code-label text-outline uppercase font-mono">
                              Raw Syslog Buffer & Kernel Drop Record
                            </span>
                            <span className="font-code-label text-code-label text-outline font-mono">
                              journald / auth.log
                            </span>
                          </div>
                          <div className="bg-surface-container-lowest p-space-md rounded font-code-body text-code-body text-on-surface flex flex-col gap-1 overflow-x-auto font-mono">
                            {evt.rawBuffer.map((line, idx) => (
                              <div
                                key={idx}
                                className={
                                  idx === 0
                                    ? 'text-error'
                                    : idx === 1
                                    ? 'text-error'
                                    : idx === 2
                                    ? 'text-secondary'
                                    : 'text-primary'
                                }
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Threat Intel Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                        <div className="bg-surface-container p-space-sm rounded flex flex-col">
                          <span className="font-label-caps text-label-caps text-outline uppercase">
                            GeoIP & Routing
                          </span>
                          <span className="font-body-md text-body-md text-on-surface font-semibold mt-1">
                            {evt.geoIp || 'Frankfurt, Germany (DE)'}
                          </span>
                          <span className="font-code-label text-code-label text-outline font-mono">
                            {evt.geoDetails || 'ASN49453 • Tor Exit Gateway'}
                          </span>
                        </div>
                        <div className="bg-surface-container p-space-sm rounded flex flex-col">
                          <span className="font-label-caps text-label-caps text-outline uppercase">
                            Reverse DNS Lookup
                          </span>
                          <span className="font-code-body text-code-body text-secondary truncate mt-1 font-mono">
                            {evt.reverseDns || 'tor-exit-node-04.torservers.net'}
                          </span>
                          <span className="font-code-label text-code-label text-outline font-mono">
                            {evt.reverseDnsTtl || 'TTL: 300s (Authoritative)'}
                          </span>
                        </div>
                        <div className="bg-surface-container p-space-sm rounded flex flex-col">
                          <span className="font-label-caps text-label-caps text-outline uppercase">
                            Enforced Mitigation State
                          </span>
                          <span className="font-body-md text-body-md text-error font-semibold mt-1">
                            {evt.mitigationState || 'nftables [f2b-sshd] Jailed'}
                          </span>
                          <span className="font-code-label text-code-label text-outline font-mono">
                            {evt.mitigationRemaining || 'Remaining: 23h 58m 12s'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Toolbar for Event */}
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <button
                            onClick={() =>
                              showToast('IP 185.220.101.42 added to permanent nftables blacklist')
                            }
                            className="px-space-md h-8 bg-error-container text-on-error-container hover:bg-error hover:text-on-error rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">block</span>
                            Add to Permanent Blacklist
                          </button>
                          <button
                            onClick={() => onNavigateTab('forensics')}
                            className="px-space-md h-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-body-sm text-body-sm transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">biotech</span>
                            Pivot to Forensics Case
                          </button>
                          <button
                            onClick={() =>
                              showToast('AbuseIPDB query result: 98% Confidence of Abuse (142 reports)')
                            }
                            className="px-space-md h-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-body-sm text-body-sm transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              travel_explore
                            </span>
                            Lookup on AbuseIPDB
                          </button>
                        </div>
                        <span className="font-code-label text-code-label text-outline font-mono">
                          Triggered Rule: {evt.triggeredRule || 'SSH_ANOMALY_091'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Collapsed row
              return (
                <div
                  key={evt.id}
                  onClick={() => setExpandedEventId(evt.id)}
                  className="bg-surface-container-low hover:bg-surface-container p-space-md rounded flex flex-col gap-space-xs transition-colors cursor-pointer border border-surface-container/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-sm flex-wrap font-mono">
                      <span className="material-symbols-outlined text-outline text-[18px]">
                        keyboard_arrow_right
                      </span>
                      <span className="font-code-body text-code-body text-on-surface-variant">
                        {evt.timestamp}
                      </span>
                      <span
                        className={`px-space-xs py-0.5 rounded font-code-label text-code-label font-bold uppercase ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-error text-on-error'
                            : evt.severity === 'WARNING'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {evt.severity}
                      </span>
                      <span className="px-space-xs py-0.5 rounded font-code-label text-code-label bg-surface-container-highest text-on-surface">
                        {evt.category}
                      </span>
                      <span className="font-code-body text-code-body text-on-surface font-medium">
                        {evt.source} ➔ {evt.destination}
                      </span>
                    </div>
                    <span className="font-code-label text-code-label text-outline font-mono">
                      {evt.process || evt.subsystem}
                    </span>
                  </div>
                  <div className="pl-space-xl text-on-surface-variant font-body-sm text-body-sm">
                    {evt.summary}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination & Stream Active Footer */}
          <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded text-outline font-code-label text-code-label font-mono border border-surface-container/30">
            <div className="flex items-center gap-space-xs">
              <span>Showing {filteredEvents.length} of 1,842 events</span>
              <span>•</span>
              <span className="text-secondary flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Stream Active
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                disabled
                className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 text-on-surface">Page 1 of 264</span>
              <button className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: TARGET IP DOSSIER & HOST DEFENSE (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* IP Target Dossier Card */}
          <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-md shadow-sm border border-surface-container/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold">
                  Target IP Dossier
                </span>
              </div>
              <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-bold uppercase font-mono">
                REPUTATION: MALICIOUS
              </span>
            </div>

            <div className="bg-surface-container p-space-md rounded flex flex-col gap-space-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-code-metric-lg text-code-metric-lg text-on-surface font-bold">
                  185.220.101.42
                </span>
                <span className="font-code-label text-code-label text-outline">
                  IPv4 / Public
                </span>
              </div>
              <span className="font-code-body text-code-body text-secondary truncate font-mono">
                tor-exit-node-04.torservers.net
              </span>
            </div>

            {/* Telemetry Attributes */}
            <div className="flex flex-col gap-space-xs font-code-body text-code-body">
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Autonomous System:</span>
                <span className="text-on-surface font-medium font-mono">AS49453 (Global AX)</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Physical Origin:</span>
                <span className="text-on-surface font-medium">Frankfurt am Main, DE</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Threat Categorization:</span>
                <span className="text-error font-medium">Tor Exit Relay / Scanner</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Confidence Score:</span>
                <span className="text-error font-bold font-mono">98% Abuse Rate</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container px-space-sm rounded">
                <span className="text-outline">Historical Hits:</span>
                <span className="text-on-surface font-medium font-mono">414 occurrences / 30d</span>
              </div>
            </div>

            {/* Fast Enforcement Action Dock */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Immediate Host Defense Controls
              </span>
              <div className="grid grid-cols-2 gap-space-xs">
                <button
                  onClick={() => showToast('Subnet 185.220.101.0/24 dropped via nftables')}
                  className="h-8 bg-error text-on-error hover:bg-error-container hover:text-on-error-container rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Drop Subnet
                </button>
                <button
                  onClick={() => showToast('Pulled 414 historical auth attempts from journald')}
                  className="h-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-body-sm text-body-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  Audit History
                </button>
              </div>
            </div>
          </div>

          {/* Realtime Host Mitigation Status */}
          <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-md shadow-sm border border-surface-container/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  security
                </span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold">
                  nftables Daemon Status
                </span>
              </div>
              <span className="font-code-label text-code-label text-secondary font-bold font-mono">
                ACTIVE FILTERING
              </span>
            </div>

            {/* Tables & Rules Stats */}
            <div className="flex flex-col gap-space-xs font-code-body text-code-body font-mono">
              <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-on-surface">set [f2b-sshd]</span>
                </div>
                <span className="font-code-label text-code-label text-secondary">28 entries</span>
              </div>
              <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-on-surface">set [f2b-recidive]</span>
                </div>
                <span className="font-code-label text-code-label text-primary">14 entries (Perm)</span>
              </div>
              <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-on-surface">chain input-wan-drop</span>
                </div>
                <span className="font-code-label text-code-label text-on-surface-variant">
                  142,910 pkts
                </span>
              </div>
            </div>

            {/* Interactive Quick Toggle */}
            <div className="flex items-center justify-between pt-space-xs bg-surface-container px-space-sm py-2 rounded">
              <div className="flex flex-col">
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  Aggressive SYN Shield
                </span>
                <span className="font-code-label text-code-label text-outline">
                  Drop SYN floods & port scans
                </span>
              </div>
              <input
                type="checkbox"
                checked={synShieldActive}
                onChange={(e) => {
                  setSynShieldActive(e.target.checked);
                  showToast(
                    e.target.checked
                      ? 'Aggressive SYN Shield activated'
                      : 'Aggressive SYN Shield disabled',
                  );
                }}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Investigation Visual Graph / Vector Breakdown */}
          <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-sm shadow-sm border border-surface-container/30">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold">
                Attack Vectors (24h Distribution)
              </span>
              <span className="font-code-label text-code-label text-outline font-mono">
                TOTAL: 1,842
              </span>
            </div>

            {/* Vector Bars */}
            <div className="flex flex-col gap-space-xs font-code-label text-code-label font-mono">
              <div>
                <div className="flex justify-between text-on-surface-variant mb-1">
                  <span>SSH Brute Force</span>
                  <span className="text-on-surface font-bold">64.2% (1,182)</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                  <div className="bg-error h-full" style={{ width: '64.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-on-surface-variant mb-1">
                  <span>Port Reconnaissance</span>
                  <span className="text-on-surface font-bold">22.8% (420)</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                  <div className="bg-secondary-container h-full" style={{ width: '22.8%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-on-surface-variant mb-1">
                  <span>DNS Amplification / Spikes</span>
                  <span className="text-on-surface font-bold">9.5% (175)</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '9.5%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-on-surface-variant mb-1">
                  <span>Daemon Integrity Anomaly</span>
                  <span className="text-on-surface font-bold">3.5% (65)</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                  <div className="bg-outline h-full" style={{ width: '3.5%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
