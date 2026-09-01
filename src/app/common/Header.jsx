import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  onToggleMobileSidebar
}) {
  const { isSuperAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 shadow-xs gap-3">
      {/* Left: Mobile Hamburger & Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-[420px]">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={19} />
        </button>

        {/* Global Search Input */}
        <div className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 gap-2 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={isSuperAdmin ? "Search all assets, facilities..." : "Search tickets, assets..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-900 text-xs sm:text-sm w-full outline-hidden placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Area: Dedicated Logout Button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          title="Sign out of account"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
