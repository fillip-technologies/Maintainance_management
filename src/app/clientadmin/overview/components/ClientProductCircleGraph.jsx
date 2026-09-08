import React, { useState } from 'react';

const HEALTH_SEGMENTS = [
  {
    key: 'working',
    label: 'Active',
    subLabel: 'Online & operational',
    color: '#22c55e',
    hoverColor: '#16a34a',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
  },
  {
    key: 'faulty',
    label: 'Down',
    subLabel: 'Offline or reporting faults',
    color: '#ef4444',
    hoverColor: '#dc2626',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-700',
  },
  {
    key: 'underMaintenance',
    label: 'Maintenance',
    subLabel: 'Under active repair / servicing',
    color: '#f59e0b',
    hoverColor: '#d97706',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-700',
  },
  {
    key: 'provisioned',
    label: 'In Stock',
    subLabel: 'Provisioned / awaiting zone deploy',
    color: '#0ea5e9',
    hoverColor: '#0284c7',
    dotClass: 'bg-sky-500',
    textClass: 'text-sky-700',
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
  const circumference = 2 * Math.PI * radius;

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
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operational distribution and equipment readiness
          </p>
        </div>

        {/* Operational Health Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{healthRate}% Operational</span>
        </div>
      </div>

      {/* Main Content: Clean Light Donut Graph & Legend */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
        
        {/* Donut Ring Chart */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full -rotate-90 transform overflow-visible"
          >
            {/* Background ring track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e2e8f0"
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

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              {activeArc ? activeArc.count : grandTotal}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1.5">
              {activeArc ? `${activeArc.label} (${activeArc.pct}%)` : 'Total Devices'}
            </span>
          </div>
        </div>

        {/* Legend: Active, Down, Maintenance, In Stock */}
        <div className="flex flex-col gap-4 sm:gap-5 min-w-[180px]">
          {arcs
            .filter((arc) => arc.key !== 'provisioned' || arc.count > 0)
            .map((arc) => {
              const isHovered = hovered === arc.key;
              return (
                <div
                  key={arc.key}
                  onMouseEnter={() => setHovered(arc.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex items-center gap-3.5 cursor-pointer py-1.5 px-3 -mx-3 rounded-xl transition-all ${
                    isHovered ? 'bg-slate-200/70' : 'hover:bg-slate-100'
                  }`}
                >
                  {/* Solid indicator dot */}
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${arc.dotClass}`} />

                  {/* Count */}
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 min-w-[32px]">
                    {arc.count}
                  </span>

                  {/* Label */}
                  <span className="text-sm sm:text-base font-medium text-slate-700">
                    {arc.label}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
