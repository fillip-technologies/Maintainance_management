import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Building2, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketClient } from '../api/socketClient';
import { getReplacementRequests } from '../api/replacementRequestsApi';
import NotificationBell from './NotificationBell';

export default function Header({ onToggleMobileSidebar }) {
  const { currentUser, isSuperAdmin, isClientAdmin, isZoneOfficer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingReplacements, setPendingReplacements] = useState(0);

  const canReviewReplacements = isSuperAdmin || isClientAdmin;
  const replacementPath = isSuperAdmin
    ? '/superadmin/replacement-requests'
    : isClientAdmin
    ? '/clientadmin/replacement-requests'
    : null;

  const refreshPendingReplacements = useCallback(async () => {
    if (!canReviewReplacements) return;
    try {
      const res = await getReplacementRequests({ status: 'pending', limit: 1 });
      setPendingReplacements(res?.totalItems ?? res?.meta?.totalItems ?? res?.items?.length ?? 0);
    } catch {
      // Best-effort
    }
  }, [canReviewReplacements]);

  useEffect(() => {
    if (!canReviewReplacements) return undefined;

    refreshPendingReplacements();

    const unsubConnect = socketClient.on('connect', refreshPendingReplacements);
    const offs = [
      'replacement:requested',
      'replacement:approved',
      'replacement:rejected',
      'replacement:completed',
    ].map((evt) => socketClient.on(evt, refreshPendingReplacements));

    const handleWindowRefresh = () => refreshPendingReplacements();
    window.addEventListener('fixly:replacement_updated', handleWindowRefresh);

    return () => {
      unsubConnect();
      offs.forEach((off) => off && off());
      window.removeEventListener('fixly:replacement_updated', handleWindowRefresh);
    };
  }, [canReviewReplacements, refreshPendingReplacements]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const companyName = currentUser?.clientName ?? '';

  const getPageMeta = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/replacement-requests')) {
      return { title: 'Replacement Requests', subtitle: 'Review and approve technician replacement requests' };
    }
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
    if (path.includes('/products') || path.includes('/cameras')) {
      return { title: 'Product Overview', subtitle: 'Inventory and equipment status across all categories' };
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
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-white shadow-xs shrink-0">
            <Building2 size={15} className="text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-white max-w-[160px] sm:max-w-[260px] truncate">
              {companyName}
            </span>
          </div>
        )}
      </div>

      {/* Right: Approve button, Notification bell, Logout */}
      <div className="flex-1 flex items-center justify-end gap-2.5">

        {/* Pending Approvals pill button matching reference design */}
        {canReviewReplacements && pendingReplacements > 0 && replacementPath && (
          <button
            type="button"
            onClick={() => navigate(replacementPath)}
            className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#052320]/90 hover:bg-[#07302c] border border-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_18px_rgba(16,185,129,0.45)] text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 animate-in fade-in duration-200"
            title={`${pendingReplacements} replacement request${pendingReplacements > 1 ? 's' : ''} awaiting approval — click to review`}
          >
            <ClipboardCheck size={18} strokeWidth={2.2} className="text-[#34d399] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight whitespace-nowrap">
              Pending Approvals
            </span>
            <span className="w-5.5 h-5.5 min-w-[22px] px-1 rounded-full bg-[#6ee7b7] text-[#022c22] font-black text-xs flex items-center justify-center leading-none shadow-xs shrink-0">
              {pendingReplacements > 99 ? '99+' : pendingReplacements}
            </span>
          </button>
        )}

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

