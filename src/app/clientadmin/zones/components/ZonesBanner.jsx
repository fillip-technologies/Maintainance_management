import React from "react";
import { MapPin, CheckCircle2, XCircle, Wrench, Activity, Grid3x3 } from "lucide-react";
import { ALL_ZONES } from "../data/zonesData";

/**
 * ZonesBanner
 * Dark gradient hero banner — shows zones count + product health summary.
 */
export default function ZonesBanner({ totalWorking, totalNotWorking, totalMaintenance, operationalCount }) {
  const stats = [
    { label: "Zones",       value: ALL_ZONES.length,  Icon: Grid3x3,    iconCls: "text-indigo-300"  },
    { label: "Working",     value: totalWorking,      Icon: CheckCircle2, iconCls: "text-emerald-300" },
    { label: "Not Working", value: totalNotWorking,   Icon: XCircle,    iconCls: "text-rose-300"    },
    { label: "Maintenance", value: totalMaintenance,  Icon: Wrench,     iconCls: "text-amber-300"   },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 w-60 h-60 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <MapPin size={12} /> Zone Management
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Activity size={12} /> {operationalCount}/{ALL_ZONES.length} Operational
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
          Facility Zone Overview
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mb-6">
          10 zones · 10 sub-zones each — monitor product health across every area of your facility.
        </p>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, Icon, iconCls }) => (
            <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={17} className={iconCls} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white leading-tight">{value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
