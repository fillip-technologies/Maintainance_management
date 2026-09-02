import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { ALL_ZONES } from "./data/zonesData";
import ZonesBanner   from "./components/ZonesBanner";
import ZonesToolbar  from "./components/ZonesToolbar";
import ZoneAccordion from "./components/ZoneAccordion";

/**
 * ZonesPage — Orchestrator
 * Owns state + aggregate calculations. All rendering delegated to child components.
 *
 * zones/
 *   ZonesPage.jsx
 *   data/zonesData.js
 *   components/
 *     ZonesBanner.jsx    ← banner with product health totals
 *     ZonesToolbar.jsx   ← search + filter + expand-all
 *     ZoneAccordion.jsx  ← per-zone expandable accordion
 *     SubzoneCard.jsx    ← simple square card (name + working/not working/maintenance)
 */
export default function ZonesPage() {
  const [searchQuery,  setSearchQuery]  = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandAll,    setExpandAll]    = useState(false);

  // ── Aggregate product health totals (across all zones) ────────
  const totalWorking     = ALL_ZONES.reduce((s, z) => s + z.totalWorking, 0);
  const totalNotWorking  = ALL_ZONES.reduce((s, z) => s + z.totalNotWorking, 0);
  const totalMaintenance = ALL_ZONES.reduce((s, z) => s + z.totalMaintenance, 0);
  const operationalCount = ALL_ZONES.filter((z) => z.status === "operational").length;

  // ── Status filter ──────────────────────────────────────────────
  const visibleZones = ALL_ZONES.filter((z) => {
    if (statusFilter === "operational" && z.status !== "operational") return false;
    if (statusFilter === "maintenance" && z.status !== "maintenance") return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">

      {/* 1. Banner — product health summary */}
      <ZonesBanner
        totalWorking={totalWorking}
        totalNotWorking={totalNotWorking}
        totalMaintenance={totalMaintenance}
        operationalCount={operationalCount}
      />

      {/* 2. Search + filter toolbar */}
      <ZonesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        expandAll={expandAll}
        setExpandAll={setExpandAll}
        totalVisible={visibleZones.length}
      />

      {/* 3. Zone accordions — one per zone, each opens into subzone cards */}
      <div className="flex flex-col gap-3">
        {visibleZones.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MapPin size={26} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No zones match your filter.</p>
          </div>
        ) : (
          visibleZones.map((zone) => (
            <ZoneAccordion
              key={zone.id}
              zone={zone}
              searchQuery={searchQuery}
              forceExpand={expandAll}
            />
          ))
        )}
      </div>
    </div>
  );
}
