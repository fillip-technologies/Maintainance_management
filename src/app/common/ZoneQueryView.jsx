import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Package, MapPin, ChevronLeft,
  Camera, Monitor, Network, Router, Flame, Wind, Zap, Speaker, ShieldCheck, Cpu,
} from 'lucide-react';
import { getZones } from '../api/zonesApi';
import { getDevices } from '../api/devicesApi';
import { getIssues } from '../api/issuesApi';

const OPEN_STATUSES = new Set(['open', 'assigned', 'in_progress', 'on_hold', 'reopened']);

const PALETTES = [
  { grad: 'from-indigo-500 to-sky-400',    light: 'bg-indigo-50',   border: 'border-indigo-100',  text: 'text-indigo-600'   },
  { grad: 'from-violet-500 to-purple-400', light: 'bg-violet-50',   border: 'border-violet-100',  text: 'text-violet-600'   },
  { grad: 'from-emerald-500 to-teal-400',  light: 'bg-emerald-50',  border: 'border-emerald-100', text: 'text-emerald-600'  },
  { grad: 'from-rose-500 to-pink-400',     light: 'bg-rose-50',     border: 'border-rose-100',    text: 'text-rose-600'     },
  { grad: 'from-amber-500 to-orange-400',  light: 'bg-amber-50',    border: 'border-amber-100',   text: 'text-amber-600'    },
  { grad: 'from-cyan-500 to-blue-400',     light: 'bg-cyan-50',     border: 'border-cyan-100',    text: 'text-cyan-600'     },
];

// ── Helpers ───────────────────────────────────────────────────────────────

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

function computeZoneData(allZones, filteredDevices, openIssues, childrenMap) {
  const zoneDeviceStats = {};
  for (const d of filteredDevices) {
    if (!d.zoneId) continue;
    const s = zoneDeviceStats[d.zoneId] ?? (zoneDeviceStats[d.zoneId] = { working: 0, faulty: 0, underMaintenance: 0 });
    if (d.status === 'active')                s.working++;
    else if (d.status === 'faulty')           s.faulty++;
    else if (d.status === 'under_maintenance') s.underMaintenance++;
  }

  const zoneIssueDevices = {};
  for (const i of openIssues) {
    const zId = i.device?.zone?.id;
    const dId = i.device?.id;
    if (zId && dId) {
      if (!zoneIssueDevices[zId]) zoneIssueDevices[zId] = new Set();
      zoneIssueDevices[zId].add(dId);
    }
  }
  const zoneIssueCount = Object.fromEntries(
    Object.entries(zoneIssueDevices).map(([zId, set]) => [zId, set.size]),
  );

  const deviceIssueIds = new Set(openIssues.map((i) => i.device?.id).filter(Boolean));

  // zoneFlags kept for backward compat (used nowhere in the new design but kept for safety)
  const badDeviceZoneIds = new Set(
    filteredDevices
      .filter((d) => d.status === 'under_maintenance' || d.status === 'faulty')
      .map((d) => d.zoneId).filter(Boolean),
  );
  const zoneFlags = {};
  for (const z of allZones) {
    const descendants = getDescendantIds(z.id, childrenMap);
    zoneFlags[z.id] = badDeviceZoneIds.has(z.id) || descendants.some((id) => badDeviceZoneIds.has(id));
  }
  return { zoneFlags, deviceIssueIds, zoneDeviceStats, zoneIssueCount };
}

/** Map category name keywords to a Lucide icon component. */
function categoryIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('camera') || n.includes('cctv'))            return Camera;
  if (n.includes('nvr') || n.includes('dvr') || n.includes('recorder')) return Monitor;
  if (n.includes('switch') || n.includes('network'))         return Network;
  if (n.includes('router'))                                   return Router;
  if (n.includes('fire') || n.includes('alarm'))             return Flame;
  if (n.includes('hvac') || n.includes('air') || n.includes('ac')) return Wind;
  if (n.includes('ups') || n.includes('power'))              return Zap;
  if (n.includes('speaker') || n.includes('pa ') || n.includes('audio')) return Speaker;
  if (n.includes('access') || n.includes('door'))            return ShieldCheck;
  if (n.includes('sensor'))                                   return Cpu;
  return Package;
}

/** Group all fetched devices into product category summary cards. */
function buildProductCategories(allDevices) {
  const catMap = {};
  for (const d of allDevices) {
    const catId   = d.categoryId ?? '__none__';
    const catName = d.category?.name ?? d.categoryName ?? 'Uncategorized';
    if (!catMap[catId]) {
      catMap[catId] = {
        categoryId: d.categoryId ?? null,
        name: catName,
        imageUrl: d.category?.imageUrl ?? null,
        total: 0, working: 0, faulty: 0, underMaintenance: 0,
      };
    }
    catMap[catId].total += 1;
    if (d.status === 'active')                catMap[catId].working          += 1;
    else if (d.status === 'faulty')           catMap[catId].faulty           += 1;
    else if (d.status === 'under_maintenance') catMap[catId].underMaintenance += 1;
  }
  return Object.values(catMap).sort((a, b) => b.total - a.total);
}

