import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, PanelLeftClose, PanelLeftOpen, MapPin, Building2, Globe2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navFor, ROLE_LABEL } from '../ui/nav';
import { BrandMark, Avatar } from '../ui/primitives';

/**
 * Navigation rail for every role. The menu itself comes from `navFor(role)`,
 * so zone officers only ever see zone destinations.
 */
export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen = false, setIsMobileOpen }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const role = currentUser?.role;
  const groups = navFor(role);

  const closeMobile = () => setIsMobileOpen && setIsMobileOpen(false);

  const handleSignOut = async () => {
    closeMobile();
    await logout();
    navigate('/login', { replace: true });
  };

  const scope =
    role === 'super_admin'
      ? { icon: Globe2, label: 'All clients', sub: 'Fillip Technologies' }
      : role === 'zone_incharge' || role === 'zone_staff'
        ? { icon: MapPin, label: currentUser?.zoneName || 'My location', sub: currentUser?.clientName || 'Location' }
        : { icon: Building2, label: currentUser?.clientName || 'My organisation', sub: 'Client workspace' };

  const content = (collapsed) => (
    <aside className="h-full flex flex-col bg-[var(--rail)] text-[var(--rail-ink)] select-none">
      {/* Brand */}
      <div className={`h-[64px] flex items-center shrink-0 ${collapsed ? 'justify-center' : 'px-5 justify-between'}`}>
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} />
          {!collapsed && (
            <div className="leading-none">
              <div className="text-[18px] font-[680] tracking-[-0.03em]">fixly</div>
              <div className="text-[10.5px] text-[var(--rail-muted)] mt-[3px] tracking-[0.01em]">Equipment care</div>
            </div>
          )}
        </div>
        <button
          className="md:hidden w-8 h-8 grid place-items-center rounded-lg text-[var(--rail-muted)] hover:text-white hover:bg-[var(--rail-active)] cursor-pointer"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scope chip — whose equipment am I looking at? */}
      <div className={`${collapsed ? 'px-3' : 'px-3.5'} pb-3`}>
        <div
          className={`flex items-center gap-2.5 rounded-[11px] bg-[var(--rail-2)] border border-[var(--rail-line)] ${collapsed ? 'justify-center h-10' : 'px-3 py-2.5'}`}
          title={collapsed ? scope.label : undefined}
        >
          <span className="w-7 h-7 rounded-[8px] grid place-items-center bg-white/[0.06] text-[var(--rail-ink)] shrink-0">
            <scope.icon size={15} />
          </span>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="text-[12.5px] font-[620] truncate">{scope.label}</div>
              <div className="text-[10.5px] text-[var(--rail-muted)] truncate">{scope.sub}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-4 fx-scroll">
        {groups.map((g) => (
          <div key={g.group} className="mt-3 first:mt-1">
            {collapsed ? (
              <div className="h-px mx-3 my-2 bg-[var(--rail-line)]" />
            ) : (
              <div className="px-3 pb-1.5 font-mono text-[10px] font-[500] tracking-[0.1em] uppercase text-[var(--rail-muted)]/80">
                {g.group}
              </div>
            )}
            <div className="flex flex-col gap-[2px]">
              {g.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center h-9 rounded-[9px] text-[13px] transition-colors ${
                      collapsed ? 'justify-center w-11 mx-auto' : 'gap-3 px-3'
                    } ${
                      isActive
                        ? 'bg-[var(--rail-active)] text-white font-[600]'
                        : 'text-[var(--rail-muted)] hover:text-[var(--rail-ink)] hover:bg-white/[0.035] font-[500]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-[var(--ok)]" />
                      )}
                      <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: user + collapse */}
      <div className="border-t border-[var(--rail-line)] p-2.5 flex flex-col gap-1">
        <div className={`flex items-center gap-2.5 rounded-[10px] ${collapsed ? 'justify-center py-1.5' : 'px-2 py-1.5'}`}>
          <Avatar name={currentUser?.name || 'User'} size={30} tone="#2a313b" />
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[12.5px] font-[600] truncate">{currentUser?.name || 'User'}</div>
              <div className="text-[10.5px] text-[var(--rail-muted)] truncate">{ROLE_LABEL[role] ?? 'User'}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="w-8 h-8 grid place-items-center rounded-lg text-[var(--rail-muted)] hover:text-[#ff8a80] hover:bg-white/[0.05] cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!collapsed)}
            className={`hidden md:flex items-center h-8 rounded-lg text-[12px] text-[var(--rail-muted)] hover:text-[var(--rail-ink)] hover:bg-white/[0.035] cursor-pointer ${
              collapsed ? 'justify-center' : 'gap-2.5 px-3'
            }`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            {!collapsed && 'Collapse'}
          </button>
        )}
        {collapsed && (
          <button
            onClick={handleSignOut}
            className="hidden md:grid place-items-center h-8 rounded-lg text-[var(--rail-muted)] hover:text-[#ff8a80] hover:bg-white/[0.05] cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div
        className={`hidden md:block h-screen sticky top-0 z-40 shrink-0 transition-[width] duration-200 ${
          isCollapsed ? 'w-[68px]' : 'w-[248px]'
        }`}
      >
        {content(isCollapsed)}
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={closeMobile} />
          <div className="relative z-50 h-full w-[272px] shadow-2xl" style={{ animation: 'fx-slide-in 200ms ease-out both', animationName: 'fx-rise' }}>
            {content(false)}
          </div>
        </div>
      )}
    </>
  );
}
