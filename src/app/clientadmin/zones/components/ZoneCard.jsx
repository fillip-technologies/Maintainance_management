import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, Package } from "lucide-react";

/**
 * ZoneCard — High-end executive square card representation of a Facility Zone.
 * Displays: Zone badge, Name/Wing, Operational status, Total Products in this zone,
 * and large Working / Not Working counts.
 * Clicking opens the separate zone details page.
 */
export default function ZoneCard({ zone, searchQuery }) {
  const navigate = useNavigate();
  const { color } = zone;
  const isOp = zone.status === "operational";

  const totalProducts = zone.totalWorking + zone.totalNotWorking + (zone.totalMaintenance || 0);

  // Check if search query matches sub-zones inside this zone
  const hasSubMatch = searchQuery && !zone.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
    zone.subzones.some(
      (sz) =>
        sz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sz.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sz.incharge.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleOpen = () => {
    navigate(`/clientadmin/zones/${zone.id}`);
  };

  return (
    <div
      onClick={handleOpen}
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[320px]"
    >
      {/* ── Top Header: ZN Avatar Badge & Status Pill ── */}
      <div className="flex items-start justify-between gap-3">
        {/* Zone Badge */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.gradient} flex flex-col items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">ZN</span>
          <span className="text-xl font-black leading-tight">{zone.zoneNumber}</span>
        </div>

        {/* Status Pill & Match indicator */}
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
              isOp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOp ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {isOp ? "Operational" : "Maintenance"}
          </span>

          {hasSubMatch && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
              Matched in sub-zones
            </span>
          )}
        </div>
      </div>

      {/* ── Zone Name & Wing ── */}
      <div className="mt-3 mb-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight truncate">
          {zone.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5">
          {zone.wing} • {zone.coverage}
        </p>
      </div>

      {/* ── Total Products Banner ── */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 my-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Package size={14} />
          </div>
          <span className="text-xs font-bold text-slate-700">Total Products</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
            {totalProducts}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">units</span>
        </div>
      </div>

      {/* ── Working / Not Working Telemetry Tiles ── */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Working Tile */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50/90 border border-emerald-100 transition-colors">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Working</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight leading-none">
              {zone.totalWorking}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600/70">units</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 mt-1">
            Online & Active
          </span>
        </div>

        {/* Not Working Tile */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-50/90 border border-rose-100 transition-colors">
          <div className="flex items-center gap-1.5 text-rose-700">
            <XCircle size={14} className="text-rose-600 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Not Working</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight leading-none">
              {zone.totalNotWorking}
            </span>
            <span className="text-[11px] font-semibold text-rose-600/70">units</span>
          </div>
          <span className="text-[10px] font-bold text-rose-600 mt-1">
            Requires Action
          </span>
        </div>
      </div>

      {/* ── Footer: Action Row ── */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
          View Zone Details
        </span>
        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-105">
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* ── Color accent bottom strip ── */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color.gradient} absolute bottom-0 left-0`} />
    </div>
  );
}
