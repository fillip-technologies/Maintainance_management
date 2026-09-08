import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Package, MapPin, ChevronLeft, Wrench,
  Building2, Users, Car, Cross, Compass, Shield, DoorOpen,
} from 'lucide-react';
import { getZones } from '../api/zonesApi';
import { getDevices } from '../api/devicesApi';
import { getIssues } from '../api/issuesApi';
import { getEquipmentVisual } from '../clientadmin/overview/components/equipmentIcons';

const OPEN_STATUSES = new Set(['open', 'assigned', 'in_progress', 'on_hold', 'reopened']);

// ── Helpers ───────────────────────────────────────────────────────────────

function getZoneIcon(name = '') {
  const n = (name || '').toLowerCase();
  if (n.includes('entry') || n.includes('exit') || n.includes('gate') || n.includes('door')) {
    return DoorOpen;
  }
  if (n.includes('visitor') || n.includes('people') || n.includes('public')) {
    return Users;
  }
  if (n.includes('admin') || n.includes('office') || n.includes('building') || n.includes('block')) {
    return Building2;
  }
  if (n.includes('park') || n.includes('car') || n.includes('vehicle')) {
    return Car;
  }
  if (n.includes('hospital') || n.includes('clinic') || n.includes('health') || n.includes('vet')) {
    return Cross;
  }
  if (n.includes('north') || n.includes('south') || n.includes('east') || n.includes('west')) {
    return Compass;
  }
  if (n.includes('safari') || n.includes('tiger') || n.includes('lion') || n.includes('animal') || n.includes('zoo') || n.includes('bear')) {
    return Shield;
  }
  return MapPin;
}

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

