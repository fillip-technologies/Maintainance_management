import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Building2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { socketClient } from '../api/socketClient';

export default function Header({ onToggleMobileSidebar }) {
  const { currentUser, isClientAdmin, isZoneOfficer, logout } = useAuth();
  const navigate = useNavigate();

  const [isLive, setIsLive] = useState(socketClient.isConnected);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleRefreshed = (e) => {
      setLastUpdated(e.detail?.time || new Date());
      setRefreshing(false);
    };

    const unsubIssueCreated = socketClient.on('issue:created', () => {
      setLastUpdated(new Date());
    });
    const unsubIssueUpdated = socketClient.on('issue:updated', () => {
      setLastUpdated(new Date());
    });
    const unsubLogSubmitted = socketClient.on('log:submitted', () => {
      setLastUpdated(new Date());
    });

    const interval = setInterval(() => {
      setIsLive(socketClient.isConnected);
    }, 2000);

    window.addEventListener('fixly:refreshed', handleRefreshed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('fixly:refreshed', handleRefreshed);
      unsubIssueCreated?.();
      unsubIssueUpdated?.();
      unsubLogSubmitted?.();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    window.dispatchEvent(new CustomEvent('fixly:trigger_refresh'));
    // Fallback in case no component listens on current page
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const companyName = currentUser?.clientName ?? '';

  return (
    <header className="h-[70px] bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 sticky top-0 z-30 shadow-xs gap-3">

      {/* Left: mobile hamburger */}
      <div className="flex items-center flex-1">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu size={19} />
        </button>
      </div>

      {/* Centre: company name */}
      <div className="flex-1 flex items-center justify-center">
        {(isClientAdmin || isZoneOfficer) && companyName && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200">
            <Building2 size={15} className="text-indigo-500 shrink-0" />
            <span className="text-sm font-bold text-indigo-700 max-w-[260px] truncate">
              {companyName}
            </span>
          </div>
        )}
      </div>

      {/* Right: Live Sync status + notification bell + logout */}
      <div className="flex-1 flex items-center justify-end gap-2.5 sm:gap-3">
        {/* Live Sync Active status pill + Updated time + Refresh */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {isLive ? <Wifi size={13} className="animate-pulse" /> : <WifiOff size={13} />}
            <span className="hidden xs:inline">{isLive ? 'Live Sync Active' : 'Offline'}</span>
          </div>

          {lastUpdated && (
            <span className="text-[11px] text-slate-400 hidden lg:block">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <NotificationBell />

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

    </header>
  );
}
