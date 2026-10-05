import React, { useState } from 'react';
import {
  X,
  Video,
  Wifi,
  WifiOff,
  AlertTriangle,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Copy,
  Check,
  Wrench,
  Activity,
  MapPin,
  Calendar,
  Cpu,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function CameraDetailModal({ camera, onClose, onOpenReportIssue, onCreateAlert }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedRtsp, setCopiedRtsp] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'telemetry' | 'history'

  if (!camera) return null;

  const isWorking = camera.status === 'online';
  const isFaulty = camera.status === 'offline';

  const copyRtsp = () => {
    navigator.clipboard?.writeText(camera.rtsp);
    setCopiedRtsp(true);
    setTimeout(() => setCopiedRtsp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWorking ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30'
            }`}>
              <Video size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">{camera.name}</h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isWorking
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse'
                  }`} />
                  {isWorking ? 'Active' : 'Not Active'}
                </span>
              </div>
              <p className="text-xs text-[var(--ink-3)] flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-slate-500" />
                <span className="font-semibold text-[var(--ink-2)]">{camera.zoneName}</span>
                <span className="text-slate-600">•</span>
                <span>{camera.location}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[var(--ink-3)]">{camera.ip}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[var(--border-color)] bg-[var(--bg-main)]/50">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'live'
                ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Video size={14} />
            Live Preview & Stream
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'telemetry'
                ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Cpu size={14} />
            Hardware & Network Telemetry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-500/5'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            <Activity size={14} />
            30-Day Outage Log ({camera.avgUptime} Uptime)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          {/* Alert Banner if Active */}
          {camera.hasAlert && camera.alertDetails && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Active Telemetry Alert: {camera.alertDetails.type}
                  </h4>
                  <span className="text-[10px] text-amber-400/80 font-medium">
                    {camera.alertDetails.timestamp ? new Date(camera.alertDetails.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 mt-1">
                  {camera.alertDetails.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportIssue?.(camera);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Wrench size={13} />
                Raise Ticket
              </button>
            </div>
          )}

          {/* TAB 1: LIVE PREVIEW */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              {/* Simulated Video Player */}
              <div className="relative aspect-video rounded-xl bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden group shadow-inner flex items-center justify-center">
                {isWorking ? (
                  <>
                    {/* Simulated live camera view background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 select-none">
                      <div className="w-24 h-24 rounded-full border-2 border-[var(--line)] flex items-center justify-center text-slate-700 animate-pulse">
                        <Video size={40} className="text-blue-500/40" />
                      </div>
                      <span className="text-xs font-mono tracking-widest text-slate-600 mt-3 uppercase">
                        RTSP FEED ACTIVE • 4K STREAM ENCODED
                      </span>
                    </div>

                    {/* Camera On-Screen Display (OSD) */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 text-[var(--ink)] text-[11px] font-mono border border-white/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        REC
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 text-[var(--ink)] text-[11px] font-mono border border-white/10 backdrop-blur-xs">
                        {camera.name.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 text-blue-700 dark:text-blue-400 text-[11px] font-bold font-mono border border-white/10 backdrop-blur-xs">
                        {camera.resolution}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-2.5 py-1 rounded bg-black/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                        <Wifi size={12} />
                        ONLINE (30 FPS)
                      </span>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 rounded-lg bg-black/60 text-[var(--ink)] hover:bg-black/90 flex items-center justify-center border border-white/10 cursor-pointer"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <span className="text-[11px] font-mono text-[var(--ink-2)] bg-black/50 px-2 py-1 rounded">
                          {new Date().toLocaleTimeString()} (LIVE)
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--ink-3)] font-mono">
                        H.265+ / 8192 Kbps / 0.1% loss
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 flex flex-col items-center justify-center text-[var(--ink-3)]">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-3">
                      <WifiOff size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--ink)]">Camera Signal Offline</h4>
                    <p className="text-xs text-[var(--ink-3)] mt-1 max-w-sm">
                      No video telemetry received from {camera.ip}. Hardware may be powered off, cable severed, or switch port disabled.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReportIssue?.(camera);
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
                    >
                      <Wrench size={14} />
                      Dispatch Technician / Raise Query
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--ink-3)] block uppercase font-bold">Device Code</span>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5 block truncate">{camera.code || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--ink-3)] block uppercase font-bold">Product Type</span>
                  <span className="text-xs font-bold text-[var(--ink)] mt-0.5 block truncate">{camera.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--ink-3)] block uppercase font-bold">Zone</span>
                  <span className="text-xs font-bold text-[var(--ink)] mt-0.5 block truncate">{camera.zoneName}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--ink-3)] block uppercase font-bold">Location</span>
                  <span className="text-xs font-medium text-[var(--ink)] mt-0.5 block truncate">{camera.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & SPECS */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <h4 className="text-xs font-bold text-[var(--ink-2)] uppercase tracking-wider mb-3">
                  Hardware & Network Information
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/50">
                    <span className="text-[var(--ink-3)]">Unique Code:</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{camera.code || camera.rawDevice?.code || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/50">
                    <span className="text-[var(--ink-3)]">Database Status:</span>
                    <span className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                      isWorking ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/25'
                    }`}>
                      {camera.backendStatus || (isWorking ? 'active' : 'faulty')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[var(--border-color)]/50">
                    <span className="text-[var(--ink-3)]">RTSP Stream URI:</span>
                    <div className="flex items-center gap-2 font-mono text-[var(--ink)] bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
                      <span className="truncate max-w-xs">{camera.rtsp}</span>
                      <button
                        onClick={copyRtsp}
                        className="text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer ml-1"
                        title="Copy RTSP Link"
                      >
                        {copiedRtsp ? <Check size={14} className="text-emerald-700 dark:text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/50">
                    <span className="text-[var(--ink-3)]">MAC Address:</span>
                    <span className="font-mono text-[var(--ink)]">{camera.mac}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/50">
                    <span className="text-[var(--ink-3)]">Resolution:</span>
                    <span className="font-bold text-[var(--ink)]">{camera.resolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink-3)]">Power & Connectivity:</span>
                    <span className="font-mono text-[var(--ink)]">{isWorking ? 'Active PoE Link' : 'Offline / Unreachable'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 30-DAY OUTAGE LOG */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--ink-3)]">Timeline events & incident records for the last 30 days:</span>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">Overall Uptime: {camera.avgUptime}</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {camera.timeline.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      t.status === 'online'
                        ? 'bg-blue-500/5 border-blue-500/20 text-[var(--ink-2)]'
                        : t.status === 'offline'
                        ? 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        t.status === 'online' ? 'bg-blue-500' : t.status === 'offline' ? 'bg-red-500' : 'bg-amber-400'
                      }`} />
                      <span className="font-mono font-bold text-[var(--ink)]">{t.label}</span>
                      <span className="text-[var(--ink-3)]">({t.date})</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {t.incident && (
                        <span className="text-xs text-amber-800 dark:text-amber-300 italic hidden sm:inline">
                          {t.incident}
                        </span>
                      )}
                      <span className={`font-mono font-bold ${
                        t.status === 'online' ? 'text-blue-700 dark:text-blue-400' : t.status === 'offline' ? 'text-red-700 dark:text-red-400' : 'text-amber-800 dark:text-amber-400'
                      }`}>
                        {t.status === 'online' ? '100% Uptime' : t.status === 'offline' ? 'Offline (0%)' : `${t.uptime}% Uptime`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[var(--ink-2)] hover:text-[var(--ink)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isWorking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCreateAlert) {
                    onCreateAlert(camera);
                  } else {
                    onOpenReportIssue?.(camera);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-900/30 flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle size={14} />
                Raise Defect Alert in Backend
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReportIssue?.(camera);
              }}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              <Wrench size={14} />
              Report Issue / Raise Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
