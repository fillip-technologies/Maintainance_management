import React, { useState } from 'react';
import { Shield, UserCheck, Wrench, ArrowRight } from 'lucide-react';
import { HEALTH_SEGMENTS as HEALTH_COLORS } from '../../../../tokens';

const HEALTH_SEGMENTS = [
  {
    key: 'working',
    label: 'Active',
    subLabel: 'Online & operational',
    color: HEALTH_COLORS.working.color,
    hoverColor: HEALTH_COLORS.working.hoverColor,
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
  },
  {
    key: 'faulty',
    label: 'Down',
    subLabel: 'Offline or reporting faults',
    color: HEALTH_COLORS.faulty.color,
    hoverColor: HEALTH_COLORS.faulty.hoverColor,
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-400',
  },
  {
    key: 'underMaintenance',
    label: 'Maintenance',
    subLabel: 'Under active repair / servicing',
    color: HEALTH_COLORS.underMaintenance.color,
    hoverColor: HEALTH_COLORS.underMaintenance.hoverColor,
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-400',
  },
  {
    key: 'provisioned',
    label: 'In Stock',
    subLabel: 'Provisioned / awaiting zone deploy',
    color: HEALTH_COLORS.provisioned.color,
    hoverColor: HEALTH_COLORS.provisioned.hoverColor,
    dotClass: 'bg-sky-500',
    textClass: 'text-sky-400',
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
    <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] shadow-lg flex flex-col gap-6 text-white">
      {/* Outer Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Product Health &amp; Operations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time equipment operational distribution and zone personnel breakdown
          </p>
        </div>

        {/* Operational Health Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{healthRate}% Operational</span>
        </div>
      </div>

      {/* Main 2-Column Frame: Left = Graph & Legend | Right = Personnel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ── LEFT SIDE: Donut Graph & Legend (col-span-7) ── */}
        <div className="lg:col-span-7 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Product Health
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
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
                  stroke="var(--border-color)"
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
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
                  {activeArc ? activeArc.count : grandTotal}
                </span>
                <span className="text-xs font-semibold text-slate-400 mt-1">
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
                    className={`flex items-center gap-3 cursor-pointer py-1.5 px-2.5 -mx-2.5 rounded-xl transition-all min-w-0 ${
                      isHovered ? 'bg-[var(--bg-card-hover)]' : 'hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    {/* Solid indicator dot */}
                    <span className={`w-3 h-3 rounded-full shrink-0 ${arc.dotClass}`} />

                    {/* Count */}
                    <span className="text-base sm:text-lg font-extrabold text-white min-w-[24px] shrink-0">
                      {arc.count}
                    </span>

                    {/* Label */}
                    <span className="text-xs sm:text-sm font-medium text-slate-300 truncate" title={arc.label}>
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
            <h3 className="text-sm font-bold text-white tracking-tight">
              Operations &amp; Zone Personnel
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any card to inspect active assigned personnel
            </p>
          </div>

          <div className="flex flex-col justify-between gap-3 flex-1">
            {/* Zone Officers Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('zone_officers')}
              className="rounded-2xl p-4 border border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-hover)] hover:border-purple-500/50 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Shield size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-400 tracking-tight">
                    Zone Officers
                  </span>
                  <span className="text-2xl font-extrabold text-white leading-none mt-1 block">
                    {zoneOfficersCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view zone leads
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-900/50 hover:bg-purple-800/60 text-purple-300 flex items-center gap-1 transition-colors shrink-0">
                <span>Officers</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            {/* Staff Members Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('staff')}
              className="rounded-2xl p-4 border border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-hover)] hover:border-teal-500/50 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-teal-950/70 border border-teal-800/60 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-400 tracking-tight">
                    Staff Members
                  </span>
                  <span className="text-2xl font-extrabold text-white leading-none mt-1 block">
                    {staffMembersCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view floor staff
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-900/50 hover:bg-teal-800/60 text-teal-300 flex items-center gap-1 transition-colors shrink-0">
                <span>Floor Staff</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            {/* Technicians Card */}
            <button
              type="button"
              onClick={() => onCardClick?.('technicians')}
              className="rounded-2xl p-4 border border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-hover)] hover:border-amber-500/50 transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-1"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-800/60 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-400 tracking-tight">
                    Technicians
                  </span>
                  <span className="text-2xl font-extrabold text-white leading-none mt-1 block">
                    {techniciansCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                    Click to view service engineers
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-900/50 hover:bg-amber-800/60 text-amber-300 flex items-center gap-1 transition-colors shrink-0">
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
