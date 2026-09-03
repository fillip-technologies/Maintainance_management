import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../api/dashboardApi';
import { getUsers } from '../../api/usersApi';
import { socketClient } from '../../api/socketClient';
import { ClientProductCards, ClientTeamCards } from './components/ClientStatCards';
import ClientProductCircleGraph from './components/ClientProductCircleGraph';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function ClientOverview() {
  const { currentUser, isSuperAdmin } = useAuth();

  // Live stats from GET /dashboard/summary (initialized to 0, no mock/fallback data)
  const [stats, setStats] = useState({
    totalDevices: 0,
    workingDevices: 0,
    faultyDevices: 0,
    underMaintenance: 0,
    openIssues: 0,
    missingLogs: 0
  });

  // Dynamic Team counts from GET /users API
  const [teamStats, setTeamStats] = useState({
    zoneOfficers: 0,
    staffMembers: 0,
    technicians: 0
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Determine dashboard scope from logged-in user
  const getScope = () => {
    if (isSuperAdmin) return { scope: 'platform' };
    if (currentUser?.clientId) return { scope: 'client', id: currentUser.clientId, includeSubzones: true };
    if (currentUser?.zoneId)   return { scope: 'zone',   id: currentUser.zoneId,   includeSubzones: true };
    return { scope: 'platform' };
  };

  const fetchStats = useCallback(async () => {
    try {
      const scopeParams = getScope();
      const [data, usersData] = await Promise.all([
        getDashboardSummary(scopeParams),
        getUsers({ limit: 100 })
      ]);

      // Always reflect the API — even all-zeros. (Previously these were gated on
      // ">0" so placeholder demo numbers could show for empty data, which made the
      // page look static/disconnected.)
      if (data) setStats(data);

      const items = usersData?.items || [];
      const activeItems = items.filter((u) => u.accountStatus !== 'removed');
      setTeamStats({
        zoneOfficers: activeItems.filter((u) => u.role === 'zone_incharge').length,
        staffMembers: activeItems.filter((u) => u.role === 'zone_staff').length,
        technicians: activeItems.filter((u) => u.role === 'technician').length
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('[ClientOverview] Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial load + focus & users_changed listener for live sync
  useEffect(() => {
    fetchStats();

    const handleFocusOrStorage = () => {
      fetchStats();
    };

    window.addEventListener('focus', handleFocusOrStorage);
    window.addEventListener('storage', handleFocusOrStorage);
    window.addEventListener('fixly:users_changed', handleFocusOrStorage);

    return () => {
      window.removeEventListener('focus', handleFocusOrStorage);
      window.removeEventListener('storage', handleFocusOrStorage);
      window.removeEventListener('fixly:users_changed', handleFocusOrStorage);
    };
  }, [fetchStats]);

  // Realtime socket event listeners
  useEffect(() => {
    const unsubIssueCreated = socketClient.on('issue:created', () => {
      fetchStats();
    });
    const unsubIssueUpdated = socketClient.on('issue:updated', () => {
      fetchStats();
    });
    const unsubLogSubmitted = socketClient.on('log:submitted', () => {
      fetchStats();
    });

    setIsLive(socketClient.isConnected);

    return () => {
      unsubIssueCreated();
      unsubIssueUpdated();
      unsubLogSubmitted();
    };
  }, [fetchStats]);

  // Map API response to the shape expected by Product Cards & Circular Analytics Graph.
  // Use `?? 0` (nullish), NOT `|| <demo>` — a real count of 0 must show as 0, not be
  // masked by placeholder numbers (that made the page look static/disconnected).
  const cardStats = {
    totalProducts:       stats.totalDevices ?? 0,
    workingProducts:     stats.workingDevices ?? 0,
    notWorkingProducts:  stats.faultyDevices ?? 0,
    maintenanceProducts: stats.underMaintenance ?? 0
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Top Headline Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Overview & Operations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Live overview of facility products, equipment operational health, and operations personnel (Zone Officers, Staff & Technicians).
          </p>
        </div>

        {/* Status bar — live indicator + last updated + manual refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
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
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh dashboard data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 1. Top Row: 4 Product Metric Cards */}
      <ClientProductCards stats={cardStats} />

      {/* 2. Middle Row: Circular / Donut Products Graph */}
      <ClientProductCircleGraph stats={cardStats} />

      {/* 3. Bottom Row: Operations & Zone Personnel */}
      <ClientTeamCards teamStats={teamStats} />
    </div>
  );
}
