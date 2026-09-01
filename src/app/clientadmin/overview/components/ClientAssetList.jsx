import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Wrench, Shield, ArrowUpRight } from 'lucide-react';

export default function ClientAssetList({ assets, onNotify }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Facility Monitored Assets & Machinery</h2>
            <p className="text-[11px] text-slate-500">Real-time health telemetry from IoT sensors</p>
          </div>
        </div>

        <button
          onClick={() => onNotify('Exporting full asset health telemetry log...')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
        >
          <span>View All 34 Assets</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {assets.map((asset) => {
          const isHealthy = asset.statusType === 'success';
          return (
            <div
              key={asset.id}
              onClick={() => onNotify(`Viewing telemetry diagnostic report for ${asset.name}`)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{asset.id}</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                      {asset.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                    {asset.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">{asset.location}</span>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isHealthy ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    {asset.status}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 mt-1">
                    Health: <strong className={asset.healthScore > 85 ? 'text-emerald-600' : 'text-amber-600'}>{asset.healthScore}%</strong>
                  </span>
                </div>
              </div>

              {/* Health Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    asset.healthScore > 85
                      ? 'bg-emerald-500'
                      : asset.healthScore > 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${asset.healthScore}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Wrench size={11} className="text-slate-400" />
                  Last PM: {asset.lastServiced}
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Shield size={11} className="text-indigo-500" />
                  Next PM: {asset.nextPM}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
