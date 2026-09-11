import React, { useState } from 'react';
import {
  LayoutGrid,
  Video,
  Bell,
  ChevronDown,
  ChevronRight,
  Layers,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function ConnectivityTimelineCard({
  zoneGroups = [],
  onOpenReportIssue,
  onOpenAlerts,
  onCreateAlert
}) {
  const [hoveredCell, setHoveredCell] = useState(null); // { productName, code, subzoneName, status, ip, incident, x, y }
  const [collapsedZones, setCollapsedZones] = useState({});

  const toggleZone = (zoneId) => {
    setCollapsedZones((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  };

  const renderSubzoneRow = (subzone, parentName) => {
    const { id, name, products = [] } = subzone;
    const onlineCount = products.filter((p) => p.status === 'online').length;
    const offlineCount = products.filter((p) => p.status === 'offline').length;
    const alertCount = products.filter((p) => p.hasAlert).length;
    const allWorking = products.length > 0 && onlineCount === products.length;

    return (
      <div
        key={id}
        className={`flex flex-col md:flex-row md:items-center px-4 py-3 hover:bg-slate-800/40 transition-colors border-b border-slate-800/50 group gap-3 ${
          offlineCount > 0 ? 'bg-red-950/10' : ''
        }`}
      >
        {/* Left Column: Subzone Info */}
        <div className="w-full md:w-64 shrink-0 flex items-center gap-3 overflow-hidden">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              allWorking
                ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40'
                : 'bg-red-950/40 border-red-800/60 text-red-400 shadow-red-900/30'
            }`}
          >
            <Layers size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors truncate">
              {name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {parentName && (
                <>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                    {parentName}
                  </span>
                  <span className="text-slate-600 text-[9px]">•</span>
                </>
              )}
              <span className="text-[10px] font-mono text-slate-400">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Product Blocks (Green for working, Red for not working) */}
        <div className="flex-1 flex flex-wrap items-center gap-2 py-1">
          {products.map((prod, idx) => {
            const isOnline = prod.status === 'online';
            return (
              <button
                key={prod.id || idx}
                type="button"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredCell({
                    productName: prod.name,
                    rawName: prod.rawName,
                    code: prod.code,
                    subzoneName: `${parentName ? `${parentName} › ` : ''}${name}`,
                    status: prod.status,
                    ip: prod.ip,
                    incident: prod.alertDetails?.message,
                    x: rect.left + rect.width / 2,
                    y: rect.top
                  });
                }}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => {
                  if (!isOnline) {
                    if (onCreateAlert && !prod.hasAlert) {
                      onCreateAlert(prod);
                    } else if (onOpenAlerts) {
                      onOpenAlerts(id);
                    }
                  }
                }}
                className={`min-w-[46px] h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 transform hover:scale-105 select-none ${
                  isOnline
                    ? 'bg-[#22c55e] text-white shadow-xs shadow-emerald-500/30 cursor-default'
                    : 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-xs shadow-red-500/50 animate-pulse cursor-pointer'
                }`}
                title={`${prod.name} - ${isOnline ? 'Active (Working)' : 'Not Active (Offline) - Click to raise alert'}`}
              >
                <Video size={13} className="shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-tight">
                  {prod.code ? prod.code.replace('CAM-', '#') : `#${idx + 1}`}
                </span>
              </button>
            );
          })}

          {products.length === 0 && (
            <span className="text-xs text-slate-500 italic">No products registered in this subzone</span>
          )}
        </div>

        {/* Alert Bell / Action Column */}
        <div className="shrink-0 flex items-center gap-2 pl-2">
          {alertCount > 0 ? (
            <button
              type="button"
              onClick={() => onOpenAlerts && onOpenAlerts(id)}
              className="relative p-1.5 rounded-full text-amber-400 hover:text-amber-300 transition-all cursor-pointer group/bell"
              title={`${alertCount} alert(s) in this subzone - Click to open Zone Alerts`}
            >
              <span className="absolute inset-0 rounded-full bg-amber-500/30 blur-xs animate-ping" />
              <span className="absolute inset-0 rounded-full bg-amber-500/20 blur-sm" />
              <Bell size={18} className="relative z-10 fill-amber-400 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </button>
          ) : offlineCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                const offCam = products.find((p) => p.status === 'offline');
                if (offCam) {
                  onCreateAlert ? onCreateAlert(offCam) : onOpenReportIssue?.(offCam);
                }
              }}
              className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
              title="Raise alert for inactive product"
            >
              <AlertTriangle size={11} />
              Raise Alert
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        {/* Right Column: Subzone Working Ratio Badge */}
        <div className="w-full md:w-36 shrink-0 flex md:flex-col md:items-end justify-between md:justify-center gap-1 pr-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wide ${
              allWorking
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-xs shadow-emerald-900/30'
                : 'bg-red-950/90 text-red-400 border border-red-800/90 shadow-xs shadow-red-900/40 animate-pulse'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${allWorking ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {onlineCount}/{products.length} Working
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {allWorking ? 'All Active' : `${offlineCount} Not Active`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-[#0c1427] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden text-slate-100">
      
      {/* ── CARD HEADER ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1427]">
        
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Zone & Product Connectivity Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live product status across subzones (Green = Working, Red = Not Working)
            </p>
          </div>
        </div>

        {/* Right: Legend (Green = Working, Red = Not Working) */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#22c55e] shadow-xs shadow-emerald-500/30" />
            <span className="text-slate-200">Working Product</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#ef4444] shadow-xs shadow-red-500/30" />
            <span className="text-slate-200">Not Working Product</span>
          </div>
        </div>
      </div>

      {/* ── MAIN ZONES & SUBZONES CONTAINER ──────────────────────────────── */}
      <div className="divide-y divide-slate-800/70">
        {zoneGroups.map((group) => {
          const isCollapsed = !!collapsedZones[group.id];
          const hasIssues = group.totalOffline > 0;

          return (
            <div key={group.id} className="bg-slate-900/10">
              
              {/* Main Zone Partition Header */}
              <div
                className={`w-full flex items-center justify-between px-4 py-3 border-y border-slate-800/80 transition-colors ${
                  hasIssues ? 'bg-slate-900/80 hover:bg-slate-800/80' : 'bg-slate-900/60 hover:bg-slate-800/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleZone(group.id)}
                  className="flex items-center gap-2.5 text-left cursor-pointer group/zbtn flex-1"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} className="text-slate-400 group-hover/zbtn:text-white shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 group-hover/zbtn:text-white shrink-0" />
                  )}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase group-hover/zbtn:text-blue-300">
                      {group.name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 ml-2">
                      ({group.subzones.length} {group.subzones.length === 1 ? 'subzone' : 'subzones'} • {group.totalProducts} cameras)
                    </span>
                  </div>
                </button>

                {/* Main Zone Status Badges */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" />
                    {group.totalOnline} Working
                  </span>
                  {group.totalOffline > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono text-red-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-xs shadow-red-500 animate-pulse" />
                      {group.totalOffline} Not Working
                    </span>
                  )}
                  {group.totalAlerts > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAlerts?.(group.id);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                      title="Open Zone Alerts"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      {group.totalAlerts} Alerts
                    </button>
                  )}
                </div>
              </div>

              {/* Subzone Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-800/40 bg-slate-950/20">
                  {group.subzones.map((subzone) => renderSubzoneRow(subzone, group.name))}
                </div>
              )}
            </div>
          );
        })}

        {zoneGroups.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No zones or subzones match the current filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting "All Facilities".</p>
          </div>
        )}
      </div>

      {/* ── FLOATING TOOLTIP ON PRODUCT HOVER ─────────────────────────────── */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-slate-900/95 border border-slate-700 text-white rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-100 max-w-xs"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            minWidth: '210px'
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-bold text-slate-200 truncate">{hoveredCell.productName}</span>
            <span className="text-[10px] font-mono font-bold text-blue-400 shrink-0">{hoveredCell.code}</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Subzone:</span>
              <span className="text-slate-200 font-medium truncate max-w-[130px]">{hoveredCell.subzoneName}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Product Status:</span>
              <span
                className={`font-bold ${
                  hoveredCell.status === 'online' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {hoveredCell.status === 'online' ? 'Working (Green)' : 'Not Working (Red)'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">IP Address:</span>
              <span className="font-mono text-slate-300">{hoveredCell.ip}</span>
            </div>
          </div>

          {hoveredCell.incident && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 italic leading-tight">
              ⚠️ {hoveredCell.incident}
            </div>
          )}

          <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-blue-400 font-semibold text-center">
            Click product to inspect live stream & specs →
          </div>
        </div>
      )}

    </div>
  );
}
