import React from 'react';
import {
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function AssetHealthOverview() {
  const assetCategories = [
    { name: 'HVAC & Climate', total: 420, health: 97.8, color: 'bg-emerald-500' },
    { name: 'Power & Generators', total: 180, health: 99.2, color: 'bg-emerald-500' },
    { name: 'Elevators & Escalators', total: 95, health: 94.5, color: 'bg-amber-500' },
    { name: 'Plumbing & Hydraulic', total: 310, health: 98.6, color: 'bg-emerald-500' },
    { name: 'Fire & Safety Systems', total: 475, health: 100.0, color: 'bg-emerald-500' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Asset Health & Telemetry Index</h3>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              98.4% Operational
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Continuous IoT monitoring across 1,480 registered equipment units
          </p>
        </div>

        <a href="#/superadmin/assets" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
          <span>Asset Inventory</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Main Health Gauge Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5 items-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-md"
            style={{
              background: 'conic-gradient(#10b981 0% 98.4%, #e2e8f0 98.4% 100%)'
            }}
          >
            <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
              <span className="text-xl font-extrabold text-slate-900">98.4%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">CMMS Health</span>
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-600">1,340</span>
              <span className="text-[10px] text-slate-400">Optimal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-600">112</span>
              <span className="text-[10px] text-slate-400">Watchlist</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-600">28</span>
              <span className="text-[10px] text-slate-400">Faulted</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="flex flex-col gap-2.5">
          {assetCategories.map((cat, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>{cat.name}</span>
                <span className="text-slate-400 text-[11px] font-normal">{cat.total} Units</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.health}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 w-11 text-right">
                  {cat.health}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Maintenance Banner */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600 shrink-0" />
          <span>
            <strong>Fixly AI Predictive Alert:</strong> 4 Cooling Compressors in Zone B scheduled for belt replacements before MTBF threshold.
          </span>
        </div>
        <button className="bg-white hover:bg-purple-100/50 border border-purple-200 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs transition-colors">
          View PM Plan
        </button>
      </div>
    </div>
  );
}
