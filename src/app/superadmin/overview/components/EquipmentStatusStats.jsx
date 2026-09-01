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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-bold text-slate-900">Equipment & Hardware Status</h3>

        {/* Category Filters (real hardware types) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedId === cat.id
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Hardware
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {fmt(current?.total)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs">
            <Cpu size={22} />
          </div>
        </div>

        {/* Card 2: Working / Active */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Working & Active
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {fmt(current?.working)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Under Maintenance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Under Maintenance
            </span>
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {fmt(current?.maintenance)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 shadow-xs">
            <Wrench size={22} />
          </div>
        </div>

        {/* Card 4: Faulty / Down */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Faulty / Down
            </span>
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {fmt(current?.notWorking)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 shadow-xs">
            <XCircle size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
