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
  open: { icon: Clock, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', verb: 'raised' },
  assigned: { icon: UserCheck, color: 'bg-sky-50 text-sky-600 border-sky-200', verb: 'assigned' },
  in_progress: { icon: PlayCircle, color: 'bg-violet-50 text-violet-600 border-violet-200', verb: 'started' },
  on_hold: { icon: PauseCircle, color: 'bg-amber-50 text-amber-600 border-amber-200', verb: 'put on hold' },
  resolved: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', verb: 'resolved' },
  reopened: { icon: RotateCcw, color: 'bg-rose-50 text-rose-600 border-rose-200', verb: 'reopened' },
  closed: { icon: CheckCircle2, color: 'bg-slate-50 text-slate-600 border-slate-200', verb: 'closed' }
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-slate-900">Live Activity & Dispatch Stream</h3>
        <p className="text-xs text-slate-500">
          Platform-wide audit trail of work-order status changes
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-8 text-center">Loading activity…</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <span className="text-xs text-slate-500">No recent work-order activity.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 relative pl-2 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-5 before:w-0.5 before:bg-slate-200">
          {list.map((act) => {
            const style = STATUS_STYLE[act.toStatus] || STATUS_STYLE.open;
            const Icon = style.icon;
            const location = [act.deviceName, act.zoneName].filter(Boolean).join(' • ');
            return (
              <div key={act.id} className="flex items-start gap-4 relative">
                <div
                  className={`w-7 h-7 min-w-7 rounded-full border-2 flex items-center justify-center bg-white z-10 ${style.color}`}
                >
                  <Icon size={14} />
                </div>

                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {act.title || 'Work order'} <span className="font-semibold text-slate-500">{style.verb}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(act.changedAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {location || 'Device'}
                    {act.changedBy ? ` — by ${act.changedBy}` : ''}
                  </p>
                  {act.clientName && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
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
