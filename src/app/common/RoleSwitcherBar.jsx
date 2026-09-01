import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, ArrowRightLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleSwitcherBar() {
  const { currentRole, switchDemoRole, currentUser, isAuthenticated, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !currentUser) {
    return null; // Don't show on login screen
  }

  const handleRoleChange = async (role) => {
    try {
      await switchDemoRole(role);
      if (role === 'super_admin') {
        navigate('/superadmin/overview');
      } else {
        navigate('/clientadmin/overview');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-50 select-none">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-semibold text-slate-300">Backend API Session:</span>
        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {currentUser.name} ({currentUser.role === 'super_admin' ? 'Super Admin' : 'Client Admin'})
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Strictly ONLY Super Admin is allowed to switch views or inspect Client Admin */}
        {isSuperAdmin && (
          <>
            <span className="text-slate-400 text-[11px] flex items-center gap-1 hidden md:flex">
              <ArrowRightLeft size={13} className="text-indigo-400" /> Switch View:
            </span>

            <button
              onClick={() => handleRoleChange('super_admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currentRole === 'super_admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Super Admin HQ View"
            >
              <Shield size={13} />
              <span>Super Admin</span>
            </button>

            <button
              onClick={() => handleRoleChange('client_admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currentRole === 'client_admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Inspect Client Admin View"
            >
              <UserCheck size={13} />
              <span>Client Admin (Apex)</span>
            </button>
          </>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
