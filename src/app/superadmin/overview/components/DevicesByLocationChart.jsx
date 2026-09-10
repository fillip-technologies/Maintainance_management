import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { CHART_PALETTE } from '../../../../tokens';

const COLOR_PALETTE = CHART_PALETTE;

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
  const highestVal = Math.max(...chartItems.map((i) => i.devices), 0);
  const maxVal = highestVal > 0 ? Math.ceil(highestVal / 20) * 20 : 100;
  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

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
      <div className="relative pt-2 pb-1 flex flex-col justify-end flex-1 min-h-[170px]">
        {chartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
            <span className="text-xs font-semibold">No location device data available</span>
          </div>
        ) : (
          <>
            {/* Horizontal Gridlines & Y-Axis Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-8">
              {yTicks.map((tick, i) => (
                <div key={`${tick}-${i}`} className="flex items-center w-full relative">
                  <span className="absolute -left-8 text-[11px] font-mono text-slate-400 -translate-y-1/2 w-6 text-right">
                    {tick}
                  </span>
                  <div className="w-full border-b border-slate-800/80" />
                </div>
              ))}
            </div>

            {/* Bars Columns */}
            <div className={`relative z-10 pl-8 grid grid-cols-${chartItems.length || 5} gap-3 sm:gap-4 items-end h-[150px] mb-6`}>
              {chartItems.map((loc) => {
                const heightPercent = maxVal > 0 ? Math.min((loc.devices / maxVal) * 100, 100) : 0;

                return (
                  <div
                    key={loc.id}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    {/* Count on Top of Bar */}
                    <span className="text-xs font-black text-white mb-1 tracking-tight group-hover:scale-110 transition-transform">
                      {loc.devices}
                    </span>

                    {/* Vertical Bar */}
                    <div className="w-full max-w-[38px] bg-slate-800/50 rounded-t-md flex items-end overflow-hidden h-full">
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: loc.color
                        }}
                        className="w-full rounded-t-md transition-all duration-500 ease-out shadow-lg hover:brightness-110"
                      />
                    </div>

                    {/* X-Axis Label */}
                    <div className="absolute -bottom-6 w-full max-w-[65px] text-center">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate leading-tight group-hover:text-white transition-colors" title={loc.name}>
                        {loc.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
