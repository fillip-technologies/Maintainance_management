import React from 'react';
import { AlertTriangle, Flame, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Critical & high-priority open work orders — backed by GET /dashboard/overview
 * `criticalAlerts`: [{ id, title, priority, status, deviceName, zoneName, clientName, assignedTo, createdAt }].
 * Read-only: the backend exposes no "dispatch" action here, so we only surface
 * the real open incidents (no fabricated buttons / telemetry).
 */
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CriticalAlerts({ alerts, loading }) {
  const list = alerts || [];
  const activeCount = list.length;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Critical & High-Priority Faults</h3>
            <span className="text-[11px] font-bold bg-rose-950/50 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-full">
              {loading ? '—' : `${activeCount} Active`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Open work orders flagged high or critical across all clients
          </p>
        </div>

        <a
          href="#/superadmin/work-orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
        >
          <span>Incident Center</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-8 text-center">Loading incidents…</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xs font-semibold text-slate-300">No critical or high-priority open faults.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((alert) => {
            const isCritical = alert.priority === 'critical';
            const Icon = isCritical ? Flame : Zap;
            return (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-900/40 border-l-4 border-l-rose-500'
                    : 'bg-amber-950/20 border-amber-900/40 border-l-4 border-l-amber-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 min-w-9 rounded-lg flex items-center justify-center ${
                      isCritical ? 'bg-rose-950/60 text-rose-400' : 'bg-amber-950/60 text-amber-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isCritical ? 'bg-rose-950/60 text-rose-300' : 'bg-amber-950/60 text-amber-300'
                        }`}
                      >
                        {alert.priority}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {alert.status}
                      </span>
                      <span className="text-[11px] text-slate-400">{timeAgo(alert.createdAt)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {alert.title || 'Untitled issue'}
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
                      <span>{[alert.deviceName, alert.zoneName, alert.clientName].filter(Boolean).join(' • ')}</span>
                      {alert.assignedTo && (
                        <span>• Assignee: <strong className="text-slate-200">{alert.assignedTo}</strong></span>
                      )}
                      {!alert.assignedTo && (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <AlertTriangle size={11} /> Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
