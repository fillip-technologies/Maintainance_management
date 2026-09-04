import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Boxes, CheckCircle2, AlertTriangle, Search, Calendar, X,
  Clock, MapPin, RefreshCw, ClipboardList, Package, Wrench,
  XCircle, CircleDot, CheckCheck, Loader2, Wifi, WifiOff,
  History, ChevronRight, Package2, Trash2
} from 'lucide-react';
import { getDailyLogs } from '../../api/dailyLogsApi';
import { getZones } from '../../api/zonesApi';
import { getIssues, deleteIssue } from '../../api/issuesApi';
import { getDevices } from '../../api/devicesApi';
import { socketClient } from '../../api/socketClient';
import { useAuth } from '../../context/AuthContext';

// ── helpers ───────────────────────────────────────────────────────────────
function fmt(isoStr, timeOnly = false) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (timeOnly) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return isoStr; }
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const LOG_META = {
  working:           { label: 'Working',       dot: 'bg-emerald-500 animate-pulse', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', row: '' },
  needs_attention:   { label: 'Needs Attention', dot: 'bg-amber-500',              badge: 'bg-amber-50 text-amber-700 border-amber-200',       row: 'bg-amber-50/30' },
  not_working:       { label: 'Not Working',   dot: 'bg-rose-500',                 badge: 'bg-rose-50 text-rose-700 border-rose-200',           row: 'bg-rose-50/30' },
  under_maintenance: { label: 'Maintenance',   dot: 'bg-sky-500',                  badge: 'bg-sky-50 text-sky-700 border-sky-200',              row: 'bg-sky-50/20' },
};

const ISSUE_META = {
  open:        { label: 'Open',        badge: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500' },
  assigned:    { label: 'Assigned',    badge: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-500' },
  in_progress: { label: 'In Progress', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',   dot: 'bg-indigo-500' },
  on_hold:     { label: 'On Hold',     badge: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
  resolved:    { label: 'Resolved',    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  closed:      { label: 'Closed',      badge: 'bg-slate-100 text-slate-600 border-slate-200',     dot: 'bg-slate-400' },
  reopened:    { label: 'Reopened',    badge: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500' },
};

const PRIORITY_BADGE = {
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high:     'bg-orange-50 text-orange-700 border-orange-200',
  medium:   'bg-amber-50 text-amber-700 border-amber-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

const DEVICE_META = {
  provisioned:       { label: 'Provisioned',      badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400' },
  active:            { label: 'Active',            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
  under_maintenance: { label: 'Under Maintenance', badge: 'bg-sky-50 text-sky-700 border-sky-200',            dot: 'bg-sky-500' },
  faulty:            { label: 'Faulty',            badge: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500' },
  retired:           { label: 'Retired / Removed', badge: 'bg-slate-200 text-slate-500 border-slate-300',     dot: 'bg-slate-400' },
};

// ── Live badge ────────────────────────────────────────────────────────────
function LiveBadge({ isLive }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
      isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
    }`}>
      {isLive ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
      {isLive ? 'Live' : 'Offline'}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, tone, sub }) {
  const tones = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  val: 'text-slate-900' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', val: 'text-emerald-600' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-100',    val: 'text-rose-600' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   val: 'text-amber-600' },
  };
  const t = tones[tone] ?? tones.indigo;
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
          <span className={`text-3xl font-extrabold tracking-tight ${t.val}`}>{value}</span>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${t.bg} ${t.text} border ${t.border} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
          <Icon size={22} />
        </div>
      </div>
      {sub && <div className="pt-3 border-t border-slate-100 mt-4"><span className="text-[11px] font-medium text-slate-500">{sub}</span></div>}
    </div>
  );
}

// ── Device History Panel ──────────────────────────────────────────────────
function DeviceHistoryPanel({ device, onClose }) {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyLogs({ deviceId: device.id, limit: 60 })
      .then((d) => setLogs(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [device.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <History size={17} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[220px]">{device.name}</p>
              <p className="text-[11px] text-slate-400">{device.zoneName} · Log history</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-2 justify-center py-16 text-slate-400 text-xs">
              <Loader2 size={16} className="animate-spin" /> Loading history…
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400 text-xs">
              <Package2 size={22} className="text-slate-300" />
              No logs found for this device.
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {logs.map((log, idx) => {
                const meta = LOG_META[log.status] ?? { label: log.status, dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
                const updated = log.updatedAt || log.createdAt;
                return (
                  <div key={log.id} className="flex gap-3 py-3.5 border-b border-slate-100 last:border-0">
                    {/* timeline */}
                    <div className="flex flex-col items-center shrink-0 mt-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                      {idx < logs.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badge}`}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{fmt(log.logDate)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        by {log.loggedByName ?? '—'}
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">"{log.notes}"</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={9} /> Updated {fmt(updated, true)} · {timeAgo(updated)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Daily Logs Tab ────────────────────────────────────────────────────────
function DailyLogsTab({ rawLogs, loading, zoneOptions, onRefresh }) {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [historyDevice, setHistoryDevice] = useState(null);
  const [isLive, setIsLive]         = useState(false);

  // Group by device — keep only the latest log per device (highest logDate)
  const latestPerDevice = useMemo(() => {
    const map = new Map();
    for (const log of rawLogs) {
      const devId = log.device?.id ?? log.id;
      const existing = map.get(devId);
      if (!existing || new Date(log.logDate) > new Date(existing.logDate)) {
        map.set(devId, log);
      }
    }
    return Array.from(map.values());
  }, [rawLogs]);

  const total   = latestPerDevice.length;
  const working = latestPerDevice.filter((l) => l.status === 'working').length;
  const notOk   = latestPerDevice.filter((l) => l.status !== 'working').length;

  const filtered = useMemo(() => latestPerDevice.filter((l) => {
    const q = search.toLowerCase().trim();
    if (q && !l.name.toLowerCase().includes(q) && !l.zoneName.toLowerCase().includes(q) && !(l.loggedByName ?? '').toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && (statusFilter === 'working' ? l.status !== 'working' : l.status === 'working')) return false;
    if (selectedZone !== 'all' && l.zoneName !== selectedZone) return false;
    return true;
  }), [latestPerDevice, search, statusFilter, selectedZone]);

  // Live socket
  useEffect(() => {
    setIsLive(socketClient.isConnected);
    const unsub = socketClient.on('log:submitted', () => {
      onRefresh();
    });
    return unsub;
  }, [onRefresh]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tracked Devices"   value={total}   icon={Boxes}        tone="indigo"  sub="Unique devices with a log" />
        <StatCard label="Working"           value={working} icon={CheckCircle2} tone="emerald" sub="Latest log shows healthy" />
        <StatCard label="Needs Attention"   value={notOk}   icon={AlertTriangle} tone="rose"   sub="Not working or flagged" />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by product, zone, or logged by…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LiveBadge isLive={isLive} />
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
            <MapPin size={13} className="text-indigo-600" />
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer">
              <option value="all">All Zones</option>
              {zoneOptions.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: 'all',         label: `All (${total})` },
              { key: 'working',     label: `Working (${working})`,  active: 'bg-emerald-600 text-white' },
              { key: 'not_working', label: `Issues (${notOk})`,     active: 'bg-rose-600 text-white' },
            ].map((t) => (
              <button key={t.key} onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${statusFilter === t.key ? (t.active ?? 'bg-slate-900 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin text-indigo-500" /> Loading…</span>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">
                  {latestPerDevice.length === 0 ? 'No daily logs submitted yet.' : 'No logs match your filters.'}
                </td></tr>
              ) : filtered.map((log) => {
                const meta = LOG_META[log.status] ?? { label: log.status, dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-700 border-slate-200', row: '' };
                const updated = log.updatedAt || log.createdAt;
                return (
                  <tr key={log.id} className={`hover:bg-slate-50/70 transition-colors group ${meta.row}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Boxes size={16} /></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{log.name}</span>
                          <span className="text-[11px] text-slate-400">{log.loggedByName ? `by ${log.loggedByName}` : '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500 shrink-0" /><span className="font-semibold">{log.zoneName}</span></div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />{fmt(updated)}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />{fmt(updated, true)} · {timeAgo(updated)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setHistoryDevice({ id: log.device?.id, name: log.name, zoneName: log.zoneName })}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <History size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History side panel */}
      {historyDevice && (
        <DeviceHistoryPanel device={historyDevice} onClose={() => setHistoryDevice(null)} />
      )}
    </div>
  );
}

// ── Queries & Issues Tab ──────────────────────────────────────────────────
function QueriesTab() {
  const [issues, setIssues]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLive, setIsLive]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getIssues({ limit: 100 });
      setIssues(data.items ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load queries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setIsLive(socketClient.isConnected);
    const u1 = socketClient.on('issue:created', load);
    const u2 = socketClient.on('issue:updated', load);
    return () => { u1(); u2(); };
  }, [load]);

  const total    = issues.length;
  const open     = issues.filter((i) => ['open', 'assigned', 'in_progress', 'on_hold', 'reopened'].includes(i.status)).length;
  const resolved = issues.filter((i) => ['resolved', 'closed'].includes(i.status)).length;

  const filtered = useMemo(() => issues.filter((i) => {
    const q = search.toLowerCase().trim();
    if (q && ![(i.device?.name ?? ''), (i.device?.zone?.name ?? ''), (i.raisedBy?.name ?? '')].some((s) => s.toLowerCase().includes(q))) return false;
    if (statusFilter === 'open'     && !['open','assigned','in_progress','on_hold','reopened'].includes(i.status)) return false;
    if (statusFilter === 'resolved' && !['resolved','closed'].includes(i.status)) return false;
    return true;
  }), [issues, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this query? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteIssue(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete query.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (filtered.length === 0) return;
    if (!confirm(`Delete all ${filtered.length} listed quer${filtered.length === 1 ? 'y' : 'ies'}? This cannot be undone.`)) return;
    setDeletingAll(true);
    const ids = filtered.map((i) => i.id);
    const failed = [];
    for (const id of ids) {
      try { await deleteIssue(id); }
      catch { failed.push(id); }
    }
    setIssues((prev) => prev.filter((i) => failed.includes(i.id) || !ids.includes(i.id)));
    if (failed.length > 0) alert(`${failed.length} quer${failed.length === 1 ? 'y' : 'ies'} could not be deleted.`);
    setDeletingAll(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Queries" value={total}    icon={ClipboardList} tone="indigo"  sub="All raised defects & queries" />
        <StatCard label="Open / Active" value={open}     icon={CircleDot}     tone="rose"    sub="Unresolved & in progress" />
        <StatCard label="Resolved"      value={resolved} icon={CheckCheck}    tone="emerald" sub="Closed & resolved queries" />
      </div>

      {error && <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold"><AlertTriangle size={13} />{error}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by device, zone, or raised by…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LiveBadge isLive={isLive} />
          <div className="flex items-center gap-1">
            {[
              { key: 'all',      label: `All (${total})` },
              { key: 'open',     label: `Active (${open})` },
              { key: 'resolved', label: `Resolved (${resolved})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${statusFilter === t.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {filtered.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deletingAll ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete All ({filtered.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Device / Query</th>
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Raised / Updated</th>
                <th className="py-3.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin text-indigo-500" /> Loading…</span>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">
                  {issues.length === 0 ? 'No queries raised yet.' : 'No queries match your filters.'}
                </td></tr>
              ) : filtered.map((issue) => {
                const sm = ISSUE_META[issue.status] ?? ISSUE_META.open;
                const pm = PRIORITY_BADGE[issue.priority] ?? PRIORITY_BADGE.medium;
                const updated = issue.updatedAt || issue.createdAt;
                const isDeleting = deletingId === issue.id;
                return (
                  <tr key={issue.id} className={`hover:bg-slate-50/60 transition-colors group ${isDeleting ? 'opacity-40' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Wrench size={16} /></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{issue.device?.name ?? '—'}</span>
                          <span className="text-[11px] text-slate-400">by {issue.raisedBy?.name ?? '—'}{issue.assignedTechnician?.user?.name ? ` · ${issue.assignedTechnician.user.name}` : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500 shrink-0" /><span className="font-semibold">{issue.device?.zone?.name ?? '—'}</span></div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${pm}`}>{issue.priority ?? 'medium'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sm.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />{fmt(updated)}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} />{fmt(updated, true)} · {timeAgo(updated)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleDelete(issue.id)}
                        disabled={isDeleting || deletingAll}
                        title="Delete query"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Devices Tab ───────────────────────────────────────────────────────────
function DevicesTab() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getDevices({ limit: 100 });
      setDevices(data.items ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load devices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total   = devices.length;
  const active  = devices.filter((d) => d.status === 'active').length;
  const faulty  = devices.filter((d) => d.status === 'faulty').length;
  const retired = devices.filter((d) => d.status === 'retired').length;

  const filtered = useMemo(() => devices.filter((d) => {
    const q = search.toLowerCase().trim();
    if (q && ![(d.name ?? ''), (d.zone?.name ?? ''), (d.serialNumber ?? '')].some((s) => s.toLowerCase().includes(q))) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  }), [devices, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"    value={total}   icon={Package}      tone="indigo"  sub="All registered" />
        <StatCard label="Active"   value={active}  icon={CheckCircle2} tone="emerald" sub="Deployed & running" />
        <StatCard label="Faulty"   value={faulty}  icon={AlertTriangle} tone="rose"   sub="Needs repair" />
        <StatCard label="Retired"  value={retired} icon={XCircle}      tone="amber"   sub="Removed / decommissioned" />
      </div>

      {error && <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold"><AlertTriangle size={13} />{error}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name, serial no., or zone…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { key: 'all',     label: `All (${total})` },
            { key: 'active',  label: `Active (${active})` },
            { key: 'faulty',  label: `Faulty (${faulty})` },
            { key: 'retired', label: `Retired (${retired})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${statusFilter === t.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Device</th>
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Serial No.</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin text-indigo-500" /> Loading…</span>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">
                  {devices.length === 0 ? 'No devices registered yet.' : 'No devices match your filters.'}
                </td></tr>
              ) : filtered.map((device) => {
                const dm = DEVICE_META[device.status] ?? DEVICE_META.provisioned;
                const isRetired = device.status === 'retired';
                return (
                  <tr key={device.id} className={`hover:bg-slate-50/60 transition-colors group ${isRetired ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isRetired ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{device.name ?? '—'}</span>
                          <span className="text-[11px] text-slate-400">{device.hardwareType?.name ?? device.category?.name ?? '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500 shrink-0" /><span className="font-semibold">{device.zone?.name ?? '—'}</span></div>
                    </td>
                    <td className="py-4 px-6"><span className="font-mono text-slate-600">{device.serialNumber ?? '—'}</span></td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${dm.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dm.dot}`} />{dm.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />{fmt(device.createdAt)}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} />{fmt(device.createdAt, true)} · {timeAgo(device.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function DailyLogsPage() {
  const [activeTab, setActiveTab]     = useState('logs');
  const [rawLogs, setRawLogs]         = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Use allSettled so both fetches run independently; report the real error
      // message from whichever call failed so it's easy to diagnose.
      const [logsResult, zonesResult] = await Promise.allSettled([
        getDailyLogs({ limit: 100 }),
        getZones({ limit: 100 }),
      ]);

      if (logsResult.status === 'rejected') {
        throw new Error(`Daily logs: ${logsResult.reason?.message ?? 'request failed'}`);
      }
      if (zonesResult.status === 'rejected') {
        throw new Error(`Zones: ${zonesResult.reason?.message ?? 'request failed'}`);
      }

      const logsData  = logsResult.value;
      const zonesData = zonesResult.value;

      const zoneMap = new Map((zonesData?.items ?? []).map((z) => [z.id, z.name]));
      setZoneOptions((zonesData?.items ?? []).map((z) => z.name));
      setRawLogs((logsData?.items ?? []).map((l) => ({
        id:           l.id,
        device:       l.device ?? null,
        name:         l.deviceName || l.device?.name || 'Unknown device',
        loggedByName: l.loggedByName ?? null,
        zoneName:     (l.device?.zoneId && zoneMap.get(l.device.zoneId)) || '—',
        logDate:      l.logDate,
        createdAt:    l.createdAt,
        updatedAt:    l.updatedAt,
        notes:        l.notes ?? null,
        status:       l.status,
      })));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Could not load daily logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const TABS = [
    { key: 'logs',    label: 'Daily Logs',      icon: Boxes },
    { key: 'queries', label: 'Queries & Issues', icon: ClipboardList },
    { key: 'devices', label: 'Devices',          icon: Package },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Activity Overview</h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Live device logs, raised queries, and the full product lifecycle for your facility.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Refreshed {fmt(lastUpdated, true)}
            </span>
          )}
          {activeTab === 'logs' && (
            <button onClick={fetchLogs} disabled={loading}
              className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">{error}</div>}

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'logs'    && <DailyLogsTab rawLogs={rawLogs} loading={loading} zoneOptions={zoneOptions} onRefresh={fetchLogs} />}
      {activeTab === 'queries' && <QueriesTab />}
      {activeTab === 'devices' && <DevicesTab />}
    </div>
  );
}
