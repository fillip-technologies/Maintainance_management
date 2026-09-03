import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Wrench,
  Layers,
  Building2,
  AlertTriangle,
  Search
} from "lucide-react";
import SubzoneCard from "./SubzoneCard";

/**
 * ZoneDetailsModal — Full detailed view of a selected zone.
 * Shows zone metadata, operational health breakdown, and all constituent subzones.
 */
export default function ZoneDetailsModal({ zone, isOpen, onClose, searchQuery: initialSearch = "" }) {
  const [localSearch, setLocalSearch] = useState(initialSearch);

  // Sync initial search if passed
  useEffect(() => {
    setLocalSearch(initialSearch || "");
  }, [initialSearch, zone]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !zone) return null;

  const { color } = zone;
  const isOp = zone.status === "operational";
  const progress = Math.round((zone.activeCount / zone.subzones.length) * 100);

  // Filter sub-zones based on local search
  const q = localSearch.trim().toLowerCase();
  const displaySubs = q
    ? zone.subzones.filter(
        (sz) =>
          sz.name.toLowerCase().includes(q) ||
          sz.floor.toLowerCase().includes(q) ||
          sz.incharge.toLowerCase().includes(q)
      )
    : zone.subzones;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Zone Badge */}
            <div
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-gradient-to-br ${color.gradient} flex flex-col items-center justify-center text-white shrink-0 shadow-md`}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 leading-tight">ZN</span>
              <span className="text-base font-extrabold leading-tight">{zone.zoneNumber}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                  {zone.label}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isOp
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isOp ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                  {isOp ? "Operational" : "Maintenance"}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Detailed view of sub-zones, telemetry logs, and equipment operational readiness
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Summary Strip ── */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          {/* Progress & Coverage */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Active Subzones Progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {zone.activeCount}/{zone.subzones.length} active sub-zones ({progress}%)
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 size={13} className="text-slate-400" />
              {zone.coverage}
            </span>
          </div>

          {/* Stat Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{zone.totalWorking} Working</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <XCircle size={13} className="text-rose-600" />
              <span className="text-xs font-bold text-rose-700">{zone.totalNotWorking} Not Working</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <Wrench size={13} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{zone.totalMaintenance} In Servicing</span>
            </div>
          </div>
        </div>

        {/* ── Sub-zones Section Header + Search ── */}
        <div className="px-5 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sub-Zones Breakdown
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
              {displaySubs.length} of {zone.subzones.length}
            </span>
          </div>

          {/* Mini Search within Subzones */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-60 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search sub-zones…"
              className="bg-transparent border-none text-xs text-slate-900 w-full outline-hidden placeholder:text-slate-400"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Sub-zones Grid (Scrollable) ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {displaySubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs font-medium">
              <Layers size={28} className="mb-2 text-slate-300" />
              No sub-zones found matching "{localSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {displaySubs.map((sz) => (
                <SubzoneCard key={sz.id} sz={sz} color={color} />
              ))}
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Facility Zone ID: <span className="font-semibold text-slate-600">{zone.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
