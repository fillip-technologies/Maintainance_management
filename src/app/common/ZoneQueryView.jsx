import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, AlertCircle, CheckCircle2,
  Loader2, Package, Home, Cpu, Wrench, TicketCheck,
} from 'lucide-react';
import { getZones } from '../api/zonesApi';
import { getDevices } from '../api/devicesApi';
import { getIssues } from '../api/issuesApi';

const OPEN_STATUSES = new Set(['open', 'assigned', 'in_progress', 'on_hold', 'reopened']);

// parentZoneId === null  OR  parentZoneId not present in the fetched set
// → treat the zone as a display-root so zone officers (whose accessible
//   zones have parents outside their scope) still see a non-empty top level.
function buildChildrenMap(zones) {
  const inScope = new Set(zones.map((z) => z.id));
  const map = {};
  for (const z of zones) {
    const key =
      z.parentZoneId && inScope.has(z.parentZoneId) ? z.parentZoneId : '__root__';
    if (!map[key]) map[key] = [];
    map[key].push(z);
  }
  return map;
}

function getDescendantIds(zoneId, childrenMap) {
  const ids = [];
  const stack = [zoneId];
  while (stack.length) {
    const id = stack.pop();
    for (const child of childrenMap[id] ?? []) {
      ids.push(child.id);
      stack.push(child.id);
    }
  }
  return ids;
}

// Zone tiles are colored from device STATUS (under_maintenance / faulty) so
// the signal is scope-consistent with getDevices: a zone can only be red if
// the caller can actually see problematic devices in it.
//
// Device boxes (shown when entering a leaf zone) are colored from open ISSUES
// (deviceIssueIds) fetched fresh per-zone, giving an accurate "has a query"
// signal that matches the user's intent.
function computeZoneData(allZones, allDevices, openIssues, childrenMap) {
  // Per-zone device stats (from bootstrap device fetch).
  const zoneDeviceStats = {};
  for (const d of allDevices) {
    if (!d.zoneId) continue;
    const s = zoneDeviceStats[d.zoneId] ?? (zoneDeviceStats[d.zoneId] = { working: 0, bad: 0 });
    if (d.status === 'active') s.working++;
    if (d.status === 'under_maintenance' || d.status === 'faulty') s.bad++;
  }

  // Per-zone open issue counts (direct — from whichever zone the device lives in).
  const zoneIssueCount = {};
  for (const i of openIssues) {
    const zId = i.device?.zone?.id;
    if (zId) zoneIssueCount[zId] = (zoneIssueCount[zId] ?? 0) + 1;
  }

  // Zones that have at least one under_maintenance or faulty device right now.
  const badDeviceZoneIds = new Set(
    allDevices
      .filter((d) => d.status === 'under_maintenance' || d.status === 'faulty')
      .map((d) => d.zoneId)
      .filter(Boolean),
  );

  // Device IDs that have an open issue — used only for device box coloring.
  const deviceIssueIds = new Set(
    openIssues.map((i) => i.device?.id).filter(Boolean),
  );

  // Roll up: a zone is red if it or any descendant in scope has a bad device.
  const zoneFlags = {};
  for (const z of allZones) {
    const descendants = getDescendantIds(z.id, childrenMap);
    zoneFlags[z.id] =
      badDeviceZoneIds.has(z.id) ||
      descendants.some((id) => badDeviceZoneIds.has(id));
  }
  return { zoneFlags, deviceIssueIds, zoneDeviceStats, zoneIssueCount };
}

