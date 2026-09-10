import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { OVERVIEW_LOCATIONS } from './locationsData';

export default function DevicesByLocationChart({ locations = OVERVIEW_LOCATIONS }) {
  const [deviceFilter, setDeviceFilter] = useState('all');

  const maxVal = 400;
  const yTicks = [400, 300, 200, 100, 0];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md">
      {/* Header with Title and Dropdown */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
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
            <option value="cameras">CCTV / Cameras</option>
            <option value="sensors">Sensors</option>
            <option value="network">Network Hardware</option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-2 pb-1 flex flex-col justify-end min-h-[190px]">
        {/* Horizontal Gridlines & Y-Axis Labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-8">
          {yTicks.map((tick) => (
            <div key={tick} className="flex items-center w-full relative">
              <span className="absolute -left-8 text-[11px] font-mono text-slate-400 -translate-y-1/2 w-6 text-right">
                {tick}
              </span>
              <div className="w-full border-b border-slate-800/80" />
            </div>
          ))}
        </div>

        {/* Bars Columns */}
        <div className="relative z-10 pl-8 grid grid-cols-5 gap-3 sm:gap-4 items-end h-[150px] mb-6">
          {locations.map((loc) => {
            const heightPercent = Math.min((loc.devices / maxVal) * 100, 100);

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
                      backgroundColor: loc.barColor
                    }}
                    className="w-full rounded-t-md transition-all duration-500 ease-out shadow-lg hover:brightness-110"
                  />
                </div>

                {/* X-Axis Label */}
                <div className="absolute -bottom-6 w-full max-w-[55px] text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block truncate leading-tight group-hover:text-white transition-colors">
                    {loc.shortName || loc.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
