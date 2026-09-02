import React, { useState, useEffect } from "react";
import {
  ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Wrench, Layers, Building2, AlertTriangle,
} from "lucide-react";
import SubzoneCard from "./SubzoneCard";

/**
 * ZoneAccordion
 * Expandable card for one zone showing its header stats and, when open,
 * a 2-column grid of SubzoneCard components — one per sub-zone.
 */
export default function ZoneAccordion({ zone, searchQuery, forceExpand }) {
  const [expanded, setExpanded] = useState(false);

  // Sync with the global "Expand All / Collapse All" toggle
  useEffect(() => { setExpanded(forceExpand); }, [forceExpand]);

  // Auto-expand this zone when a subzone matches the search
  useEffect(() => {
    if (!searchQuery) return;
    const q = searchQuery.toLowerCase();
    const hit = zone.subzones.some(
      (sz) =>
        sz.name.toLowerCase().includes(q) ||
        sz.floor.toLowerCase().includes(q) ||
        sz.incharge.toLowerCase().includes(q)
    );
    if (hit) setExpanded(true);
  }, [searchQuery, zone.subzones]);

  // Build the subset to show
  const zoneHit = zone.label.toLowerCase().includes((searchQuery || "").toLowerCase());
  const matchedSubs = zone.subzones.filter(
    (sz) =>
      !searchQuery ||
      zoneHit ||
      sz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sz.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sz.incharge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hide this whole card if nothing matches
  if (searchQuery && !zoneHit && matchedSubs.length === 0) return null;

  const displaySubs = zoneHit ? zone.subzones : matchedSubs;
  const { color } = zone;
  const isOp = zone.status === "operational";
  const progress = Math.round((zone.activeCount / zone.subzones.length) * 100);

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
        expanded
          ? "border-slate-300 shadow-lg ring-1 ring-slate-100"
          : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* ─────────────── Header (always visible) ─────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer group"
      >
        {/* Zone number badge */}
        <div
          className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl bg-gradient-to-br ${color.gradient} flex flex-col items-center justify-center text-white shrink-0 shadow-md`}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-75 leading-tight">ZN</span>
          <span className="text-lg font-extrabold leading-tight">{zone.zoneNumber}</span>
        </div>

        {/* Zone info */}
        <div className="flex-1 min-w-0">
          {/* Name + status badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[15px] font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
              {zone.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOp
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isOp ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
              {isOp ? "Operational" : "Maintenance"}
            </span>
          </div>

          {/* Progress bar + meta row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Active subzones progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                {zone.activeCount}/{zone.subzones.length} active
              </span>
            </div>

            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Layers size={11} className="text-slate-400" />
              {zone.subzones.length} sub-zones
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={11} className="text-emerald-500" />
              {zone.totalWorking} working
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <XCircle size={11} className="text-rose-500" />
              {zone.totalNotWorking} not working
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <Wrench size={11} className="text-amber-500" />
              {zone.totalMaintenance} maintenance
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Building2 size={11} className="text-slate-400" />
              {zone.coverage}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <div
          className={`p-2 rounded-xl shrink-0 transition-all ${
            expanded ? `${color.light} ${color.text}` : "text-slate-400 group-hover:bg-slate-100"
          }`}
        >
          {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
        </div>
      </button>

      {/* ─────────────── Expanded subzone grid ─────────────── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Sub-section header */}
          <div className="flex items-center justify-between py-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500">
                Sub-Zones
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${color.badge}`}>
                {displaySubs.length}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${color.border} ${color.text} ${color.light}`}>
              {zone.id}
            </span>
          </div>

          {/* 3-column square card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displaySubs.map((sz) => (
              <SubzoneCard key={sz.id} sz={sz} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
