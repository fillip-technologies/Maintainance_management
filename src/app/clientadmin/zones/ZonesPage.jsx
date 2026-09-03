import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { ALL_ZONES } from "./data/zonesData";
import ZonesToolbar from "./components/ZonesToolbar";
import ZoneCard from "./components/ZoneCard";

/**
 * ZonesPage — Orchestrator
 * Renders search & status filters, and a 3-card square grid for each zone
 * (showing Total Products, Working, and Not Working).
 * Clicking any card navigates directly to that zone's dedicated details page.
 */
export default function ZonesPage() {
  const [searchQuery,  setSearchQuery]  = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Status & Search filter ─────────────────────────────────────
  const visibleZones = ALL_ZONES.filter((z) => {
    if (statusFilter === "operational" && z.status !== "operational") return false;
    if (statusFilter === "maintenance" && z.status !== "maintenance") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const zoneHit = z.label.toLowerCase().includes(q) || z.wing.toLowerCase().includes(q);
      const subHit = z.subzones.some(
        (sz) =>
          sz.name.toLowerCase().includes(q) ||
          sz.floor.toLowerCase().includes(q) ||
          sz.incharge.toLowerCase().includes(q)
      );
      if (!zoneHit && !subHit) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">

      {/* 1. Search + filter toolbar */}
      <ZonesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalVisible={visibleZones.length}
      />

      {/* 2. Square Zone Cards Grid — 3 cards per row */}
      {visibleZones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 py-20">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MapPin size={26} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">No zones match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {visibleZones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
