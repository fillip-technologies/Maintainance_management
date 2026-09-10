import React, { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  Wrench,
  XCircle
} from 'lucide-react';

/**
 * Equipment & hardware status — backed by GET /dashboard/overview.
 *   devices        : { total, working, underMaintenance, faulty, ... }
 *   byHardwareType : [{ hardwareTypeId, name, total, working, underMaintenance, faulty }]
 * Category tabs are the real hardware types; "All" uses the fleet totals.
 */
export default function EquipmentStatusStats({ devices, byHardwareType = [], loading }) {
  const [selectedId, setSelectedId] = useState('all');

  const categories = useMemo(() => {
    const all = {
      id: 'all',
      name: 'All Hardware',
      total: devices?.total ?? 0,
      working: devices?.working ?? 0,
      maintenance: devices?.underMaintenance ?? 0,
      notWorking: devices?.faulty ?? 0
    };
    const rest = (byHardwareType || []).map((h) => ({
      id: h.hardwareTypeId ?? 'unassigned',
      name: h.name,
      total: h.total ?? 0,
      working: h.working ?? 0,
      maintenance: h.underMaintenance ?? 0,
      notWorking: h.faulty ?? 0
    }));
    return [all, ...rest];
  }, [devices, byHardwareType]);

  const current = categories.find((c) => c.id === selectedId) || categories[0];

  const fmt = (n) => (loading ? '—' : (n ?? 0).toLocaleString('en-IN'));

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-bold text-white">Equipment & Hardware Status</h3>

        {/* Category Filters (real hardware types) */}
        <div className="flex items-center gap-1 bg-[var(--bg-main)]/70 p-1 rounded-xl border border-[var(--border-color)] text-xs overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedId === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Clean Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Hardware
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {fmt(current?.total)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Cpu size={22} />
          </div>
        </div>

        {/* Card 2: Working / Active */}
        <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Working & Active
            </span>
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {fmt(current?.working)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Under Maintenance */}
        <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Under Maintenance
            </span>
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {fmt(current?.maintenance)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Wrench size={22} />
          </div>
        </div>

        {/* Card 4: Faulty / Down */}
        <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Faulty / Down
            </span>
            <span className="text-3xl font-extrabold text-rose-400 tracking-tight">
              {fmt(current?.notWorking)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <XCircle size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
