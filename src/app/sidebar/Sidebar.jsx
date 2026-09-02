import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Wrench,
  LogOut,
  Building2,
  Users,
  MapPin,
  CalendarCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen
}) {
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Navigation schema configured strictly by role
  const superAdminNav = [
    {
      group: 'Super Administrator',
      items: [
        {
          name: 'Platform Overview',
          path: '/superadmin/overview',
          icon: LayoutDashboard
        },
        {
          name: 'Client Users',
          path: '/superadmin/clients',
          icon: Building2
        },
        {
          name: 'Products & Inventory',
          path: '/superadmin/products',
          icon: Boxes
        }
      ]
    }
  ];

  const clientAdminNav = [
    {
      group: 'Facility Command',
      items: [
        {
          name: 'Facility Overview',
          path: '/clientadmin/overview',
          icon: LayoutDashboard
        },
        {
          name: 'Team & Roles',
          path: '/clientadmin/users',
          icon: Users
        },
        {
          name: 'Zone Officer',
          path: '/clientadmin/zone-officer',
          icon: MapPin
        },
        {
          name: 'Daily Logs',
          path: '/clientadmin/daily-logs',
          icon: CalendarCheck
        }
      ]
    }
  ];

  const navItems = isSuperAdmin ? superAdminNav : clientAdminNav;

  const getInitials = (name) => {
    if (!name) return 'FX';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.name || 'User';
  const roleLabel = isSuperAdmin ? 'Super Admin' : (currentUser?.role === 'client_admin' ? 'Client Admin' : 'Zone In-Charge');
  const orgLabel = isSuperAdmin ? 'Fixly HQ' : (currentUser?.facilityName || 'Facility');

  const sidebarContent = (
    <aside
      className={`h-full bg-white flex flex-col select-none transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-[280px] md:w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-[70px] px-3.5 flex items-center border-b border-slate-200 gap-2 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-[38px] h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-white relative shadow-md shrink-0 ${
              isSuperAdmin
                ? 'bg-gradient-to-br from-indigo-600 to-sky-500 shadow-indigo-100'
                : 'bg-gradient-to-br from-emerald-600 to-teal-500 shadow-emerald-100'
            }`}
          >
            <Wrench size={20} className="-rotate-12 hover:rotate-45 transition-transform duration-300" />
          </div>

          {/* Text hidden when collapsed */}
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 lowercase">fixly</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isSuperAdmin
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isSuperAdmin ? 'HQ' : 'Client'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {isSuperAdmin ? 'Enterprise Ops' : 'Facility Command'}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          className={`hidden md:flex w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isCollapsed ? 'absolute -right-3.5 top-5 z-50 shadow-md bg-white' : ''
          }`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        {/* Mobile Close Drawer Button */}
        <button
          className="md:hidden w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 flex flex-col gap-3">
        {navItems.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {/* Group Label (Hidden when collapsed) */}
            {!isCollapsed ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 animate-in fade-in duration-150">
                {group.group}
              </span>
            ) : (
              <div className="h-px bg-slate-100 my-1 mx-2" />
            )}

            <nav className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center transition-all group relative ${
                        isCollapsed
                          ? `w-11 h-11 mx-auto justify-center rounded-xl ${
                              isActive
                                ? isSuperAdmin
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold'
                                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-200 font-bold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`
                          : `justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium ${
                              isActive
                                ? isSuperAdmin
                                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 shadow-xs'
                                  : 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div
                        className={`flex items-center ${
                          isCollapsed ? 'justify-center' : 'gap-3 whitespace-nowrap'
                        }`}
                      >
                        <Icon
                          size={19}
                          className={`${
                            isCollapsed && isActive
                              ? 'text-white'
                              : isSuperAdmin
                              ? 'text-indigo-600 group-hover:text-indigo-700'
                              : 'text-emerald-600 group-hover:text-emerald-700'
                          } transition-colors shrink-0`}
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Card at Bottom */}
      <div
        className={`p-3 border-t border-slate-200 flex items-center bg-white gap-2 ${
          isCollapsed ? 'justify-center flex-col' : 'justify-between'
        }`}
      >
        <div
          className={`flex items-center overflow-hidden ${
            isCollapsed ? 'justify-center' : 'gap-2.5'
          }`}
          title={isCollapsed ? `${displayName} (${roleLabel})` : undefined}
        >
          <div
            className={`relative w-9 h-9 min-w-9 rounded-xl ${
              isSuperAdmin
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                : 'bg-gradient-to-br from-emerald-600 to-teal-600'
            } flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0`}
          >
            <span>{getInitials(displayName)}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden animate-in fade-in duration-150">
              <span className="text-xs font-bold text-slate-900 truncate">{displayName}</span>
              <span className="text-[10px] text-slate-500 truncate">
                {roleLabel} • {orgLabel.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        <button
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
      {/* 1. Desktop Sidebar */}
      <div
        className={`hidden md:block h-screen sticky top-0 left-0 z-40 border-r border-slate-200 transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </div>

      {/* 2. Mobile Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
