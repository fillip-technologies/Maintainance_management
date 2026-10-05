import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Wrench,
  Video,
  CheckCircle2,
  Layers,
  Filter
} from 'lucide-react';

function formatTimestamp(ts) {
  if (!ts) return 'Recent';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recent';
  }
}

function cleanAlertMessage(msg) {
  if (!msg) return 'Camera is offline and requires inspection.';
  if (msg.startsWith('ALERT: Camera') && msg.includes('is NOT ACTIVE')) {
    return 'Camera signal lost. Offline and requires technician inspection.';
  }
  return msg;
}

export default function CameraAlertsDrawer({
  isOpen,
  onClose,
  cameras = [],
  zones = [],
  initialZoneFilter = 'all',
  onOpenReportIssue,
  onCreateAlert
}) {
  const [selectedZone, setSelectedZone] = useState(initialZoneFilter);

  // Extract all cameras with active alerts
  const alertCameras = useMemo(() => {
    return cameras.filter((c) => c.hasAlert && c.alertDetails);
  }, [cameras]);

  // Group alerts by parent zone
  const alertsByZone = useMemo(() => {
    const map = {};
    for (const cam of alertCameras) {
      const zId = cam.parentZoneId || cam.rootZoneId || cam.zoneId;
      if (!map[zId]) {
        const zoneObj = zones.find((z) => z.id === zId) || { name: cam.parentZoneName || cam.zoneName, id: zId };
        const allZoneCams = cameras.filter((c) => (c.parentZoneId || c.rootZoneId || c.zoneId) === zId);
        const onlineCount = allZoneCams.filter((c) => c.status === 'online').length;
        const offlineCount = allZoneCams.filter((c) => c.status === 'offline').length;
        
        map[zId] = {
          zone: zoneObj,
          totalCams: allZoneCams.length,
          onlineCount,
          offlineCount,
          alerts: []
        };
      }
      map[zId].alerts.push(cam);
    }
    return map;
  }, [alertCameras, zones, cameras]);

  if (!isOpen) return null;

  const filteredZoneKeys = Object.keys(alertsByZone).filter((zKey) => {
    if (selectedZone === 'all') return true;
    return zKey === selectedZone;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:w-[480px] h-full bg-[var(--surface-2)] border-l border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── DRAWER HEADER ──────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Bell size={18} className="fill-amber-400 text-amber-800 dark:text-amber-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--ink)] tracking-tight">Zone Telemetry Alerts</h3>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                  {alertCameras.length} Active
                </span>
              </div>
              <p className="text-xs text-[var(--ink-3)] mt-0.5">
                Active incidents requiring technician inspection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            title="Close Alert Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── ZONE FILTER PILLS ───────────────────────────────────────────── */}
        {Object.keys(alertsByZone).length > 1 && (
          <div className="px-5 py-2.5 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
            <span className="text-[var(--ink-3)] font-bold text-[11px] shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} />
              Zone:
            </span>
            <button
              type="button"
              onClick={() => setSelectedZone('all')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                selectedZone === 'all'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink)] bg-[var(--surface-3)]'
              }`}
            >
              All Zones ({alertCameras.length})
            </button>
            {Object.entries(alertsByZone).map(([zId, group]) => (
              <button
                key={zId}
                type="button"
                onClick={() => setSelectedZone(zId)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  selectedZone === zId
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink)] bg-[var(--surface-3)]'
                }`}
              >
                {group.zone.name} ({group.alerts.length})
              </button>
            ))}
          </div>
        )}

        {/* ── DRAWER CONTENT (ZONE-WISE ALERTS) ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          
          {filteredZoneKeys.length === 0 ? (
            <div className="py-16 text-center text-[var(--ink-3)]">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">All Cameras Healthy</h4>
              <p className="text-xs text-[var(--ink-3)] mt-1">No active incidents reported in this zone.</p>
            </div>
          ) : (
            filteredZoneKeys.map((zId) => {
              const group = alertsByZone[zId];
              return (
                <div key={zId} className="space-y-2.5">
                  
                  {/* Clean Zone Partition Header (No redundant "ZONE ZONE" suffix) */}
                  <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-blue-700 dark:text-blue-400" />
                      <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                        {group.zone.name}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-700 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      {group.alerts.length} {group.alerts.length === 1 ? 'Alert' : 'Alerts'}
                    </span>
                  </div>

                  {/* Camera Alert Cards */}
                  <div className="space-y-2.5">
                    {group.alerts.map((cam) => {
                      const alert = cam.alertDetails;
                      const isCritical = alert.severity === 'critical';
                      const isHigh = alert.severity === 'high';

                      return (
                        <div
                          key={cam.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCritical
                              ? 'bg-red-500/10 border-red-500/40'
                              : isHigh
                              ? 'bg-amber-500/10 border-amber-500/40'
                              : 'bg-[var(--surface-2)] border-[var(--line)]'
                          }`}
                        >
                          {/* Alert Card Header: Severity, Alert Type, and Clean Time */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--line)]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                    isCritical
                                      ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40'
                                      : isHigh
                                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40'
                                  }`}
                                >
                                  <AlertTriangle size={11} />
                                  {alert.severity}
                                </span>
                                <h4 className="text-xs font-bold text-[var(--ink)] tracking-tight">
                                  {alert.type}
                                </h4>
                              </div>
                              <span className="text-[10px] text-[var(--ink-3)] font-medium mt-1 block">
                                Triggered: {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/25 animate-pulse">
                              Not Active
                            </span>
                          </div>

                          {/* Clean Concise Alert Message */}
                          <p className="text-xs text-[var(--ink)] mt-2 leading-relaxed">
                            {cleanAlertMessage(alert.message)}
                          </p>

                          {/* Concise Camera Identity (No redundant zone name or fake IP) */}
                          <div className="flex items-center gap-2 text-xs text-[var(--ink-2)] mt-2 pt-2 border-t border-[var(--line)]">
                            <Video size={13} className="text-[var(--ink-3)] shrink-0" />
                            <span className="font-mono font-bold text-[var(--ink)]">{cam.code}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-[var(--ink-2)]">{cam.name}</span>
                          </div>

                          {/* Focused Action Button (Dispatch Tech / Create Alert) */}
                          <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-[var(--line)]">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                if (onCreateAlert && !alert.isBackendIssue) {
                                  onCreateAlert(cam);
                                } else {
                                  onOpenReportIssue?.(cam);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
                            >
                              <Wrench size={13} />
                              {alert.isBackendIssue ? 'Dispatch Tech' : 'Create Alert in DB'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* ── DRAWER FOOTER ──────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[var(--ink)] bg-[var(--surface-3)] hover:bg-[var(--surface-3)] rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
