import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Wrench,
  Package,
  Layers,
  Building2,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ALL_ZONES } from "./data/zonesData";
import SubzoneCard from "./components/SubzoneCard";

/**
 * ZoneDetailPage — Dedicated separate page for a single zone.
 * Shows zone metadata, operational telemetry, and constituent sub-zones.
 */
export default function ZoneDetailPage() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Lookup zone by ID or zoneNumber
  const zoneIndex = ALL_ZONES.findIndex(
    (z) => z.id.toLowerCase() === zoneId?.toLowerCase() || String(z.zoneNumber) === zoneId
  );
  const zone = zoneIndex !== -1 ? ALL_ZONES[zoneIndex] : null;

  if (!zone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Zone Not Found</h2>
        <p className="text-sm text-slate-500">The requested facility zone could not be located.</p>
        <button
          onClick={() => navigate("/clientadmin/zones")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Zones
        </button>
      </div>
    );
  }

  const { color } = zone;
  const isOp = zone.status === "operational";
  const totalProducts = zone.totalWorking + zone.totalNotWorking + (zone.totalMaintenance || 0);
  const progress = Math.round((zone.activeCount / zone.subzones.length) * 100);

  // Prev & Next zone navigation
  const prevZone = zoneIndex > 0 ? ALL_ZONES[zoneIndex - 1] : null;
  const nextZone = zoneIndex < ALL_ZONES.length - 1 ? ALL_ZONES[zoneIndex + 1] : null;

  // Filter sub-zones
  const filteredSubzones = zone.subzones.filter((sz) => {
    if (statusFilter !== "all" && sz.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sz.name.toLowerCase().includes(q) ||
        sz.floor.toLowerCase().includes(q) ||
        sz.incharge.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* ── Breadcrumb & Top Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clientadmin/zones")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={14} /> Back to Zones
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link to="/clientadmin/zones" className="hover:text-slate-600 transition-colors">
              Zones
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">{zone.name}</span>
          </nav>
        </div>

        {/* Prev / Next zone switcher */}
        <div className="flex items-center gap-2">
          {prevZone && (
            <button
              onClick={() => navigate(`/clientadmin/zones/${prevZone.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title={`Previous: ${prevZone.name}`}
            >
              <ChevronLeft size={14} /> {prevZone.name}
            </button>
          )}
          {nextZone && (
            <button
              onClick={() => navigate(`/clientadmin/zones/${nextZone.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title={`Next: ${nextZone.name}`}
            >
              {nextZone.name} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Zone Hero Banner ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4">
          {/* Large Zone Badge */}
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-br ${color.gradient} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}
          >
            <span className="text-[11px] font-black uppercase tracking-widest opacity-80 leading-tight">ZN</span>
            <span className="text-2xl sm:text-3xl font-black leading-tight">{zone.zoneNumber}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {zone.label}
              </h1>
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
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium flex-wrap mt-0.5">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" />
                Coverage: <strong className="text-slate-700 font-semibold">{zone.coverage}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400" />
                Sub-zones: <strong className="text-slate-700 font-semibold">{zone.subzones.length} Total</strong>
              </span>
              <span>•</span>
              <span>
                Zone ID: <strong className="text-slate-700 font-semibold">{zone.id}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Active sub-zones progress card */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Sub-zone Activation</span>
            <span className="font-bold text-slate-900">{zone.activeCount}/{zone.subzones.length} Active</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {progress}% of sub-zones active and online
          </span>
        </div>

        {/* Accent bottom strip */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${color.gradient} absolute bottom-0 left-0`} />
      </div>

      {/* ── Metric Cards Row: Total Products, Working, Not Working, Maintenance ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Total Products</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Package size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-medium text-slate-500">
            Registered facility equipment in this zone
          </div>
        </div>

        {/* Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Working Products</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">
                {zone.totalWorking}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-medium text-emerald-700">
            Online, healthy & operational
          </div>
        </div>

        {/* Not Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Not Working Products</span>
              <span className="text-3xl font-black text-rose-600 tracking-tight">
                {zone.totalNotWorking}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <XCircle size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-medium text-rose-700">
            Reported faults / attention needed
          </div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">In Maintenance</span>
              <span className="text-3xl font-black text-amber-600 tracking-tight">
                {zone.totalMaintenance}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Wrench size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-medium text-amber-700">
            Under routine PM or repair
          </div>
        </div>
      </div>

      {/* ── Sub-zones Directory Section ── */}
      <div className="flex flex-col gap-4">
        {/* Section Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Sub-Zones Directory
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${color.badge}`}>
              {filteredSubzones.length} of {zone.subzones.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5 text-xs font-semibold">
              {["all", "active", "maintenance", "standby"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    statusFilter === tab
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-64 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sub-zone, floor, officer…"
                className="bg-transparent border-none text-xs text-slate-900 w-full outline-hidden placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Zones Cards Grid */}
        {filteredSubzones.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200 py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Layers size={26} />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              No sub-zones match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubzones.map((sz) => (
              <SubzoneCard key={sz.id} sz={sz} color={color} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
