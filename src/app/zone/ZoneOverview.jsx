import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/dashboardApi';
import { socketClient } from '../api/socketClient';
import { RefreshCw, Wifi, WifiOff, MapPinOff, Boxes, CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react';

/**
 * Zone Officer overview. Shows ONLY the officer's in-scope facility health,
 * driven by GET /dashboard/summary with zone scope — the backend enforces that
 * the caller may only aggregate over their assigned zone subtree, so there is
 * no way to widen this to client- or platform-level data from here.
 *
 * If the officer has no zone assignment yet, we render an explicit empty state
 * and make NO request (a zone role has no valid platform/client scope to fall
 * back to — asking for one would 403).
 */
export default function ZoneOverview() {
  const { currentUser } = useAuth();
  const zoneId = currentUser?.zoneId ?? null;

  const [stats, setStats] = useState({
    totalDevices: 0,
    workingDevices: 0,
    faultyDevices: 0,
    openIssues: 0,
    missingLogs: 0,
  });
  const [loading, setLoading] = useState(!!zoneId);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!zoneId) return; // no assignment → nothing to fetch
    try {
      const data = await getDashboardSummary({ scope: 'zone', id: zoneId, includeSubzones: true });
      if (data) setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[ZoneOverview] Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    fetchStats();
    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStats]);

  useEffect(() => {
    if (!zoneId) return;
    const unsubCreated = socketClient.on('issue:created', () => fetchStats());
    const unsubUpdated = socketClient.on('issue:updated', () => fetchStats());
    const unsubLog = socketClient.on('log:submitted', () => fetchStats());
    setIsLive(socketClient.isConnected);
    return () => {
      unsubCreated();
      unsubUpdated();
      unsubLog();
    };
  }, [fetchStats, zoneId]);

  // No zone assigned — friendly empty state, no API call.
  if (!zoneId) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
          <MapPinOff size={26} />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">No zone assigned yet</h1>
        <p className="text-sm text-slate-500 max-w-md">
          Your account isn&apos;t assigned to a zone. Once an administrator assigns you
          to a zone, your facility overview will appear here.
        </p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Devices', value: stats.totalDevices, icon: Boxes, tone: 'indigo' },
    { label: 'Working', value: stats.workingDevices, icon: CheckCircle2, tone: 'emerald' },
    { label: 'Faulty', value: stats.faultyDevices, icon: AlertTriangle, tone: 'rose' },
    { label: 'Open Issues', value: stats.openIssues, icon: ClipboardList, tone: 'amber' },
  ];
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Headline */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Zone Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Live operational health for your assigned zone and its sub-zones.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {isLive ? <Wifi size={13} className="animate-pulse" /> : <WifiOff size={13} />}
            <span>{isLive ? 'Live Sync Active' : 'Offline'}</span>
          </div>
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-[120px] animate-pulse flex flex-col gap-3">
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                  <span className={`w-9 h-9 rounded-xl border flex items-center justify-center ${tones[c.tone]}`}>
                    <Icon size={18} />
                  </span>
                </div>
                <span className="text-3xl font-extrabold text-slate-900">{c.value ?? 0}</span>
              </div>
            );
          })}
        </div>
      )}

      {stats.missingLogs > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <AlertTriangle size={15} />
          {stats.missingLogs} device{stats.missingLogs === 1 ? '' : 's'} missing today&apos;s status log.
        </div>
      )}
    </div>
  );
}
