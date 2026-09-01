import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers } from '../../api/usersApi';
import UserStatCards from './components/UserStatCards';
import UserTable from './components/UserTable';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import { Search, UserPlus, CheckCircle2, X, RefreshCw } from 'lucide-react';

export default function ClientUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({ limit: 100 });
      const items = data?.items || [];
      const activeItems = items.filter((u) => u.accountStatus !== 'removed');
      setAllUsers(activeItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    const handleUsersChanged = () => {
      fetchUsers();
    };

    window.addEventListener('fixly:users_changed', handleUsersChanged);
    window.addEventListener('storage', handleUsersChanged);

    return () => {
      window.removeEventListener('fixly:users_changed', handleUsersChanged);
      window.removeEventListener('storage', handleUsersChanged);
    };
  }, [fetchUsers]);

  // Derived filtered users for the table based on search and role tab
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesRole = selectedRole === 'all' || u.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.zoneName && u.zoneName.toLowerCase().includes(q)) ||
        (u.specialization && u.specialization.toLowerCase().includes(q));

      return matchesRole && matchesSearch;
    });
  }, [allUsers, selectedRole, searchQuery]);

  const handleUserCreated = (newUser) => {
    setAllUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    showToast(`User "${newUser.name}" created successfully (${newUser.role.replace('_', ' ')})!`);
    fetchUsers();
  };

  const handleUserUpdated = (updatedUser) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
    showToast(`User "${updatedUser.name}" updated successfully!`);
    fetchUsers();
  };

  const handleUserDeleted = (deletedUser) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== deletedUser.id));
    showToast(`User "${deletedUser.name}" account marked as removed.`);
    fetchUsers();
  };

  const roleFilterTabs = [
    { id: 'all', label: 'All Team' },
    { id: 'zone_incharge', label: 'Zone In-Charges' },
    { id: 'zone_staff', label: 'Zone Staff' },
    { id: 'technician', label: 'Technicians' },
    { id: 'client_admin', label: 'Client Admins' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast Notification Alert */}
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

      {/* Top Headline Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Team & User Roles
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Manage operational team access, assign Zone In-Charges and Floor Staff, allocate certified Technicians, and configure user permissions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <UserPlus size={16} />
          <span>Add / Invite User</span>
        </button>
      </div>

      {/* Dynamic KPI Stats Cards */}
      <UserStatCards users={allUsers} />

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or assigned zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {roleFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-1 cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading && allUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading facility users...</span>
        </div>
      ) : (
        <UserTable users={filteredUsers} onEditUser={(u) => setEditingUser(u)} />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleUserCreated}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={handleUserUpdated}
        onDeleted={handleUserDeleted}
      />
    </div>
  );
}
