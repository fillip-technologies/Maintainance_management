import React from 'react';
import { ChevronRight } from 'lucide-react';
import { OVERVIEW_LOCATIONS } from './locationsData';

export default function LocationCardsRow({ locations = OVERVIEW_LOCATIONS, onSelectLocation }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {locations.map((loc) => (
        <div
          key={loc.id}
          onClick={() => onSelectLocation && onSelectLocation(loc.id)}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
        >
          {/* Rounded-xl Image Thumbnail */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 shadow-xs">
            <img
              src={loc.image}
              alt={loc.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details Column */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm font-bold text-white truncate">
                {loc.shortName || loc.name}
              </span>
              <ChevronRight
                size={16}
                className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </div>

            {/* Operational Status Pill */}
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  loc.bottomStatusColor === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  loc.bottomStatusColor === 'amber'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {loc.operationalStatus}
              </span>
            </div>

            {/* Device Count */}
            <span className="text-xs font-bold text-slate-300 mt-1">
              {loc.devices} Devices
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
