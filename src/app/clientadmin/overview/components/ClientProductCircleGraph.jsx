import React, { useState } from 'react';
import { Shield, UserCheck, Wrench, ArrowRight } from 'lucide-react';

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

export default function ClientProductCircleGraph({ stats, teamStats, onCardClick }) {
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

  // Team counts
  const zoneOfficersCount = teamStats?.zoneOfficers ?? 0;
  const staffMembersCount = teamStats?.staffMembers ?? 0;
  const techniciansCount  = teamStats?.technicians  ?? 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-6">
      {/* Outer Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Health &amp; Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time equipment operational distribution and zone personnel breakdown
          </p>
        </div>

        {/* Operational Health Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{healthRate}% Operational</span>
        </div>
      </div>

      {/* Main 2-Column Frame: Left = Graph & Legend | Right = Personnel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ── LEFT SIDE: Donut Graph & Legend (col-span-7) ── */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Product Health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time operational distribution and equipment readiness
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 my-auto py-4">
            {/* Donut Ring Chart */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
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
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {activeArc ? activeArc.count : grandTotal}
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1">
                  {activeArc ? `${activeArc.label} (${activeArc.pct}%)` : 'Total Devices'}
                </span>
              </div>
            </div>

            {/* Legend: Active, Down, Maintenance, In Stock */}
            <div className="flex flex-col gap-3.5 min-w-[160px]">
              {arcs.map((arc) => {
                const isHovered = hovered === arc.key;
                return (
                  <div
                    key={arc.key}
                    onMouseEnter={() => setHovered(arc.key)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center gap-3 cursor-pointer py-1.5 px-2.5 -mx-2.5 rounded-xl transition-all ${
                      isHovered ? 'bg-slate-200/70' : 'hover:bg-slate-100'
                    }`}
                  >
                    {/* Solid indicator dot */}
                    <span className={`w-3 h-3 rounded-full shrink-0 ${arc.dotClass}`} />

                    {/* Count */}
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 min-w-[24px]">
                      {arc.count}
                    </span>

                    {/* Label */}
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {arc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE: Operations & Zone Personnel (col-span-5) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Operations &amp; Zone Personnel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any card to inspect active assigned personnel
            </p>
          </div>

          <div className="flex flex-col justify-between gap-3 flex-1">
            {/* Zone Officers Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('zone_officers')}
              className="rounded-2xl p-4 border border-purple-200/80 bg-purple-50/70 hover:bg-purple-100/70 hover:border-purple-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Shield size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-600 tracking-tight">
                    Zone Officers
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none mt-1 block">
                    {zoneOfficersCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view zone leads
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center gap-1 transition-colors shrink-0">
                <span>Officers</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            {/* Staff Members Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('staff')}
              className="rounded-2xl p-4 border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100/70 hover:border-teal-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-600 tracking-tight">
                    Staff Members
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none mt-1 block">
                    {staffMembersCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view floor staff
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-100 hover:bg-teal-200 text-teal-700 flex items-center gap-1 transition-colors shrink-0">
                <span>Floor Staff</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            {/* Technicians Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('technicians')}
              className="rounded-2xl p-4 border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-600 tracking-tight">
                    Technicians
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none mt-1 block">
                    {techniciansCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view service engineers
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center gap-1 transition-colors shrink-0">
                <span>Engineers</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