// ── Product card — matches the reference dashboard style ─────────────────
function ProductCard({ cat, index, onClick }) {
  const p = PALETTES[index % PALETTES.length];
  const Icon = categoryIcon(cat.name);
  const hasAlert = (cat.faulty + cat.underMaintenance) > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left w-full focus:outline-none"
    >
      {/* Coloured circle — logo image if available, otherwise Lucide icon */}
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200 overflow-hidden`}>
        {cat.imageUrl
          ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-full" />
          : <Icon size={26} className="text-white" />}
      </div>

      {/* Total + name */}
      <div className="flex-1 min-w-0">
        <p className="text-3xl font-black text-slate-900 leading-none">{cat.total}</p>
        <p className="text-sm font-semibold text-slate-500 mt-1 truncate">{cat.name}</p>
      </div>

      {/* Status dot rows */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block" />
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </span>
          <span className="text-sm font-black text-emerald-700 w-6 leading-none">{cat.working}</span>
          <span className="text-xs font-semibold text-slate-500">Online</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.faulty > 0 ? 'bg-rose-500' : 'bg-rose-200'}`} />
          <span className={`text-sm font-black w-6 leading-none ${cat.faulty > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{cat.faulty}</span>
          <span className="text-xs font-semibold text-slate-500">Offline</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.underMaintenance > 0 ? 'bg-amber-400' : 'bg-amber-200'}`} />
          <span className={`text-sm font-black w-6 leading-none ${cat.underMaintenance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{cat.underMaintenance}</span>
          <span className="text-xs font-semibold text-slate-500">Maintenance</span>
        </div>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ZoneQueryView({ clientId, initialCat } = {}) {
  // Raw fetched data
  const [allZones, setAllZones]     = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});

  // Computed from (possibly filtered) devices
  const [zoneFlags, setZoneFlags]           = useState({});
  const [deviceIssueIds, setDeviceIssueIds] = useState(new Set());
  const [zoneDeviceStats, setZoneDeviceStats] = useState({});
  const [zoneIssueCount, setZoneIssueCount] = useState({});

  // View state — if a category was passed from outside, start in zone drill-down
  const [viewMode, setViewMode]         = useState(initialCat ? 'zones' : 'products');
  const [selectedCat, setSelectedCat]   = useState(initialCat ?? null);
  const [breadcrumb, setBreadcrumb]     = useState([]);
  const [devices, setDevices]           = useState([]);

  const [loading, setLoading]     = useState(true);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError]         = useState('');

  const bootstrap = useCallback(async () => {
    setBreadcrumb([]);
    setViewMode(initialCat ? 'zones' : 'products');
    setSelectedCat(initialCat ?? null);
    setDevices([]);
    setLoading(true);
    setError('');
    try {
      const [zonesRes, devicesRes, issuesRes] = await Promise.all([
        getZones({ limit: 100, ...(clientId ? { clientId } : {}) }),
        getDevices({ limit: 100 }),
        getIssues({ limit: 100 }),
      ]);
      const zones   = zonesRes?.items  ?? [];
      const devs    = devicesRes?.items ?? [];
      const issues  = (issuesRes?.items ?? []).filter((i) => OPEN_STATUSES.has(i.status));
      const map     = buildChildrenMap(zones);
      setAllZones(zones);
      setAllDevices(devs);
      setOpenIssues(issues);
      setChildrenMap(map);
      // If a category was pre-selected (from dashboard click), filter immediately
      const filteredDevs = initialCat
        ? (initialCat.categoryId
            ? devs.filter((d) => d.categoryId === initialCat.categoryId)
            : devs.filter((d) => !d.categoryId))
        : devs;
      const computed = computeZoneData(zones, filteredDevs, issues, map);
      setZoneFlags(computed.zoneFlags);
      setDeviceIssueIds(computed.deviceIssueIds);
      setZoneDeviceStats(computed.zoneDeviceStats);
      setZoneIssueCount(computed.zoneIssueCount);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { bootstrap(); }, [bootstrap, clientId]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectCategory = (cat) => {
    const filtered = cat.categoryId
      ? allDevices.filter((d) => d.categoryId === cat.categoryId)
      : allDevices.filter((d) => !d.categoryId);
    const computed = computeZoneData(allZones, filtered, openIssues, childrenMap);
    setZoneFlags(computed.zoneFlags);
    setDeviceIssueIds(computed.deviceIssueIds);
    setZoneDeviceStats(computed.zoneDeviceStats);
    setZoneIssueCount(computed.zoneIssueCount);
    setSelectedCat(cat);
    setBreadcrumb([]);
    setViewMode('zones');
  };

  const handleBackToProducts = () => {
    setSelectedCat(null);
    setBreadcrumb([]);
    setViewMode('products');
    setDevices([]);
  };

  const enterZone = async (zone) => {
    const hasChildren   = (childrenMap[zone.id] ?? []).length > 0;
    const hasOwnDevices = (zone._count?.devices ?? 0) > 0;
    setBreadcrumb((prev) => [...prev, { id: zone.id, name: zone.name }]);

    if (!hasChildren || hasOwnDevices) {
      setViewMode('devices');
      setDevLoading(true);
      setDevices([]);
      try {
        const res = await getDevices({ zoneId: zone.id, limit: 100 });
        const all = res?.items ?? [];
        // Show only the selected category's devices so the drill-down is consistent
        const filtered = selectedCat
          ? selectedCat.categoryId
            ? all.filter((d) => d.categoryId === selectedCat.categoryId)
            : all.filter((d) => !d.categoryId)
          : all;
        setDevices(filtered);
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const productCategories = buildProductCategories(allDevices);
  const currentKey   = breadcrumb.length ? breadcrumb.at(-1).id : '__root__';
  const currentZones = childrenMap[currentKey] ?? [];

  // ── Loading / error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
        <Loader2 size={18} className="animate-spin text-indigo-400" />
        <span className="text-sm">Loading…</span>
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* ── Products view ─────────────────────────────────────────────────── */}
      {viewMode === 'products' && (
        <>
          {productCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
              <Package size={28} className="opacity-40" />
              <p className="text-sm font-medium">No products deployed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productCategories.map((cat, i) => (
                <ProductCard
                  key={cat.categoryId ?? i}
                  cat={cat}
                  index={i}
                  onClick={() => handleSelectCategory(cat)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Zones / devices view ──────────────────────────────────────────── */}
      {(viewMode === 'zones' || viewMode === 'devices') && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 flex-wrap text-xs">
            {/* Back to products */}
            <button
              onClick={handleBackToProducts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft size={12} /> Products
            </button>

            <ChevronRight size={12} className="text-slate-300 shrink-0" />

            {/* Category label */}
            <button
              onClick={() => { setBreadcrumb([]); setViewMode('zones'); setDevices([]); }}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                breadcrumb.length === 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              {selectedCat?.name ?? 'All'}
            </button>

            {/* Zone breadcrumb */}
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight size={12} className="text-slate-300 shrink-0" />
                <button
                  onClick={() => goToBreadcrumb(i)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    i === breadcrumb.length - 1
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* ── Zone tiles ─────────────────────────────────────────────────── */}
          {viewMode === 'zones' && (
            currentZones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
                <Package size={28} className="opacity-40" />
                <p className="text-sm font-medium">No zones found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentZones.map((zone) => {
                  const childCount = (childrenMap[zone.id] ?? []).length;
                  const stats = zoneDeviceStats[zone.id] ?? { working: 0, faulty: 0, underMaintenance: 0 };
                  const hasOffline = stats.faulty > 0;
                  const hasMaint   = stats.underMaintenance > 0;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => enterZone(zone)}
                      className="group flex items-center gap-4 bg-white border border-dashed border-slate-300 rounded-2xl px-5 py-4 text-left w-full hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none"
                    >
                      {/* Zone icon */}
                      <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
                        <MapPin size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-700 truncate transition-colors leading-tight">
                          {zone.name}
                        </p>
                        {childCount > 0 && (
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {childCount} sub-zone{childCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Dot status rows — same convention as product cards */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="relative flex shrink-0">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                          </span>
                          <span className="text-xs font-black text-emerald-700 w-5 leading-none">{stats.working}</span>
                          <span className="text-[11px] font-medium text-slate-400">Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${hasOffline ? 'bg-rose-500' : 'bg-rose-200'}`} />
                          <span className={`text-xs font-black w-5 leading-none ${hasOffline ? 'text-rose-600' : 'text-slate-400'}`}>{stats.faulty}</span>
                          <span className="text-[11px] font-medium text-slate-400">Offline</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${hasMaint ? 'bg-amber-400' : 'bg-amber-200'}`} />
                          <span className={`text-xs font-black w-5 leading-none ${hasMaint ? 'text-amber-600' : 'text-slate-400'}`}>{stats.underMaintenance}</span>
                          <span className="text-[11px] font-medium text-slate-400">Maint.</span>
                        </div>
                      </div>

                      <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* ── Device boxes ───────────────────────────────────────────────── */}
          {viewMode === 'devices' && (
            devLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                <Loader2 size={18} className="animate-spin text-indigo-400" />
                <span className="text-sm">Loading devices…</span>
              </div>
            ) : devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
                <Package size={28} className="opacity-40" />
                <p className="text-sm font-medium">No {selectedCat?.name ?? 'devices'} in this zone</p>
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
        </>
      )}

    </div>
  );
}
