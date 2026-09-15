import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

function timeAgo(ts) {
  if (!ts) return 'Recently';
  try {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

const SEV = {
  critical: { dot: 'bg-red-500',    badge: 'bg-red-500/15 text-red-400 border-red-700/40',    label: 'Critical' },
  high:     { dot: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400 border-orange-700/40', label: 'High' },
  medium:   { dot: 'bg-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-700/40', label: 'Medium' },
  low:      { dot: 'bg-blue-400',   badge: 'bg-blue-500/15 text-blue-400 border-blue-700/40',   label: 'Low' },
};
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function NotificationPanel({ cameras = [], openIssues = [], onOpenAlerts, loading = false }) {
  const alerts = cameras
    .filter((c) => c.hasAlert || c.status === 'offline')
    .map((cam) => ({
      id: cam.id,
      name: cam.name || cam.code,
      zone: cam.subzoneName || cam.zoneName,
      code: cam.code,
      severity: cam.alertDetails?.severity || (cam.status === 'offline' ? 'high' : 'low'),
      time: cam.alertDetails?.timestamp || cam.rawDevice?.updatedAt,
      zoneId: cam.zoneId,
    }))
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4));

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount     = alerts.filter((a) => a.severity === 'high').length;
  const medCount      = alerts.filter((a) => a.severity === 'medium').length;

  return (
    <div className="flex flex-col bg-[#0c1427] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">

      {/* Header */}
      <div className="px-4 py-3 bg-[#0a1120] border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center">
            <Bell size={13} className="fill-amber-400" />
          </div>
          <span className="text-[12px] font-bold text-white">Active Alerts</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-bold font-mono">
          {alerts.length}
        </span>
      </div>

      {/* Severity summary row */}
      {!loading && alerts.length > 0 && (
        <div className="flex items-center gap-0 border-b border-slate-800/50 divide-x divide-slate-800/50 shrink-0">
          {[
            { label: 'Critical', count: criticalCount, color: 'text-red-400' },
            { label: 'High',     count: highCount,     color: 'text-orange-400' },
            { label: 'Medium',   count: medCount,      color: 'text-yellow-400' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex-1 py-2 text-center">
              <div className={`text-[13px] font-bold font-mono ${color}`}>{count}</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Alert list */}
      <div className="flex flex-col divide-y divide-slate-800/40 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        {loading ? (
          /* Loading skeleton */
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={20} className="animate-spin text-slate-600" />
            <span className="text-[11px] text-slate-600 font-medium">Loading alerts…</span>
            <div className="w-full px-4 space-y-2.5 mt-1">
              {[72, 56, 64].map((w) => (
                <div key={w} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 rounded-full bg-slate-800 animate-pulse" style={{ width: `${w}%` }} />
                    <div className="h-2 rounded-full bg-slate-800/60 animate-pulse" style={{ width: `${w - 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">All systems operational</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = SEV[alert.severity] || SEV.high;
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => onOpenAlerts?.(alert.zoneId)}
                className="w-full px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-slate-800/25 transition-colors text-left cursor-pointer group"
              >
                {/* Severity dot */}
                <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0 mt-1.5 shadow-[0_0_6px_currentColor]`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-100 truncate leading-tight group-hover:text-white">
                      {alert.name}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{alert.zone}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-slate-600">{alert.code}</span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-700">
                      <Clock size={8} />
                      {timeAgo(alert.time)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="shrink-0 px-3.5 py-2.5 border-t border-slate-800/60 bg-[#0a1120]">
          <button
            type="button"
            onClick={() => onOpenAlerts?.('all')}
            className="w-full text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer text-center"
          >
            View All Alerts →
          </button>
        </div>
      )}
    </div>
  );
}
