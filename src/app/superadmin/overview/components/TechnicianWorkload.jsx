import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';

/**
 * Technician dispatch & capacity — backed by GET /dashboard/overview `technicians`:
 *   { total, busy, idle, top:[{ id, name, specialization, openAssigned }] }
 * "Busy" = has ≥1 open assigned work order; "Available" = none. No fabricated
 * ratings / on-time metrics (the backend does not track them).
 */
export default function TechnicianWorkload({ technicians, loading }) {
  const total = technicians?.total ?? 0;
  const busy = technicians?.busy ?? 0;
  const idle = technicians?.idle ?? 0;
  const top = technicians?.top || [];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">Technician Dispatch & Capacity</h3>
            <span className="text-[11px] font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              {loading ? '—' : `${total} Technicians`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Live crew allocation by open work-order load
          </p>
        </div>

        <Link to="/superadmin/technicians" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline">
          <span>Team Roster</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Capacity Allocation Summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl flex flex-col items-center bg-sky-950/40 border border-sky-800/60 text-sky-300">
          <span className="text-xl font-extrabold text-sky-200">{loading ? '—' : busy}</span>
          <span className="text-[11px] font-semibold">On Active Job</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
          <span className="text-xl font-extrabold text-emerald-200">{loading ? '—' : idle}</span>
          <span className="text-[11px] font-semibold">Available</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-slate-800/60 border border-slate-700 text-slate-300">
          <span className="text-xl font-extrabold text-slate-200">{loading ? '—' : total}</span>
          <span className="text-[11px] font-semibold">Total Crew</span>
        </div>
      </div>

      {/* Busiest technicians */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Highest Open Work-Order Load
        </span>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading crew…</div>
        ) : top.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-xs text-slate-400">No technicians on record.</span>
          </div>
        ) : (
          top.map((tech) => (
            <div key={tech.id} className="flex items-center justify-between p-2.5 bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-xl gap-2.5 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {(tech.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{tech.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      tech.openAssigned > 0
                        ? 'bg-sky-950/60 text-sky-300 border-sky-800/50'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                    }`}
                  >
                    {tech.openAssigned > 0 ? 'On Job' : 'Available'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{tech.specialization || 'General technician'}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-sm font-extrabold text-white">{tech.openAssigned}</span>
                <span className="text-[10px] text-slate-400">Open</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
