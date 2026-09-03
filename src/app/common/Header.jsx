import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onToggleMobileSidebar }) {
  const { currentUser, isClientAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
        {isClientAdmin && companyName && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200">
            <Building2 size={15} className="text-indigo-500 shrink-0" />
            <span className="text-sm font-bold text-indigo-700 max-w-[260px] truncate">
              {companyName}
            </span>
          </div>
        )}
      </div>

      {/* Right: logout */}
      <div className="flex-1 flex items-center justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>

    </header>
  );
}
