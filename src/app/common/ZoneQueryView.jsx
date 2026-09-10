import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Package, MapPin, ChevronLeft, Wrench,
  Building2, Users, Car, Cross, Compass, Shield, DoorOpen,
  Camera, Check, X, Maximize2, Minimize2,
} from 'lucide-react';
import { getZones } from '../api/zonesApi';
import { getDevices } from '../api/devicesApi';
import { getIssues } from '../api/issuesApi';
import { getEquipmentVisual } from '../clientadmin/overview/components/equipmentIcons';
import mapImage from '../../assets/map-image.png';

const OPEN_STATUSES = new Set(['open', 'assigned', 'in_progress', 'on_hold', 'reopened']);

// ── 16 Predefined Distinct Blank Map Areas (Enclosures & Open clearings) ─────
const MAP_BLANK_SLOTS = [
  { id: 'elephant', x: 20, y: 20, keywords: ['elephant', 'mammoth'] },
  { id: 'tiger',    x: 78, y: 20, keywords: ['tiger', 'leopard', 'cheetah', 'panther'] },
  { id: 'bear',     x: 49, y: 15, keywords: ['bear', 'polar', 'grizzly'] },
  { id: 'giraffe',  x: 28, y: 36, keywords: ['giraffe', 'ziraffe', 'zebra'] },
  { id: 'bird',     x: 76, y: 36, keywords: ['bird', 'aviary', 'eagle', 'parrot'] },
  { id: 'monkey',   x: 20, y: 58, keywords: ['monkey', 'primate', 'chimp', 'ape', 'baboon', 'gorilla'] },
  { id: 'lion',     x: 74, y: 54, keywords: ['lion'] },
  { id: 'deer',     x: 38, y: 50, keywords: ['deer', 'herbivore', 'antelope', 'safari'] },
  { id: 'aquarium', x: 50, y: 34, keywords: ['aquarium', 'fish', 'marine', 'otter', 'seal'] },
  { id: 'reptile',  x: 62, y: 70, keywords: ['reptile', 'snake', 'croc', 'alligator'] },
  { id: 'nocturnal',x: 24, y: 74, keywords: ['nocturnal', 'bat', 'owl'] },
  { id: 'gate',     x: 49, y: 84, keywords: ['entry', 'exit', 'gate', 'entrance', 'door'] },
  { id: 'admin',    x: 78, y: 84, keywords: ['admin', 'office', 'block', 'hq'] },
  { id: 'parking',  x: 20, y: 86, keywords: ['parking', 'car', 'vehicle'] },
  { id: 'hospital', x: 65, y: 78, keywords: ['hospital', 'vet', 'clinic', 'medical'] },
  { id: 'visitor',  x: 38, y: 78, keywords: ['visitor', 'public', 'center', 'info'] },
];

/**
 * Calculates collision-free positions for all zones across the safari map.
 * Ensures that newly added zones automatically occupy vacant blank areas without overlapping!
 */
