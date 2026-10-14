import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw, AlertTriangle, Check, X, Clock, User, Tag, Wrench, MapPin, Repeat,
  Search, ChevronDown, ChevronUp, LayoutList, LayoutGrid
} from 'lucide-react';
import {
  getReplacementRequests,
  approveReplacementRequest,
  rejectReplacementRequest,
} from '../api/replacementRequestsApi';
import { getAllZones } from '../api/zonesApi';
import { resolveZoneHierarchy } from './zoneResolver';
import { socketClient } from '../api/socketClient';

const STATUS_TABS = [
  { id: 'pending',   label: 'Awaiting Approval' },
  { id: 'approved',  label: 'Approved' },
  { id: 'rejected',  label: 'Rejected' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all',       label: 'All Requests' },
];

const STATUS_LABELS = {
  pending:   'Awaiting Approval',
  approved:  'Approved',
  rejected:  'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  rejected:  'bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  completed: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const pretty = (s) => (s ?? '').replace(/_/g, ' ');

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function parseNotes(notes) {
  if (!notes) return { tag: null, text: '' };
  const match = String(notes).match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    return {
      tag: match[1].replace(/_/g, ' '),
      text: match[2].trim(),
    };
  }
  return { tag: null, text: String(notes).trim() };
}

function replacementLabel(r) {
  if (r.replacementChoice === 'in_stock') {
    return r.spareDeviceName
      ? `Spare: ${r.spareDeviceName}${r.spareDeviceCode ? ` (${r.spareDeviceCode})` : ''}`
      : 'In-stock spare';
  }
  if (r.replacementChoice === 'new_device') return 'New hardware unit';
  if (r.replacementChoice === 'none') return 'No replacement';
  if (r.partDescription) return r.partDescription;
  if (r.spareDeviceName) return r.spareDeviceName;
  if (r.notes) {
    const { text } = parseNotes(r.notes);
    if (text) return text;
  }
  return 'Replacement unit';
}

/**
 * Approval queue for technician equipment-replacement requests.
 * Displays only authentic fields returned from the backend API.
 */
export default function ReplacementRequestsPage() {
  const [items, setItems]             = useState([]);
  const [zones, setZones]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [tab, setTab]                 = useState('pending');
  const [busyId, setBusyId]           = useState(null);
  const [rejecting, setRejecting]     = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'cards'
  const [expandedId, setExpandedId]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [res, zonesList] = await Promise.all([
        getReplacementRequests({ limit: 100 }),
        getAllZones().catch(() => []),
      ]);
      setItems(res?.items ?? []);
      if (Array.isArray(zonesList) && zonesList.length > 0) {
        setZones(zonesList);
      }
    } catch (err) {
      setError(err.message || 'Failed to load replacement requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const offs = ['replacement:requested', 'replacement:approved', 'replacement:rejected', 'replacement:completed']
      .map((evt) => socketClient.on(evt, load));
    return () => offs.forEach((off) => off && off());
  }, [load]);

  const counts = useMemo(() => {
    return items.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const zoneMap = useMemo(() => {
    return new Map((zones || []).map((z) => [z.id || z._id, z]));
  }, [zones]);

  const filteredItems = useMemo(() => {
    const byTab = tab === 'all' ? items : items.filter((r) => r.status === tab);
    if (!searchQuery.trim()) return byTab;

    const q = searchQuery.toLowerCase().trim();
    return byTab.filter((r) => {
      const zoneInfo = resolveZoneHierarchy(r, zoneMap);
      const devName = (r.issue?.device?.name ?? '').toLowerCase();
      const devCode = (r.issue?.device?.code ?? '').toLowerCase();
      const zoneName = (zoneInfo.zoneName ?? '').toLowerCase();
      const subZoneName = (zoneInfo.subZoneName ?? '').toLowerCase();
      const catName = (r.issue?.category?.name ?? '').toLowerCase();
      const reason = (r.reason ?? '').toLowerCase();
      const notes = (r.notes ?? '').toLowerCase();
      const defect = (r.issue?.description ?? '').toLowerCase();
      const tech = (r.requestedBy?.name ?? '').toLowerCase();

      return (
        devName.includes(q) ||
        devCode.includes(q) ||
        zoneName.includes(q) ||
        subZoneName.includes(q) ||
        catName.includes(q) ||
        reason.includes(q) ||
        notes.includes(q) ||
        defect.includes(q) ||
        tech.includes(q)
      );
    });
  }, [items, tab, searchQuery, zoneMap]);

  const handleApprove = async (r) => {
    setBusyId(r.id);
    setError('');
    try {
      await approveReplacementRequest(r.id);
      await load();
      window.dispatchEvent(new CustomEvent('fixly:replacement_updated'));
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    setError('');
    try {
      await rejectReplacementRequest(rejecting.id, rejectNote.trim());
      setRejecting(null);
      setRejectNote('');
      await load();
      window.dispatchEvent(new CustomEvent('fixly:replacement_updated'));
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-200">
      {/* Top Banner / Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30 shrink-0 shadow-2xs">
            <Repeat size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Replacement Requests
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {counts[tab] ?? filteredItems.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and approve equipment replacement requests raised by on-site technicians.
            </p>
          </div>
        </div>

        {/* Header Actions: Refresh & View Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-[var(--bg-card)] p-1 rounded-xl border border-slate-200 dark:border-[var(--border-color)] shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Table View"
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Card View"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-card)] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh requests"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[var(--bg-card)] p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-[var(--border-color)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[var(--bg-main)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    active ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts[t.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, defect, tech…"
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[var(--bg-main)] border border-slate-200 dark:border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* TABLE VIEW (Fits 100% width, zero horizontal scrolling) */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-slate-200/90 dark:border-[var(--border-color)] shadow-xs overflow-hidden">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[var(--bg-main)]/80 border-b border-slate-200 dark:border-[var(--border-color)] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3 w-[19%]">Equipment</th>
                  <th className="py-3 px-2 w-[16%]">Defect / Category</th>
                  <th className="py-3 px-2 w-[10%]">Reason</th>
                  <th className="py-3 px-2 w-[11%]">Replacement</th>
                  <th className="py-3 px-2 w-[11%]">Requested By</th>
                  <th className="py-3 px-2 w-[13%] text-center">Status</th>
                  <th className="py-3 px-3 w-[20%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[var(--border-color)] text-xs font-medium text-slate-700 dark:text-slate-300">
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={18} className="animate-spin text-indigo-500" />
                        <span>Loading replacement requests…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400 text-xs">
                      No {tab === 'all' ? '' : STATUS_LABELS[tab] || tab} replacement requests found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((r) => {
                    const isExpanded = expandedId === r.id;
                    const deviceName = r.issue?.device?.name ?? r.issue?.deviceName ?? r.device?.name ?? 'Unit';
                    const deviceCode = r.issue?.device?.code ?? r.issue?.device?.serialNumber ?? r.device?.code ?? null;
                    const zoneInfo = resolveZoneHierarchy(r, zoneMap);
                    const categoryName = r.issue?.category?.name;
                    const defectDesc = r.issue?.description;
                    const parsed = parseNotes(r.notes);

                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          onClick={() => toggleExpand(r.id)}
                          className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${
                            isExpanded ? 'bg-slate-50/50' : ''
                          }`}
                        >
                          {/* 1. Equipment */}
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                {deviceName}
                                {deviceCode && (
                                  <span className="text-[11px] font-mono text-slate-400 font-normal ml-1">
                                    · {deviceCode}
                                  </span>
                                )}
                              </span>
                              {zoneInfo.zoneName && (
                                <span className="text-[11px] flex items-center gap-1 mt-0.5 truncate text-slate-400">
                                  <MapPin size={10} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {zoneInfo.zoneName}
                                  </span>
                                  {zoneInfo.subZoneName && (
                                    <span className="text-slate-400 font-normal truncate">
                                      · {zoneInfo.subZoneName}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 2. Defect / Category */}
                          <td className="py-3 px-2 min-w-0">
                            <div className="flex flex-col min-w-0">
                              {categoryName && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                                  <Tag size={10} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{categoryName}</span>
                                </span>
                              )}
                              {defectDesc && (
                                <span
                                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5"
                                  title={defectDesc}
                                >
                                  {defectDesc}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Reason */}
                          <td className="py-3 px-2 min-w-0">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                                {pretty(r.reason)}
                              </span>
                              {parsed.text && (
                                <span
                                  className="text-[11px] text-slate-400 truncate mt-0.5"
                                  title={parsed.text}
                                >
                                  {parsed.text}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 4. Replacement */}
                          <td className="py-3 px-2 min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 truncate">
                              <Repeat size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate" title={replacementLabel(r)}>{replacementLabel(r)}</span>
                            </div>
                          </td>

                          {/* 5. Requested By */}
                          <td className="py-3 px-2 min-w-0">
                            <div className="flex flex-col min-w-0">
                              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 truncate">
                                <Wrench size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate">{r.requestedBy?.name ?? 'Technician'}</span>
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                                <Clock size={10} className="shrink-0" />
                                <span className="truncate">{fmtDate(r.createdAt)}</span>
                              </span>
                            </div>
                          </td>

                          {/* 6. Status Pill Badge */}
                          <td className="py-3 px-2 text-center min-w-0">
                            <div className="flex items-center justify-center">
                              <span
                                className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border text-[10.5px] font-semibold capitalize shadow-2xs whitespace-nowrap ${
                                  STATUS_STYLE[r.status] ?? STATUS_STYLE.cancelled
                                }`}
                              >
                                {STATUS_LABELS[r.status] ?? r.status}
                              </span>
                            </div>
                          </td>

                          {/* 7. Quick Actions */}
                          <td className="py-3 px-3 text-right min-w-0">
                            <div className="flex items-center justify-end gap-1.5 shrink-0 flex-nowrap">
                              {r.status === 'pending' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRejecting(r);
                                      setRejectNote('');
                                    }}
                                    disabled={busyId === r.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-rose-500/10 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Reject request"
                                  >
                                    <X size={12} />
                                    <span>Reject</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(r);
                                    }}
                                    disabled={busyId === r.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Approve request"
                                  >
                                    <Check size={12} />
                                    <span>{busyId === r.id ? '…' : 'Approve'}</span>
                                  </button>
                                </>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(r.id);
                                }}
                                className="p-1 rounded-lg border border-slate-200 dark:border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[var(--bg-card)] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                                title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                              >
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Details Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50 dark:bg-[var(--bg-main)]/50">
                            <td colSpan={7} className="p-4 border-t border-slate-100 dark:border-[var(--border-color)]">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* Box 1: Defect & Issue Details */}
                                <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl p-3.5 border border-slate-200/80 dark:border-[var(--border-color)] shadow-2xs flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Defect / Issue Details
                                  </span>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {r.issue?.description || 'No defect description reported.'}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                    {categoryName && (
                                      <span className="flex items-center gap-1">
                                        <Tag size={11} className="text-slate-400" />
                                        {categoryName}
                                      </span>
                                    )}
                                    {zoneInfo.zoneName && (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={11} className="text-indigo-400" />
                                        <span>Zone: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{zoneInfo.zoneName}</strong></span>
                                        {zoneInfo.subZoneName && (
                                          <span className="text-slate-400 font-normal"> · Location: {zoneInfo.subZoneName}</span>
                                        )}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Wrench size={11} className="text-slate-400" />
                                      {r.requestedBy?.name ?? 'Technician'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={11} className="text-slate-400" />
                                      {fmtDate(r.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                {/* Box 2: Reason & Technician Notes */}
                                <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl p-3.5 border border-slate-200/80 dark:border-[var(--border-color)] shadow-2xs flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Reason For Replacement
                                  </span>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                                    {pretty(r.reason)}
                                  </p>
                                  {r.notes && (
                                    <div className="mt-1">
                                      {parsed.tag && (
                                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 mb-1">
                                          {parsed.tag}
                                        </span>
                                      )}
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {parsed.text}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Box 3: Replacement Details & Review History */}
                                <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl p-3.5 border border-slate-200/80 dark:border-[var(--border-color)] shadow-2xs flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Replacement Unit & Resolution
                                  </span>
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                                    <Repeat size={13} className="text-slate-400 shrink-0" />
                                    <span>{replacementLabel(r)}</span>
                                  </div>

                                  {r.reviewedBy && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[var(--border-color)] text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                                      <User size={11} />
                                      <span>
                                        {r.status === 'rejected' ? 'Rejected' : 'Approved'} by{' '}
                                        <strong className="text-slate-700 dark:text-slate-200 font-semibold">{r.reviewedBy.name}</strong> ·{' '}
                                        {fmtDate(r.reviewedAt)}
                                      </span>
                                      {r.reviewNote && (
                                        <span className="text-slate-600 dark:text-slate-300 block w-full mt-0.5 italic">
                                          “{r.reviewNote}”
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW (Alternative layout, refined and user-friendly) */}
      {viewMode === 'cards' && (
        <div className="flex flex-col gap-3.5">
          {loading && items.length === 0 ? (
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-slate-200/90 dark:border-[var(--border-color)] py-14 text-center text-xs text-slate-400">
              <div className="flex flex-col items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-indigo-500" />
                <span>Loading replacement requests…</span>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-slate-200/90 dark:border-[var(--border-color)] py-14 text-center text-xs text-slate-400">
              No {tab === 'all' ? '' : STATUS_LABELS[tab] || tab} replacement requests found.
            </div>
          ) : (
            filteredItems.map((r) => {
              const deviceName = r.issue?.device?.name ?? r.issue?.deviceName ?? r.device?.name ?? 'Unit';
              const deviceCode = r.issue?.device?.code ?? r.issue?.device?.serialNumber ?? r.device?.code ?? null;
              const zoneInfo = resolveZoneHierarchy(r, zoneMap);
              const parsed = parseNotes(r.notes);

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-slate-200/90 dark:border-[var(--border-color)] shadow-xs p-5 flex flex-col gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold capitalize ${
                            STATUS_STYLE[r.status] ?? STATUS_STYLE.cancelled
                          }`}
                        >
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {deviceName}
                          {deviceCode && (
                            <span className="text-xs font-mono font-medium text-slate-400 ml-1.5">
                              · {deviceCode}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                        {r.issue?.category?.name && (
                          <span className="flex items-center gap-1">
                            <Tag size={11} className="text-slate-400" />
                            {r.issue.category.name}
                          </span>
                        )}
                        {zoneInfo.zoneName && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{zoneInfo.zoneName}</span>
                            {zoneInfo.subZoneName && (
                              <span className="text-slate-400 font-normal">· {zoneInfo.subZoneName}</span>
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Wrench size={11} className="text-slate-400" />
                          {r.requestedBy?.name ?? 'Technician'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {fmtDate(r.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejecting(r);
                            setRejectNote('');
                          }}
                          disabled={busyId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(r)}
                          disabled={busyId === r.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <Check size={14} /> {busyId === r.id ? 'Approving…' : 'Approve'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info Cards (Defect, Reason, Replacement) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-[var(--bg-main)] rounded-xl p-3 border border-slate-200/70 dark:border-[var(--border-color)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Defect & Category
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.issue?.category?.name ?? 'General'}
                      </p>
                      {r.issue?.description && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{r.issue.description}</p>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-[var(--bg-main)] rounded-xl p-3 border border-slate-200/70 dark:border-[var(--border-color)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Reason
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{pretty(r.reason)}</p>
                      {parsed.tag && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 mt-1">
                          {parsed.tag}
                        </span>
                      )}
                      {parsed.text && <p className="text-slate-600 dark:text-slate-400 mt-1">{parsed.text}</p>}
                    </div>

                    <div className="bg-slate-50 dark:bg-[var(--bg-main)] rounded-xl p-3 border border-slate-200/70 dark:border-[var(--border-color)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Replacement Unit
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Repeat size={12} className="text-slate-400 shrink-0" />
                        {replacementLabel(r)}
                      </p>
                    </div>
                  </div>

                  {/* Review Info */}
                  {r.reviewedBy && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-[var(--border-color)]">
                      <User size={11} />
                      <span>
                        {r.status === 'rejected' ? 'Rejected' : 'Approved'} by{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{r.reviewedBy.name}</span> ·{' '}
                        {fmtDate(r.reviewedAt)}
                      </span>
                      {r.reviewNote && <span className="text-slate-600 dark:text-slate-300">— “{r.reviewNote}”</span>}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4 border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Reject Replacement Request</h2>
              <p className="text-xs text-slate-500 mt-1">
                {rejecting.issue?.device?.name ?? 'Equipment'}
                {rejecting.issue?.device?.code ? ` (${rejecting.issue.device.code})` : ''} — the technician will be notified of this decision.
              </p>
            </div>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Reason for rejecting (optional)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejecting(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejecting.id}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {busyId === rejecting.id ? 'Rejecting…' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
