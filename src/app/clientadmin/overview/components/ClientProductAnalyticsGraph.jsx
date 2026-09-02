import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Wrench,
  Package,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';

export default function ClientProductAnalyticsGraph({ stats }) {
  const [timeframe, setTimeframe] = useState('7d'); // '7d' | '30d' | '90d'
  const [activeHoverIdx, setActiveHoverIdx] = useState(null);

  const total = stats?.totalProducts || (stats?.workingProducts || stats?.notWorkingProducts ? (stats?.workingProducts + stats?.notWorkingProducts + stats?.maintenanceProducts) : 24);
  const working = stats?.workingProducts !== undefined ? stats?.workingProducts : (total > 0 ? total - (stats?.notWorkingProducts || 2) - (stats?.maintenanceProducts || 3) : 19);
  const faulty = stats?.notWorkingProducts !== undefined ? stats?.notWorkingProducts : 2;
  const maintenance = stats?.maintenanceProducts !== undefined ? stats?.maintenanceProducts : 3;

  const workingPct = total > 0 ? Math.round((working / total) * 100) : 0;
  const faultyPct = total > 0 ? Math.round((faulty / total) * 100) : 0;
  const maintenancePct = total > 0 ? Math.max(0, 100 - workingPct - faultyPct) : 0;

  // 7-day telemetry trend data
  const telemetryData = [
    { day: 'Mon', total: total, working: Math.max(1, working - 2), faulty: 2, maintenance: 3, uptime: 91.6 },
    { day: 'Tue', total: total, working: Math.max(1, working - 1), faulty: 1, maintenance: 3, uptime: 95.8 },
    { day: 'Wed', total: total, working: Math.max(1, working - 3), faulty: 3, maintenance: 4, uptime: 87.5 },
    { day: 'Thu', total: total, working: Math.max(1, working - 1), faulty: 2, maintenance: 2, uptime: 91.6 },
    { day: 'Fri', total: total, working: working, faulty: faulty, maintenance: maintenance, uptime: workingPct },
    { day: 'Sat', total: total, working: working, faulty: faulty, maintenance: maintenance, uptime: workingPct },
    { day: 'Sun (Today)', total: total, working: working, faulty: faulty, maintenance: maintenance, uptime: workingPct }
  ];

  // Zone distribution
  const zoneDistribution = [
    { name: 'North Wing - Floor 1-4', total: Math.round(total * 0.4) || 10, working: Math.round(working * 0.4) || 9, color: 'from-indigo-500 to-sky-500' },
    { name: 'Roof Plant & Chiller Bay', total: Math.round(total * 0.25) || 6, working: Math.round(working * 0.25) || 5, color: 'from-cyan-500 to-teal-500' },
    { name: 'South Wing & Basement Bay', total: Math.round(total * 0.2) || 5, working: Math.round(working * 0.2) || 4, color: 'from-emerald-500 to-teal-600' },
    { name: 'External & Utilities Bay', total: Math.max(1, Math.round(total * 0.15)) || 3, working: Math.max(1, Math.round(working * 0.15)) || 3, color: 'from-purple-500 to-indigo-600' }
  ];

  // Graph SVG points calculations
  const maxVal = Math.max(...telemetryData.map((d) => d.total), total, 25);
  const chartHeight = 180;
  const chartWidth = 520;
  const stepX = chartWidth / (telemetryData.length - 1);

  const pointsTotal = telemetryData
    .map((d, i) => `${i * stepX},${chartHeight - (d.total / maxVal) * (chartHeight - 30)}`)
    .join(' ');

  const pointsWorking = telemetryData
    .map((d, i) => `${i * stepX},${chartHeight - (d.working / maxVal) * (chartHeight - 30)}`)
    .join(' ');

  const areaWorking = `${pointsWorking} ${chartWidth},${chartHeight} 0,${chartHeight}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Activity size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Total Products & Operational Health Graph
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {workingPct}% Healthy
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live equipment telemetry, 7-day operational uptime curves, and zone allocation
            </p>
          </div>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {['7d', '30d', '90d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t === '7d' ? 'Last 7 Days' : t === '30d' ? '30 Days' : 'Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Left Trend Chart + Right Status & Zone Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 7-Day Visual Telemetry Graph */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Operational Uptime Telemetry</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Total Equipment ({total})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Active Working ({working})
              </span>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="relative w-full pt-2 pb-1">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="workingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="totalLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={ratio * (chartHeight - 30) + 15}
                  x2={chartWidth}
                  y2={ratio * (chartHeight - 30) + 15}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Working Area Fill */}
              <polygon points={areaWorking} fill="url(#workingAreaGrad)" />

              {/* Total Registered Line (Top reference) */}
              <polyline
                fill="none"
                stroke="url(#totalLineGrad)"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                points={pointsTotal}
              />

              {/* Working Devices Trend Curve */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsWorking}
              />

              {/* Data Points */}
              {telemetryData.map((d, i) => {
                const cx = i * stepX;
                const cyWorking = chartHeight - (d.working / maxVal) * (chartHeight - 30);
                const isHovered = activeHoverIdx === i;

                return (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveHoverIdx(i)} onMouseLeave={() => setActiveHoverIdx(null)}>
                    {/* Hover vertical line */}
                    {isHovered && (
                      <line
                        x1={cx}
                        y1="10"
                        x2={cx}
                        y2={chartHeight}
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cyWorking}
                      r={isHovered ? 6 : 4}
                      className={`${isHovered ? 'fill-emerald-600 stroke-white stroke-2' : 'fill-white stroke-emerald-500 stroke-2'} transition-all`}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Day Labels */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-1">
              {telemetryData.map((d, i) => (
                <span key={i} className={activeHoverIdx === i ? 'text-indigo-600 font-extrabold' : ''}>
                  {d.day}
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Active Point Details Badge */}
          <div className="mt-1 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>
                {activeHoverIdx !== null ? telemetryData[activeHoverIdx].day : 'Today (Current Status)'}:
              </span>
            </span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">
                {activeHoverIdx !== null ? telemetryData[activeHoverIdx].working : working} / {total} Active
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                {activeHoverIdx !== null ? telemetryData[activeHoverIdx].uptime : workingPct}% Uptime
              </span>
            </div>
          </div>

        </div>

        {/* Right: Health Ratio Donut Breakdown & Zone Allocation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Health Distribution Breakdown Bars */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Equipment Health Status</span>
              <span className="text-[11px] font-bold text-slate-500">{total} Total Units</span>
            </div>

            {/* Combined Multi-color Progress Strip */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${workingPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Working: ${working}`}
              />
              <div
                style={{ width: `${maintenancePct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Maintenance: ${maintenance}`}
              />
              <div
                style={{ width: `${faultyPct}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Faulty: ${faulty}`}
              />
            </div>

            {/* Status Legend Tiles */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col">
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Working
                </span>
                <span className="text-base font-extrabold text-emerald-950 mt-0.5">{working}</span>
                <span className="text-[10px] text-emerald-600 font-medium">{workingPct}%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col">
                <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                  <Wrench size={11} />
                  Servicing
                </span>
                <span className="text-base font-extrabold text-amber-950 mt-0.5">{maintenance}</span>
                <span className="text-[10px] text-amber-600 font-medium">{maintenancePct}%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex flex-col">
                <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                  <XCircle size={11} />
                  Faulty
                </span>
                <span className="text-base font-extrabold text-rose-950 mt-0.5">{faulty}</span>
                <span className="text-[10px] text-rose-600 font-medium">{faultyPct}%</span>
              </div>
            </div>
          </div>

          {/* Zone-wise Products Allocation */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-600" />
                Products by Facility Zone
              </span>
              <span className="text-[11px] font-bold text-indigo-600">4 Zones</span>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {zoneDistribution.map((zone, idx) => {
                const zPct = Math.round((zone.working / zone.total) * 100);
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                        {zone.name}
                      </span>
                      <span className="font-bold text-slate-900">
                        {zone.working}/{zone.total} Active ({zPct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${zPct}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${zone.color} transition-all duration-500`}
                      />
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
