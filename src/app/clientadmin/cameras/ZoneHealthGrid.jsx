import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Video,
  ChevronRight,
  Shield,
  Building2,
  Users,
  Dumbbell,
  Compass,
  Warehouse
} from 'lucide-react';

const ZONE_ICONS = {
  warehouse: Warehouse,
  audit: Shield,
  admin: Building2,
  facilities: Dumbbell,
  perimeter: Compass,
  safari: Layers
};

export default function ZoneHealthGrid({
  zones = [],
  cameras = [],
  selectedZone,
  onSelectZone,
  onOpenAlerts
}) {
  // Compute zone-wise aggregated live data
  const zoneStats = React.useMemo(() => {
    return zones.map((z) => {
      const zCams = cameras.filter((c) => c.zoneId === z.id);
      const total = zCams.length;
      const online = zCams.filter((c) => c.status === 'online').length;
      const offline = zCams.filter((c) => c.status === 'offline').length;
      const partial = zCams.filter((c) => c.status === 'partial').length;
      const alerts = zCams.filter((c) => c.hasAlert).length;
      
      const sumUptime = zCams.reduce((acc, c) => acc + parseFloat(c.avgUptime || 0), 0);
      const avgUptime = total > 0 ? (sumUptime / total).toFixed(1) : '100.0';

      const isAllWorking = total > 0 && online === total;
      const hasFaulty = offline > 0;

      return {
        ...z,
        total,
        online,
        offline,
        partial,
        alerts,
        avgUptime,
        isAllWorking,
        hasFaulty
      };
    });
  }, [zones, cameras]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">
            Live Zone-Wise Telemetry & Working Status
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Click any zone to filter timeline view
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {zoneStats.map((z) => {
          const isSelected = selectedZone === z.id;
          const IconComponent = ZONE_ICONS[z.id] || Layers;

          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(isSelected ? 'all' : z.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-900/20 ring-1 ring-blue-500/50'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-[var(--border-color)] hover:border-slate-700'
              }`}
            >
              {/* Header: Icon + Zone Name + Alert badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      z.hasFaulty
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    <IconComponent size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors" title={z.name}>
                      {z.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {z.total} {z.total === 1 ? 'cam' : 'cams'}
                    </span>
                  </div>
                </div>

                {z.alerts > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAlerts(z.id);
                    }}
                    className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono hover:bg-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`${z.alerts} active alert(s) in this zone - click to inspect`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {z.alerts}
                  </button>
                )}
              </div>

              {/* Working breakdown (Blue for working, Red for offline) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Working:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">{z.online}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-300">{z.total}</span>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${z.total > 0 ? (z.online / z.total) * 100 : 0}%` }}
                    title={`${z.online} Working (Blue)`}
                  />
                  {z.offline > 0 && (
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${(z.offline / z.total) * 100}%` }}
                      title={`${z.offline} Offline (Red)`}
                    />
                  )}
                  {z.partial > 0 && (
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${(z.partial / z.total) * 100}%` }}
                      title={`${z.partial} Partial (Amber)`}
                    />
                  )}
                </div>

                {/* Footer: Live status badge + Zone Uptime */}
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      z.isAllWorking
                        ? 'text-blue-400'
                        : z.hasFaulty
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        z.isAllWorking
                          ? 'bg-blue-400'
                          : z.hasFaulty
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                    {z.isAllWorking
                      ? '100% Working'
                      : `${z.offline} Faulty`}
                  </span>
                  <span className="font-mono text-slate-400 font-semibold">
                    {z.avgUptime}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
