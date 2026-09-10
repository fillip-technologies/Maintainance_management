import React from 'react';
import { ChevronRight, Building2 } from 'lucide-react';

export default function LocationCardsRow({ facilities, locations, onSelectLocation, loading }) {
  // Use real backend facilities only — no hardcoded fallback
  const items = (facilities && facilities.length > 0)
    ? facilities
    : (locations && locations.length > 0)
      ? locations
      : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 animate-pulse"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800/60 rounded" />
              <div className="h-3 w-12 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {items.map((loc) => {
        const id = loc.clientId || loc.id;
        const name = loc.facilityName || loc.name || 'Facility';
        const devicesCount = loc.devices ?? 0;
        const image = loc.imageUrl || loc.image;
        const isFaulty = (loc.faultyDevices ?? loc.offline ?? 0) > 0;
        const isMaint = (loc.underMaintenanceDevices ?? loc.maintenance ?? 0) > 0;
        const statusText = loc.operationalStatus || (isFaulty ? 'Partial Issues' : isMaint ? 'Under Maintenance' : 'Operational');
        const statusColor = isFaulty ? 'rose' : isMaint ? 'amber' : 'emerald';

        return (
          <div
            key={id}
            onClick={() => onSelectLocation && onSelectLocation(id)}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
          >
            {/* Rounded-xl Image Thumbnail or Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 shadow-xs flex items-center justify-center bg-slate-900">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Building2 size={24} className="text-blue-400" />
              )}
            </div>

            {/* Details Column */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-white truncate" title={name}>
                  {name}
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
                    statusColor === 'rose'
                      ? 'bg-rose-500'
                      : statusColor === 'amber'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    statusColor === 'rose'
                      ? 'text-rose-400'
                      : statusColor === 'amber'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {statusText}
                </span>
              </div>

              {/* Device Count */}
              <span className="text-xs font-bold text-slate-300 mt-1">
                {devicesCount} Devices
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
