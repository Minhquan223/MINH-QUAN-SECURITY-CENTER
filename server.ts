import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory state for SOC server
const initialSystemMetrics = {
  hostname: 'HOMESV.LAN',
  uptime: '38d 14h 22m',
  baseArch: 'AMD64 / ZEN3 SOC',
  kernel: '6.1.0-21-amd64',
  zfsPoolStatus: 'HEALTHY',
  nftablesStatus: 'ENFORCING',
  lastSync: '14:28:12 UTC',
  heartbeatAgeSeconds: 2,
  cpu: {
    loadPercent: 24,
    model: 'AMD Ryzen 7 5700G @ 3.80GHz',
    packageTemp: 42,
    cores: '8C/16T',
  },
  ram: {
    usedGb: 14.2,
    totalGb: 32.0,
    usedPercent: 44,
  },
  storage: {
    nvmeUsedTb: 1.2,
    nvmeTotalTb: 2.0,
    nvmePercent: 60,
    nvmeTemp: 38,
    nvmeStatus: '38°C [NOMINAL]',
    zfsUsedTb: 14.8,
    zfsTotalTb: 24.0,
    zfsPercent: 61,
  },
  loadAvg: [0.42, 0.38, 0.31],
  securityTelemetry: {
    defcon: 4,
    blockedTodayDrops: 842,
    threatPosture: 'LOW RISK / ACTIVE SURV',
    fail2banJailsActive: 12,
    fail2banFailedAttempts: 37,
    crowdsecDecisionsBounces: 3,
    analyzedEvents24h: 1842,
  },
  daemonState: {
    dockerVersion: 'v26.1.1',
    containersRunning: 11,
    containersTotal: 12,
    systemdDegradedUnits: 0,
    notice: 'Bazarr sync index delay',
    runtimeState: '16 RUNNING / 0 DEAD',
  },
};

const initialNetworkData = {
  primaryDevice: 'enp2s0 (ONT Fiber)',
  wanFiber: true,
  ingressRxMbps: 48.6,
  egressTxMbps: 12.4,
  ingressPeakMbps: 112.4,
  egressPeakMbps: 45.2,
  activeSockets: {
    established: 428,
    timeWait: 18,
  },
  defaultRoute: '192.168.1.1',
  wanPeak24h: '112.4 MB/s (03:14 UTC)',
  pingRtt: '4.2ms [1.1.1.1]',
  interfaces: [
    {
      name: 'enp2s0',
      type: 'GbE LAN',
      tag: 'GbE LAN [UP]',
      state: 'UP',
      speedDesc: '1000Mbps Full Duplex',
      ip: '192.168.1.100/24',
      gatewayOrSsid: 'GW: 192.168.1.1 (Fiber ONT)',
      rxBytes: '1.42 TB',
      txBytes: '894.2 GB',
      ping: '1.2ms',
      pingType: 'PHY PING',
      icon: 'lan',
    },
    {
      name: 'wlp3s0',
      type: 'INTEL AX200',
      tag: 'INTEL AX200 [STANDBY]',
      state: 'STANDBY',
      speedDesc: '866 Mbps (-54 dBm)',
      ip: '192.168.1.101/24',
      gatewayOrSsid: 'SSID: HomeNet_5G_Ext',
      rxBytes: '42.1 GB',
      txBytes: '18.4 GB',
      ping: '3.8ms',
      pingType: 'WLAN RTT',
      icon: 'wifi',
    },
    {
      name: 'tailscale0',
      type: 'MESH VPN',
      tag: 'MESH VPN [ACTIVE]',
      state: 'ACTIVE',
      speedDesc: 'DERP 12 (FRA)',
      ip: 'Overlay IPv4: 100.92.14.88',
      gatewayOrSsid: 'Peers: 7 Authorized Nodes',
      rxBytes: '18.2 GB',
      txBytes: '22.4 GB',
      ping: '18.5ms',
      pingType: 'MESH LAT',
      icon: 'vpn_lock',
    },
  ],
  trafficPoints: [
    { time: '-5m 00s', rx: 20, tx: 10 },
    { time: '-4m 30s', rx: 40, tx: 15 },
    { time: '-4m 00s', rx: 35, tx: 22 },
    { time: '-3m 30s', rx: 60, tx: 30 },
    { time: '-3m 00s', rx: 55, tx: 25 },
    { time: '-2m 30s', rx: 80, tx: 40 },
    { time: '-2m 00s', rx: 70, tx: 45 },
    { time: '-1m 30s', rx: 90, tx: 50 },
    { time: '-1m 00s', rx: 75, tx: 40 },
    { time: '-30s', rx: 110, tx: 65 },
    { time: 'T=0 (NOW)', rx: 85, tx: 55 },
  ],
};