// ── Product card — matching the clean enterprise equipment design ─────────
function ProductCard({ cat, onClick }) {
  const { Component: SvgVisual, isLink } = getEquipmentVisual(cat.name);
  const total = cat.total ?? 0;
  const working = cat.working ?? 0;
  const faulty = cat.faulty ?? 0;
  const maintenance = cat.underMaintenance ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col justify-between bg-white hover:bg-slate-50/60 border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      {/* Top section: Icon on left, Name directly adjacent, Big number on far right */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center">
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <SvgVisual className="w-12 h-12" />
            )}
          </div>

          <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={cat.name}>
            {cat.name}
          </span>
        </div>

        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none shrink-0">
          {total}
        </span>
      </div>

      {/* Bottom section: Online / Offline / Maintenance Status Rows */}
      <div className="mt-5 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 font-medium">{isLink ? 'Active' : 'Online'}</span>
          </div>
          <span className="font-bold text-slate-900">{working}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 font-medium">{isLink ? 'Down' : 'Offline'}</span>
          </div>
          <span className="font-bold text-slate-900">{faulty}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-600 font-medium">Maintenance</span>
          </div>
          <span className="font-bold text-slate-900">{maintenance}</span>
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
      <div className="flex items-center justify-center py-16 gap-3 text-slate-400 bg-[#080e1e] rounded-3xl border border-[#16223e] p-8">
        <Loader2 size={20} className="animate-spin text-blue-400" />
        <span className="text-sm font-medium">Loading zone analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs font-semibold text-rose-300">
        {error}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 text-slate-900">

      {/* ── Products view ─────────────────────────────────────────────────── */}
      {viewMode === 'products' && (
        <>
          {productCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              <Package size={30} className="opacity-40" />
              <p className="text-sm font-medium">No products deployed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productCategories.map((cat, i) => (
                <ProductCard
                  key={cat.categoryId ?? i}
                  cat={cat}
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
          {/* Breadcrumb Navigation — Light enterprise pill style */}
          <nav className="flex items-center gap-2 flex-wrap text-xs bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs">
            {/* Back to products */}
            <button
              onClick={handleBackToProducts}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Products
            </button>

            <ChevronRight size={14} className="text-slate-400 shrink-0" />

            {/* Category label */}
            <button
              onClick={() => { setBreadcrumb([]); setViewMode('zones'); setDevices([]); }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                breadcrumb.length === 0
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {selectedCat?.name ?? 'All'}
            </button>

            {/* Zone breadcrumb */}
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
                <button
                  onClick={() => goToBreadcrumb(i)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    i === breadcrumb.length - 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* ── Zone Table View matching reference Image 2 ──────────────────── */}
          {viewMode === 'zones' && (
            currentZones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <Package size={30} className="opacity-40" />
                <p className="text-sm font-medium">No zones found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200/80 text-xs font-bold text-slate-700">
                        <th className="py-3.5 px-4 w-12 text-slate-400 font-semibold text-center">#</th>
                        <th className="py-3.5 px-4">Zone / Area</th>
                        <th className="py-3.5 px-4 text-center w-28">
                          {selectedCat?.name ?? 'Cameras'}
                        </th>
                        <th className="py-3.5 px-4 text-center w-24">Online</th>
                        <th className="py-3.5 px-4 text-center w-24">Offline</th>
                        <th className="py-3.5 px-4 text-center w-24">Maint.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentZones.map((zone, idx) => {
                        const childCount = (childrenMap[zone.id] ?? []).length;
                        const stats = zoneDeviceStats[zone.id] ?? { working: 0, faulty: 0, underMaintenance: 0 };
                        const totalCount = stats.working + stats.faulty + stats.underMaintenance;
                        const ZoneIcon = getZoneIcon(zone.name);

                        return (
                          <tr
                            key={zone.id}
                            onClick={() => enterZone(zone)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group text-sm"
                          >
                            {/* # */}
                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-500 text-center">
                              {idx + 1}
                            </td>

                            {/* Zone / Area */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  <ZoneIcon size={18} />
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                    {zone.name}
                                  </span>
                                  {childCount > 0 && (
                                    <span className="text-xs text-slate-400 font-normal shrink-0">
                                      ({childCount} sub-zone{childCount !== 1 ? 's' : ''})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Total Equipment Count */}
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {totalCount}
                            </td>

                            {/* Online */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{stats.working}</span>
                              </span>
                            </td>

                            {/* Offline */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stats.faulty > 0 ? 'bg-rose-500' : 'bg-rose-300'}`} />
                                <span>{stats.faulty}</span>
                              </span>
                            </td>

                            {/* Maint. */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stats.underMaintenance > 0 ? 'bg-amber-400' : 'bg-amber-300'}`} />
                                <span>{stats.underMaintenance}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── Device boxes ───────────────────────────────────────────────── */}
          {viewMode === 'devices' && (
            devLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <Loader2 size={20} className="animate-spin text-blue-600" />
                <span className="text-sm font-medium">Loading devices…</span>
              </div>
            ) : devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <Package size={30} className="opacity-40" />
                <p className="text-sm font-medium">No {selectedCat?.name ?? 'devices'} in this zone</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {devices.map((device) => {
                  const isFaulty = device.status === 'faulty' || deviceIssueIds.has(device.id);
                  const isMaint = device.status === 'under_maintenance';
                  const isActive = !isFaulty && !isMaint && (device.status === 'active' || device.status === 'operational');

                  let statusInfo;
                  if (isActive) {
                    statusInfo = {
                      cardBorder: 'border-emerald-200 hover:border-emerald-400',
                      accentLine: 'bg-emerald-500',
                      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
                      Icon: CheckCircle2,
                      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                      dot: 'bg-emerald-500',
                      label: 'Active',
                    };
                  } else if (isMaint) {
                    statusInfo = {
                      cardBorder: 'border-amber-200 hover:border-amber-400',
                      accentLine: 'bg-amber-400',
                      iconBox: 'bg-amber-50 text-amber-700 border border-amber-200',
                      Icon: Wrench,
                      badge: 'bg-amber-50 text-amber-700 border border-amber-200',
                      dot: 'bg-amber-400',
                      label: 'Under Maintenance',
                    };
                  } else if (isFaulty) {
                    statusInfo = {
                      cardBorder: 'border-rose-200 hover:border-rose-400',
                      accentLine: 'bg-rose-500',
                      iconBox: 'bg-rose-50 text-rose-600 border border-rose-200',
                      Icon: AlertCircle,
                      badge: 'bg-rose-50 text-rose-700 border border-rose-200',
                      dot: 'bg-rose-500',
                      label: 'Faulty',
                    };
                  } else {
                    statusInfo = {
                      cardBorder: 'border-slate-200 hover:border-slate-300',
                      accentLine: 'bg-slate-300',
                      iconBox: 'bg-slate-100 text-slate-600 border border-slate-200',
                      Icon: Package,
                      badge: 'bg-slate-100 text-slate-600 border border-slate-200',
                      dot: 'bg-slate-400',
                      label: (device.status || 'Unknown').replace(/_/g, ' '),
                    };
                  }

                  const StatusIcon = statusInfo.Icon;

                  return (
                    <div
                      key={device.id}
                      title={`${device.name} — ${statusInfo.label}`}
                      className={`bg-white hover:bg-slate-50/60 rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-center min-h-[140px] relative overflow-hidden group hover:-translate-y-0.5 ${statusInfo.cardBorder}`}
                    >
                      {/* Top 3px accent indicator line */}
                      <div className={`absolute top-0 left-0 right-0 h-[3px] ${statusInfo.accentLine}`} />

                      {/* Icon */}
                      <div className="flex items-center justify-center pt-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${statusInfo.iconBox} shadow-xs group-hover:scale-105 transition-transform`}>
                          <StatusIcon size={22} />
                        </div>
                      </div>

                      {/* Device Name */}
                      <div className="my-2.5">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-2" title={device.name}>
                          {device.name}
                        </p>
                      </div>

                      {/* Status Badge Pill */}
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.badge}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
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
