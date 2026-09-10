import React from 'react';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  UserCheck,
  Activity
} from 'lucide-react';

/**
 * Live activity stream — backed by GET /dashboard/overview `recentActivity`:
 *   [{ id, fromStatus, toStatus, priority, title, deviceName, zoneName, clientName, changedBy, changedAt }]
 * Each row is a real issue status-history transition. No fabricated telemetry.
 */
const STATUS_STYLE = {
  open: { icon: Clock, color: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60', verb: 'raised' },
  assigned: { icon: UserCheck, color: 'bg-sky-950/60 text-sky-300 border-sky-800/60', verb: 'assigned' },
  in_progress: { icon: PlayCircle, color: 'bg-violet-950/60 text-violet-300 border-violet-800/60', verb: 'started' },
  on_hold: { icon: PauseCircle, color: 'bg-amber-950/60 text-amber-300 border-amber-800/60', verb: 'put on hold' },
  resolved: { icon: CheckCircle2, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60', verb: 'resolved' },
  reopened: { icon: RotateCcw, color: 'bg-rose-950/60 text-rose-300 border-rose-800/60', verb: 'reopened' },
  closed: { icon: CheckCircle2, color: 'bg-slate-800 text-slate-300 border-slate-700', verb: 'closed' }
};

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

export default function RecentActivityFeed({ activities, loading }) {
  const list = activities || [];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-white">Live Activity & Dispatch Stream</h3>
        <p className="text-xs text-slate-400">
          Platform-wide audit trail of work-order status changes
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-8 text-center">Loading activity…</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <span className="text-xs text-slate-400">No recent work-order activity.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative pl-2 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-5 before:w-0.5 before:bg-slate-800">
          {list.map((act) => {
            const style = STATUS_STYLE[act.toStatus] || STATUS_STYLE.open;
            const Icon = style.icon;
            const location = [act.deviceName, act.zoneName].filter(Boolean).join(' • ');
            return (
              <div key={act.id} className="flex items-start gap-4 relative">
                <div
                  className={`w-7 h-7 min-w-7 rounded-full border-2 flex items-center justify-center bg-[var(--bg-card)] z-10 ${style.color}`}
                >
                  <Icon size={14} />
                </div>

                <div className="flex-1 bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-xl p-3.5 flex flex-col gap-1 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {act.title || 'Work order'} <span className="font-semibold text-slate-400">{style.verb}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(act.changedAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {location || 'Device'}
                    {act.changedBy ? ` — by ${act.changedBy}` : ''}
                  </p>
                  {act.clientName && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2 py-0.5 rounded">
                        {act.clientName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