const initialServices = [
  {
    id: 'docker',
    name: 'Docker Engine',
    category: 'SYSTEM',
    status: 'ONLINE',
    statusBadge: 'ONLINE',
    statusTone: 'secondary',
    cpu: '1.2%',
    mem: '420 MB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'PORT: unix:///var/run/docker.sock',
    icon: 'token',
  },
  {
    id: 'caddy',
    name: 'Caddy Ingress',
    category: 'WEB/PROXY',
    status: 'ACTIVE',
    statusBadge: 'ACTIVE',
    statusTone: 'secondary',
    cpu: '0.4%',
    mem: '88 MB',
    uptime: '38d 14h',
    restarts: 1,
    portOrEdge: 'PORTS: :80, :443, :8443',
    icon: 'router',
  },
  {
    id: 'cloudflared',
    name: 'Cloudflared',
    category: 'WEB/PROXY',
    status: 'SYNCED',
    statusBadge: 'SYNCED',
    statusTone: 'secondary',
    cpu: '0.1%',
    mem: '62 MB',
    uptime: '19d 08h',
    restarts: 0,
    portOrEdge: 'EDGE: 2 QUIC Tunnels Up',
    icon: 'cloud_done',
  },
  {
    id: 'tailscale',
    name: 'Tailscaled',
    category: 'SYSTEM',
    status: 'CONNECTED',
    statusBadge: 'CONNECTED',
    statusTone: 'secondary',
    cpu: '0.2%',
    mem: '45 MB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'MESH: 100.92.14.88 (Exit Node)',
    icon: 'share',
  },
  {
    id: 'adguard',
    name: 'AdGuard Home',
    category: 'SYSTEM',
    status: 'FILTERING',
    statusBadge: 'FILTERING',
    statusTone: 'primary',
    cpu: '0.8%',
    mem: '114 MB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'DNS: :53 (28% Block Rate)',
    icon: 'verified_user',
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud Hub',
    category: 'MEDIA/STORAGE',
    status: 'NOMINAL',
    statusBadge: 'NOMINAL',
    statusTone: 'secondary',
    cpu: '2.4%',
    mem: '1.4 GB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'STORAGE: /mnt/tank/user_data',
    icon: 'cloud_sync',
  },
  {
    id: 'mariadb',
    name: 'MariaDB 11.2',
    category: 'DATABASE',
    status: 'HEALTHY',
    statusBadge: 'HEALTHY',
    statusTone: 'secondary',
    cpu: '1.1%',
    mem: '780 MB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'PORT: 127.0.0.1:3306 (InnoDB)',
    icon: 'database',
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    category: 'DATABASE',
    status: 'HEALTHY',
    statusBadge: 'HEALTHY',
    statusTone: 'primary',
    cpu: '0.3%',
    mem: '92 MB',
    uptime: '38d 14h',
    restarts: 0,
    portOrEdge: 'KEYS: 18,490 (HIT: 99.4%)',
    icon: 'bolt',
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin Media',
    category: 'MEDIA/STORAGE',
    status: 'READY',
    statusBadge: 'READY',
    statusTone: 'secondary',
    cpu: '0.6%',
    mem: '820 MB',
    uptime: '24d 11h',
    restarts: 0,
    portOrEdge: 'VAAPI: AMD Radeon Vega 8',
    icon: 'movie',
  },
  {
    id: 'sonarr',
    name: 'Sonarr TV',
    category: 'MEDIA/STORAGE',
    status: 'RUNNING',
    statusBadge: 'RUNNING',
    statusTone: 'primary',
    cpu: '0.4%',
    mem: '310 MB',
    uptime: '22d 02h',
    restarts: 0,
    portOrEdge: 'PORT: :8989 • v4.0.4',
    icon: 'tv',
  },
  {
    id: 'radarr',
    name: 'Radarr Cinema',
    category: 'MEDIA/STORAGE',
    status: 'RUNNING',
    statusBadge: 'RUNNING',
    statusTone: 'primary',
    cpu: '0.5%',
    mem: '340 MB',
    uptime: '22d 02h',
    restarts: 0,
    portOrEdge: 'PORT: :7878 • v5.4.3',
    icon: 'videocam',
  },
  {
    id: 'bazarr',
    name: 'Bazarr',
    category: 'MEDIA/STORAGE',
    status: 'WARNING',
    statusBadge: 'WARNING',
    statusTone: 'warning',
    cpu: '3.8%',
    mem: '190 MB',
    uptime: '0d 00h',
    restarts: 3,
    portOrEdge: 'Sync index delay • Retrying provider',
    notice: 'Sync index delay • Retrying provider',
    icon: 'subtitles',
  },
];

