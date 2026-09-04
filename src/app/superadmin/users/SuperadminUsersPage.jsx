import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, X, RefreshCw, Building2, UserPlus, CheckCircle2
} from 'lucide-react';
import { getClients } from '../../api/clientsApi';
import { getUsers } from '../../api/usersApi';
import UserStatCards from '../../clientadmin/users/components/UserStatCards';
import UserTable from '../../clientadmin/users/components/UserTable';
import CreateUserModal from '../../clientadmin/users/components/CreateUserModal';
import EditUserModal from '../../clientadmin/users/components/EditUserModal';

export default function SuperadminUsersPage() {
  const [clients, setClients]             = useState([]);
  const [selectedClientId, setSelected]   = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  const [allUsers, setAllUsers]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser]   = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load all clients once
  useEffect(() => {
    getClients({ limit: 100 })
      .then((d) => {
        const items = d.items ?? [];
        setClients(items);
        if (items.length === 1) setSelected(items[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingClients(false));
  }, []);

  const fetchUsers = useCallback(async (clientId) => {
    if (!clientId) { setAllUsers([]); return; }
    setLoading(true);
    try {
      const data = await getUsers({ clientId, limit: 100 });
      setAllUsers((data?.items ?? []).filter((u) => u.accountStatus !== 'removed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAllUsers([]); setSearchQuery(''); setSelectedRole('all');
    fetchUsers(selectedClientId);
  }, [selectedClientId, fetchUsers]);

  // Cross-page sync
  useEffect(() => {
    const handler = () => fetchUsers(selectedClientId);
    window.addEventListener('fixly:users_changed', handler);
    return () => window.removeEventListener('fixly:users_changed', handler);
  }, [fetchUsers, selectedClientId]);

  const filteredUsers = useMemo(() => allUsers.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      || u.name?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || u.zoneAssignments?.some((a) => a.zone?.name?.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  }), [allUsers, selectedRole, searchQuery]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const roleFilterTabs = [
    { id: 'all',          label: 'All Users' },
    { id: 'client_admin', label: 'Client Admins' },
    { id: 'zone_incharge', label: 'Zone In-Charges' },
    { id: 'zone_staff',   label: 'Zone Staff' },
    { id: 'technician',   label: 'Technicians' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Create and manage all users — client admins, zone in-charges, and zone staff — across any organization.
          </p>
        </div>
        {selectedClientId && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer shrink-0"
          >
            <UserPlus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Organization selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 size={15} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-700">Organization:</span>
        </div>
        <select
          value={selectedClientId}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loadingClients}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60"
        >
          <option value="">{loadingClients ? 'Loading…' : '— select an organization —'}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.facilityName ?? c.name}{c.location ? ` · ${c.location}` : ''}
            </option>
          ))}
        </select>
        {selectedClientId && (
          <button
            onClick={() => fetchUsers(selectedClientId)}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* No org selected */}
      {!selectedClientId && !loadingClients && (
        <div className="flex flex-col items-center gap-3 p-16 bg-white rounded-2xl border border-slate-200 text-center">
          <Users size={28} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Select an organization above to manage its users.</p>
        </div>
      )}

      {selectedClientId && (
        <>
          {/* Stat cards */}
          <UserStatCards users={allUsers} />

          {/* Search + role filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, or zone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {roleFilterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* User table */}
          {loading && allUsers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Loading users…</span>
            </div>
          ) : (
            <UserTable users={filteredUsers} onEditUser={(u) => setEditingUser(u)} />
          )}
        </>
      )}

      {/* Create modal — passes clientId so super_admin can create users for the selected org */}
      <CreateUserModal
        isOpen={isCreateOpen}
        clientId={selectedClientId}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newUser) => {
          showToast(`User "${newUser.name}" created (${newUser.role.replace(/_/g, ' ')}).`);
          fetchUsers(selectedClientId);
        }}
      />

      {/* Edit modal */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        clientId={selectedClientId}
        onClose={() => setEditingUser(null)}
        onUpdated={(u) => {
          showToast(`User "${u.name}" updated.`);
          fetchUsers(selectedClientId);
        }}
        onDeleted={(u) => {
          showToast(`User "${u.name}" removed.`);
          fetchUsers(selectedClientId);
        }}
      />
    </div>
  );
}
