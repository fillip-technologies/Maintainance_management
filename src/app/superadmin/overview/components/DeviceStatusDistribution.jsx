import React from 'react';

export default function DeviceStatusDistribution({ devices, loading }) {
  const total = devices?.total ?? 1246;
  const working = devices?.working ?? 1182;
  const faulty = devices?.faulty ?? 38;
  const underMaintenance = devices?.underMaintenance ?? 26;

  const fmt = (n) => (loading ? '—' : (n ?? 0).toLocaleString('en-IN'));

  const onlinePct = total > 0 ? (working / total) * 100 : 94.8;
  const offlinePct = total > 0 ? (faulty / total) * 100 : 3.1;
  const maintPct = total > 0 ? (underMaintenance / total) * 100 : 2.1;

  // SVG Donut calculation
  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~351.86

  // Gap between segments in circumference units
  const gap = 3;
  const onlineLen = Math.max((onlinePct / 100) * circumference - gap, 0);
  const offlineLen = Math.max((offlinePct / 100) * circumference - gap, 0);
  const maintLen = Math.max((maintPct / 100) * circumference - gap, 0);

  const onlineOffset = 0;
  const offlineOffset = -(onlineLen + gap);
  const maintOffset = -(onlineLen + gap + offlineLen + gap);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md">
      <h3 className="text-base font-bold text-white tracking-tight">
        Device Status Distribution
      </h3>

      <div className="flex items-center justify-around gap-4 flex-1">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />

            {/* Online (Green) Segment */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${onlineLen} ${circumference}`}
              strokeDashoffset={onlineOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Offline (Red) Segment */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${offlineLen} ${circumference}`}
              strokeDashoffset={offlineOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Maintenance (Amber) Segment */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${maintLen} ${circumference}`}
              strokeDashoffset={maintOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              {fmt(total)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-1">
              Total Devices
            </span>
          </div>
        </div>

        {/* Legend Column */}
        <div className="flex flex-col justify-center gap-3">
          {/* Online */}
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/40" />
            <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
              <span className="font-extrabold text-white">{fmt(working)}</span>
              <span className="text-slate-400">Online</span>
              <span className="text-slate-400 font-semibold">
                ({loading ? '—' : `${onlinePct.toFixed(1)}%`})
              </span>
            </div>
          </div>

          {/* Offline */}
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0 shadow-xs shadow-rose-500/40" />
            <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
              <span className="font-extrabold text-white">{fmt(faulty)}</span>
              <span className="text-slate-400">Offline</span>
              <span className="text-slate-400 font-semibold">
                ({loading ? '—' : `${offlinePct.toFixed(1)}%`})
              </span>
            </div>
          </div>

          {/* Maintenance */}
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 shadow-xs shadow-amber-500/40" />
            <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
              <span className="font-extrabold text-white">{fmt(underMaintenance)}</span>
              <span className="text-slate-400">Maintenance</span>
              <span className="text-slate-400 font-semibold">
                ({loading ? '—' : `${maintPct.toFixed(1)}%`})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