const initialSecurityEvents = [
  {
    id: 'sec-98402',
    incidentId: 'INCIDENT #SEC-98402',
    timestamp: '2025-05-14 14:27:44.204 UTC',
    severity: 'CRITICAL',
    category: 'Auth / Brute Force (SSH)',
    subsystem: 'SSH / Auth',
    source: '185.220.101.42 (DE / Tor Exit / AS49453)',
    destination: '192.168.1.100:22 (HOMESV)',
    process: '/usr/sbin/sshd [PID: 49201]',
    summary: "SSH brute-force: 3 invalid attempts for 'root'",
    diagnosis:
      "Multiple persistent failed authentication attempts for privileged user root. Traffic characteristics matched signature bruteforce_ssh_tier1 with 38 failed handshakes within 6000ms.",
    rawBuffer: [
      '14:27:43.912 sshd[49201]: Failed password for invalid user root from 185.220.101.42 port 51230 ssh2',
      '14:27:44.004 sshd[49201]: Received disconnect from 185.220.101.42 port 51230:11: Bye Bye [preauth]',
      '14:27:44.110 fail2ban-server[1204]: [ssh-nftables] Ban 185.220.101.42 triggered by rule maxretry=3',
      '14:27:44.204 kernel: [38194.10283] nftables: DROP IN=enp3s0 OUT= MAC=00:1e:67:84:aa:21 SRC=185.220.101.42 DST=192.168.1.100 PROTO=TCP SPT=51238 DPT=22 FLAGS=SYN',
    ],
    geoIp: 'Frankfurt, Germany (DE)',
    geoDetails: 'ASN49453 • Tor Exit Gateway',
    reverseDns: 'tor-exit-node-04.torservers.net',
    reverseDnsTtl: 'TTL: 300s (Authoritative)',
    mitigationState: 'nftables [f2b-sshd] Jailed',
    mitigationRemaining: 'Remaining: 23h 58m 12s',
    triggeredRule: 'SSH_ANOMALY_091',
    dossier: {
      ip: '185.220.101.42',
      ipType: 'IPv4 / Public',
      reverseDns: 'tor-exit-node-04.torservers.net',
      autonomousSystem: 'AS49453 (Global AX)',
      physicalOrigin: 'Frankfurt am Main, DE',
      threatCategorization: 'Tor Exit Relay / Scanner',
      confidenceScore: '98% Abuse Rate',
      historicalHits: '414 occurrences / 30d',
    },
  },
  {
    id: 'sec-98399',
    timestamp: '14:28:11 UTC',
    severity: 'NOTICE',
    category: 'Access / SSH Session',
    subsystem: 'SSH / Auth',
    source: '100.92.14.2 (MacBook)',
    destination: '192.168.1.100:22',
    process: 'pam_sshd',
    summary: 'SSH session opened for user quan via ed25519 key',
  },
  {
    id: 'sec-98380',
    timestamp: '14:25:30 UTC',
    severity: 'NOTICE',
    category: 'Reverse Proxy / TLS',
    subsystem: 'Docker audit',
    source: 'caddy-proxy',
    destination: "Let's Encrypt ACME",
    process: 'caddy',
    summary: 'Docker ingress reload: TLS cert auto-renewed for homesv.internal',
  },
  {
    id: 'sec-98375',
    timestamp: '14:21:05.819 UTC',
    severity: 'CRITICAL',
    category: 'Network / Port Scan',
    subsystem: 'Firewall / nftables',
    source: '45.154.255.89 (RU)',
    destination: '192.168.1.100:Multi',
    process: 'kernel / nftables',
    summary:
      'SYN scan on 12 closed ports (21, 22, 23, 80, 443, 3306, 8080) -> Inbound traffic dropped by nftables policy [input-wan-drop].',
  },
  {
    id: 'sec-98362',
    timestamp: '14:18:22 UTC',
    severity: 'INFO',
    category: 'Container Daemon',
    subsystem: 'Docker audit',
    source: 'bazarr-subtitles',
    destination: 'unix:///var/run/docker.sock',
    process: 'PID 18420',
    summary: 'Container daemon initialized task worker successfully',
  },
  {
    id: 'sec-98350',
    timestamp: '14:15:33.102 UTC',
    severity: 'WARNING',
    category: 'DNS / Exfiltration Probe',
    subsystem: 'DNS / AdGuard',
    source: '192.168.1.145 (IoT camera)',
    destination: '1.1.1.1:53',
    process: 'AdGuardHome',
    summary:
      'Suspicious query rate spike: 850 qps targeting dynamic DNS domain cluster *.ddns.net -> Automated burst ratelimit applied.',
  },
  {
    id: 'sec-98342',
    timestamp: '14:15:00 UTC',
    severity: 'NOTICE',
    category: 'Network Rate Limiter',
    subsystem: 'Firewall / nftables',
    source: 'GW Ping Burst',
    destination: 'enp2s0',
    process: 'K_NETFILTER',
    summary: 'ICMP rate limiter activated on interface enp2s0 (120 pkts/s)',
  },
  {
    id: 'sec-98320',
    timestamp: '14:12:00.012 UTC',
    severity: 'WARNING',
    category: 'Filesystem / AIDE',
    subsystem: 'Integrity / AIDE',
    source: 'localhost',
    destination: '/etc/pam.d/common-auth',
    process: 'systemd-udevd',
    summary:
      'Checksum SHA256 mismatch detected during scheduled audit -> Auto-verified apt update artifact via dpkg database check.',
  },
  {
    id: 'sec-98315',
    timestamp: '14:08:44.912 UTC',
    severity: 'NOTICE',
    category: 'Access / Tailscale VPN',
    subsystem: 'SSH / Auth',
    source: '100.92.14.2 (MacBook-M3)',
    destination: '100.92.14.88:443',
    process: 'tailscaled',
    summary:
      'Operator quan@homesv authorized via Tailscale OAuth SSO. DERP relay #11 (Tokyo) direct WireGuard established.',
  },
  {
    id: 'sec-98301',
    timestamp: '14:02:18 UTC',
    severity: 'WARNING',
    category: 'Hardware / Thermal',
    subsystem: 'Integrity / AIDE',
    source: 'NVME0n1',
    destination: 'FAN CURVE ENGAGED',
    process: 'kernel',
    summary: 'Thermal threshold alert: Samsung 980 PRO reached 52°C during scrub',
  },
  {
    id: 'sec-98285',
    timestamp: '13:58:40 UTC',
    severity: 'INFO',
    category: 'Cache Invalidation',
    subsystem: 'Docker audit',
    source: 'redis-nc',
    destination: 'OK',
    process: 'redis-server',
    summary: 'Nextcloud Redis memory cache flush complete; RTT < 0.4ms',
  },
  {
    id: 'sec-98270',
    timestamp: '13:55:12.441 UTC',
    severity: 'INFO',
    category: 'Container Daemon',
    subsystem: 'Docker audit',
    source: 'local_socket',
    destination: 'unix:///var/run/docker.sock',
    process: 'dockerd',
    summary:
      'Container caddy-ingress healthy status confirmed. ACME zero-downtime certificate renewed for *.homesv.internal.',
  },
  {
    id: 'sec-98250',
    timestamp: '13:41:09.112 UTC',
    severity: 'NOTICE',
    category: 'Reverse Proxy',
    subsystem: 'Docker audit',
    source: '104.28.19.12 (US, Cloudflare)',
    destination: '192.168.1.100:443',
    process: 'caddy',
    summary:
      'TLS 1.3 handshakes negotiated with ECDHE_ECDSA_AES_256_GCM_SHA384, HTTP/3 QUIC connection active.',
  },
];

