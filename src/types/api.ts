export type ConnectionState = 'LIVE' | 'RECONNECTING' | 'OFFLINE';

export interface SystemMetrics {
  hostname: string;
  uptime: string;
  baseArch: string;
  kernel: string;
  zfsPoolStatus: string;
  nftablesStatus: string;
  lastSync: string;
  heartbeatAgeSeconds: number;
  cpu: {
    loadPercent: number;
    model: string;
    packageTemp: number;
    cores: number;
  };
  ram: {
    usedGb: number;
    totalGb: number;
    usedPercent: number;
  };
  storage: {
    nvmeUsedTb: number;
    nvmeTotalTb: number;
    nvmePercent: number;
    nvmeTemp: number;
    nvmeStatus: string;
    zfsUsedTb: number;
    zfsTotalTb: number;
    zfsPercent: number;
  };
  loadAvg: [number, number, number];
  securityTelemetry: {
    defcon: string;
    blockedTodayDrops: number;
    threatPosture: string;
    fail2banJailsActive: number;
    fail2banFailedAttempts: number;
    crowdsecDecisionsBounces: number;
    analyzedEvents24h: number;
  };
  daemonState: {
    dockerVersion: string;
    containersRunning: number;
    containersTotal: number;
    systemdDegradedUnits: number;
    notice: string;
    runtimeState: string;
  };
}

export interface NetworkInterface {
  name: string;
  type: string;
  tag: string;
  state: 'UP' | 'STANDBY' | 'ACTIVE';
  speedDesc: string;
  ip: string;
  gatewayOrSsid: string;
  rxBytes: string;
  txBytes: string;
  ping: string;
  pingType: string;
  icon: string;
}

export interface NetworkData {
  primaryDevice: string;
  wanFiber: boolean;
  ingressRxMbps: number;
  egressTxMbps: number;
  ingressPeakMbps: number;
  egressPeakMbps: number;
  activeSockets: {
    established: number;
    timeWait: number;
  };
  defaultRoute: string;
  wanPeak24h: string;
  pingRtt: string;
  interfaces: NetworkInterface[];
  trafficPoints: {
    time: string;
    rx: number;
    tx: number;
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
