import React from "react";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";

const TABS = [
  { id: "all",         label: "All" },
  { id: "operational", label: "Operational" },
  { id: "maintenance", label: "Maintenance" },
];

/**
 * ZonesToolbar
 * Search input + status filter tabs + expand/collapse toggle.
 */
export default function ZonesToolbar({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  expandAll, setExpandAll,
  totalVisible,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search zones or sub-zones…"
          className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Segmented filter */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Showing count */}
        <span className="text-[11px] font-semibold text-slate-400">{totalVisible} zone{totalVisible !== 1 ? "s" : ""}</span>

        {/* Expand all */}
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          {expandAll ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>
    </div>
  );
}