const initialLogs = [
  {
    id: 1,
    timestamp: '14:28:11.890',
    service: 'sshd',
    severity: 'INFO',
    pid: '[PID 49214]',
    message:
      'Accepted publickey for quan from 100.92.14.2 port 52190 ssh2: ED25519 SHA256:m0Qn3X79AilVz74G...',
  },
  {
    id: 2,
    timestamp: '14:28:09.124',
    service: 'caddy',
    severity: 'INFO',
    pid: '[PID 1104]',
    message:
      '{"level":"info", "ts":1715696889.124, "msg":"handled request", "request":{"remote_ip":"100.92.14.2", "proto":"HTTP/2.0", "method":"GET", "uri":"/api/v1/metrics"}, "status":200, "size":1420, "duration":0.00341}',
    rawJson: {
      level: 'info',
      ts: 1715696889.124,
      msg: 'handled request',
      request: {
        remote_ip: '100.92.14.2',
        proto: 'HTTP/2.0',
        method: 'GET',
        uri: '/api/v1/metrics',
      },
      status: 200,
      size: 1420,
      duration: 0.00341,
    },
  },
  {
    id: 3,
    timestamp: '14:27:44.204',
    service: 'sshd',
    severity: 'WARN',
    pid: '[PID 49201]',
    message:
      "Failed password for invalid user root from 185.220.101.42 port 51230 ssh2",
  },
  {
    id: 4,
    timestamp: '14:27:44.891',
    service: 'fail2ban',
    severity: 'NOTICE',
    pid: '[PID 841]',
    message:
      '[sshd] ACTION: BAN Target Host 185.220.101.42 (3 failed authentication attempts detected in 10s window)',
  },
  {
    id: 5,
    timestamp: '14:27:45.012',
    service: 'nftables',
    severity: 'INFO',
    pid: '[KERNEL]',
    message:
      'Added dynamic set element: ip filter f2b-sshd { 185.220.101.42 timeout 86400s }',
  },
  {
    id: 6,
    timestamp: '14:26:18.441',
    service: 'adguard',
    severity: 'INFO',
    pid: '[PID 2042]',
    message:
      "DNS query from 192.168.1.100 for 'gateway.docker.internal' [type A] -> answered 172.17.0.1 (latency: 0.2ms)",
  },
  {
    id: 7,
    timestamp: '14:25:30.980',
    service: 'caddy',
    severity: 'NOTICE',
    pid: '[PID 1104]',
    message:
      "[tls.cache] TLS certificate renewal validated successfully: subject=*.homesv.internal issuer=letsencrypt-staging algorithm=ECDSA-P256",
  },
  {
    id: 8,
    timestamp: '14:24:12.118',
    service: 'kernel',
    severity: 'INFO',
    pid: '[ 4819.301]',
    message: 'r8169 0000:02:00.0 enp2s0: link up, 1000Mbps, full duplex, lpa 0xCDE1',
  },
  {
    id: 9,
    timestamp: '14:21:05.819',
    service: 'nftables',
    severity: 'WARN',
    pid: '[KERNEL]',
    message:
      '[SYN_SCAN_DETECTED] IN=enp2s0 OUT= MAC=00:e0:4c:68:01:aa SRC=45.154.255.89 DST=192.168.1.100 LEN=40 TOS=0x00 TTL=241 ID=1420 PROTO=TCP SPT=49152 DPT=22 FLAGS=0x02',
  },
  {
    id: 10,
    timestamp: '14:18:22.502',
    service: 'dockerd',
    severity: 'INFO',
    pid: '[PID 1419]',
    message:
      'Container 8f9b1c3e031a started: bazarr-subtitles (image: lscr.io/linuxserver/bazarr:latest)',
  },
  {
    id: 11,
    timestamp: '14:15:01.019',
    service: 'tailscaled',
    severity: 'INFO',
    pid: '[PID 789]',
    message:
      'wgengine: Reconfig: configuring userspace WireGuard engine (active peers: 7, tailscale0 link mtu 1280)',
  },
  {
    id: 12,
    timestamp: '14:11:45.290',
    service: 'nextcloud',
    severity: 'INFO',
    pid: '[cron.php]',
    message:
      'Background job \\OC\\BackgroundJob\\GarbageCollect executed cleanly in 1.4s (mem: 24MB)',
  },
];

