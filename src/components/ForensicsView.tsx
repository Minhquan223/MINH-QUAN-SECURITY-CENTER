import React, { useState } from 'react';

export const ForensicsView: React.FC = () => {
  const [activeForensicTab, setActiveForensicTab] = useState<string>('cases');
  const [activeArtifact, setActiveArtifact] = useState<string>('EV-0104');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyHashes = () => {
    const hashes = `SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nMD5: d41d8cd98f00b204e9800998ecf8427e`;
    navigator.clipboard.writeText(hashes);
    showToast('Cryptographic hashes copied to clipboard');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg select-text font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-primary text-on-surface px-space-md py-space-sm rounded shadow-xl flex items-center gap-space-sm font-code-body animate-fade-in">
          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Case Meta Sub-Header & Global Triage Bar */}
      <div className="flex flex-col bg-surface-container-low rounded-lg p-space-md shadow-md gap-space-md border border-surface-container-high/40">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded border border-surface-container-high">
              <span className="font-code-label text-code-label text-secondary uppercase font-bold tracking-wider font-mono">
                CASE ID
              </span>
              <span className="font-code-body text-code-body text-on-surface font-semibold font-mono">
                CASE-2025-05-HOMESV-04
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-code-label text-code-label bg-surface-container-high text-primary px-space-sm py-space-xs rounded uppercase font-semibold font-mono">
                IN PROGRESS
              </span>
              <span className="font-code-label text-code-label bg-error-container text-on-error-container px-space-sm py-space-xs rounded uppercase font-bold font-mono">
                TLP:AMBER
              </span>
              <span className="font-code-label text-code-label bg-surface-container-highest text-on-surface-variant px-space-sm py-space-xs rounded font-mono">
                SEV-2 / CRITICAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md text-on-surface-variant font-code-label text-code-label font-mono flex-wrap">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">badge</span>
              <span>
                Lead: <strong className="text-on-surface font-semibold">quan@homesv</strong>
              </span>
            </div>
            <span className="text-outline-variant">/</span>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
              <span>
                Opened:{' '}
                <strong className="text-on-surface font-semibold">2025-05-14 14:30:12 UTC</strong>
              </span>
            </div>
            <span className="text-outline-variant">/</span>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                verified_user
              </span>
              <span className="text-secondary font-mono">GPG: 0x94B2E81F</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-space-sm pt-space-xs border-t border-surface-container-high/40">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs font-mono">
              <span className="font-code-label text-code-label text-outline uppercase tracking-wider">
                Subject:
              </span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">
                Investigate Repeated SSH Credential Stuffing & Tor Exit Node Probing
              </h1>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Host incident correlation on{' '}
              <span className="font-code-body text-primary font-medium font-mono">
                debian-x86_64
              </span>
              : rapid SYN sweep across port 22, 14 failed auth cycles within 180ms, automated
              fail2ban recidive trigger evaluation.
            </p>
          </div>

          {/* Action Quick Bar */}
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => showToast('Generating forensic vault archive (.tar.gz)...')}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-body text-code-body transition-colors shadow-sm cursor-pointer font-mono"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                inventory_2
              </span>
              <span>Export Vault (.tar.gz)</span>
            </button>
            <button
              onClick={() => showToast('Exporting cryptographic DFIR Dossier PDF...')}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-primary-container text-on-primary-container font-code-body text-code-body font-semibold hover:bg-primary transition-colors shadow-sm cursor-pointer font-mono"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Generate DFIR Dossier</span>
            </button>
          </div>
        </div>

        {/* Forensics Sub-Navigation Ribbon */}
        <div className="flex items-center gap-space-xs overflow-x-auto pt-space-xs bg-surface-container-lowest p-space-xs rounded font-mono">
          {[
            { id: 'cases', label: 'Cases [3 Active]', icon: 'folder_open' },
            { id: 'vault', label: 'Evidence Vault (18)', icon: 'lock' },
            { id: 'timeline', label: 'Timeline Reconstruction', icon: 'history' },
            { id: 'hash', label: 'Hash Analysis (VT/MISP)', icon: 'fingerprint' },
            { id: 'syslog', label: 'Syslog & Auditd Streams', icon: 'terminal' },
            { id: 'usb', label: 'USB & Peripheral Activity', icon: 'usb' },
            { id: 'ebpf', label: 'Filesystem & eBPF State', icon: 'hard_drive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveForensicTab(tab.id)}
              className={`flex items-center gap-space-xs px-space-sm py-space-xs rounded font-code-label text-code-label whitespace-nowrap transition-colors cursor-pointer ${
                activeForensicTab === tab.id
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Operational Status Flash Metrics (4 dense cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
              Custody Chain
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-code-metric-xl text-code-metric-xl font-bold text-on-surface tracking-tight font-mono">
              100% SECURE
            </div>
            <div className="font-code-label text-code-label text-secondary mt-1 font-mono">
              4 of 4 Artifacts Cryptostamped
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
              Adversary Vector
            </span>
            <span className="material-symbols-outlined text-[18px] text-error">public_off</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-code-metric-xl text-code-metric-xl font-bold text-error tracking-tight font-mono">
              185.220.101.42
            </div>
            <div className="font-code-label text-code-label text-on-surface-variant mt-1 font-mono">
              Exit Relay • Confidence 100%
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
              Filesystem Drift
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">rule_folder</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-code-metric-xl text-code-metric-xl font-bold text-primary tracking-tight font-mono">
              NOMINAL (0.01%)
            </div>
            <div className="font-code-label text-code-label text-on-surface-variant mt-1 font-mono">
              1 tracked PAM file • SUID clear
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
              Peripheral Vector
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">usb</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-code-metric-xl text-code-metric-xl font-bold text-on-surface tracking-tight font-mono">
              ISOLATED
            </div>
            <div className="font-code-label text-code-label text-secondary mt-1 font-mono">
              0 Unknown devices connected
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Panel Forensic Investigation Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* LEFT PANEL (Col 1-4): Evidence Timeline & Chain of Custody */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* Evidence Vault & Timeline Breakdown */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">dataset</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  Artifact Timeline
                </span>
              </div>
              <span className="font-code-label text-code-label bg-surface-container-high px-space-xs py-0.5 rounded text-secondary font-mono">
                4 ITEMS
              </span>
            </div>

            <div className="flex flex-col gap-space-xs">
              {/* Item 1 */}
              <div
                onClick={() => setActiveArtifact('EV-0104')}
                className={`cursor-pointer p-space-sm rounded transition-all group ${
                  activeArtifact === 'EV-0104'
                    ? 'bg-surface-container ring-1 ring-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-code-label text-code-label text-primary font-bold">
                    #EV-0104
                  </span>
                  <span className="font-code-label text-code-label text-outline">
                    14:27:44 UTC
                  </span>
                </div>
                <div className="font-code-body text-code-body text-on-surface font-semibold mt-1 font-mono">
                  SSH Failed Auth PCAP (.pcap)
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-code-label text-code-label mt-space-xs font-mono">
                  <span>Size: 4.2 MB (4,404,019 B)</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                    SHA-256 OK
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setActiveArtifact('EV-0105')}
                className={`cursor-pointer p-space-sm rounded transition-all group ${
                  activeArtifact === 'EV-0105'
                    ? 'bg-surface-container ring-1 ring-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-code-label text-code-label text-on-surface font-bold">
                    #EV-0105
                  </span>
                  <span className="font-code-label text-code-label text-outline">
                    14:27:45 UTC
                  </span>
                </div>
                <div className="font-code-body text-code-body text-on-surface font-medium mt-1 font-mono">
                  Fail2ban jail & nftables snapshot
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-code-label text-code-label mt-space-xs font-mono">
                  <span>jail: sshd-recidive (86400s)</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                    SHA-256 OK
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => setActiveArtifact('EV-0106')}
                className={`cursor-pointer p-space-sm rounded transition-all group ${
                  activeArtifact === 'EV-0106'
                    ? 'bg-surface-container ring-1 ring-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-code-label text-code-label text-on-surface font-bold">
                    #EV-0106
                  </span>
                  <span className="font-code-label text-code-label text-outline">
                    14:21:05 UTC
                  </span>
                </div>
                <div className="font-code-body text-code-body text-on-surface font-medium mt-1 font-mono">
                  Raw SYN scan flows (12 flows)
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-code-label text-code-label mt-space-xs font-mono">
                  <span>Target: Port 22, 2222, 8022</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                    SHA-256 OK
                  </span>
                </div>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => setActiveArtifact('EV-0107')}
                className={`cursor-pointer p-space-sm rounded transition-all group ${
                  activeArtifact === 'EV-0107'
                    ? 'bg-surface-container ring-1 ring-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-code-label text-code-label text-on-surface font-bold">
                    #EV-0107
                  </span>
                  <span className="font-code-label text-code-label text-outline">
                    14:12:00 UTC
                  </span>
                </div>
                <div className="font-code-body text-code-body text-on-surface font-medium mt-1 font-mono">
                  AIDE DB diff report (/etc/pam.d/)
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-code-label text-code-label mt-space-xs font-mono">
                  <span>1 modification recorded</span>
                  <span className="text-secondary flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                    SHA-256 OK
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chain of Custody & Cryptographic Ledger */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  fact_check
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  Chain of Custody Ledger
                </span>
              </div>
              <span className="font-code-label text-code-label text-outline font-mono">
                RFC 3161
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-xs text-on-surface-variant font-code-label text-code-label font-mono border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="text-outline">Collector Daemon:</span>
                <span className="text-on-surface">suricata-eve-logger / auditd</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Seal Type:</span>
                <span className="text-on-surface">Local GPG + Blake3 digest</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Signing Key:</span>
                <span className="text-primary font-mono">0x94B2E81FB92A071E</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Custody Officer:</span>
                <span className="text-on-surface font-mono">quan (UID 1000)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Host Verification:</span>
                <span className="text-secondary">UNMODIFIED (No Bit-Rot)</span>
              </div>
            </div>

            <div className="p-space-xs bg-surface-container rounded text-center font-mono">
              <span className="font-code-label text-code-label text-on-surface-variant tracking-wider">
                IMMUTABLE LOG STORE:{' '}
                <strong className="text-primary font-mono">
                  /var/log/forensics/vault/case-04.tar
                </strong>
              </span>
            </div>
          </div>

          {/* Forensic Context Summary Graphic */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-xs border border-surface-container-high/30">
            <div className="flex items-center justify-between font-mono">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-sans">
                Incident Flow Distribution
              </span>
              <span className="font-code-label text-code-label text-on-surface font-bold">
                120 pkts/sec peak
              </span>
            </div>
            {/* Histogram chart */}
            <div className="w-full h-20 pt-space-xs">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 60">
                <rect fill="#1e293b" height="12" rx="1" width="12" x="0" y="48" />
                <rect fill="#1e293b" height="16" rx="1" width="12" x="18" y="44" />
                <rect fill="#1e293b" height="20" rx="1" width="12" x="36" y="40" />
                <rect fill="#1e293b" height="28" rx="1" width="12" x="54" y="32" />
                <rect fill="#0ea5e9" height="50" rx="1" width="12" x="72" y="10" />
                <rect fill="#ffb4ab" height="56" rx="1" width="12" x="90" y="4" />
                <rect fill="#ffb4ab" height="52" rx="1" width="12" x="108" y="8" />
                <rect fill="#0ea5e9" height="36" rx="1" width="12" x="126" y="24" />
                <rect fill="#1e293b" height="18" rx="1" width="12" x="144" y="42" />
                <rect fill="#1e293b" height="10" rx="1" width="12" x="162" y="50" />
                <rect fill="#1e293b" height="14" rx="1" width="12" x="180" y="46" />
                <rect fill="#1e293b" height="8" rx="1" width="12" x="198" y="52" />
                <rect fill="#1e293b" height="12" rx="1" width="12" x="216" y="48" />
                <rect fill="#1e293b" height="8" rx="1" width="12" x="234" y="52" />
                <rect fill="#1e293b" height="6" rx="1" width="12" x="252" y="54" />
                <rect fill="#1e293b" height="10" rx="1" width="12" x="270" y="50" />
                <rect fill="#1e293b" height="8" rx="1" width="12" x="288" y="52" />
                <rect fill="#1e293b" height="6" rx="1" width="12" x="306" y="54" />
              </svg>
            </div>
            <div className="flex items-center justify-between font-code-label text-code-label text-outline font-mono">
              <span>14:10:00 UTC</span>
              <span className="text-error font-bold">14:27:44 (Bursts)</span>
              <span>14:35:00 UTC</span>
            </div>
          </div>
        </div>

        {/* CENTER PANEL (Col 5-8): Artifact Deep Dive & Micro Hex Inspector */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          {/* Target Artifact & Threat Intel Lookup */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  fingerprint
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  Artifact Cryptographic Profile
                </span>
              </div>
              <button
                onClick={handleCopyHashes}
                className="flex items-center gap-1 font-code-label text-code-label text-secondary hover:text-primary transition-colors cursor-pointer font-mono"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Copy Hashes</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-xs font-code-body text-code-body border border-surface-container-high/40 font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="font-code-label text-code-label text-outline uppercase">
                  Target Binary/Packet
                </span>
                <span className="text-on-surface font-bold break-all">
                  pcap_dump_20250514_142744.pcap
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pt-space-xs">
                <span className="font-code-label text-code-label text-outline uppercase">
                  SHA-256 Digest
                </span>
                <span className="text-primary text-[11px] leading-tight break-all font-mono">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pt-space-xs">
                <span className="font-code-label text-code-label text-outline uppercase">
                  MD5 Digest
                </span>
                <span className="text-on-surface-variant text-[11px] break-all font-mono">
                  d41d8cd98f00b204e9800998ecf8427e
                </span>
              </div>
            </div>

            {/* Threat Intelligence Verdict Box */}
            <div className="bg-surface-container p-space-sm rounded flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-error">
                    fitbit_jumping_jacks
                  </span>
                  <span className="font-code-label text-code-label text-error font-bold tracking-wide uppercase font-mono">
                    Threat Intelligence Match
                  </span>
                </div>
                <span className="font-code-label text-code-label bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-bold font-mono uppercase">
                  MALICIOUS // TOR EXIT
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs font-code-label text-code-label font-mono">
                <div className="flex flex-col">
                  <span className="text-outline">AbuseIPDB Confidence:</span>
                  <span className="text-error font-bold text-[13px]">100% (142 Reports)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-outline">VirusTotal Score:</span>
                  <span className="text-error font-bold text-[13px]">18 / 92 Engines</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-outline">Associated AS / ISP:</span>
                  <span className="text-on-surface">AS208323 (Zwiebelfreunde)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-outline">Geographic Origin:</span>
                  <span className="text-on-surface">Frankfurt am Main, DE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hex & Raw Frame Inspector */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">memory</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  Micro Hex Stream Inspector
                </span>
              </div>
              <span className="font-code-label text-code-label text-on-surface-variant font-mono">
                FRAME 0014 (OFFSET 0x0000)
              </span>
            </div>

            {/* Hex viewer widget */}
            <div className="bg-surface-container-lowest p-space-sm rounded font-code-body text-[11px] leading-relaxed text-on-surface-variant overflow-x-auto border border-surface-container-high font-mono">
              <div className="flex gap-space-md select-text">
                <div className="text-outline shrink-0">
                  00000000
                  <br />
                  00000010
                  <br />
                  00000020
                  <br />
                  00000030
                  <br />
                  00000040
                  <br />
                  00000050
                  <br />
                  00000060
                </div>
                <div className="text-primary-fixed shrink-0">
                  00 e0 4c 68 01 aa 52 54 00 12 34 56 08 00 45 00
                  <br />
                  00 54 fa e2 40 00 40 06 c8 19 b9 dc 65 2a 0a 00
                  <br />
                  01 64 00 16 cd 12 7b 91 ee 40 00 00 00 00 80 02
                  <br />
                  fa f0 d0 b3 00 00 02 04 05 b4 01 03 03 08 01 01
                  <br />
                  04 02 53 53 48 2d 32 2e 30 2d 4f 70 65 6e 53 53
                  <br />
                  48 5f 38 2e 39 70 31 20 55 62 75 6e 74 75 2d 33
                  <br />
                  75 62 75 6e 74 75 30 2e 36 0d 0a 00 ff 2a 11 02
                </div>
                <div className="text-secondary pl-space-xs border-l border-surface-container-highest shrink-0 hidden sm:block">
                  ..Lh..RT..4V..E.
                  <br />
                  .T..@.@.....e*..
                  <br />
                  .d....&#123;..@......
                  <br />
                  ..........SSH-2.
                  <br />
                  0-OpenSSH_8.9p1
                  <br />
                  Ubuntu-3ubuntu0.
                  <br />
                  6....*..
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant font-code-label text-code-label font-mono">
              <span>
                Payload Identity:{' '}
                <strong className="text-on-surface">SSH-2.0-OpenSSH_8.9p1 Banner</strong>
              </span>
              <span className="text-secondary">Dissector: SSH / TCP_ACK</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Col 9-12): Peripheral Audit & Host Integrity */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* USB Peripheral Activity */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">usb</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  USB Peripheral Activity
                </span>
              </div>
              <span className="font-code-label text-code-label text-secondary flex items-center gap-1 font-bold font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                UDEV: SECURE
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between font-code-label text-code-label font-mono">
                <span className="text-outline uppercase">Active Mass Storage:</span>
                <span className="text-on-surface font-semibold">1 Registered</span>
              </div>
              <div className="p-space-xs bg-surface-container rounded flex flex-col gap-1">
                <div className="flex items-center justify-between font-code-body text-code-body font-mono">
                  <span className="text-on-surface font-bold">SanDisk Cruzer Glide 64GB</span>
                  <span className="font-code-label text-code-label text-primary font-bold">
                    PORT 2-1
                  </span>
                </div>
                <div className="font-code-label text-code-label text-on-surface-variant flex items-center justify-between font-mono">
                  <span>
                    Serial: <span className="text-outline">4C5300012204...</span>
                  </span>
                  <span className="text-secondary font-bold">POLICY: ALLOW</span>
                </div>
              </div>

              <div className="pt-space-xs">
                <div className="font-code-label text-code-label text-outline uppercase pb-1 font-mono">
                  Recent Peripheral Journal:
                </div>
                <div className="flex flex-col gap-1 font-code-body text-[11px] text-on-surface-variant font-mono">
                  <div className="flex items-center justify-between bg-surface-container-low px-space-xs py-1 rounded">
                    <span className="text-outline">2025-05-10 09:12:00</span>
                    <span>Disconnect on Port 1-2 (Vendor: 046d)</span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-low px-space-xs py-1 rounded">
                    <span className="text-outline">2025-05-08 17:40:22</span>
                    <span className="text-secondary font-semibold">
                      Whitelisted Mount /dev/sdb1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filesystem & eBPF Integrity Monitor */}
          <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  security_update_good
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
                  Host Integrity (AIDE / eBPF)
                </span>
              </div>
              <span className="font-code-label text-code-label bg-surface-container-high text-primary px-space-xs py-0.5 rounded font-mono">
                eBPF HOOKS ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-space-xs font-code-body text-code-body font-mono">
              <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded border border-surface-container-high/30">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    check_circle
                  </span>
                  <span className="text-on-surface">Rootfs (/) baseline</span>
                </div>
                <span className="font-code-label text-code-label text-secondary">
                  CLEAN (04:00 UTC)
                </span>
              </div>
              <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded border border-surface-container-high/30">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    edit_note
                  </span>
                  <span className="text-on-surface">/etc config drift</span>
                </div>
                <span className="font-code-label text-code-label text-primary font-bold">
                  1 Valid Change
                </span>
              </div>
              <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded border border-surface-container-high/30">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    verified
                  </span>
                  <span className="text-on-surface">SUID binaries audit</span>
                </div>
                <span className="font-code-label text-code-label text-on-surface-variant">
                  24/24 Matched
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-1 border border-surface-container-high/40">
              <span className="font-code-label text-code-label text-outline uppercase font-mono">
                Drift Details (/etc/pam.d/common-auth):
              </span>
              <p className="font-code-body text-[11px] text-on-surface-variant leading-normal font-mono">
                Modified by <span className="text-primary font-mono">pam-auth-update</span> during
                automated patch sync. Checksum recorded in local AIDE SQLite database at 14:12:00
                UTC. Non-malicious.
              </p>
            </div>
          </div>

          {/* Hardware Security Status */}
          <div className="bg-surface-container-low rounded-lg p-space-sm shadow-sm flex items-center justify-between border border-surface-container-high/30">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">memory</span>
              <span className="font-code-label text-code-label text-on-surface font-mono">
                TPM 2.0 / SecureBoot
              </span>
            </div>
            <span className="font-code-label text-code-label bg-surface-container-high text-secondary px-space-xs py-0.5 rounded font-bold font-mono">
              ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* Investigation Workspace Bottom Action & Escalation Bar */}
      <div className="bg-surface-container-low rounded-lg p-space-md shadow-md flex flex-wrap items-center justify-between gap-space-md border border-surface-container-high/40">
        <div className="flex items-center gap-space-md flex-wrap font-mono">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              lock_clock
            </span>
            <span className="font-code-label text-code-label text-on-surface uppercase tracking-wider font-bold">
              Evidence Vault State:
            </span>
            <span className="font-code-label text-code-label bg-surface-container-high text-primary px-space-xs py-0.5 rounded font-mono">
              LOCKED_IMMUTABLE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant font-code-label text-code-label">
            <span className="text-outline">Triage Checklist:</span>
            <span className="text-secondary font-bold">3/3 Tasks Completed</span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap font-mono">
          <button
            onClick={() =>
              showToast('ESCALATION PROTOCOL: BGP Route Withdrawal announced for 185.220.101.42/32')
            }
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-error-container text-on-error-container font-code-body text-code-body font-bold hover:bg-error hover:text-on-error transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Escalate Threat Rule (BGP Blackhole)</span>
          </button>
          <button
            onClick={() => showToast('Incident CASE-04 resolution draft generated')}
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-body text-code-body transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Close Incident</span>
          </button>
          <button
            onClick={() => showToast('Blake3 & GPG cryptostamps 100% verified across storage')}
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-surface-container hover:bg-surface-container-highest text-secondary font-code-body text-code-body transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Re-Verify Cryptostamps</span>
          </button>
        </div>
      </div>
    </div>
  );
};
