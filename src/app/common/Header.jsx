import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketClient } from '../api/socketClient';
import NotificationBell from './NotificationBell';

export default function Header({ onToggleMobileSidebar }) {
  const { currentUser, isClientAdmin, isZoneOfficer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(socketClient.isConnected);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setIsLive(socketClient.isConnected);
    }, 1000);

    const unsubConnect = socketClient.on('connect', () => setIsLive(true));
    const unsubDisconnect = socketClient.on('disconnect', () => setIsLive(false));

    return () => {
      clearInterval(timer);
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const companyName = currentUser?.clientName ?? '';

  const getPageMeta = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/users') || path.includes('/team')) {
      return { title: 'Team & Roles', subtitle: 'Manage team access and permissions' };
    }
    if (path.includes('/requests') || path.includes('/raise-query')) {
      return { title: 'Raise Query', subtitle: 'Submit and track service tickets' };
    }
    if (path.includes('/logs') || path.includes('/daily-logs')) {
      return { title: 'Daily Logs', subtitle: 'Review inspection and activity logs' };
    }
    if (path.includes('/zones')) {
      return { title: 'Zones', subtitle: 'Facility zones and operational areas' };
    }
    return { title: 'Dashboard', subtitle: 'Overview of your equipment and maintenance status' };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageMeta();

  return (
    <header className="h-[70px] bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center px-3 sm:px-6 sticky top-0 z-30 shadow-xs gap-3">

      {/* Left: mobile hamburger + Page Title */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[var(--bg-card)] border border-[var(--border-color)] shrink-0 cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu size={19} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight truncate">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-slate-400 hidden xl:block truncate">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Centre: company name */}
      <div className="flex-1 flex items-center justify-center">
        {(isClientAdmin || isZoneOfficer) && companyName && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-white shadow-xs">
            <Building2 size={15} className="text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-white max-w-[260px] truncate">
              {companyName}
            </span>
          </div>
        )}
      </div>

      {/* Right: Date/Time clock, Online status pill, Notification bell, Logout */}
      <div className="flex-1 flex items-center justify-end gap-2.5">
        {/* Live Date & Time */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-slate-300 text-xs font-semibold shadow-xs">
          <Calendar size={14} className="text-slate-400" />
          <span>
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {'  '}
            {currentTime.toLocaleTimeString('en-US')}
          </span>
        </div>

        {/* Status badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
          isLive
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
            : 'bg-[var(--bg-card)] text-slate-400 border-[var(--border-color)]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>{isLive ? 'Online' : 'Offline'}</span>
        </div>

        <NotificationBell />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>

    </header>
  );
}

