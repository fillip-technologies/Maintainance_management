import React from 'react';
import {
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';

/**
 * Work-order (issue) real-time pulse — backed by GET /dashboard/overview `issues`:
 *   { open, byStatus:{7 states}, byPriority:{...}, createdToday, resolvedToday, closedToday }
 * Every value is a live count; there are no fabricated SLA / preventive metrics.
 */
const STATUS_META = [
  { key: 'open', label: 'Open', color: '#6366f1', icon: Clock },
  { key: 'assigned', label: 'Assigned', color: '#0ea5e9', icon: PieIcon },
  { key: 'in_progress', label: 'In Progress', color: '#8b5cf6', icon: PlayCircle },
  { key: 'on_hold', label: 'On Hold', color: '#f59e0b', icon: PauseCircle },
  { key: 'resolved', label: 'Resolved', color: '#10b981', icon: CheckCircle2 },
  { key: 'reopened', label: 'Reopened', color: '#f43f5e', icon: RotateCcw },
  { key: 'closed', label: 'Closed', color: '#64748b', icon: CheckCircle2 }
];

const PRIORITY_META = [
  { key: 'critical', label: 'Critical', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'high', label: 'High', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'medium', label: 'Medium', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'low', label: 'Low', cls: 'bg-slate-50 text-slate-600 border-slate-200' }
];

export default function WorkOrderStatus({ issues, loading }) {
  const byStatus = issues?.byStatus || {};
  const byPriority = issues?.byPriority || {};
  const total = issues?.total ?? 0;

  const segments = STATUS_META.map((m) => {
    const count = byStatus[m.key] ?? 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...m, count, pct };
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Work Order Real-Time Pulse</h3>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              {loading ? '—' : `${issues?.open ?? 0} Open`}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Live ticket lifecycle across all facilities ({total} total)
          </p>
        </div>

        <a href="#/superadmin/work-orders" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
          <span>All Work Orders</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Distribution bar */}
      <div className="py-1">
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
          {segments.map((seg) =>
            seg.count > 0 ? (
              <div
                key={seg.key}
                className="h-full transition-all duration-300"
                style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.count}`}
              ></div>
            ) : null
          )}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {segments.map((status) => {
          const Icon = status.icon;
          return (
            <div key={status.key} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 gap-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status.color }}></span>
                  <span className="text-[11px] font-medium truncate">{status.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{status.pct}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{loading ? '—' : status.count}</span>
                <Icon size={16} className="text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority breakdown of OPEN work orders */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Open by priority</span>
        {PRIORITY_META.map((p) => (
          <span
            key={p.key}
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${p.cls}`}
          >
            {p.label}
            <span className="font-extrabold">{loading ? '—' : (byPriority[p.key] ?? 0)}</span>
          </span>
        ))}
      </div>

      {/* Today counters */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl flex flex-col items-center bg-indigo-50 border border-indigo-200 text-indigo-700">
          <span className="text-xl font-extrabold text-indigo-900">{loading ? '—' : (issues?.createdToday ?? 0)}</span>
          <span className="text-[11px] font-semibold">Raised Today</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-emerald-50 border border-emerald-200 text-emerald-700">
          <span className="text-xl font-extrabold text-emerald-900">{loading ? '—' : (issues?.resolvedToday ?? 0)}</span>
          <span className="text-[11px] font-semibold">Resolved Today</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-slate-50 border border-slate-200 text-slate-600">
          <span className="text-xl font-extrabold text-slate-800">{loading ? '—' : (issues?.closedToday ?? 0)}</span>
          <span className="text-[11px] font-semibold">Closed Today</span>
        </div>
      </div>
    </div>
  );
}
