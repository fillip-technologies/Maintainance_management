import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Wrench,
  MapPin
} from 'lucide-react';

export default function ClientProductCircleGraph({ stats }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const total = stats?.totalProducts || 24;
  const working = stats?.workingProducts !== undefined ? stats?.workingProducts : 19;
  const faulty = stats?.notWorkingProducts !== undefined ? stats?.notWorkingProducts : 2;
  const maintenance = stats?.maintenanceProducts !== undefined ? stats?.maintenanceProducts : 3;

  const workingPct = total > 0 ? Math.round((working / total) * 100) : 0;
  const faultyPct = total > 0 ? Math.round((faulty / total) * 100) : 0;
  const maintenancePct = total > 0 ? Math.max(0, 100 - workingPct - faultyPct) : 0;

  // Donut SVG parameters
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.26
  const gap = total > 3 ? 5 : 0; // Clean 5px gap between arcs so they never overlap
  const activeSegmentsCount = (working > 0 ? 1 : 0) + (maintenance > 0 ? 1 : 0) + (faulty > 0 ? 1 : 0);
  const totalGapSpace = activeSegmentsCount * gap;
  const usableCircumference = Math.max(10, circumference - totalGapSpace);

  const workingStroke = total > 0 && working > 0 ? (working / total) * usableCircumference : 0;
  const maintenanceStroke = total > 0 && maintenance > 0 ? (maintenance / total) * usableCircumference : 0;
  const faultyStroke = total > 0 && faulty > 0 ? (faulty / total) * usableCircumference : 0;

  // Clean sequential offsets with gap spacing
  const workingOffset = 0;
  const maintenanceOffset = -(workingStroke + (workingStroke > 0 ? gap : 0));
  const faultyOffset = -(workingStroke + (workingStroke > 0 ? gap : 0) + maintenanceStroke + (maintenanceStroke > 0 ? gap : 0));

  const zoneBreakdown = [
    { name: 'North Wing - Floor 1-4', count: Math.round(total * 0.42) || 10, working: Math.round(working * 0.42) || 9, color: 'bg-emerald-500' },
    { name: 'Roof Plant & Chiller Bay', count: Math.round(total * 0.25) || 6, working: Math.round(working * 0.25) || 5, color: 'bg-indigo-500' },
    { name: 'South Wing & Basement Bay', count: Math.round(total * 0.21) || 5, working: Math.round(working * 0.21) || 4, color: 'bg-sky-500' },
    { name: 'External & Utilities Bay', count: Math.max(1, Math.round(total * 0.12)) || 3, working: Math.max(1, Math.round(working * 0.12)) || 3, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Products Status & Health Distribution
        </h2>
        <p className="text-xs text-slate-500">
          Live circular breakdown of registered facility machinery and operational readiness
        </p>
      </div>

      {/* Main Content: Left Circular Donut Chart + Right Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Interactive Circular Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative">
          
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Donut */}
            <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
              {/* Background Track Circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-slate-200/80"
                strokeWidth="14"
                fill="transparent"
              />

              {/* 1. Working Segment (Emerald) */}
              {workingStroke > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className={`transition-all duration-300 cursor-pointer ${
                    hoveredSegment === 'working' ? 'stroke-emerald-400' : 'stroke-emerald-500'
                  }`}
                  strokeWidth={hoveredSegment === 'working' ? '18' : '14'}
                  strokeDasharray={`${workingStroke} ${circumference}`}
                  strokeDashoffset={workingOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  onMouseEnter={() => setHoveredSegment('working')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}

              {/* 2. Maintenance Segment (Amber) */}
              {maintenanceStroke > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className={`transition-all duration-300 cursor-pointer ${
                    hoveredSegment === 'maintenance' ? 'stroke-amber-400' : 'stroke-amber-500'
                  }`}
                  strokeWidth={hoveredSegment === 'maintenance' ? '18' : '14'}
                  strokeDasharray={`${maintenanceStroke} ${circumference}`}
                  strokeDashoffset={maintenanceOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  onMouseEnter={() => setHoveredSegment('maintenance')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}

              {/* 3. Faulty Segment (Rose) */}
              {faultyStroke > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className={`transition-all duration-300 cursor-pointer ${
                    hoveredSegment === 'faulty' ? 'stroke-rose-400' : 'stroke-rose-500'
                  }`}
                  strokeWidth={hoveredSegment === 'faulty' ? '18' : '14'}
                  strokeDasharray={`${faultyStroke} ${circumference}`}
                  strokeDashoffset={faultyOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  onMouseEnter={() => setHoveredSegment('faulty')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {hoveredSegment === 'working'
                  ? working
                  : hoveredSegment === 'maintenance'
                  ? maintenance
                  : hoveredSegment === 'faulty'
                  ? faulty
                  : total}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                {hoveredSegment === 'working'
                  ? 'Working'
                  : hoveredSegment === 'maintenance'
                  ? 'Servicing'
                  : hoveredSegment === 'faulty'
                  ? 'Faulty'
                  : 'Total Units'}
              </span>
              <span className="text-[10px] font-extrabold text-indigo-600 mt-0.5">
                {hoveredSegment === 'working'
                  ? `${workingPct}% of Fleet`
                  : hoveredSegment === 'maintenance'
                  ? `${maintenancePct}% in PM`
                  : hoveredSegment === 'faulty'
                  ? `${faultyPct}% Attention`
                  : `${workingPct}% Active`}
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-medium mt-3">
            Hover over circle segments for details
          </span>
        </div>

        {/* Right: Detailed Metric Cards & Zone Allocation */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Status Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Working Card */}
            <div
              onMouseEnter={() => setHoveredSegment('working')}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredSegment === 'working'
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-xs ring-2 ring-emerald-200'
                  : 'bg-white border-slate-200/90 hover:border-emerald-200 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Working
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {workingPct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{working}</span>
                <span className="text-xs text-slate-500 font-medium">units online</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${workingPct}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Servicing Card */}
            <div
              onMouseEnter={() => setHoveredSegment('maintenance')}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredSegment === 'maintenance'
                  ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-2 ring-amber-200'
                  : 'bg-white border-slate-200/90 hover:border-amber-200 hover:bg-amber-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wrench size={15} className="text-amber-600" />
                  Servicing
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {maintenancePct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{maintenance}</span>
                <span className="text-xs text-slate-500 font-medium">under PM</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${maintenancePct}%` }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>

            {/* Faulty Card */}
            <div
              onMouseEnter={() => setHoveredSegment('faulty')}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredSegment === 'faulty'
                  ? 'bg-rose-50/90 border-rose-300 shadow-xs ring-2 ring-rose-200'
                  : 'bg-white border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <XCircle size={15} className="text-rose-600" />
                  Faulty
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {faultyPct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{faulty}</span>
                <span className="text-xs text-slate-500 font-medium">attention</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${faultyPct}%` }} className="h-full bg-rose-500 rounded-full" />
              </div>
            </div>

          </div>

          {/* Zone-wise Progress Summary */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-600" />
                Zone Product Health Distribution
              </span>
              <span className="text-[11px] font-semibold text-slate-400">4 Active Zones</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {zoneBreakdown.map((z, idx) => {
                const zPct = Math.round((z.working / z.count) * 100);
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">{z.name}</span>
                      <span className="font-bold text-slate-900">{z.working}/{z.count} Active</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${zPct}%` }} className={`h-full ${z.color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
