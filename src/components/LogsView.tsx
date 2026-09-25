import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types/api';

interface LogsViewProps {
  logs: LogEntry[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs: initialLogs }) => {
  const [logsList, setLogsList] = useState<LogEntry[]>(initialLogs);
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>('caddy');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [regexFilter, setRegexFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [lineWrap, setLineWrap] = useState(true);
  const [showPids, setShowPids] = useState(true);
  const [fontSizeClass, setFontSizeClass] = useState('text-[12px] leading-[18px]');
  const [cliCommand, setCliCommand] = useState(
    'journalctl -u caddy -u sshd -u fail2ban -f -n 100 --output=short-iso',
  );
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Sync with prop updates if live
  useEffect(() => {
    if (isStreaming) {
      setLogsList(initialLogs);
    }
  }, [initialLogs, isStreaming]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logsList, autoScroll]);

  // Filter logs
  const filteredLogs = logsList.filter((log) => {
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
    if (selectedUnit !== 'ALL' && !log.service.toLowerCase().includes(selectedUnit.toLowerCase())) {
      return false;
    }
    if (regexFilter) {
      try {
        const reg = new RegExp(regexFilter, 'i');
        if (!reg.test(log.message) && !reg.test(log.service)) {
          return false;
        }
      } catch {
        // ignore invalid regex
      }
    }
    return true;
  });

  const handleUnitChange = (val: string) => {
    setSelectedUnit(val);
    if (val === 'ALL') {
      setCliCommand('journalctl -f -n 100 --output=short-iso');
    } else {
      setCliCommand(`journalctl -u ${val} -f -n 100 --output=short-iso`);
    }
  };

  const handleAppendPipe = (pipeStr: string) => {
    if (!cliCommand.includes(pipeStr)) {
      setCliCommand((prev) => `${prev} ${pipeStr}`);
    }
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopyFeedback('Copied CLI!');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleCopyViewport = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.service}] [${l.severity}] ${showPids ? l.pid + ' ' : ''}${l.message}`,
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied Viewport!');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleClearBuffer = () => {
    setLogsList([]);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">
      {/* Toast Feedback */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-primary text-on-surface px-space-md py-space-sm rounded shadow-xl flex items-center gap-space-sm font-code-body animate-fade-in">
          <span className="material-symbols-outlined text-secondary text-[18px]">content_copy</span>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* TOP HEADER & CONTROLLER CHASSIS */}
      <div className="flex flex-col bg-surface-container rounded-lg p-space-md shadow-sm gap-space-md border border-surface-container-high/40">
        {/* Title & Stream Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </span>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider font-semibold">
                  System & Service Log Viewer
                </span>
                <span className="font-code-label text-code-label px-space-xs py-0.5 rounded bg-surface-container-highest text-primary font-bold font-mono">
                  JOURNALD + DOCKER
                </span>
              </div>
              <p className="font-code-label text-code-label text-on-surface-variant tracking-wide uppercase font-mono">
                Unified Real-Time Kernel & Container Demuxer
              </p>
            </div>
          </div>

          {/* Live Stream Pause & Telemetry Actions */}
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? 'bg-secondary animate-pulse' : 'bg-error'
                }`}
              />
              <span
                className={`font-code-label text-code-label font-bold tracking-wider ${
                  isStreaming ? 'text-secondary' : 'text-error'
                }`}
              >
                {isStreaming ? 'TAIL: ACTIVE' : 'STREAM PAUSED'}
              </span>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-space-sm py-space-xs rounded transition-colors text-body-sm font-body-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                {isStreaming ? 'pause_circle' : 'play_circle'}
              </span>
              <span className="font-code-body text-code-body font-mono">
                {isStreaming ? 'Pause Stream' : 'Resume Stream'}
              </span>
            </button>
            <button
              onClick={handleClearBuffer}
              title="Purge View Buffer"
              className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs rounded transition-colors text-body-sm font-body-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">clear_all</span>
              <span className="font-code-body text-code-body font-mono">Clear</span>
            </button>
          </div>
        </div>

        {/* Filter & Aggregation Ribbon */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-center">
          {/* Target Daemon Multiselect */}
          <div className="xl:col-span-3 flex flex-col gap-space-xs relative">
            <label className="font-code-label text-code-label text-on-surface-variant uppercase flex items-center justify-between font-mono">
              <span>Target Daemon / Unit</span>
              <span className="text-primary font-semibold">12 ACTIVE UNITS</span>
            </label>
            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-code-body text-code-body px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer font-mono border border-surface-container-high"
              >
                <option value="ALL">ALL UNITS (Multiplexed Feed)</option>
                <option value="caddy">Docker: Caddy (caddy-ingress.service)</option>
                <option value="sshd">sshd.service (OpenSSH Daemon)</option>
                <option value="fail2ban">fail2ban.service (Brute Force Deflector)</option>
                <option value="nftables">nftables.service (Kernel Packet Filter)</option>
                <option value="tailscaled">tailscaled.service (Mesh Tunnel)</option>
                <option value="adguard">Docker: AdGuardHome (adguard.service)</option>
                <option value="dockerd">dockerd.service (Moby Engine)</option>
                <option value="kernel">Kernel: dmesg (klogd / Ring Buffer)</option>
                <option value="nextcloud">Docker: Nextcloud & cron</option>
                <option value="mariadb">Docker: MariaDB 11.2</option>
                <option value="redis">Docker: Redis In-Memory Cache</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-outline absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Syslog Severity Pills */}
          <div className="xl:col-span-4 flex flex-col gap-space-xs">
            <span className="font-code-label text-code-label text-on-surface-variant uppercase font-mono">
              Syslog Log Level Filter
            </span>
            <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded border border-surface-container-high font-mono">
              {['ALL', 'CRIT', 'ERR', 'WARN', 'NOTICE', 'INFO'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-space-sm py-0.5 rounded font-code-label text-code-label uppercase transition-colors ${
                    selectedSeverity === sev
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                      : sev === 'CRIT' || sev === 'ERR'
                      ? 'text-error hover:bg-error-container/40'
                      : sev === 'WARN'
                      ? 'text-secondary hover:bg-surface-container-high'
                      : sev === 'NOTICE'
                      ? 'text-primary hover:bg-surface-container-high'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Live RegEx Filter */}
          <div className="xl:col-span-5 flex flex-col gap-space-xs">
            <label className="font-code-label text-code-label text-on-surface-variant uppercase flex items-center justify-between font-mono">
              <span>Match Pattern / RegEx Filter</span>
              <span className="text-outline">SYNTAX: PCRE2</span>
            </label>
            <div className="relative flex items-center bg-surface-container-lowest rounded px-space-sm py-space-xs border border-surface-container-high">
              <span className="font-code-label text-code-label text-primary font-bold mr-space-xs font-mono">
                grep -E:
              </span>
              <input
                type="text"
                value={regexFilter}
                onChange={(e) => setRegexFilter(e.target.value)}
                placeholder="e.g. status=5.. | 'failed password' | SYN_SCAN"
                className="w-full bg-transparent font-code-body text-code-body text-on-surface placeholder:text-outline focus:outline-none font-mono"
              />
              {regexFilter && (
                <button
                  onClick={() => setRegexFilter('')}
                  className="text-outline hover:text-on-surface text-body-sm px-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Viewport Utility Switches */}
        <div className="flex flex-wrap items-center justify-between pt-space-xs text-on-surface-variant gap-space-sm font-mono">
          <div className="flex items-center gap-space-lg flex-wrap">
            {/* Auto Scroll Switch */}
            <label className="flex items-center gap-space-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-container-lowest text-primary-container focus:ring-0 cursor-pointer accent-primary"
              />
              <span className="font-code-label text-code-label text-on-surface">
                Auto-scroll (Pinned to Bottom)
              </span>
            </label>
            {/* Wrap Lines Switch */}
            <label className="flex items-center gap-space-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lineWrap}
                onChange={(e) => setLineWrap(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-container-lowest text-primary-container focus:ring-0 cursor-pointer accent-primary"
              />
              <span className="font-code-label text-code-label text-on-surface">Soft Line Wrap</span>
            </label>
            {/* Show PID Switch */}
            <label className="flex items-center gap-space-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPids}
                onChange={(e) => setShowPids(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-container-lowest text-primary-container focus:ring-0 cursor-pointer accent-primary"
              />
              <span className="font-code-label text-code-label text-on-surface">
                Display PID / Thread IDs
              </span>
            </label>
          </div>

          {/* Terminal Font Size Switcher */}
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-xs py-0.5 rounded border border-surface-container-high">
            <span className="font-code-label text-code-label text-outline px-1 uppercase">
              Font Size:
            </span>
            {[
              { size: '11px', cls: 'text-[11px] leading-[17px]' },
              { size: '12px', cls: 'text-[12px] leading-[18px]' },
              { size: '13px', cls: 'text-[13px] leading-[20px]' },
            ].map((f) => (
              <button
                key={f.size}
                onClick={() => setFontSizeClass(f.cls)}
                className={`px-space-xs py-0.5 rounded font-code-label text-code-label ${
                  fontSizeClass === f.cls
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f.size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TELEMETRY / INGESTION STATUS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-space-sm bg-surface-container-low p-space-sm rounded-lg border border-surface-container-high/30">
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded">
          <span className="font-code-label text-code-label text-outline uppercase font-mono">
            Active Feed
          </span>
          <span className="font-code-body text-code-body text-primary font-semibold truncate font-mono">
            {selectedUnit === 'ALL' ? 'caddy + sshd + 10' : selectedUnit}
          </span>
        </div>
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded">
          <span className="font-code-label text-code-label text-outline uppercase font-mono">
            Ingestion Velocity
          </span>
          <div className="flex items-center justify-between font-mono">
            <span className="font-code-body text-code-body text-secondary font-bold">
              {isStreaming ? '34 lines/s' : '0 lines/s'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreaming ? 'bg-secondary animate-pulse' : 'bg-outline'
              }`}
            />
          </div>
        </div>
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded font-mono">
          <span className="font-code-label text-code-label text-outline uppercase">
            Ring Buffer Fill
          </span>
          <div className="flex items-center justify-between">
            <span className="font-code-body text-code-body text-on-surface">10,000 / 10,000</span>
            <span className="font-code-label text-code-label text-secondary">100%</span>
          </div>
        </div>
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded font-mono">
          <span className="font-code-label text-code-label text-outline uppercase">
            Dropped Frames
          </span>
          <div className="flex items-center justify-between">
            <span className="font-code-body text-code-body text-on-surface font-semibold">
              0 lines (0.00%)
            </span>
            <span className="material-symbols-outlined text-[14px] text-secondary">
              check_circle
            </span>
          </div>
        </div>
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded font-mono">
          <span className="font-code-label text-code-label text-outline uppercase">
            Buffer Memory RSS
          </span>
          <span className="font-code-body text-code-body text-on-surface font-semibold">14.2 MB</span>
        </div>
        <div className="flex flex-col bg-surface-container px-space-sm py-space-xs rounded font-mono">
          <span className="font-code-label text-code-label text-outline uppercase">
            Matching Rows
          </span>
          <span className="font-code-body text-code-body text-primary font-bold">
            {filteredLogs.length} / {logsList.length} displayed
          </span>
        </div>
      </div>

      {/* MONOSPACE TERMINAL VIEWPORT CONTAINER */}
      <div className="relative flex flex-col bg-surface-container-lowest rounded-lg shadow-2xl overflow-hidden border border-surface-container-high/60">
        {/* Virtual Terminal Title Bar */}
        <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs select-none border-b border-surface-container-high/40">
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary/70 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/70 inline-block" />
            </div>
            <span className="font-code-label text-code-label text-on-surface-variant tracking-wider uppercase ml-space-xs font-mono">
              journalctl -f -o json-pretty --unit=* | tty1
            </span>
          </div>
          <div className="flex items-center gap-space-md font-mono">
            <span className="font-code-label text-code-label text-outline uppercase">
              ENCODING: UTF-8
            </span>
            <button
              onClick={handleCopyViewport}
              className="flex items-center gap-1 font-code-label text-code-label text-primary hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span>COPY VIEWPORT</span>
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div
          ref={terminalRef}
          className={`w-full max-h-[580px] min-h-[460px] overflow-y-auto overflow-x-auto p-space-md font-code-body ${fontSizeClass} bg-surface-container-lowest text-on-surface font-mono`}
        >
          {filteredLogs.length === 0 ? (
            <div className="p-space-lg text-center font-code-body text-outline">
              // No matching log records found in active ring buffer.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <tbody className="divide-none">
                {filteredLogs.map((log, index) => {
                  const lineNum = String(index + 1).padStart(4, '0');
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-container/60 group transition-colors"
                    >
                      <td className="select-none text-right pr-space-md text-outline font-code-label text-code-label align-top w-12">
                        {lineNum}
                      </td>
                      <td className="select-none pr-space-sm text-outline-variant font-code-label text-code-label whitespace-nowrap align-top">
                        [{log.timestamp}]
                      </td>
                      <td className="pr-space-sm align-top whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-code-label text-code-label font-bold uppercase ${
                            log.service === 'caddy'
                              ? 'bg-primary-container/20 text-primary'
                              : log.service === 'fail2ban'
                              ? 'bg-secondary-container/20 text-secondary'
                              : 'bg-surface-container-high text-secondary'
                          }`}
                        >
                          {log.service}
                        </span>
                      </td>
                      <td className="pr-space-sm align-top whitespace-nowrap">
                        <span
                          className={`px-1 py-0.5 rounded font-code-label text-code-label uppercase ${
                            log.severity === 'CRIT' || log.severity === 'ERR'
                              ? 'bg-error-container text-on-error-container font-bold'
                              : log.severity === 'WARN'
                              ? 'bg-surface-container-highest text-secondary font-bold'
                              : log.severity === 'NOTICE'
                              ? 'bg-surface-container-highest text-primary font-bold'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      {showPids && (
                        <td className="pr-space-sm align-top whitespace-nowrap text-outline font-code-label text-code-label">
                          {log.pid}
                        </td>
                      )}
                      <td
                        className={`align-top text-on-surface font-code-body ${
                          lineWrap ? 'break-words' : 'whitespace-nowrap'
                        }`}
                      >
                        {log.severity === 'WARN' ? (
                          <span className="text-error">{log.message}</span>
                        ) : log.severity === 'NOTICE' ? (
                          <span className="text-primary font-semibold">{log.message}</span>
                        ) : (
                          log.message
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pinned Terminal Stream Status Footer */}
        <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs text-on-surface-variant select-none border-t border-surface-container-high/40 font-mono">
          <div className="flex items-center gap-space-sm">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isStreaming ? 'bg-secondary animate-pulse' : 'bg-outline'
              }`}
            />
            <span className="font-code-label text-code-label text-secondary font-bold tracking-wider">
              TAILSTREAM BUFFER ONLINE
            </span>
            <span className="text-outline font-code-label text-code-label">|</span>
            <span className="font-code-label text-code-label text-on-surface-variant">
              HOST: homesv.local
            </span>
          </div>
          <div className="flex items-center gap-space-md font-code-label text-code-label">
            <span className="text-outline">CURSOR: Ln {filteredLogs.length}, Col 98</span>
            <span className="text-primary font-semibold">100% BUFFER CAPACITY</span>
          </div>
        </div>
      </div>

      {/* BOTTOM RAW QUERY CLI BAR & PIPE SHORTCUTS */}
      <div className="flex flex-col bg-surface-container rounded-lg p-space-md shadow-sm gap-space-sm border border-surface-container-high/40">
        <div className="flex flex-wrap items-center justify-between gap-space-xs font-mono">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
            <span className="font-code-label text-code-label text-on-surface font-bold uppercase tracking-wider">
              Equivalent POSIX / Shell Command:
            </span>
          </div>
          {/* Quick Pipe Insert Buttons */}
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-code-label text-code-label text-outline uppercase mr-1">
              Insert Pipe:
            </span>
            <button
              onClick={() => handleAppendPipe('| grep -iE "err|fail|warn"')}
              className="bg-surface-container-lowest hover:bg-surface-container-high text-secondary px-space-xs py-0.5 rounded font-code-label text-code-label transition-colors cursor-pointer"
            >
              | grep -i err
            </button>
            <button
              onClick={() => handleAppendPipe("| awk '{print $1, $4, $5}'")}
              className="bg-surface-container-lowest hover:bg-surface-container-high text-primary px-space-xs py-0.5 rounded font-code-label text-code-label transition-colors cursor-pointer"
            >
              | awk
            </button>
            <button
              onClick={() =>
                handleAppendPipe("| jq '.request | {remote_ip, method, uri}'")
              }
              className="bg-surface-container-lowest hover:bg-surface-container-high text-on-surface px-space-xs py-0.5 rounded font-code-label text-code-label transition-colors cursor-pointer"
            >
              | jq .
            </button>
            <button
              onClick={() => handleAppendPipe('| sort | uniq -c | sort -nr')}
              className="bg-surface-container-lowest hover:bg-surface-container-high text-outline hover:text-on-surface px-space-xs py-0.5 rounded font-code-label text-code-label transition-colors cursor-pointer"
            >
              | uniq -c
            </button>
          </div>
        </div>

        {/* Active CLI Shell Command Box */}
        <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded font-code-body text-code-body border border-surface-container-high font-mono">
          <div className="flex items-center gap-space-sm flex-1 overflow-x-auto min-w-0 pr-space-md">
            <span className="text-primary font-bold select-none leading-none">quan@homesv:~$</span>
            <span className="text-on-surface whitespace-nowrap">{cliCommand}</span>
          </div>
          <button
            onClick={handleCopyCli}
            className="flex items-center gap-space-xs bg-primary-container hover:bg-secondary text-on-primary-container px-space-sm py-space-xs rounded font-body-sm font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Copy CLI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
