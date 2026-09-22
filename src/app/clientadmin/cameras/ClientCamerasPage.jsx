import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Search,
  Layers,
  Bell,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllZones } from '../../api/zonesApi';
import { getAllDevices } from '../../api/devicesApi';
import { getIssues, createIssue } from '../../api/issuesApi';
import { getIssueCategories } from '../../api/issueCategoriesApi';
import ConnectivityTimelineCard from './ConnectivityTimelineCard';
import CameraAlertsDrawer from './CameraAlertsDrawer';
import NotificationPanel from './NotificationPanel';

export default function ClientCamerasPage() {
  const { currentUser } = useAuth();
  const clientId = currentUser?.clientId || currentUser?.client_id || currentUser?.client?.id;

  const outletContext = useOutletContext();
  const onOpenRequestModal = outletContext?.onOpenRequestModal;

  const [allZones, setAllZones] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [issueCategories, setIssueCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [selectedHardwareType, setSelectedHardwareType] = useState(null); // null = all categories
  const [selectedZone, setSelectedZone] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'online' | 'offline' | 'alerts'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertFilterZone, setAlertFilterZone] = useState('all');
  const [notificationToast, setNotificationToast] = useState(null);

  // ── Fetch real data from backend APIs ─────────────────────────────────────
  const fetchApiData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const extractList = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.items)) return res.items;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.zones)) return res.zones;
        if (Array.isArray(res.data?.items)) return res.data.items;
        if (Array.isArray(res.data?.zones)) return res.data.zones;
        if (Array.isArray(res.rows)) return res.rows;
        return [];
      };

      const [zonesList, devicesList, issuesRes, categoriesRes] = await Promise.all([
        getAllZones({ clientId }).catch((err) => {
          console.warn('[ClientCamerasPage] Error fetching zones:', err);
          return [];
        }),
        getAllDevices({ limit: 100 }).catch((err) => {
          console.warn('[ClientCamerasPage] Error fetching devices:', err);
          return [];
        }),
        getIssues({ status: 'open,assigned,in_progress,on_hold,reopened', limit: 100 }).catch((err) => {
          console.warn('[ClientCamerasPage] Error fetching issues:', err);
          return { items: [] };
        }),
        getIssueCategories().catch((err) => {
          console.warn('[ClientCamerasPage] Error fetching categories:', err);
          return [];
        }),
      ]);

      const normalizedZones = (zonesList || []).map((z, idx) => ({
        ...z,
        id: z.id || z._id || z.zoneId || `zone-${idx}`,
        name: z.name || z.zoneName || z.title || `Zone ${idx + 1}`,
        parentZoneId: z.parentZoneId || z.parent_zone_id || null,
        description: z.description || z.desc || '',
      }));
      setAllZones(normalizedZones);

      const issuesList = extractList(issuesRes);
      setOpenIssues(issuesList);

      const categoriesList = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.items || []);
      setIssueCategories(categoriesList);

      // Map raw devices to camera items with zone relationships
      const zoneMap = new Map(normalizedZones.map((z) => [z.id, z]));

      const getTopLevelZone = (zoneId) => {
        if (!zoneId) return null;
        let curr = zoneMap.get(zoneId);
        if (!curr) return null;
        const visited = new Set();
        while (curr.parentZoneId && !visited.has(curr.id)) {
          visited.add(curr.id);
          const parent = zoneMap.get(curr.parentZoneId);
          if (!parent) break;
          curr = parent;
        }
        return curr;
      };

      const mappedCameras = (devicesList || []).map((device, idx) => {
        const rootZoneObj = getTopLevelZone(device.zoneId);
        const parentZoneId = rootZoneObj?.id || device.zoneId || null;
        const parentZoneName = rootZoneObj?.name || 'Main Campus';

        // Check if device has an open issue in backend
        const openIssue = issuesList.find((iss) => iss.deviceId === device.id);

        // Active check: device status must be active AND have no active occupying issue
        const isActive = device.status === 'active' && !openIssue;
        const status = isActive ? 'online' : 'offline'; // 'online' = Green, 'offline' = Red

        const hasAlert = !isActive || !!openIssue;

        let alertDetails = null;
        if (openIssue) {
          alertDetails = {
            id: openIssue.id,
            type: openIssue.category?.name || 'Device Defect / Alert',
            severity: openIssue.priority || 'high',
            timestamp: openIssue.createdAt,
            message: openIssue.description || `Active defect on ${device.name}`,
            isBackendIssue: true,
          };
        } else if (!isActive) {
          alertDetails = {
            id: null,
            type: 'Device Inactive / Outage',
            severity: device.status === 'faulty' ? 'critical' : 'high',
            timestamp: device.updatedAt || device.createdAt,
            message: `Device status is "${device.status.replace('_', ' ')}". Hardware telemetry lost in ${parentZoneName}.`,
            isBackendIssue: false,
          };
        }

        const ip = device.customSpec?.ip || `192.168.${(idx % 200) + 10}.${(idx % 240) + 1}`;
        const mac = device.customSpec?.mac || `00:1A:2B:3C:${String((idx % 90) + 10)}:${String((idx % 80) + 10)}`;

        return {
          id: device.id,
          code: device.code || `CAM-${String(idx + 1).padStart(6, '0')}`,
          name: device.name,
          rawName: device.name,
          zoneId: device.zoneId || 'unassigned',
          rootZoneId: parentZoneId,
          parentZoneId,
          parentZoneName,
          zoneName: parentZoneName,
          location: device.location || `${parentZoneName} - Deployed Camera`,
          type: device.productType?.name || device.hardwareType?.name || device.categoryName || 'Unknown',
          hardwareTypeId: device.hardwareTypeId || device.productTypeId || null,
          hardwareTypeName: device.hardwareType?.name || device.productType?.name || device.categoryName || 'Unknown',
          ip,
          mac,
          resolution: device.customSpec?.resolution || '3840x2160 @ 30fps',
          rtsp: device.customSpec?.rtsp || `rtsp://${ip}:554/live/ch0`,
          status, // 'online' (Green) | 'offline' (Red)
          backendStatus: device.status,
          avgUptime: isActive ? '100%' : (device.status === 'under_maintenance' ? '76.4%' : '0%'),
          hasAlert,
          alertDetails,
          rawDevice: device,
        };
      });

      setCameras(mappedCameras);
    } catch (err) {
      console.error('[ClientCamerasPage] Fetch error:', err);
      setApiError(err.message || 'Unable to connect to backend APIs');
      setAllZones([]);
      setCameras([]);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [clientId]);

  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  // ── Create Alert for not-active device ────────────────────────────────────
  const handleCreateAlert = async (camera, customPriority = 'high', customMessage = '') => {
    if (!camera || !camera.id) return;
    try {
      const preferredCategory =
        issueCategories.find(
          (c) =>
            c.name.toLowerCase().includes('camera') ||
            c.name.toLowerCase().includes('offline') ||
            c.name.toLowerCase().includes('signal') ||
            c.name.toLowerCase().includes('fault')
        ) || issueCategories[0];

      if (!preferredCategory?.id) {
        throw new Error('No defect categories configured in backend.');
      }

      const description =
        customMessage ||
        `ALERT: Camera ${camera.name} (${camera.code || camera.id}) in ${camera.zoneName} is NOT ACTIVE. Requires immediate technician inspection.`;

      const created = await createIssue({
        deviceId: camera.id,
        categoryId: preferredCategory.id,
        priority: customPriority || 'high',
        description,
      });

      setNotificationToast({
        title: 'Defect Alert Raised',
        message: `High priority alert logged for ${camera.name} in ${camera.zoneName}. Device moved to maintenance.`,
        zoneId: camera.parentZoneId || camera.zoneId,
      });

      await fetchApiData();
      return created;
    } catch (err) {
      console.error('[ClientCamerasPage] Failed to create alert:', err);
      alert(err.message || 'Failed to create alert in backend');
    }
  };

  // Top-level facilities list for filter dropdown
  const topLevelFacilities = useMemo(() => {
    return allZones.filter((z) => !z.parentZoneId);
  }, [allZones]);

  // Unique hardware types derived from loaded devices (for the category nav)
  const hardwareTypes = useMemo(() => {
    const map = new Map();
    for (const cam of cameras) {
      const key = cam.hardwareTypeId || cam.hardwareTypeName;
      if (key && !map.has(key)) {
        map.set(key, { id: cam.hardwareTypeId, name: cam.hardwareTypeName, count: 0 });
      }
      if (key) map.get(key).count++;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [cameras]);

  // Filtered cameras based on category, zone, status, and search query
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      // 0. Hardware type / category filter
      if (selectedHardwareType) {
        const key = cam.hardwareTypeId || cam.hardwareTypeName;
        if (key !== selectedHardwareType) return false;
      }

      // 1. Zone filter (matches top-level parent zone or direct zone)
      if (selectedZone !== 'all') {
        const rootId = cam.rootZoneId || cam.parentZoneId || cam.zoneId;
        if (rootId !== selectedZone && cam.parentZoneId !== selectedZone && cam.zoneId !== selectedZone) return false;
      }

      // 2. Status filter
      if (statusFilter === 'online' && cam.status !== 'online') return false;
      if (statusFilter === 'offline' && cam.status !== 'offline') return false;
      if (statusFilter === 'alerts' && !cam.hasAlert) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !cam.name.toLowerCase().includes(q) &&
          !cam.code?.toLowerCase().includes(q) &&
          !cam.zoneName.toLowerCase().includes(q) &&
          !cam.ip.toLowerCase().includes(q) &&
          !cam.location?.toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });
  }, [cameras, selectedHardwareType, selectedZone, statusFilter, searchQuery]);

  // ── Build parent zone rows: only parent zones with all descendant cameras aggregated ──
  const zoneRows = useMemo(() => {
    const zoneMap = new Map(allZones.map((z) => [z.id, z]));
    const getRootZoneId = (zId) => {
      if (!zId) return null;
      let curr = zoneMap.get(zId);
      if (!curr) return null;
      const visited = new Set();
      while (curr.parentZoneId && !visited.has(curr.id)) {
        visited.add(curr.id);
        const parent = zoneMap.get(curr.parentZoneId);
        if (!parent) break;
        curr = parent;
      }
      return curr.id;
    };

    const topZones = allZones.filter((z) => !z.parentZoneId);
    const rows = [];

    for (const pZone of topZones) {
      // Aggregate all cameras belonging to this parent zone (direct or through any descendant subzone)
      const cams = filteredCameras.filter((c) => {
        const rootId = c.rootZoneId || getRootZoneId(c.zoneId);
        return rootId === pZone.id || c.parentZoneId === pZone.id || c.zoneId === pZone.id;
      });

      if (cams.length === 0) continue;

      const online = cams.filter((c) => c.status === 'online').length;
      const offline = cams.filter((c) => c.status === 'offline').length;
      const alerts = cams.filter((c) => c.hasAlert).length;

      rows.push({
        id: pZone.id,
        name: pZone.name,
        cameras: cams,
        stats: {
          total: cams.length,
          online,
          offline,
          alerts,
        },
      });
    }

    // Handle any unassigned or orphan cameras
    const assignedIds = new Set(rows.flatMap((r) => r.cameras.map((c) => c.id)));
    const orphanCams = filteredCameras.filter((c) => !assignedIds.has(c.id));
    if (orphanCams.length > 0) {
      rows.push({
        id: 'unassigned',
        name: 'General / Unassigned',
        cameras: orphanCams,
        stats: {
          total: orphanCams.length,
          online: orphanCams.filter((c) => c.status === 'online').length,
          offline: orphanCams.filter((c) => c.status === 'offline').length,
          alerts: orphanCams.filter((c) => c.hasAlert).length,
        },
      });
    }

    return rows;
  }, [allZones, filteredCameras]);

  // Overall KPI statistics
  const stats = useMemo(() => {
    const total = cameras.length;
    const online = cameras.filter((c) => c.status === 'online').length;
    const offline = cameras.filter((c) => c.status === 'offline').length;
    const alerts = cameras.filter((c) => c.hasAlert).length;
    return { total, online, offline, alerts };
  }, [cameras]);

  const handleOpenAlerts = (zoneId = 'all') => {
    setAlertFilterZone(zoneId);
    setIsAlertsOpen(true);
  };

  const handleOpenReportIssue = (camera) => {
    if (camera) {
      handleCreateAlert(camera);
    } else if (onOpenRequestModal) {
      onOpenRequestModal();
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 min-h-full bg-[var(--bg-main)] text-slate-100 relative">
      
      {/* ── CATEGORY NAV ─────────────────────────────────────────────────── */}
      {cameras.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* All pill */}
            <button
              type="button"
              onClick={() => setSelectedHardwareType(null)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                !selectedHardwareType
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900'
                  : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              All Products
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                !selectedHardwareType ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {cameras.length}
              </span>
            </button>

            {/* Divider */}
            <span className="w-px h-5 bg-[var(--border-color)] shrink-0" />

            {/* One pill per hardware type */}
            {hardwareTypes.map((ht) => {
              const isActive = selectedHardwareType === (ht.id || ht.name);
              return (
                <button
                  key={ht.id || ht.name}
                  type="button"
                  onClick={() => setSelectedHardwareType(ht.id || ht.name)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900'
                      : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {ht.name}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ht.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FILTER & SEARCH CONTROLS BAR ─────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3.5 flex flex-col gap-3 shadow-xs">
        
        {/* Top Tier: Search Bar + Facility Dropdown + Zone Alerts Drawer Trigger */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cameras by code (e.g. CAM-000100), name, or zone..."
              className="w-full pl-9 pr-14 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors font-normal"
              style={{
                '--color-text-tertiary': 'rgba(148, 163, 184, 0.45)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Facility Selector & Zone Alerts Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Main Zone / Facility Selector */}
            <div className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 shrink-0">
              <Layers size={15} className="text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-400 shrink-0">Facility:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all" className="bg-[#0b1329] text-white">
                  All Facilities ({topLevelFacilities.length})
                </option>
                {topLevelFacilities.map((z) => (
                  <option key={z.id} value={z.id} className="bg-[#0b1329] text-white">
                    {z.name}
                  </option>
                ))}
              </select>
              {loading ? (
                <Loader2 size={13} className="animate-spin text-blue-400 ml-1 shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={fetchApiData}
                  title="Refresh data from database"
                  className="text-slate-400 hover:text-blue-400 transition-colors ml-1 cursor-pointer"
                >
                  <RefreshCw size={13} />
                </button>
              )}
            </div>

            {/* Zone Alerts Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => handleOpenAlerts('all')}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
              title="Open Zone Telemetry Alert Drawer"
            >
              <div className="relative flex items-center justify-center">
                <Bell size={15} className="fill-amber-400 text-amber-300" />
                {stats.alerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span>Zone Alerts</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                {stats.alerts}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Status Filters & Fleet Status Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[var(--border-color)]/70">
          
          {/* Status Filter Buttons */}
          <div className="flex items-center p-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shrink-0 overflow-x-auto">
            {[
              {
                key: 'all',
                label: 'All',
                count: stats.total,
                dot: null,
                active: 'bg-blue-600/20 border border-blue-500/40',
                countColor: 'text-white',
              },
              {
                key: 'online',
                label: 'Active',
                count: stats.online,
                dot: 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]',
                active: 'bg-emerald-600/15 border border-emerald-500/30',
                countColor: 'text-emerald-400',
              },
              {
                key: 'offline',
                label: 'Not Active',
                count: stats.offline,
                dot: 'bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.7)] animate-pulse',
                active: 'bg-red-600/15 border border-red-500/30',
                countColor: 'text-red-400',
              },
              {
                key: 'alerts',
                label: 'Alerts',
                count: stats.alerts,
                dot: 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.7)]',
                active: 'bg-amber-600/15 border border-amber-500/30',
                countColor: 'text-amber-400',
              },
            ].map(({ key, label, count, dot, active, countColor }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === key ? active : 'hover:bg-slate-800/50'
                }`}
              >
                {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
                <span className="text-[11px] text-slate-500">{label}</span>
                <span className={`text-[13px] font-bold font-mono leading-none ${statusFilter === key ? countColor : 'text-slate-300'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Summary Pill on Right */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="text-slate-500">Fleet Health:</span>
              <span className={`font-bold font-mono ${stats.offline === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.total > 0 ? `${((stats.online / stats.total) * 100).toFixed(1)}%` : '0%'} Active
              </span>
            </div>
            {stats.offline > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/60 border border-red-800/80 text-red-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                {stats.offline} Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT + NOTIFICATION PANEL ───────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* Left: zone cards (takes remaining space) */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* API error */}
          {apiError && !loading && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold">
              <AlertTriangle size={18} className="shrink-0 text-rose-400" />
              <div className="flex-1">
                <span className="font-bold">API Connection Issue: </span>
                {apiError}
              </div>
              <button
                type="button"
                onClick={fetchApiData}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-rose-200 cursor-pointer text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !hasLoaded && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-16 flex flex-col items-center justify-center gap-3 shadow-xs">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <span className="text-xs font-semibold text-slate-400">Loading live facility zones and product telemetry from database…</span>
            </div>
          )}

          {/* Zone cards */}
          {(!hasLoaded || zoneRows.length > 0) && (
            <ConnectivityTimelineCard
              zoneRows={zoneRows}
              onOpenReportIssue={handleOpenReportIssue}
              onOpenAlerts={handleOpenAlerts}
              onCreateAlert={handleCreateAlert}
            />
          )}

          {/* Empty state */}
          {hasLoaded && !loading && !apiError && cameras.length === 0 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Layers size={32} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">No Cameras in Database</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  The API query succeeded, but zero camera products were found for your facility.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchApiData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
              >
                ↻ Refresh
              </button>
            </div>
          )}
        </div>

        {/* Right: notification panel (fixed width, sticky) */}
        <div className="w-72 shrink-0 sticky top-4">
          <NotificationPanel
            cameras={cameras}
            openIssues={openIssues}
            onOpenAlerts={handleOpenAlerts}
            loading={loading && !hasLoaded}
          />
        </div>

      </div>

      {/* ── ZONE-WISE ALERT DRAWER (Side Bar Alert Card) ─────────────────── */}
      <CameraAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        cameras={cameras}
        zones={allZones}
        initialZoneFilter={alertFilterZone}
        onOpenReportIssue={handleOpenReportIssue}
        onCreateAlert={handleCreateAlert}
      />

      {/* ── LIVE NOTIFICATION TOAST ─────────────────────────────────────── */}
      {notificationToast && (
        <div
          onClick={() => handleOpenAlerts(notificationToast.zoneId)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0c1427] border border-amber-500/60 shadow-2xl text-slate-100 flex items-start gap-3 cursor-pointer animate-in slide-in-from-bottom duration-300 max-w-md"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Bell size={18} className="fill-amber-400 text-amber-300 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 uppercase">
                {notificationToast.title}
              </h4>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <p className="text-xs text-slate-200 mt-1">
              {notificationToast.message}
            </p>
            <span className="text-[11px] text-blue-400 font-semibold mt-1 block">
              Click to view Zone Telemetry Alerts →
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNotificationToast(null);
            }}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}
