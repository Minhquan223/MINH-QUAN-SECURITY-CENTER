export type ConnectionState = 'LIVE' | 'RECONNECTING' | 'OFFLINE';

export interface SystemMetrics {
  hostname: string;
  uptime: number;
  baseArch: string;
  kernel: string;
  zfsPoolStatus: string;
  nftablesStatus: string;
  lastSync: string;
  heartbeatAgeSeconds: number | null;

  cpu: {
    loadPercent: number;
    model: string;
    packageTemp: number | null;
    cores: number;
  };

  ram: {
    usedGb: number;
    totalGb: number;
    usedPercent: number;
  };

  storage: {
    root: {
      mount: string;
      usedGb: number;
      totalGb: number;
      percent: number;
      filesystem: string;
      status: string;
    };
    data: {
      mount: string;
      usedGb: number;
      totalGb: number;
      percent: number;
      filesystem: string;
      status: string;
    };
    smart: string | null;
    temperature: number | null;

    nvmeUsedTb: number | null;
    nvmeTotalTb: number | null;
    nvmePercent: number | null;
    nvmeTemp: number | null;
    nvmeStatus: string;
    zfsUsedTb: number | null;
    zfsTotalTb: number | null;
    zfsPercent: number | null;
  };

  loadAvg: [number, number, number];

  securityTelemetry: {
    defcon: string;
    blockedTodayDrops: number | null;
    threatPosture: string;
    fail2banJailsActive: number | null;
    fail2banFailedAttempts: number;
    crowdsecDecisionsBounces: number | null;
    analyzedEvents24h: number | null;
  };

  daemonState: {
    dockerVersion: string;
    containersRunning: number;
    containersTotal: number;
    systemdDegradedUnits: number;
    notice: string | null;
    runtimeState: string;
  };
}

export interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'tailscale';
  tag: string;
  state: string;
  speedDesc: string | null;
  duplex: string | null;
  carrier: boolean;
  mac: string | null;
  mtu: number | null;
  ip: string | null;
  gateway: string | null;

  ssid: string | null;
  bssid: string | null;
  signalDbm: number | null;
  frequencyMhz: number | null;
  txBitrateMbps: number | null;
  rxBitrateMbps: number | null;

  rxBytes: number;
  txBytes: number;
  ping: number | null;
  pingType: string;
  icon: string;
}

export interface WifiInfo {
  interface: string;
  state: string;
  ip: string | null;
  gateway: string | null;
  ssid: string | null;
  bssid: string | null;
  signalDbm: number | null;
  frequencyMhz: number | null;
  txBitrateMbps: number | null;
  rxBitrateMbps: number | null;
  mac: string | null;
  mtu: number | null;
  carrier: boolean;
}

export interface LanInfo {
  interface: string;
  state: string;
  ip: string | null;
  gateway: string | null;
  speed: string | null;
  duplex: string | null;
  carrier: boolean;
  mac: string | null;
  mtu: number | null;
  rxBytes: number;
  txBytes: number;
  ping: number | null;
}

export interface NetworkData {
  primaryDevice: string;
  wanFiber: boolean | null;

  ingressRxMbps: number;
  egressTxMbps: number;

  peaks: {
    ingressRxMbps: number;
    egressTxMbps: number;
  };

  activeSockets: number;

  defaultRoute: {
    device: string;
    gateway: string;
  };

  wanPeak24h: {
    rxMbps: number;
    txMbps: number;
    scope?: string;
    sampleCount?: number;
  };

  pingRtt: number | null;

  interfaces: NetworkInterface[];

  wifi: WifiInfo | null;
  lan: LanInfo[];

  trafficPoints: {
    timestamp: number;
    rxMbps: number;
    txMbps: number;
  }[];
}

export interface ServiceDaemon {
  id: string;
  name: string;
  category: 'SYSTEM' | 'WEB/PROXY' | 'MEDIA/STORAGE' | 'DATABASE';
  status: string;
  statusBadge: string;
  statusTone: 'secondary' | 'primary' | 'warning' | 'error';
  cpu: string;
  mem: string;
  uptime: string;
  restarts: number;
  portOrEdge: string;
  notice?: string;
  icon: string;
}

export interface TargetDossier {
  ip: string;
  ipType: string;
  reverseDns: string;
  autonomousSystem: string;
  physicalOrigin: string;
  threatCategorization: string;
  confidenceScore: string;
  historicalHits: string;
}

export interface SecurityEvent {
  id: string;
  incidentId?: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE' | 'INFO';
  category: string;
  subsystem: string;
  source: string;
  destination: string;
  process?: string;
  summary: string;
  diagnosis?: string;
  rawBuffer?: string[];
  geoIp?: string;
  geoDetails?: string;
  reverseDns?: string;
  reverseDnsTtl?: string;
  mitigationState?: string;
  mitigationRemaining?: string;
  triggeredRule?: string;
  dossier?: TargetDossier;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  service: string;
  severity: 'CRIT' | 'ERR' | 'WARN' | 'NOTICE' | 'INFO';
  pid: string;
  message: string;
  rawJson?: Record<string, unknown>;
}

export interface StreamEvent {
  type: 'security_event' | 'metrics_tick' | 'network_tick' | 'log_entry' | 'heartbeat';
  data: any;
  timestamp: string;
}
