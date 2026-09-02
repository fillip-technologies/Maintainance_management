import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  X,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { getDailyLogs } from '../../api/dailyLogsApi';
import { getZones } from '../../api/zonesApi';

export default function DailyLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'working' | 'not_working'
  const [selectedZone, setSelectedZone] = useState('all');

  const [logs, setLogs] = useState([]);
  const [zoneOptions, setZoneOptions] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pull real daily logs + zones (to resolve zone names) from the backend.
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, zonesData] = await Promise.all([
        getDailyLogs({ limit: 100 }),
        getZones({ limit: 100 })
      ]);

      const zoneMap = new Map((zonesData?.items || []).map((z) => [z.id, z.name]));
      setZoneOptions(['all', ...(zonesData?.items || []).map((z) => z.name)]);

      const rows = (logsData?.items || []).map((l) => {
        const zoneId = l.device?.zoneId ?? null;
        return {
          id: l.id,
          name: l.deviceName || l.device?.name || 'Unknown device',
          loggedByName: l.loggedByName || null,
          zoneName: (zoneId && zoneMap.get(zoneId)) || '—',
          date: l.logDate || l.createdAt,
          time: l.createdAt,
          status: l.status // working | not_working | needs_attention
        };
      });
      setLogs(rows);
    } catch (err) {
      console.error('Fetch daily logs error:', err);
      setError('Could not load daily logs. Is the backend running?');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Compute 3 primary stats: Total, Working, Not Working (anything not "working").
  const totalProducts = logs.length;
  const workingProducts = logs.filter((l) => l.status === 'working').length;
  const notWorkingProducts = logs.filter((l) => l.status !== 'working').length;

  // Filter logs based on search, status, and zone
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        l.name.toLowerCase().includes(q) ||
        (l.loggedByName && l.loggedByName.toLowerCase().includes(q)) ||
        l.zoneName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'working' ? l.status === 'working' : l.status !== 'working');
      const matchesZone = selectedZone === 'all' || l.zoneName === selectedZone;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [logs, searchQuery, statusFilter, selectedZone]);

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Top Headline Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Product Logs
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Daily operational health checks, zone allocations, and status submissions for all registered facility equipment.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 3 Stats Cards: Total Products, Working, Not Working */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Total Products</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Boxes size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">All monitored equipment</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Total Logged
            </span>
          </div>
        </div>

        {/* Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Working Products</span>
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {workingProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Operating normal & healthy</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Active / Healthy
            </span>
          </div>
        </div>

        {/* Not Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Not Working Products</span>
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {notWorkingProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Breakdowns & fault flagged</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
              Attention Needed
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by product name, code, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters: Zone Selector & Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zone Selector Dropdown */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
            <MapPin size={14} className="text-indigo-600" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="all">All Zones</option>
              {zoneOptions.filter(z => z !== 'all').map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              All Logs ({totalProducts})
            </button>

            <button
              onClick={() => setStatusFilter('working')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'working'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              Working ({workingProducts})
            </button>

            <button
              onClick={() => setStatusFilter('not_working')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'not_working'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              Not Working ({notWorkingProducts})
            </button>
          </div>
        </div>
      </div>

      {/* Daily Logs Table: Name, Zone, Date, Status */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                      Loading daily logs…
                    </span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    {logs.length === 0
                      ? 'No daily logs have been submitted yet.'
                      : 'No logs found matching your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const meta =
                    {
                      working: {
                        label: 'Working',
                        dot: 'bg-emerald-500 animate-pulse',
                        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        icon: 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      },
                      needs_attention: {
                        label: 'Needs Attention',
                        dot: 'bg-amber-500',
                        badge: 'bg-amber-50 text-amber-700 border-amber-200',
                        icon: 'bg-amber-50 text-amber-600 border-amber-200'
                      },
                      not_working: {
                        label: 'Not Working',
                        dot: 'bg-rose-500',
                        badge: 'bg-rose-50 text-rose-700 border-rose-200',
                        icon: 'bg-rose-50 text-rose-600 border-rose-200'
                      }
                    }[log.status] || {
                      label: log.status,
                      dot: 'bg-slate-400',
                      badge: 'bg-slate-50 text-slate-700 border-slate-200',
                      icon: 'bg-slate-50 text-slate-600 border-slate-200'
                    };
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* 1. Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border ${meta.icon}`}
                          >
                            <Boxes size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {log.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {log.loggedByName ? `Logged by ${log.loggedByName}` : 'Logged by —'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Zone */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-indigo-500 shrink-0" />
                          <span className="text-slate-800 font-semibold">{log.zoneName}</span>
                        </div>
                      </td>

                      {/* 3. Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {formatDate(log.date)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            {formatTime(log.date)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
