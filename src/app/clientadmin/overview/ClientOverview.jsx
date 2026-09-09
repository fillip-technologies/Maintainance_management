import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../api/dashboardApi';
import { getUsers } from '../../api/usersApi';
import { socketClient } from '../../api/socketClient';
import { ClientProductCards, ClientTeamCards } from './components/ClientStatCards';
import ClientProductCircleGraph from './components/ClientProductCircleGraph';
import ClientProductHealthCards from './components/ClientProductHealthCards';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import ZoneQueryView from '../../common/ZoneQueryView';
import { RefreshCw, Wifi, WifiOff, BarChart2, LayoutGrid, Calendar } from 'lucide-react';

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
  const [drawer, setDrawer] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'zone'
  const [zoneInitialCat, setZoneInitialCat] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

      // zone_incharge / zone_staff come from the users list (they have clientId set).
      // Technicians are platform-level (clientId = null) and assigned via
      // technician_assignments — their count comes from the dashboard summary instead.
      const items = usersData?.items || [];
      const activeItems = items.filter((u) => u.accountStatus !== 'removed');
      setTeamStats({
        zoneOfficers: activeItems.filter((u) => u.role === 'zone_incharge').length,
        staffMembers: activeItems.filter((u) => u.role === 'zone_staff').length,
        technicians: data?.assignedTechnicians ?? 0,
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
    totalProducts:       stats.totalDevices       ?? 0,
    workingProducts:     stats.workingDevices      ?? 0,
    notWorkingProducts:  (stats.faultyDevices ?? 0) + (stats.underMaintenance ?? 0),
    provisionedProducts: stats.provisionedDevices  ?? 0,
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header — Title on Left; Live Clock, Online Status, and Controls on Right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of your equipment and maintenance status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Date & Time */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-600 text-xs font-semibold shadow-xs">
            <Calendar size={15} className="text-slate-400" />
            <span>
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {'  '}
              {currentTime.toLocaleTimeString('en-US')}
            </span>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
            isLive
              ? 'bg-[#ecfdf5] text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{isLive ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <>
          <ClientProductCards stats={cardStats} onCardClick={setDrawer} />
          <ClientProductHealthCards
            refreshTick={lastUpdated}
            onCategoryClick={(cat) => { setZoneInitialCat(cat); setActiveTab('zone'); }}
          />
          <ClientProductCircleGraph
            stats={stats}
            teamStats={teamStats}
            onCardClick={setDrawer}
          />
          {drawer && (
            <ClientDetailDrawer type={drawer} onClose={() => setDrawer(null)} />
          )}
        </>
      )}

      {/* Zone View tab */}
      {activeTab === 'zone' && (
        <div className="flex flex-col gap-4">
          <div>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs cursor-pointer"
            >
              ← Back to Dashboard Overview
            </button>
          </div>
          <ZoneQueryView
            key={zoneInitialCat?.categoryId ?? 'all'}
            initialCat={zoneInitialCat}
          />
        </div>
      )}
    </div>
  );
}
