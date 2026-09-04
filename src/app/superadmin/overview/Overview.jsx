import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Cpu,
  FileWarning,
  CheckCircle2,
  X,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

import StatCard from './components/StatCard';
import EquipmentStatusStats from './components/EquipmentStatusStats';
import WorkOrderStatus from './components/WorkOrderStatus';
import CriticalAlerts from './components/CriticalAlerts';
import FacilityOverviewTable from './components/FacilityOverviewTable';
import TechnicianWorkload from './components/TechnicianWorkload';
import RecentActivityFeed from './components/RecentActivityFeed';
import { getPlatformOverview } from '../../api/dashboardApi';
import { socketClient } from '../../api/socketClient';

export default function Overview() {
  const [toastMessage, setToastMessage] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Maintenance Operations Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Platform-wide command center for assets, work orders, technicians, and client facilities.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {isLive ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isLive ? 'Live' : 'Offline'}
          </span>
          {lastUpdated && (
            <span className="text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchOverview}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-semibold px-2.5 py-1 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={loading ? '—' : (devices?.total ?? 0).toLocaleString('en-IN')}
          icon={Cpu}
          iconBg="primary"
        />
        <StatCard
          title="Open Work Orders"
          value={loading ? '—' : (issues?.open ?? 0).toLocaleString('en-IN')}
          icon={ClipboardList}
          iconBg="cyan"
        />
        <StatCard
          title="Critical Open"
          value={loading ? '—' : (issues?.byPriority?.critical ?? 0).toLocaleString('en-IN')}
          icon={AlertTriangle}
          iconBg="purple"
        />
        <StatCard
          title="Missing Today's Log"
          value={loading ? '—' : (devices?.missingTodayLog ?? 0).toLocaleString('en-IN')}
          icon={FileWarning}
          iconBg="success"
        />
      </div>

      {/* Tenancy quick strip */}
      {tenancy && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Organizations', value: tenancy.companies },
            { label: 'Clients', value: tenancy.clients },
            { label: 'Zones', value: tenancy.zones },
            { label: 'Users', value: tenancy.users },
            { label: 'Technicians', value: tenancy.technicians },
            { label: 'Faulty Devices', value: devices?.faulty ?? 0 }
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex flex-col shadow-xs"
            >
              <span className="text-lg font-extrabold text-slate-900">{item.value}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <EquipmentStatusStats
        devices={devices}
        byHardwareType={overview?.byHardwareType}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WorkOrderStatus issues={issues} loading={loading} />
        <CriticalAlerts alerts={overview?.criticalAlerts} loading={loading} />
      </div>

      <TechnicianWorkload technicians={overview?.technicians} loading={loading} />

      <FacilityOverviewTable facilities={overview?.facilities} loading={loading} onNotify={showToast} />

      <RecentActivityFeed activities={overview?.recentActivity} loading={loading} />
    </div>
  );
}
