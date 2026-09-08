import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertCircle, Wrench, Package } from 'lucide-react';

const HEALTH_SEGMENTS = [
  {
    key: 'working',
    label: 'Active',
    subLabel: 'Online & operational',
    color: '#22c55e',      // Vibrant green matching screenshot
    hoverColor: '#34d399',
    dotClass: 'bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)]',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
  },
  {
    key: 'faulty',
    label: 'Down',
    subLabel: 'Offline or reporting faults',
    color: '#ef4444',      // Vibrant red matching screenshot
    hoverColor: '#f87171',
    dotClass: 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.6)]',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    bgClass: 'bg-rose-500/10',
  },
  {
    key: 'underMaintenance',
    label: 'Maintenance',
    subLabel: 'Under active repair / servicing',
    color: '#f59e0b',      // Vibrant amber/yellow matching screenshot
    hoverColor: '#fbbf24',
    dotClass: 'bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.6)]',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
  },
  {
    key: 'provisioned',
    label: 'In Stock',
    subLabel: 'Provisioned / awaiting zone deploy',
    color: '#0ea5e9',      // Sky blue
    hoverColor: '#38bdf8',
    dotClass: 'bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.5)]',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500/30',
    bgClass: 'bg-sky-500/10',
  },
];

export default function ClientProductCircleGraph({ stats }) {
  const [hovered, setHovered] = useState(null);

  const totalDevices = stats?.totalDevices      ?? 0;
  const working      = stats?.workingDevices     ?? 0;
  const faulty       = stats?.faultyDevices      ?? 0;
  const maintenance  = stats?.underMaintenance   ?? 0;
  const provisioned  = stats?.provisionedDevices ?? 0;

  const counts = {
    working,
    faulty,
    underMaintenance: maintenance,
    provisioned,
  };

  const grandTotal = totalDevices || (working + faulty + maintenance + provisioned);
  const healthRate = grandTotal > 0 ? Math.round((working / grandTotal) * 100) : 100;

  // Donut geometry
  const radius = 62;
  const strokeWidth = 14;
  const hoverStrokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~389.56

  // Prepare segment arcs
  let currentOffset = 0;
  const arcs = HEALTH_SEGMENTS.map((seg) => {
    const count = counts[seg.key] ?? 0;
    const stroke = grandTotal > 0 ? (count / grandTotal) * circumference : 0;
    const arcOffset = -currentOffset;
    if (stroke > 0) {
      currentOffset += stroke;
    }
    const pct = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;
    return {
      ...seg,
      count,
      stroke,
      arcOffset,
      pct,
    };
  });

  const activeArc = hovered ? arcs.find((a) => a.key === hovered) : null;

  return (
    <div className="bg-[#080e1e] rounded-3xl p-5 sm:p-6 border border-[#16223e] shadow-xl flex flex-col gap-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-[#16223e]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Product Health
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operational distribution and equipment readiness
          </p>
        </div>

        {/* Operational Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{healthRate}% Operational</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left / Center: Exact Donut Chart + Legend Matching User Screenshot */}
        <div className="lg:col-span-8 bg-[#0c162b] border border-[#1a2847] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14">
          
          {/* Donut Ring Chart */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full -rotate-90 transform overflow-visible"
            >
              {/* Background ring track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#17233f"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Data Arcs */}
              {grandTotal > 0 &&
                arcs.map((arc) =>
                  arc.stroke > 0 ? (
                    <circle
                      key={arc.key}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={hovered === arc.key ? arc.hoverColor : arc.color}
                      strokeWidth={hovered === arc.key ? hoverStrokeWidth : strokeWidth}
                      strokeDasharray={`${arc.stroke} ${circumference - arc.stroke}`}
                      strokeDashoffset={arc.arcOffset}
                      strokeLinecap="butt"
                      fill="transparent"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHovered(arc.key)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  ) : null
                )}
            </svg>

            {/* Center Label (24 Total Links / Total Devices) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                {activeArc ? activeArc.count : grandTotal}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1">
                {activeArc ? `${activeArc.label} (${activeArc.pct}%)` : 'Total Devices'}
              </span>
            </div>
          </div>

          {/* Legend: 22 Active, 1 Down, 1 Maintenance */}
          <div className="flex flex-col gap-3.5 sm:gap-4 min-w-[160px]">
            {arcs
              .filter((arc) => arc.key !== 'provisioned' || arc.count > 0)
              .map((arc) => {
                const isHovered = hovered === arc.key;
                return (
                  <div
                    key={arc.key}
                    onMouseEnter={() => setHovered(arc.key)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center gap-3 cursor-pointer py-1 px-2.5 -mx-2.5 rounded-xl transition-all ${
                      isHovered ? 'bg-[#152342]' : 'hover:bg-[#111e38]'
                    }`}
                  >
                    {/* Vibrant solid indicator dot */}
                    <span className={`w-4 h-4 rounded-full shrink-0 ${arc.dotClass}`} />

                    {/* Count */}
                    <span className="text-base sm:text-lg font-extrabold text-white min-w-[28px]">
                      {arc.count}
                    </span>

                    {/* Label */}
                    <span className="text-sm font-medium text-slate-300">
                      {arc.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Side: Quick Summary Highlights */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Active / Online card */}
          <div className="bg-[#0c162b] border border-[#1a2847] hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Fleet Availability
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {healthRate}%
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-white">
              {working} of {grandTotal} Active
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-[#17233f] rounded-full overflow-hidden">
              <div
                style={{ width: `${healthRate}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Attention needed card */}
          <div className="bg-[#0c162b] border border-[#1a2847] hover:border-rose-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Attention Needed
              </span>
              <span className="text-xs font-bold text-rose-400">
                {faulty + maintenance} units
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-white">
              {faulty} Down · {maintenance} Maintenance
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Service requests are tracked in active work orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