function computeZonePositions(zones = []) {
  const positions = {};
  const occupiedSlotIndices = new Set();

  // Helper to check minimum distance (avoid badge collisions)
  const isTooClose = (pos) => {
    return Object.values(positions).some((p) => {
      const dx = Math.abs(p.x - pos.x);
      const dy = Math.abs(p.y - pos.y);
      return dx < 18 && dy < 12; // Badge dimension collision threshold in %
    });
  };

  // Pass 1: Assign zones that match specific keyword categories to their ideal enclosures
  zones.forEach((zone) => {
    const name = (zone?.name || '').toLowerCase();
    const matchedSlotIndex = MAP_BLANK_SLOTS.findIndex(
      (slot, i) => !occupiedSlotIndices.has(i) && slot.keywords.some((kw) => name.includes(kw))
    );

    if (matchedSlotIndex !== -1) {
      const slot = MAP_BLANK_SLOTS[matchedSlotIndex];
      if (!isTooClose(slot)) {
        positions[zone.id] = { x: slot.x, y: slot.y };
        occupiedSlotIndices.add(matchedSlotIndex);
      }
    }
  });

  // Pass 2: Assign any remaining/custom zones to the next nearest vacant blank slot
  zones.forEach((zone, idx) => {
    if (positions[zone.id]) return;

    let foundSlot = null;
    for (let i = 0; i < MAP_BLANK_SLOTS.length; i++) {
      if (!occupiedSlotIndices.has(i)) {
        const slot = MAP_BLANK_SLOTS[i];
        if (!isTooClose(slot)) {
          foundSlot = slot;
          occupiedSlotIndices.add(i);
          break;
        }
      }
    }

    if (foundSlot) {
      positions[zone.id] = { x: foundSlot.x, y: foundSlot.y };
    } else {
      // If all 16 slots are occupied, distribute into a clean open area with safe staggered offset
      const fallbackBase = MAP_BLANK_SLOTS[idx % MAP_BLANK_SLOTS.length];
      const offset = Math.floor(idx / MAP_BLANK_SLOTS.length) * 5;
      positions[zone.id] = {
        x: Math.min(86, Math.max(14, fallbackBase.x + offset)),
        y: Math.min(84, Math.max(16, fallbackBase.y + offset)),
      };
    }
  });

  return positions;
}

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

// ── Product card — matching the clean enterprise equipment design (Dark Theme) ──
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
      className="group flex flex-col justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      {/* Top section: Icon on left, Name directly adjacent, Big number on far right */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center">
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            ) : (
              <SvgVisual className="w-16 h-16 sm:w-20 sm:h-20" />
            )}
          </div>

          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition-colors leading-tight break-words" title={cat.name}>
            {cat.name}
          </span>
        </div>

        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none shrink-0">
          {total}
        </span>
      </div>

      {/* Bottom section: Online / Offline / Maintenance Status Rows */}
      <div className="mt-5 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-400/30" />
            <span className="text-slate-300 font-medium">{isLink ? 'Active' : 'Online'}</span>
          </div>
          <span className="font-bold text-white">{working}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-xs shadow-rose-500/30" />
            <span className="text-slate-300 font-medium">{isLink ? 'Down' : 'Offline'}</span>
          </div>
          <span className="font-bold text-white">{faulty}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-xs shadow-amber-400/30" />
            <span className="text-slate-300 font-medium">Maintenance</span>
          </div>
          <span className="font-bold text-white">{maintenance}</span>
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
  const [selectedZoneId, setSelectedZoneId] = useState('all');
  const [hoveredZoneId, setHoveredZoneId]   = useState(null);
  const [isMapExpanded, setIsMapExpanded]   = useState(false);

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

  const productCategories = buildProductCategories(allDevices);
  const currentKey   = breadcrumb.length ? breadcrumb.at(-1).id : '__root__';
  const currentZones = childrenMap[currentKey] ?? [];

  // Compute collision-free positions across blank areas of the safari map
  const zonePositions = useMemo(() => {
    return computeZonePositions(currentZones);
  }, [currentZones]);

  // Filter devices for selected category
  const filteredDevs = selectedCat
    ? (selectedCat.categoryId
        ? allDevices.filter((d) => d.categoryId === selectedCat.categoryId)
        : allDevices.filter((d) => !d.categoryId))
    : allDevices;

  const totalDevCount   = filteredDevs.length;
  const onlineDevCount  = filteredDevs.filter((d) => d.status === 'active' || d.status === 'operational').length;
  const offlineDevCount = filteredDevs.filter((d) => d.status === 'faulty').length;
  const maintDevCount   = filteredDevs.filter((d) => d.status === 'under_maintenance').length;

  const onlineRate  = totalDevCount > 0 ? Math.round((onlineDevCount / totalDevCount) * 100) : 0;
  const offlineRate = totalDevCount > 0 ? Math.round((offlineDevCount / totalDevCount) * 100) : 0;
  const maintRate   = totalDevCount > 0 ? Math.round((maintDevCount / totalDevCount) * 100) : 0;

