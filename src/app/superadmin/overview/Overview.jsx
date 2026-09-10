import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Cpu,
  FileWarning,
  CheckCircle2,
  X,
  BarChart2,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';

import StatCard from './components/StatCard';
import PlatformKpiCards from './components/PlatformKpiCards';
import LocationsOverviewMap from './components/LocationsOverviewMap';
import DeviceStatusDistribution from './components/DeviceStatusDistribution';
import DevicesByLocationChart from './components/DevicesByLocationChart';
import LocationCardsRow from './components/LocationCardsRow';
import WorkOrderStatus from './components/WorkOrderStatus';
import CriticalAlerts from './components/CriticalAlerts';
import FacilityOverviewTable from './components/FacilityOverviewTable';
import TechnicianWorkload from './components/TechnicianWorkload';
import RecentActivityFeed from './components/RecentActivityFeed';
import ZoneQueryView from '../../common/ZoneQueryView';
import { getPlatformOverview } from '../../api/dashboardApi';
import { getClients } from '../../api/clientsApi';
import { socketClient } from '../../api/socketClient';

export default function Overview() {
  const [toastMessage, setToastMessage] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'zone'
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOverview = useCallback(async () => {
    try {
      const data = await getPlatformOverview();
      if (data) {
        setOverview(data);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('[Superadmin Overview] fetch error:', err);
      setError(err.message || 'Failed to load platform overview from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();

    const unsubIssue = socketClient.on('issue:new', fetchOverview);
    const unsubLog = socketClient.on('daily_log:new', fetchOverview);
    const unsubDev = socketClient.on('device:updated', fetchOverview);

    const interval = setInterval(() => {
      setIsLive(socketClient.isConnected);
    }, 2000);

    return () => {
      unsubIssue();
      unsubLog();
      unsubDev();
      clearInterval(interval);
    };
  }, [fetchOverview]);

  // Load clients when Zone View tab is first opened
  useEffect(() => {
    if (activeTab !== 'zone' || clients.length > 0) return;
    getClients({ limit: 100 })
      .then((res) => {
        const items = res?.items ?? [];
        setClients(items);
        if (items.length > 0) setSelectedClientId(items[0].id);
      })
      .catch(() => {});
  }, [activeTab, clients.length]);

  const devices = overview?.devices;
  const issues = overview?.issues;
  const tenancy = overview?.tenancy;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Tab Switcher (Analytics / Zone View) */}
      <div className="flex items-center justify-end py-1">
        <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
              ${activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart2 size={13} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('zone')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
              ${activeTab === 'zone'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={13} />
            Zone View
          </button>
        </div>
      </div>

      {/* Error banner — analytics only */}
      {activeTab === 'analytics' && error && !loading && (
        <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Zone View tab ──────────────────────────────────────────────── */}
      {activeTab === 'zone' && (
        <div className="flex flex-col gap-5">
          {/* Client selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 shrink-0">Client</span>
            <div className="relative">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-semibold text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs"
              >
                {clients.length === 0 && (
                  <option value="">Loading clients…</option>
                )}
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Zone view scoped to selected client */}
          {selectedClientId
            ? <ZoneQueryView key={selectedClientId} clientId={selectedClientId} />
            : <p className="text-sm text-slate-400 text-center py-10">Select a client to view its zones.</p>
          }
        </div>
      )}

      {/* ── Analytics tab ──────────────────────────────────────────────── */}
      {activeTab === 'analytics' && <>

      {/* 1. 7 KPI Stat Cards Banner */}
      <PlatformKpiCards
        tenancy={tenancy}
        devices={devices}
        loading={loading}
      />

      {/* 2. Middle Row: Locations Overview Map & List (Left) + Distribution & Location Bar Chart (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left 7 cols: Interactive Satellite Map & Locations List */}
        <div className="xl:col-span-7 flex flex-col">
          <LocationsOverviewMap
            facilities={overview?.facilities}
            loading={loading}
            className="h-full"
          />
        </div>

        {/* Right 5 cols: Device Status Distribution Donut + Devices by Location Bar Chart */}
        <div className="xl:col-span-5 flex flex-col gap-5 justify-between">
          <DeviceStatusDistribution devices={devices} loading={loading} className="flex-1" />
          <DevicesByLocationChart
            facilities={overview?.facilities}
            hardwareTypes={overview?.byHardwareType}
            loading={loading}
            className="flex-1"
          />
        </div>
      </div>

      {/* 3. Bottom Row: Location Operational Cards */}
      <LocationCardsRow
        facilities={overview?.facilities}
        loading={loading}
      />

      {/* Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
        <WorkOrderStatus issues={issues} loading={loading} />
        <CriticalAlerts alerts={overview?.criticalAlerts} loading={loading} />
      </div>

      <TechnicianWorkload technicians={overview?.technicians} loading={loading} />

      <FacilityOverviewTable facilities={overview?.facilities} loading={loading} onNotify={showToast} />

      <RecentActivityFeed activities={overview?.recentActivity} loading={loading} />

      </>} {/* end analytics tab */}
    </div>
  );
}
