import React, { useState } from 'react';
import { NetworkData, NetworkInterface } from '../types/api';

interface NetworkViewProps {
  network: NetworkData;
}

const fmtBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '?';
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const fmtNumber = (value: number | null | undefined, digits = 1) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '?';
  return value.toFixed(digits);
};

const signalQuality = (dbm: number | null) => {
  if (dbm === null) return '?';
  if (dbm >= -50) return 'EXCELLENT';
  if (dbm >= -60) return 'GOOD';
  if (dbm >= -70) return 'FAIR';
  return 'WEAK';
};

const InterfaceCard: React.FC<{
  iface: NetworkInterface;
  active: boolean;
  onClick: () => void;
}> = ({ iface, active, onClick }) => {
  const isWifi = iface.type === 'wifi';
  const isEthernet = iface.type === 'ethernet';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-space-md rounded-lg flex flex-col justify-between transition-all border ${
        active
          ? 'bg-surface-container ring-1 ring-primary border-primary/50 shadow-md'
          : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high/40'
      }`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-space-xs font-mono">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              {iface.icon}
            </span>
            <span className="font-code-body text-code-body text-on-surface font-bold">
              {iface.name}
            </span>
          </div>

          <span className={`font-code-label text-code-label px-1 py-0.5 rounded uppercase font-semibold ${
            iface.state === 'UP'
              ? 'bg-secondary-container/20 text-secondary'
              : 'bg-surface-container-highest text-outline'
          }`}>
            {iface.state}
          </span>
        </div>

        <div className="font-code-label text-code-label font-mono space-y-1">
          <div className="text-on-surface">
            IP: <span className="text-secondary">{iface.ip || '?'}</span>
          </div>

          <div className="text-outline">
            MAC: {iface.mac || '?'}
          </div>

          {isWifi && (
            <>
              <div className="text-on-surface">
                SSID: <span className="text-secondary">{iface.ssid || '?'}</span>
              </div>
              <div className="text-outline">
                Signal: {fmtNumber(iface.signalDbm)} dBm / {signalQuality(iface.signalDbm)}
              </div>
              <div className="text-outline">
                Radio: {iface.frequencyMhz ? `${(iface.frequencyMhz / 1000).toFixed(2)} GHz` : '?'}
              </div>
            </>
          )}

          {isEthernet && (
            <>
              <div className="text-outline">
                Link: {iface.speedDesc || 'NO LINK'}
              </div>
              <div className="text-outline">
                Duplex: {iface.duplex || '?'}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-space-md pt-space-xs border-t border-surface-container-high/40 grid grid-cols-3 gap-2 font-code-label text-code-label font-mono">
        <div>
          <div className="text-outline">RX</div>
          <div className="text-on-surface">{fmtBytes(iface.rxBytes)}</div>
        </div>

        <div>
          <div className="text-outline">TX</div>
          <div className="text-on-surface">{fmtBytes(iface.txBytes)}</div>
        </div>

        <div>
          <div className="text-outline">PING</div>
          <div className="text-secondary font-bold">
            {iface.ping !== null ? `${fmtNumber(iface.ping)} ms` : '?'}
          </div>
        </div>
      </div>
    </button>
  );
};

export const NetworkView: React.FC<NetworkViewProps> = ({ network }) => {
  const [activeIface, setActiveIface] = useState(network.primaryDevice);

  const selected = network.interfaces.find((x) => x.name === activeIface)
    ?? network.interfaces[0];

  const wifi = network.wifi;
  const lan = network.lan;

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded border border-surface-container-high/40">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-outline font-mono">
            <span className="font-code-label text-code-label tracking-widest uppercase">
              Network Telemetry
            </span>
            <span className="font-code-body text-code-body">//</span>
            <span className="font-code-label text-code-label text-primary font-bold uppercase tracking-widest">
              REAL-TIME
            </span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5 font-bold uppercase">
            PHYSICAL & TUNNEL INTERFACES
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-space-xs font-mono">
          <div className="bg-surface-container px-space-sm py-1 rounded font-code-label text-code-label">
            <span className="text-outline">DEFAULT: </span>
            <span className="text-secondary font-bold">
              {network.defaultRoute.device} ? {network.defaultRoute.gateway}
            </span>
          </div>

          <div className="bg-surface-container px-space-sm py-1 rounded font-code-label text-code-label">
            <span className="text-outline">PING: </span>
            <span className="text-primary font-bold">
              {network.pingRtt !== null ? `${fmtNumber(network.pingRtt)} ms` : '?'}
            </span>
          </div>

          <div className="bg-surface-container px-space-sm py-1 rounded font-code-label text-code-label">
            <span className="text-outline">SOCKETS: </span>
            <span className="text-on-surface font-bold">{network.activeSockets}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {network.interfaces.map((iface) => (
          <InterfaceCard
            key={iface.name}
            iface={iface}
            active={selected?.name === iface.name}
            onClick={() => setActiveIface(iface.name)}
          />
        ))}
      </div>

      {selected && (
        <div className="bg-surface-container-low rounded-lg p-space-md border border-surface-container-high/40">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <div className="font-code-label text-code-label text-outline uppercase tracking-widest">
                Selected Interface
              </div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">
                {selected.name}
              </div>
            </div>

            <span className="font-code-label text-code-label text-secondary uppercase">
              {selected.type}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md font-mono text-code-label">
            <div>
              <div className="text-outline">GATEWAY</div>
              <div className="text-on-surface">{selected.gateway || '?'}</div>
            </div>

            <div>
              <div className="text-outline">MTU</div>
              <div className="text-on-surface">{selected.mtu ?? '?'}</div>
            </div>

            <div>
              <div className="text-outline">CARRIER</div>
              <div className="text-on-surface">{selected.carrier ? 'PRESENT' : 'NO LINK'}</div>
            </div>

            <div>
              <div className="text-outline">PING</div>
              <div className="text-secondary font-bold">
                {selected.ping !== null ? `${fmtNumber(selected.ping)} ms` : '?'}
              </div>
            </div>
          </div>

          {selected.type === 'wifi' && (
            <div className="mt-space-md pt-space-md border-t border-surface-container-high/40 grid grid-cols-2 md:grid-cols-4 gap-space-md font-mono text-code-label">
              <div>
                <div className="text-outline">BSSID</div>
                <div className="text-on-surface">{selected.bssid || '?'}</div>
              </div>

              <div>
                <div className="text-outline">FREQUENCY</div>
                <div className="text-on-surface">
                  {selected.frequencyMhz ? `${selected.frequencyMhz} MHz` : '?'}
                </div>
              </div>

              <div>
                <div className="text-outline">TX RATE</div>
                <div className="text-on-surface">
                  {selected.txBitrateMbps !== null ? `${fmtNumber(selected.txBitrateMbps)} Mbps` : '?'}
                </div>
              </div>

              <div>
                <div className="text-outline">RX RATE</div>
                <div className="text-on-surface">
                  {selected.rxBitrateMbps !== null ? `${fmtNumber(selected.rxBitrateMbps)} Mbps` : '?'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">

        <div className="bg-surface-container-low rounded-lg p-space-md border border-surface-container-high/40">
          <div className="flex items-center gap-space-xs mb-space-md">
            <span className="material-symbols-outlined text-[18px] text-primary">wifi</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
              Wi-Fi Link
            </span>
          </div>

          {wifi ? (
            <div className="grid grid-cols-2 gap-space-md font-mono text-code-label">
              <div>
                <div className="text-outline">SSID</div>
                <div className="text-on-surface">{wifi.ssid || '?'}</div>
              </div>
              <div>
                <div className="text-outline">SIGNAL</div>
                <div className="text-secondary font-bold">
                  {fmtNumber(wifi.signalDbm)} dBm
                </div>
              </div>
              <div>
                <div className="text-outline">BSSID</div>
                <div className="text-on-surface">{wifi.bssid || '?'}</div>
              </div>
              <div>
                <div className="text-outline">RADIO</div>
                <div className="text-on-surface">
                  {wifi.frequencyMhz ? `${wifi.frequencyMhz} MHz` : '?'}
                </div>
              </div>
              <div>
                <div className="text-outline">TX</div>
                <div className="text-on-surface">
                  {wifi.txBitrateMbps !== null ? `${fmtNumber(wifi.txBitrateMbps)} Mbps` : '?'}
                </div>
              </div>
              <div>
                <div className="text-outline">RX</div>
                <div className="text-on-surface">
                  {wifi.rxBitrateMbps !== null ? `${fmtNumber(wifi.rxBitrateMbps)} Mbps` : '?'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-outline font-mono text-code-label">NO WIFI DATA</div>
          )}
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md border border-surface-container-high/40">
          <div className="flex items-center gap-space-xs mb-space-md">
            <span className="material-symbols-outlined text-[18px] text-primary">lan</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
              Ethernet Links
            </span>
          </div>

          <div className="space-y-space-sm">
            {lan.map((item) => (
              <div key={item.interface} className="p-space-sm bg-surface-container rounded border border-surface-container-high/40 font-mono text-code-label">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface font-bold">{item.interface}</span>
                  <span className={item.carrier ? 'text-secondary' : 'text-outline'}>
                    {item.carrier ? 'LINK UP' : 'LINK DOWN'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-outline">
                  <span>IP: {item.ip || '?'}</span>
                  <span>Speed: {item.speed || '?'}</span>
                  <span>Duplex: {item.duplex || '?'}</span>
                  <span>MTU: {item.mtu}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-surface-container-low rounded-lg p-space-md border border-surface-container-high/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm font-mono">
          <div>
            <div className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
              Live Traffic
            </div>
            <div className="text-outline font-code-label text-code-label">
              RX {fmtNumber(network.ingressRxMbps, 3)} Mbps / TX {fmtNumber(network.egressTxMbps, 3)} Mbps
            </div>
          </div>

          <div className="text-outline font-code-label text-code-label">
            Process samples: {network.wanPeak24h.sampleCount ?? network.trafficPoints.length}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-md font-mono">
          <div className="p-space-md bg-surface-container rounded">
            <div className="text-outline text-code-label">RX CURRENT</div>
            <div className="text-on-surface text-xl font-bold">
              {fmtNumber(network.ingressRxMbps, 3)} Mbps
            </div>
          </div>

          <div className="p-space-md bg-surface-container rounded">
            <div className="text-outline text-code-label">TX CURRENT</div>
            <div className="text-on-surface text-xl font-bold">
              {fmtNumber(network.egressTxMbps, 3)} Mbps
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