// ── Skeleton Loader matching the Safari Map & Zones Dashboard (Dark Theme) ──
function ZoneDashboardSkeleton({ selectedCategoryName = '' }) {
  return (
    <div className="flex flex-col gap-5 text-white animate-in fade-in duration-200">
      {/* 1. Breadcrumb Bar Skeleton */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2 animate-pulse">
        <div className="h-7 w-20 bg-[var(--bg-card-hover)] rounded-xl" />
        <div className="w-3 h-3 bg-slate-700 rounded-full" />
        <div className="h-7 w-24 bg-blue-600/30 border border-blue-500/40 rounded-xl flex items-center justify-center">
          <span className="text-xs font-bold text-blue-400 opacity-80">
            {selectedCategoryName || 'Loading…'}
          </span>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-card-hover)] shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-6 w-14 bg-slate-700 rounded-md" />
                <div className="h-3 w-20 bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full w-2/5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Section Skeleton: Map on Left, All Zones Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Map Skeleton (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-md overflow-hidden flex flex-col animate-pulse">
          {/* Map Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20" />
              <div className="h-4 w-28 bg-slate-700 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-24 bg-[var(--bg-card-hover)] rounded-xl" />
              <div className="h-7 w-7 bg-[var(--bg-card-hover)] rounded-xl" />
            </div>
          </div>

          {/* Map Canvas Skeleton */}
          <div className="relative w-full h-[360px] sm:h-[420px] bg-[var(--bg-main)] flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] shadow-md border border-[var(--border-color)] flex items-center justify-center text-blue-400">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Loading safari map & zones…</span>
          </div>
        </div>

        {/* Right: Table Skeleton (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col gap-3.5 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 bg-slate-700 rounded-md" />
            <div className="h-4 w-14 bg-blue-600/30 rounded" />
          </div>

          {/* Table Skeleton Rows */}
          <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden w-full">
            <div className="bg-[var(--bg-card-hover)] px-3 py-2.5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="h-3 w-4 bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-700 rounded" />
              <div className="h-3 w-10 bg-slate-700 rounded" />
              <div className="h-3 w-10 bg-slate-700 rounded" />
              <div className="h-3 w-10 bg-slate-700 rounded" />
            </div>
            <div className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-3 py-3 flex items-center justify-between">
                  <div className="h-3 w-4 bg-slate-800 rounded" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-800" />
                    <div className="h-3.5 w-24 bg-slate-800 rounded" />
                  </div>
                  <div className="h-3 w-8 bg-slate-800 rounded" />
                  <div className="h-3 w-8 bg-slate-800 rounded" />
                  <div className="h-3 w-8 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  // ── Loading / error ───────────────────────────────────────────────────────

  if (loading) {
    return <ZoneDashboardSkeleton selectedCategoryName={selectedCat?.name || initialCat?.name} />;
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
    <div className="flex flex-col gap-5 text-white">

      {/* ── Products view ─────────────────────────────────────────────────── */}
      {viewMode === 'products' && (
        <>
          {productCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-md">
              <Package size={30} className="opacity-40" />
              <p className="text-sm font-medium text-slate-300">No products deployed yet</p>
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
          {/* Breadcrumb Navigation — Dark enterprise pill style */}
          <nav className="flex items-center gap-2 flex-wrap text-xs bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-2.5 sm:p-3 shadow-md">
            {/* Back to products */}
            <button
              onClick={handleBackToProducts}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-slate-200 bg-[var(--bg-card-hover)] hover:bg-[var(--border-color)] hover:text-white transition-colors cursor-pointer border border-[var(--border-color)]"
            >
              <ChevronLeft size={14} /> Products
            </button>

            <ChevronRight size={14} className="text-slate-500 shrink-0" />

            {/* Category label */}
            <button
              onClick={() => { setBreadcrumb([]); setViewMode('zones'); setDevices([]); }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                breadcrumb.length === 0
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 bg-[var(--bg-card-hover)] hover:bg-[var(--border-color)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              {selectedCat?.name ?? 'All'}
            </button>

            {/* Zone breadcrumb */}
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight size={14} className="text-slate-500 shrink-0" />
                <button
                  onClick={() => goToBreadcrumb(i)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    i === breadcrumb.length - 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 bg-[var(--bg-card-hover)] hover:bg-[var(--border-color)] hover:text-white border border-[var(--border-color)]'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* ── Zoo Safari Map & All Zones View (Matching Image 2) ─────────── */}
          {viewMode === 'zones' && (
            <div className="flex flex-col gap-5">
              {/* ── Top 4 KPI Metric Cards ─────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* 1. Total Cameras / Equipment */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex items-center justify-between group hover:border-[var(--border-hover)] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex items-center justify-center text-slate-300 shrink-0">
                      <Camera size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-white leading-none">
                        {totalDevCount}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 truncate max-w-[100px]">
                        Total {selectedCat?.name ?? 'Cameras'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>

                {/* 2. Online */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-emerald-500/30">
                      <Check size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-white leading-none">
                        {onlineDevCount}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1">
                        Online
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${onlineRate}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">{onlineRate}%</span>
                  </div>
                </div>

                {/* 3. Offline */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs shadow-rose-500/30">
                      <X size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-white leading-none">
                        {offlineDevCount}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1">
                        Offline
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${offlineRate}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-rose-400">{offlineRate}%</span>
                  </div>
                </div>

                {/* 4. Maintenance */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center text-white shrink-0 shadow-xs shadow-amber-400/30">
                      <Wrench size={19} />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-white leading-none">
                        {maintDevCount}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1">
                        Maintenance
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${maintRate}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-amber-400">{maintRate}%</span>
                  </div>
                </div>
              </div>

              {/* ── Main Two-Column Section: Map on Left, All Zones Table on Right ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left: Zoo Safari Map (7 cols when normal, 12 cols when expanded) */}
                <div className={`${isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-7'} bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-md flex flex-col overflow-hidden transition-all duration-300`}>
                  {/* Map Header */}
                  <div className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                        <MapPin size={16} />
                      </div>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Zoo Safari Map
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Zone Selector Dropdown */}
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-hover)] text-xs font-semibold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                      >
                        <option value="all" className="bg-[#0c172c] text-white">All Zones</option>
                        {currentZones.map((z) => (
                          <option key={z.id} value={z.id} className="bg-[#0c172c] text-white">{z.name}</option>
                        ))}
                      </select>

                      {/* Expand / Maximize Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsMapExpanded((prev) => !prev)}
                        className="p-1.5 rounded-xl border border-[var(--border-color)] text-slate-300 hover:text-white hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                        title={isMapExpanded ? 'Collapse Map' : 'Expand Map'}
                      >
                        {isMapExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Map Canvas with Pinned Badges — Fills edge-to-edge without gaps */}
                  <div className="relative w-full overflow-hidden rounded-b-3xl bg-slate-900 select-none">
                    <img
                      src={mapImage}
                      alt="Zoo Safari Aerial Map"
                      className="w-full h-auto object-cover block"
                    />

                    {/* Compass Rose Indicator (Top-Right) */}
                    <div className="absolute top-3.5 right-3.5 z-10 bg-white/90 backdrop-blur-xs px-2 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex flex-col items-center pointer-events-none">
                      <span className="text-[10px] font-black text-slate-700 leading-none">N</span>
                      <Compass size={16} className="text-slate-700 mt-0.5" />
                    </div>

                    {/* Zone Overlay Pinned Badges — Collision-Free Blank Area Placement */}
                    {currentZones.map((zone) => {
                      const coords = zonePositions[zone.id] || { x: 50, y: 50 };
                      const stats = zoneDeviceStats[zone.id] ?? { working: 0, faulty: 0, underMaintenance: 0 };
                      const totalZoneCount = stats.working + stats.faulty + stats.underMaintenance;
                      const ZoneIcon = getZoneIcon(zone.name);
                      const isHighlighted = hoveredZoneId === zone.id || selectedZoneId === zone.id;
                      const isDimmed = selectedZoneId !== 'all' && selectedZoneId !== zone.id;

                      return (
                        <div
                          key={zone.id}
                          style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                          onClick={() => enterZone(zone)}
                          onMouseEnter={() => setHoveredZoneId(zone.id)}
                          onMouseLeave={() => setHoveredZoneId(null)}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer select-none ${
                            isDimmed ? 'opacity-25 pointer-events-none scale-90 z-0' : 'opacity-100'
                          } ${
                            isHighlighted
                              ? 'scale-110 z-30 ring-3 ring-blue-500/60 shadow-2xl'
                              : 'hover:scale-105 z-10 shadow-lg'
                          }`}
                        >
                          <div className="bg-[#0c172c]/95 backdrop-blur-md border border-[var(--border-color)] rounded-2xl px-2.5 py-2 flex items-center gap-2.5 shadow-xl hover:border-blue-400/80">
                            {/* Zone Avatar */}
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden text-slate-200 p-0.5">
                              {zone.logoUrl || zone.imageUrl ? (
                                <img src={zone.logoUrl || zone.imageUrl} alt={zone.name} className="w-full h-full object-contain" />
                              ) : (
                                <ZoneIcon size={18} />
                              )}
                            </div>

                            {/* Zone Details */}
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[130px]" title={zone.name}>
                                {zone.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 mt-0.5">
                                <span className="flex items-center gap-1 font-bold text-slate-200">
                                  <Camera size={11} className="text-slate-400" />
                                  {totalZoneCount}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {stats.working}
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${stats.faulty > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${stats.faulty > 0 ? 'bg-rose-500' : 'bg-slate-700'}`} />
                                  {stats.faulty}
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${stats.underMaintenance > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${stats.underMaintenance > 0 ? 'bg-amber-400' : 'bg-slate-700'}`} />
                                  {stats.underMaintenance}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: All Zones Table (5 cols, or hidden if map expanded) */}
                {!isMapExpanded && (
                  <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col gap-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        All Zones
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedZoneId('all')}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    {/* Table — Clean, with vertical scroll, fixed sticky header */}
                    <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden w-full flex flex-col">
                      <div className="overflow-y-auto max-h-[420px] custom-scrollbar">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[var(--bg-card-hover)] text-slate-300 font-bold border-b border-[var(--border-color)] text-xs sticky top-0 z-10">
                            <tr>
                              <th className="py-2.5 px-3 w-8 text-center text-slate-400 font-semibold bg-[var(--bg-card-hover)]">#</th>
                              <th className="py-2.5 px-3 font-semibold text-slate-300 bg-[var(--bg-card-hover)]">Zone / Area</th>
                              <th className="py-2.5 px-2 text-center w-16 font-semibold text-slate-300 bg-[var(--bg-card-hover)]">Online</th>
                              <th className="py-2.5 px-2 text-center w-16 font-semibold text-slate-300 bg-[var(--bg-card-hover)]">Offline</th>
                              <th className="py-2.5 px-2 text-center w-16 font-semibold text-slate-300 bg-[var(--bg-card-hover)]">Maint.</th>
                            </tr>
                          </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {currentZones.map((zone, idx) => {
                            const stats = zoneDeviceStats[zone.id] ?? { working: 0, faulty: 0, underMaintenance: 0 };
                            const ZoneIcon = getZoneIcon(zone.name);
                            const isSelected = selectedZoneId === zone.id;
                            const isHovered = hoveredZoneId === zone.id;

                            return (
                              <tr
                                key={zone.id}
                                onClick={() => {
                                  setSelectedZoneId(zone.id);
                                  enterZone(zone);
                                }}
                                onMouseEnter={() => setHoveredZoneId(zone.id)}
                                onMouseLeave={() => setHoveredZoneId(null)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected || isHovered
                                    ? 'bg-blue-950/40 font-semibold'
                                    : 'hover:bg-[var(--bg-card-hover)]'
                                }`}
                              >
                                <td className="py-3 px-3 text-slate-400 font-medium text-center">{idx + 1}</td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-6 h-6 rounded-md bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden text-slate-200">
                                      {zone.logoUrl || zone.imageUrl ? (
                                        <img src={zone.logoUrl || zone.imageUrl} alt={zone.name} className="w-full h-full object-contain" />
                                      ) : (
                                        <ZoneIcon size={14} />
                                      )}
                                    </div>
                                    <span className="font-semibold text-white truncate" title={zone.name}>
                                      {zone.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-400/30" />
                                    {stats.working}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-200">
                                    <span className={`w-2 h-2 rounded-full ${stats.faulty > 0 ? 'bg-rose-500' : 'bg-slate-700'} shrink-0 shadow-xs shadow-rose-500/30`} />
                                    {stats.faulty}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="inline-flex items-center justify-center gap-1.5 font-bold text-slate-200">
                                    <span className={`w-2 h-2 rounded-full ${stats.underMaintenance > 0 ? 'bg-amber-400' : 'bg-slate-700'} shrink-0 shadow-xs shadow-amber-400/30`} />
                                    {stats.underMaintenance}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* ── Device boxes ───────────────────────────────────────────────── */}
          {viewMode === 'devices' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setBreadcrumb([]); setViewMode('zones'); setDevices([]); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back to Map
                </button>
              </div>

              {devLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col justify-between h-[130px]">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-slate-800" />
                        <div className="h-4 w-12 bg-slate-800 rounded-full" />
                      </div>
                      <div className="flex flex-col gap-1.5 mt-4">
                        <div className="h-3.5 w-20 bg-slate-700 rounded" />
                        <div className="h-3 w-14 bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : devices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-md">
                  <Package size={30} className="opacity-40" />
                  <p className="text-sm font-medium text-slate-300">No {selectedCat?.name ?? 'devices'} in this zone</p>
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
                        cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
                        accentLine: 'bg-emerald-500',
                        iconBox: 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60',
                        Icon: CheckCircle2,
                        badge: 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60',
                        dot: 'bg-emerald-500',
                        label: 'Active',
                      };
                    } else if (isMaint) {
                      statusInfo = {
                        cardBorder: 'border-amber-500/40 hover:border-amber-400',
                        accentLine: 'bg-amber-400',
                        iconBox: 'bg-amber-950/50 text-amber-400 border border-amber-800/60',
                        Icon: Wrench,
                        badge: 'bg-amber-950/50 text-amber-400 border border-amber-800/60',
                        dot: 'bg-amber-400',
                        label: 'Under Maintenance',
                      };
                    } else if (isFaulty) {
                      statusInfo = {
                        cardBorder: 'border-rose-500/40 hover:border-rose-400',
                        accentLine: 'bg-rose-500',
                        iconBox: 'bg-rose-950/50 text-rose-400 border border-rose-800/60',
                        Icon: AlertCircle,
                        badge: 'bg-rose-950/50 text-rose-400 border border-rose-800/60',
                        dot: 'bg-rose-500',
                        label: 'Faulty',
                      };
                    } else {
                      statusInfo = {
                        cardBorder: 'border-[var(--border-color)] hover:border-[var(--border-hover)]',
                        accentLine: 'bg-slate-600',
                        iconBox: 'bg-[var(--bg-card-hover)] text-slate-300 border border-[var(--border-color)]',
                        Icon: Package,
                        badge: 'bg-[var(--bg-card-hover)] text-slate-300 border border-[var(--border-color)]',
                        dot: 'bg-slate-400',
                        label: (device.status || 'Unknown').replace(/_/g, ' '),
                      };
                    }

                    const StatusIcon = statusInfo.Icon;

                    return (
                      <div
                        key={device.id}
                        title={`${device.name} — ${statusInfo.label}`}
                        className={`bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl p-4 sm:p-5 border shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between text-center min-h-[140px] relative overflow-hidden group hover:-translate-y-0.5 ${statusInfo.cardBorder}`}
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
                          <p className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight line-clamp-2" title={device.name}>
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
              )}
          </div>
        )}
        </>
      )}

    </div>
  );
}
