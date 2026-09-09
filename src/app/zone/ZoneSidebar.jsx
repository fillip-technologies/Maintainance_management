import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, ChevronLeft, ChevronRight, Wrench, LogOut, X, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar for the Zone Officer area (zone_incharge / zone_staff).
 *
 * Deliberately minimal: a zone officer only ever sees their own in-scope
 * facility overview — no user management, no client-wide or platform menus.
 * Kept as a separate component (rather than a branch inside the shared Sidebar)
 * so admin-only navigation can never leak in.
 */
export default function ZoneSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
}) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const navItems = [
    {
      group: 'Zone Operations',
      items: [
        { name: 'Facility Overview', path: '/zone/overview',   icon: LayoutDashboard },
        { name: 'My Team',           path: '/zone/team',       icon: Users },
        { name: 'Daily Log Entry',   path: '/zone/daily-logs', icon: BookOpen },
        { name: 'Raise Query',       path: '/zone/requests',   icon: ClipboardList },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'ZO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.name || 'Zone Officer';
  const roleLabel = currentUser?.role === 'zone_incharge' ? 'Zone In-Charge' : 'Zone Staff';

  const sidebarContent = (
    <aside
      className={`h-full bg-[var(--bg-sidebar)] flex flex-col select-none ${
        isCollapsed ? 'md:w-[78px]' : 'w-[280px] md:w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-[70px] px-4 flex items-center justify-between border-b border-[var(--border-color)] gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-[38px] h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-white relative shadow-md bg-gradient-to-br from-amber-600 to-orange-500 shadow-amber-950/40 overflow-hidden">
            {currentUser?.zoneLogoUrl
              ? <img src={currentUser.zoneLogoUrl} alt="zone logo" className="w-full h-full object-cover" />
              : <Wrench size={20} className="-rotate-12 hover:rotate-45 transition-transform duration-300" />
            }
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[var(--bg-sidebar)] bg-amber-400"></span>
          </div>

          <div className="flex flex-col whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white lowercase">fixly</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-800/60 text-amber-400">
                Zone
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Zone Operations</span>
          </div>
        </div>

        {/* Desktop Collapse Button */}
        <button
          className="hidden md:flex w-7 h-7 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-slate-400 hover:text-white items-center justify-center transition-colors cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile Close Drawer Button */}
        <button
          className="md:hidden w-8 h-8 rounded-xl bg-[var(--bg-card)] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-color)]"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-4">
        {navItems.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {group.group}
            </span>
            <nav className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group relative ${
                        isActive
                          ? 'bg-[var(--bg-card)] text-white font-bold border-l-4 border-amber-500 shadow-sm'
                          : 'text-slate-300 hover:bg-[var(--bg-card)] hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <Icon size={19} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-sidebar)] gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative w-9 h-9 min-w-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            <span>{getInitials(displayName)}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-sidebar)]"></span>
          </div>
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-xs font-bold text-white truncate">{displayName}</span>
            <span className="text-[10px] text-slate-400 truncate">{roleLabel}</span>
          </div>
        </div>

        <button
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          title="Sign Out"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block h-screen sticky top-0 left-0 z-40 border-r border-[var(--border-color)] transition-all duration-300 bg-[var(--bg-sidebar)] ${
          isCollapsed ? 'w-[78px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Mobile Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-[280px] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