// --- SOC REST API Endpoints ---

// GET /api/system
app.get('/api/system', (_req: Request, res: Response) => {
  res.json(initialSystemMetrics);
});

// GET /api/network
app.get('/api/network', (_req: Request, res: Response) => {
  res.json(initialNetworkData);
});

// GET /api/services
app.get('/api/services', (_req: Request, res: Response) => {
  res.json(initialServices);
});

// GET /api/security/events
app.get('/api/security/events', (req: Request, res: Response) => {
  const { severity, subsystem, q } = req.query;
  let filtered = [...initialSecurityEvents];

  if (severity && severity !== 'ALL') {
    filtered = filtered.filter((e) => e.severity === severity);
  }
  if (subsystem) {
    filtered = filtered.filter((e) => e.subsystem === subsystem);
  }
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.source.toLowerCase().includes(query) ||
        e.summary.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        (e.diagnosis && e.diagnosis.toLowerCase().includes(query)),
    );
  }

  res.json(filtered);
});

// GET /api/logs
app.get('/api/logs', (req: Request, res: Response) => {
  const { service, severity, regex } = req.query;
  let filtered = [...initialLogs];

  if (service && service !== 'ALL' && typeof service === 'string') {
    filtered = filtered.filter((l) => l.service.toLowerCase().includes(service.toLowerCase()));
  }
  if (severity && severity !== 'ALL' && typeof severity === 'string') {
    filtered = filtered.filter((l) => l.severity === severity);
  }
  if (regex && typeof regex === 'string') {
    try {
      const reg = new RegExp(regex, 'i');
      filtered = filtered.filter((l) => reg.test(l.message) || reg.test(l.service));
    } catch {
      // ignore
    }
  }

  res.json(filtered);
});

