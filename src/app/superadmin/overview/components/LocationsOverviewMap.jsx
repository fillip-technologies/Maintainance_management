import React, { useState } from 'react';
import { ChevronRight, Plus, Minus, Maximize2, Minimize2, MapPin } from 'lucide-react';
import { OVERVIEW_LOCATIONS, satelliteMapImg } from './locationsData';

export default function LocationsOverviewMap({ locations = OVERVIEW_LOCATIONS, selectedId, onSelectLocation }) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLocId, setActiveLocId] = useState(selectedId || 'zoo-safari');

  const handleSelect = (id) => {
    setActiveLocId(id);
    if (onSelectLocation) onSelectLocation(id);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.8));

  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950/95 backdrop-blur-xl' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Locations Overview
          </h2>
          <p className="text-xs text-slate-400">
            All sites under DFO Nalanda &amp; associated projects
          </p>
        </div>
      </div>

      {/* Main Content Grid: Map (Left) + Locations List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[360px]">
        {/* Map Container (7 cols on lg) */}
        <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-center select-none shadow-inner group min-h-[320px] lg:min-h-[380px]">
          {/* Satellite Map Image with Zoom Transform */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={satelliteMapImg}
              alt="Bihar Nalanda Satellite Map"
              className="w-full h-full object-cover brightness-[0.75] contrast-[1.1] saturate-[1.15]"
            />
            {/* Dark green terrain gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Geographical Markers & Highway Badges */}
            <div className="absolute top-4 left-6 text-xs font-black tracking-wider text-white/70 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Patna
            </div>
            <div className="absolute top-6 right-8 text-xs font-black tracking-wider text-white/70 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Bihar Sharif
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black tracking-widest text-white/60 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Rajgir
            </div>
            <div className="absolute bottom-6 left-8 text-xs font-black tracking-wider text-white/70 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Gaya
            </div>

            {/* Highway Badges */}
            <div className="absolute top-16 right-1/4 bg-black/60 border border-slate-600/80 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-300">
              NH 31
            </div>
            <div className="absolute top-1/2 left-6 bg-black/60 border border-slate-600/80 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-300">
              NH 20
            </div>
            <div className="absolute bottom-14 right-1/4 bg-black/60 border border-slate-600/80 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-300">
              NH 22
            </div>

            {/* Interactive Location Pins */}
            {locations.map((loc) => {
              const isSelected = activeLocId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc.id)}
                  style={{ left: `${loc.pinX}%`, top: `${loc.pinY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 cursor-pointer z-20 group/pin"
                >
                  {/* Pin Icon with Ripple */}
                  <div className="relative flex items-center justify-center">
                    {isSelected && (
                      <span
                        className="absolute w-8 h-8 rounded-full animate-ping opacity-60"
                        style={{ backgroundColor: loc.pinColor }}
                      />
                    )}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white transition-transform hover:scale-110"
                      style={{ backgroundColor: loc.pinColor }}
                    >
                      <MapPin size={14} className="fill-white" />
                    </div>
                  </div>

                  {/* Pin Label Badge */}
                  <div
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-lg whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-white ring-2 ring-blue-500/50'
                        : 'bg-black/75 border-slate-600 hover:bg-black'
                    }`}
                  >
                    {loc.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top-Right Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-3 right-3 z-30 p-2 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Bottom-Left Zoom In/Out Controls */}
          <div className="absolute bottom-3 left-3 z-30 flex flex-col bg-black/70 border border-slate-700/80 rounded-lg overflow-hidden shadow-lg backdrop-blur-xs">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-700/80"
              title="Zoom In"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right Locations List (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-1.5">
          {locations.map((loc) => {
            const isSelected = activeLocId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => handleSelect(loc.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                }`}
              >
                {/* Circular Photo Thumbnail */}
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0 shadow-sm"
                />

                {/* Info Text */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        loc.statusDot === 'red'
                          ? 'bg-rose-500'
                          : loc.statusDot === 'amber'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {loc.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 mt-0.5">
                    {loc.devices} Devices
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {loc.breakdownText}
                  </span>
                </div>

                {/* Chevron Arrow */}
                <ChevronRight
                  size={16}
                  className={`shrink-0 transition-transform ${
                    isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
