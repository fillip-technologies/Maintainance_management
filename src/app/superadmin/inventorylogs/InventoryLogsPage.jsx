import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollText, Search, X, RefreshCw,
  AlertTriangle, Clock, MapPin, Calendar
} from 'lucide-react';
import { getDailyLogs } from '../../api/dailyLogsApi';
import { getZones } from '../../api/zonesApi';

const STATUS_META = {
  working:           { label: 'Working',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  not_working:       { label: 'Not Working',  color: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  under_maintenance: { label: 'Maintenance',  color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  needs_attention:   { label: 'Attention',    color: 'bg-orange-50 text-orange-700 border-orange-200',    dot: 'bg-orange-400' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.needs_attention;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`text-3xl font-extrabold tracking-tight ${color}`}>{value}</span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <ScrollText size={18} className="text-slate-400" />
      </div>
    </div>
  );
}

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, zonesData] = await Promise.all([
        getDailyLogs({ limit: 200, date: selectedDate || undefined }),
        getZones({ limit: 200 }),
      ]);

      const zoneMap = new Map((zonesData?.items || []).map((z) => [z.id, z.name]));
      setZoneOptions(zonesData?.items || []);

      const rows = (logsData?.items || []).map((l) => ({
        id: l.id,
        deviceName: l.deviceName || l.device?.name || 'Unknown device',
        deviceCode: l.device?.code ?? '—',
        loggedByName: l.loggedByName ?? null,
        zoneName: (l.device?.zoneId && zoneMap.get(l.device.zoneId)) || '—',
        date: l.logDate || l.createdAt,
        createdAt: l.createdAt,
        status: l.status,
        note: l.note ?? '',
      }));

      setLogs(rows);
    } catch (err) {
      setError('Could not load inventory logs.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((l) => {
      const matchesSearch =
        !q ||
        l.deviceName.toLowerCase().includes(q) ||
        l.deviceCode.toLowerCase().includes(q) ||
        (l.loggedByName && l.loggedByName.toLowerCase().includes(q)) ||
        l.zoneName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesZone = selectedZone === 'all' || l.zoneName === selectedZone;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [logs, searchQuery, statusFilter, selectedZone]);

  const working = logs.filter((l) => l.status === 'working').length;
  const notWorking = logs.filter((l) => l.status === 'not_working').length;
  const maintenance = logs.filter((l) => l.status === 'under_maintenance').length;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Logs
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Platform-wide daily device status logs across all clients and zones.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={logs.length} color="text-slate-900" />
        <StatCard label="Working" value={working} color="text-emerald-600" />
        <StatCard label="Not Working" value={notWorking} color="text-rose-600" />
        <StatCard label="Maintenance" value={maintenance} color="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex-wrap">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[200px] max-w-sm focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search device, zone, logged by…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-700 outline-hidden cursor-pointer"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Zone filter */}
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-hidden focus:border-indigo-400 cursor-pointer"
        >
          <option value="all">All Zones</option>
          {zoneOptions.map((z) => (
            <option key={z.id} value={z.name}>{z.name}</option>
          ))}
        </select>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'all',               label: `All (${logs.length})`,       active: 'bg-slate-900 text-white' },
            { key: 'working',           label: `Working (${working})`,        active: 'bg-emerald-600 text-white' },
            { key: 'not_working',       label: `Not Working (${notWorking})`, active: 'bg-rose-600 text-white' },
            { key: 'under_maintenance', label: `Maintenance (${maintenance})`,active: 'bg-amber-600 text-white' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === t.key ? `${t.active} shadow-xs` : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {loading && logs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading logs…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <ScrollText size={28} className="text-slate-300" />
          <span className="text-sm font-bold text-slate-600">No logs found</span>
          <span className="text-xs text-slate-400">Try adjusting the filters or date.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{l.deviceName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{l.deviceCode}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      {l.zoneName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {l.loggedByName ?? <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                    {l.note || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        {l.date ? new Date(l.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={11} />
                        {l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            Showing {filtered.length} of {logs.length} log{logs.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