// GET /api/events/stream
// Server-Sent Events (SSE) stream endpoint
app.get('/api/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  let counter = 0;
  const timer = setInterval(() => {
    counter++;

    // 1. Send periodic heartbeat comments every 15s to keep proxy connections alive
    if (counter % 15 === 0) {
      res.write(`: ping ${Date.now()}\n\n`);
    }

    // 2. Metrics tick every 3s
    if (counter % 3 === 0) {
      const cpuJitter = Math.floor(21 + Math.random() * 7);
      const ramJitter = +(14.2 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      const metricsTick = {
        cpu: {
          loadPercent: cpuJitter,
          model: 'AMD Ryzen 7 5700G @ 3.80GHz',
          packageTemp: 41 + Math.floor(Math.random() * 3),
          cores: '8C/16T',
        },
        ram: {
          usedGb: ramJitter,
          totalGb: 32.0,
          usedPercent: Math.round((ramJitter / 32) * 100),
        },
      };

      res.write(
        `data: ${JSON.stringify({
          type: 'metrics_tick',
          data: metricsTick,
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }

    // 3. Security event push every 10s
    if (counter % 10 === 0) {
      const eventTime = new Date().toISOString().substring(11, 19) + ' UTC';
      const eventData = {
        id: `sec-${Date.now()}`,
        timestamp: eventTime,
        severity: counter % 20 === 0 ? 'WARNING' : 'NOTICE',
        category: counter % 20 === 0 ? 'Firewall / nftables' : 'Access / SSH Session',
        subsystem: 'SSH / Auth',
        source: counter % 20 === 0 ? '194.26.29.112 (Tor Exit)' : '100.92.14.2 (MacBook)',
        destination: '192.168.1.100:22',
        process: 'pam_sshd',
        summary:
          counter % 20 === 0
            ? 'Failed key auth signature match: bruteforce_ssh_tier1 drop applied'
            : 'Interactive terminal telemetry ping verified via ed25519 key',
      };

      res.write(
        `data: ${JSON.stringify({
          type: 'security_event',
          data: eventData,
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(timer);
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Minh Quan Security Center running on http://localhost:${PORT}`);
  });
}

startServer();
