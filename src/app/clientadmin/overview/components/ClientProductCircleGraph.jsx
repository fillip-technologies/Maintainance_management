import React, { useState } from 'react';
import { CheckCircle2, XCircle, Wrench, Box, PauseCircle } from 'lucide-react';

const SEGMENTS = [
  {
    key: 'working',
    label: 'Working',
    sub: 'Active & operational',
    strokeColor: '#10b981',
    strokeHoverColor: '#34d399',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-300',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-50 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle2,
    iconCls: 'text-emerald-600',
    dot: 'bg-emerald-500',
    unit: 'units online',
  },
  {
    key: 'underMaintenance',
    label: 'Under Maintenance',
    sub: 'Has an active service request',
    strokeColor: '#8b5cf6',
    strokeHoverColor: '#a78bfa',
    bar: 'bg-violet-500',
    ring: 'ring-violet-300',
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    hoverBg: 'hover:bg-violet-50 hover:border-violet-300',
    badge: 'bg-violet-100 text-violet-800',
    icon: Wrench,
    iconCls: 'text-violet-600',
    dot: 'bg-violet-500',
    unit: 'in service',
  },
  {
    key: 'faulty',
    label: 'Faulty',
    sub: 'Flagged by daily logs',
    strokeColor: '#f43f5e',
    strokeHoverColor: '#fb7185',
    bar: 'bg-rose-500',
    ring: 'ring-rose-300',
    border: 'border-rose-400',
    bg: 'bg-rose-50',
    hoverBg: 'hover:bg-rose-50 hover:border-rose-300',
    badge: 'bg-rose-100 text-rose-800',
    icon: XCircle,
    iconCls: 'text-rose-600',
    dot: 'bg-rose-500',
    unit: 'need attention',
  },
  {
    key: 'provisioned',
    label: 'Provisioned',
    sub: 'Added, not yet deployed',
    strokeColor: '#0ea5e9',
    strokeHoverColor: '#38bdf8',
    bar: 'bg-sky-500',
    ring: 'ring-sky-300',
    border: 'border-sky-400',
    bg: 'bg-sky-50',
    hoverBg: 'hover:bg-sky-50 hover:border-sky-300',
    badge: 'bg-sky-100 text-sky-800',
    icon: Box,
    iconCls: 'text-sky-600',
    dot: 'bg-sky-500',
    unit: 'in stock',
  },
  {
    key: 'onHold',
    label: 'Services On Hold',
    sub: 'Queries paused / awaiting action',
    strokeColor: '#f97316',
    strokeHoverColor: '#fb923c',
    bar: 'bg-orange-500',
    ring: 'ring-orange-300',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-50 hover:border-orange-300',
    badge: 'bg-orange-100 text-orange-800',
    icon: PauseCircle,
    iconCls: 'text-orange-600',
    dot: 'bg-orange-500',
    unit: 'on hold',
  },
];

export default function ClientProductCircleGraph({ stats }) {
  const [hovered, setHovered] = useState(null);

  const totalDevices = stats?.totalDevices      ?? 0;
  const working      = stats?.workingDevices     ?? 0;
  const maintenance  = stats?.underMaintenance   ?? 0;
  const faulty       = stats?.faultyDevices      ?? 0;
  const provisioned  = stats?.provisionedDevices ?? 0;
  const onHold       = stats?.onHoldIssues       ?? 0;

  const counts = { working, underMaintenance: maintenance, faulty, provisioned, onHold };

  // All 5 values summed — used for proportional arc sizing so the donut is full.
  const grandTotal = working + maintenance + faulty + provisioned + onHold;

  const pct = (n) => (grandTotal > 0 ? Math.round((n / grandTotal) * 100) : 0);

  // ── Donut geometry ───────────────────────────────────────────────────────
  const radius        = 68;
  const circumference = 2 * Math.PI * radius;
  const gap           = grandTotal > 1 ? 4 : 0;
  const activeCount   = SEGMENTS.filter((s) => counts[s.key] > 0).length;
  const usable        = Math.max(10, circumference - activeCount * gap);

  let offset = 0;
  const arcs = SEGMENTS.map((seg) => {
    const count  = counts[seg.key] ?? 0;
    const stroke = count > 0 ? (count / grandTotal) * usable : 0;
    const off    = -offset;
    if (stroke > 0) offset += stroke + gap;
    return { ...seg, count, stroke, arcOffset: off, pct: pct(count) };
  });

  const active = hovered ? arcs.find((a) => a.key === hovered) : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Products Status &amp; Health Distribution
        </h2>
        <p className="text-xs text-slate-500">
          Full breakdown of device fleet and active service queries
        </p>
      </div>

      {/* Chart + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

        {/* Donut */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle cx="90" cy="90" r={radius} stroke="#e2e8f0" strokeWidth="14" fill="transparent" />
              {/* Segments */}
              {arcs.map((arc) =>
                arc.stroke > 0 ? (
                  <circle
                    key={arc.key}
                    cx="90" cy="90" r={radius}
                    stroke={hovered === arc.key ? arc.strokeHoverColor : arc.strokeColor}
                    strokeWidth={hovered === arc.key ? 20 : 14}
                    strokeDasharray={`${arc.stroke} ${circumference}`}
                    strokeDashoffset={arc.arcOffset}
                    strokeLinecap="butt"
                    fill="transparent"
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(arc.key)}
                    onMouseLeave={() => setHovered(null)}
                  />
                ) : null
              )}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {active ? active.count : totalDevices}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                {active ? active.label : 'Total Devices'}
              </span>
              <span className="text-[10px] font-extrabold text-indigo-600 mt-0.5">
                {active ? `${active.pct}% of all` : `${pct(working)}% Active`}
              </span>
            </div>
          </div>

          {/* Colour legend below donut */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-4">
            {arcs.map((arc) => (
              <span
                key={arc.key}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 cursor-pointer"
                onMouseEnter={() => setHovered(arc.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={`w-2 h-2 rounded-full ${arc.dot}`} />
                {arc.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: 5 metric cards in a 2+3 layout */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3">
          {arcs.map((arc) => {
            const Icon = arc.icon;
            const isHovered = hovered === arc.key;
            return (
              <div
                key={arc.key}
                onMouseEnter={() => setHovered(arc.key)}
                onMouseLeave={() => setHovered(null)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isHovered
                    ? `${arc.bg} ${arc.border} shadow-sm ring-2 ${arc.ring}`
                    : `bg-white border-slate-200/90 ${arc.hoverBg}`
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${arc.dot}`} />
                    <Icon size={12} className={`${arc.iconCls} shrink-0`} />
                    <span className="truncate">{arc.label}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${arc.badge}`}>
                    {arc.pct}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{arc.count}</span>
                  <span className="text-xs text-slate-500 font-medium">{arc.unit}</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${arc.pct}%` }}
                    className={`h-full ${arc.bar} rounded-full transition-all duration-500`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{arc.sub}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
