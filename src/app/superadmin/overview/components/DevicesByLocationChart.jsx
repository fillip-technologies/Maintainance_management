import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { CHART_PALETTE } from '../../../../tokens';

const COLOR_PALETTE = CHART_PALETTE;

function getNiceYAxis(highest) {
  if (highest <= 0) return { maxVal: 100, ticks: [100, 75, 50, 25, 0] };

  // Provide ~15% headroom so highest bar count sits comfortably below chart top
  const target = highest * 1.15;
  const rawStep = target / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let stepMultiplier;
  if (normalized <= 1) stepMultiplier = 1;
  else if (normalized <= 2) stepMultiplier = 2;
  else if (normalized <= 2.5) stepMultiplier = 2.5;
  else if (normalized <= 5) stepMultiplier = 5;
  else stepMultiplier = 10;

  const step = stepMultiplier * magnitude;
  const maxVal = Math.round(step * 4);
  const ticks = [
    maxVal,
    Math.round(step * 3),
    Math.round(step * 2),
    Math.round(step * 1),
    0,
  ];
  return { maxVal, ticks };
}

export default function DevicesByLocationChart({ facilities, locations, hardwareTypes = [], loading, className = '' }) {
  const [deviceFilter, setDeviceFilter] = useState('all');

  // Use real backend facilities only — no hardcoded fallback
  const items = useMemo(() => {
    if (facilities && facilities.length > 0) return facilities;
    if (locations && locations.length > 0) return locations;
    return [];
  }, [facilities, locations]);

  // Compute filtered items and counts
  const chartItems = useMemo(() => {
    return items.slice(0, 7).map((loc, idx) => {
      let count = loc.devices ?? 0;
      if (deviceFilter !== 'all' && loc.byHardwareType) {
        count = loc.byHardwareType[deviceFilter] ?? 0;
      }
      return {
        id: loc.clientId || loc.id,
        name: loc.facilityName || loc.shortName || loc.name,
        devices: count,
        color: loc.pinColor || loc.barColor || COLOR_PALETTE[idx % COLOR_PALETTE.length],
      };
    });
  }, [items, deviceFilter]);

  // Calculate dynamic max value and nice y-axis ticks
  const { maxVal, ticks: yTicks } = useMemo(() => {
    const highestVal = Math.max(...chartItems.map((i) => i.devices), 0);
    return getNiceYAxis(highestVal);
  }, [chartItems]);

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-md h-full flex-1 ${className}`}>
      {/* Header with Title and Dropdown */}
      <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
        <h3 className="text-base font-bold text-white tracking-tight">
          Devices by Location
        </h3>

        {/* Dropdown Filter */}
        <div className="relative">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-slate-300 outline-none hover:border-slate-600 focus:border-blue-500 cursor-pointer shadow-xs transition-colors"
          >
            <option value="all">All Devices</option>
            {hardwareTypes.map((hw) => (
              <option key={hw.hardwareTypeId || hw.id} value={hw.hardwareTypeId || hw.id}>
                {hw.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-3 pb-1 flex flex-col justify-end flex-1 min-h-[190px]">
        {loading ? (
          <div className="flex items-end justify-between gap-3 sm:gap-4 h-[155px] pl-9 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full max-w-[40px] bg-slate-800/60 rounded-t-md h-[45%]" />
              </div>
            ))}
          </div>
        ) : chartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
            <span className="text-xs font-semibold">No location device data available</span>
          </div>
        ) : (
          <>
            {/* Plot Area: Gridlines + Bars */}
            <div className="relative h-[155px] w-full">
              {/* Horizontal Gridlines & Y-Axis Labels */}
              <div className="absolute inset-0 pl-9 flex flex-col justify-between pointer-events-none">
                {yTicks.map((tick, i) => (
                  <div key={`${tick}-${i}`} className="flex items-center w-full relative">
                    <span className="absolute -left-9 text-[11px] font-mono text-slate-400 -translate-y-1/2 w-7 text-right select-none">
                      {tick}
                    </span>
                    <div className="w-full border-b border-slate-800/80" />
                  </div>
                ))}
              </div>

              {/* Bars Columns */}
              <div className="relative z-10 pl-9 h-full flex items-end justify-between gap-3 sm:gap-4">
                {chartItems.map((loc) => {
                  const heightPercent = maxVal > 0 ? Math.min((loc.devices / maxVal) * 100, 100) : 0;

                  return (
                    <div
                      key={loc.id}
                      className="relative flex-1 flex flex-col items-center justify-end h-full group min-w-0"
                    >
                      {/* Interactive Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 absolute -top-8 z-30 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {loc.name}: {loc.devices} devices
                      </div>

                      {/* Bar wrapper tracking height */}
                      <div
                        className="w-full max-w-[40px] relative flex flex-col items-center justify-end transition-all duration-500 ease-out"
                        style={{ height: `${heightPercent}%`, minHeight: loc.devices > 0 ? '16px' : '4px' }}
                      >
                        {/* Count on Top of Bar */}
                        <span
                          className={`absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black tracking-tight whitespace-nowrap transition-transform duration-200 group-hover:scale-110 select-none ${
                            loc.devices > 0 ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {loc.devices}
                        </span>

                        {/* Bar Body */}
                        <div
                          style={{
                            backgroundColor: loc.devices > 0 ? loc.color : 'rgba(71, 85, 105, 0.4)',
                          }}
                          className={`w-full rounded-t-md transition-all duration-300 shadow-md ${
                            loc.devices > 0
                              ? 'h-full hover:brightness-125'
                              : 'h-1 rounded-full'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels Row below 0-Baseline */}
            <div className="pl-9 flex justify-between gap-3 sm:gap-4 mt-2.5 pt-1">
              {chartItems.map((loc) => (
                <div key={loc.id} className="flex-1 text-center min-w-0">
                  <span
                    className="text-[11px] font-semibold text-slate-400 block truncate leading-tight hover:text-white transition-colors cursor-default"
                    title={loc.name}
                  >
                    {loc.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