export default function ZoneQueryView() {
  const [childrenMap, setChildrenMap]         = useState({});
  const [zoneFlags, setZoneFlags]             = useState({});
  const [deviceIssueIds, setDeviceIssueIds]   = useState(new Set());
  const [zoneDeviceStats, setZoneDeviceStats] = useState({});
  const [zoneIssueCount, setZoneIssueCount]   = useState({});
  const [breadcrumb, setBreadcrumb]         = useState([]);   // [{id, name}]
  const [devices, setDevices]         = useState([]);
  const [viewMode, setViewMode]       = useState('zones');
  const [loading, setLoading]         = useState(true);
  const [devLoading, setDevLoading]   = useState(false);
  const [error, setError]             = useState('');

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [zonesRes, devicesRes, issuesRes] = await Promise.all([
        getZones({ limit: 100 }),
        getDevices({ limit: 100 }),          // all in-scope devices — drives zone tile color
        getIssues({ limit: 100 }),           // open issues — drives device box color
      ]);
      const zones   = zonesRes?.items  ?? [];
      const devices = devicesRes?.items ?? [];
      const issues  = (issuesRes?.items ?? []).filter((i) => OPEN_STATUSES.has(i.status));
      const map     = buildChildrenMap(zones);
      const { zoneFlags, deviceIssueIds, zoneDeviceStats, zoneIssueCount } =
        computeZoneData(zones, devices, issues, map);
      setChildrenMap(map);
      setZoneFlags(zoneFlags);
      setDeviceIssueIds(deviceIssueIds);
      setZoneDeviceStats(zoneDeviceStats);
      setZoneIssueCount(zoneIssueCount);
    } catch (err) {
      setError(err.message || 'Failed to load zone data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const currentKey   = breadcrumb.length ? breadcrumb.at(-1).id : '__root__';
  const currentZones = childrenMap[currentKey] ?? [];

  const enterZone = async (zone) => {
    const hasChildren    = (childrenMap[zone.id] ?? []).length > 0;
    const hasOwnDevices  = (zone._count?.devices ?? 0) > 0;
    setBreadcrumb((prev) => [...prev, { id: zone.id, name: zone.name }]);

    // Show devices if: leaf zone OR the zone itself holds devices directly.
    // A zone that has both sub-zones AND its own devices must show devices so
    // the units that caused it to be red are actually visible.
    if (!hasChildren || hasOwnDevices) {
      setViewMode('devices');
      setDevLoading(true);
      setDevices([]);
      try {
        const res = await getDevices({ zoneId: zone.id, limit: 100 });
        setDevices(res?.items ?? []);
      } catch (err) {
        setError(err.message || 'Failed to load devices.');
      } finally {
        setDevLoading(false);
      }
    } else {
      setViewMode('zones');
    }
  };

  const goToBreadcrumb = (index) => {
    setBreadcrumb((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));
    setViewMode('zones');
    setDevices([]);
  };

  // ─── Loading / error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
        <Loader2 size={18} className="animate-spin text-indigo-400" />
        <span className="text-sm">Loading zones…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
        {error}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 flex-wrap text-xs">
        <button
          onClick={() => goToBreadcrumb(-1)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer
            ${breadcrumb.length === 0
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
        >
          <Home size={12} />
          All Zones
        </button>

        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            <button
              onClick={() => goToBreadcrumb(i)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer
                ${i === breadcrumb.length - 1
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* ── Zone tiles ───────────────────────────────────────────────────── */}
      {viewMode === 'zones' && (
        currentZones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
            <Package size={28} className="opacity-40" />
            <p className="text-sm font-medium">No zones in your scope</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentZones.map((zone) => {
              const hasIssues  = zoneFlags[zone.id] ?? false;
              const childCount = (childrenMap[zone.id] ?? []).length;
              const totalDev   = zone._count?.devices ?? 0;
              const stats      = zoneDeviceStats[zone.id] ?? { working: 0, bad: 0 };
              const issueCount = zoneIssueCount[zone.id] ?? 0;

              return (
                <button
                  key={zone.id}
                  onClick={() => enterZone(zone)}
                  className={`group flex flex-col gap-3 p-4 rounded-2xl border-2 text-left w-full
                    transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg
                    ${hasIssues
                      ? 'bg-rose-100 border-rose-300 hover:border-rose-500 hover:shadow-rose-200/60'
                      : 'bg-emerald-100 border-emerald-300 hover:border-emerald-500 hover:shadow-emerald-200/60'}`}
                >
                  {/* ── Header ─────────────────────────────────────────── */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                        ${hasIssues ? 'bg-rose-200' : 'bg-emerald-200'}`}>
                        {hasIssues
                          ? <AlertCircle  size={17} className="text-rose-700"    />
                          : <CheckCircle2 size={17} className="text-emerald-700" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-extrabold truncate leading-tight
                          ${hasIssues ? 'text-rose-950' : 'text-emerald-950'}`}>
                          {zone.name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className={`shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-0.5
                        ${hasIssues ? 'text-rose-500' : 'text-emerald-500'}`}
                    />
                  </div>

                  {/* ── Stats row ──────────────────────────────────────── */}
                  <div className={`grid grid-cols-3 gap-2 rounded-xl p-2.5
                    ${hasIssues ? 'bg-rose-200/70' : 'bg-emerald-200/70'}`}>

                    {/* Total devices */}
                    <div className="flex flex-col items-center gap-0.5">
                      <Cpu size={12} className={hasIssues ? 'text-rose-700' : 'text-emerald-700'} />
                      <span className={`text-sm font-black leading-none ${hasIssues ? 'text-rose-950' : 'text-emerald-950'}`}>
                        {totalDev}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${hasIssues ? 'text-rose-700' : 'text-emerald-700'}`}>
                        Total
                      </span>
                    </div>

                    {/* Working */}
                    <div className="flex flex-col items-center gap-0.5">
                      <CheckCircle2 size={12} className={hasIssues ? 'text-rose-600' : 'text-emerald-600'} />
                      <span className={`text-sm font-black leading-none ${hasIssues ? 'text-rose-950' : 'text-emerald-950'}`}>
                        {stats.working}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${hasIssues ? 'text-rose-700' : 'text-emerald-700'}`}>
                        Working
                      </span>
                    </div>

                    {/* Issues */}
                    <div className="flex flex-col items-center gap-0.5">
                      <TicketCheck size={12} className={hasIssues ? 'text-rose-700' : 'text-emerald-700'} />
                      <span className={`text-sm font-black leading-none ${hasIssues ? 'text-rose-950' : 'text-emerald-950'}`}>
                        {issueCount}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${hasIssues ? 'text-rose-700' : 'text-emerald-700'}`}>
                        Issues
                      </span>
                    </div>
                  </div>

                  {/* ── Footer line ────────────────────────────────────── */}
                  <p className={`text-[11px] font-semibold leading-none
                    ${hasIssues ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {hasIssues
                      ? `${stats.bad} unit${stats.bad !== 1 ? 's' : ''} under maintenance`
                      : 'All units operational'}
                    {childCount > 0 && ` · ${childCount} sub-zone${childCount !== 1 ? 's' : ''}`}
                  </p>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* ── Device boxes ─────────────────────────────────────────────────── */}
      {viewMode === 'devices' && (
        devLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
            <Loader2 size={18} className="animate-spin text-indigo-400" />
            <span className="text-sm">Loading devices…</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
            <Package size={28} className="opacity-40" />
            <p className="text-sm font-medium">No devices in this zone</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {devices.map((device) => {
              const isBad  = deviceIssueIds.has(device.id);
              const isGood = !isBad && device.status === 'active';
              return (
                <div
                  key={device.id}
                  title={`${device.name} — ${device.status.replace(/_/g, ' ')}`}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-center min-h-[110px]
                    ${isBad
                      ? 'bg-rose-100    border-rose-300    text-rose-900'
                      : isGood
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100   border-slate-300   text-slate-600'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                    ${isBad ? 'bg-rose-200' : isGood ? 'bg-emerald-200' : 'bg-slate-200'}`}>
                    {isBad
                      ? <AlertCircle  size={18} className="text-rose-700"    />
                      : isGood
                      ? <CheckCircle2 size={18} className="text-emerald-700" />
                      : <Package      size={18} className="text-slate-500"   />}
                  </div>

                  <p className="text-[11px] font-bold leading-tight line-clamp-2">
                    {device.name}
                  </p>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                    ${isBad
                      ? 'bg-rose-200    text-rose-800'
                      : isGood
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-slate-200   text-slate-600'}`}>
                    {device.status.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
}
