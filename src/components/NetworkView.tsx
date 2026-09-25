import React, { useState } from 'react';
import { NetworkData } from '../types/api';

interface NetworkViewProps {
  network: NetworkData;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ network }) => {
  const [activeIface, setActiveIface] = useState<string>('enp2s0');

  const sockets = [
    { proto: 'tcp', local: '0.0.0.0:22', remote: '0.0.0.0:*', state: 'LISTEN', pid: 'sshd (49201)' },
    { proto: 'tcp', local: '192.168.1.100:22', remote: '100.92.14.2:52190', state: 'ESTABLISHED', pid: 'sshd (49214)' },
    { proto: 'tcp', local: '0.0.0.0:443', remote: '0.0.0.0:*', state: 'LISTEN', pid: 'caddy (1104)' },
    { proto: 'tcp', local: '192.168.1.100:443', remote: '104.28.19.12:49812', state: 'ESTABLISHED', pid: 'caddy (1104)' },
    { proto: 'tcp', local: '127.0.0.1:3306', remote: '0.0.0.0:*', state: 'LISTEN', pid: 'mariadbd (1420)' },
    { proto: 'udp', local: '0.0.0.0:53', remote: '0.0.0.0:*', state: 'LISTEN', pid: 'AdGuardHome (2042)' },
    { proto: 'udp', local: '0.0.0.0:41641', remote: '0.0.0.0:*', state: 'ACTIVE', pid: 'tailscaled (789)' },
    { proto: 'tcp', local: '192.168.1.100:22', remote: '185.220.101.42:51230', state: 'TIME_WAIT', pid: '-' },
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">
      {/* Network Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded border border-surface-container-high/40">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-outline font-mono">
            <span className="font-code-label text-code-label tracking-widest uppercase">
              Network Telemetry
            </span>
            <span className="font-code-body text-code-body">//</span>
            <span className="font-code-label text-code-label text-primary font-bold uppercase tracking-widest">
              MULTI-HOMED DUAL-ACTIVE
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold uppercase">
            PHYSICAL & VIRTUAL INTERFACES // SOCKET ROUTING
          </h1>
        </div>
        <div className="flex items-center gap-space-xs font-mono">
          <div className="bg-surface-container px-space-sm py-1 rounded text-on-surface font-code-label text-code-label">
            <span className="text-outline">DEFAULT ROUTE: </span>
            <span className="text-secondary font-bold">{network.defaultRoute}</span>
          </div>
          <div className="bg-surface-container px-space-sm py-1 rounded text-on-surface font-code-label text-code-label">
            <span className="text-outline">PHY PING: </span>
            <span className="text-primary font-bold">{network.pingRtt}</span>
          </div>
        </div>
      </div>

      {/* Interfaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {network.interfaces.map((iface) => (
          <div
            key={iface.name}
            onClick={() => setActiveIface(iface.name)}
            className={`p-space-md rounded-lg flex flex-col justify-between transition-all cursor-pointer border ${
              activeIface === iface.name
                ? 'bg-surface-container ring-1 ring-primary border-primary/50 shadow-md'
                : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-space-xs font-mono">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    {iface.icon}
                  </span>
                  <span className="font-code-body text-code-body text-on-surface font-bold">
                    {iface.name}
                  </span>
                </div>
                <span className="font-code-label text-code-label px-1 py-0.5 rounded bg-surface-container-highest text-secondary uppercase font-semibold">
                  {iface.tag}
                </span>
              </div>
              <p className="font-code-label text-code-label text-on-surface-variant font-mono">
                {iface.ip}
              </p>
              <p className="font-code-label text-code-label text-outline font-mono mt-0.5">
                {iface.gatewayOrSsid}
              </p>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-surface-container-high/40 flex items-center justify-between font-code-body text-code-body font-mono">
              <span className="text-outline text-xs">RX: {iface.rxBytes}</span>
              <span className="text-on-surface text-xs">TX: {iface.txBytes}</span>
              <span className="text-secondary font-bold text-xs">{iface.ping}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Sockets Table */}
      <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/40">
        <div className="flex items-center justify-between pb-space-xs font-mono">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">hub</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold font-sans">
              Active Kernel Sockets & Listening Ports
            </span>
          </div>
          <span className="font-code-label text-code-label text-outline">
            {network.activeSockets.established} ESTABLISHED / {network.activeSockets.timeWait} TIME_WAIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-outline text-[11px] uppercase">
                <th className="py-2 px-3">Proto</th>
                <th className="py-2 px-3">Local Address</th>
                <th className="py-2 px-3">Foreign Address</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Process / Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {sockets.map((s, idx) => (
                <tr key={idx} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-2 px-3 text-secondary uppercase font-bold">{s.proto}</td>
                  <td className="py-2 px-3 text-on-surface">{s.local}</td>
                  <td className="py-2 px-3 text-on-surface-variant">{s.remote}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1 py-0.5 rounded text-[10px] uppercase font-bold ${
                        s.state === 'ESTABLISHED'
                          ? 'bg-secondary-container/20 text-secondary'
                          : s.state === 'LISTEN'
                          ? 'bg-surface-container-highest text-primary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {s.state}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-on-surface-variant font-semibold">{s.pid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
