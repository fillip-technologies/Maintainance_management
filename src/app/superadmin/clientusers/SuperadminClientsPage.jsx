import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Building2, UserPlus, Search, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { getUsers } from '../../api/usersApi';
import { getClients } from '../../api/clientsApi';
import { getCompanies } from '../../api/companiesApi';
import ClientStatCards from './components/ClientStatCards';
import ClientTable from './components/ClientTable';
import CreateClientModal from './components/CreateClientModal';
import EditClientModal from './components/EditClientModal';
import DeleteClientModal from './components/DeleteClientModal';

export default function SuperadminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'invited'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Client-driven fetch: start from Client records so orphan clients (no admin
  // user yet) are always visible. Users are joined in for display only.
  const fetchClientUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsData, usersData, companiesData] = await Promise.all([
        getClients({ limit: 100 }),
        getUsers({ role: 'client_admin', limit: 100 }),
        getCompanies({ limit: 100 })
      ]);

      // Index active admins by their clientId for O(1) lookup
      const adminByClientId = new Map(
        (usersData?.items || [])
          .filter((u) => u.clientId && u.accountStatus !== 'removed')
          .map((u) => [u.clientId, u])
      );
      const companiesById = new Map((companiesData?.items || []).map((c) => [c.id, c]));

      const mapped = (clientsData?.items || []).map((client) => {
        const admin = adminByClientId.get(client.id);
        const company = companiesById.get(client.companyId);
        return {
          id: admin?.id ?? null,               // user id — null when no admin exists
          clientId: client.id,                  // always set from the client record
          companyName: company?.name ?? '—',
          facilityName: client.facilityName ?? client.name ?? '—',
          adminName: admin?.name ?? null,
          email: admin?.email ?? null,
          location: client.location ?? '—',
          status: admin?.accountStatus ?? 'no_admin',
          createdAt: client.createdAt ?? new Date().toISOString()
        };
      });

      setClients(mapped);
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientUsers();

    const handleSync = () => {
      fetchClientUsers();
    };

    window.addEventListener('fixly:users_changed', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('fixly:users_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchClientUsers]);

  const handleClientCreated = (newClient) => {
    showToast(`Client Admin "${newClient.name || newClient.adminName}" created successfully!`);
    fetchClientUsers();
  };

  const handleClientUpdated = (updatedClient) => {
    showToast(`Client Admin "${updatedClient.name || updatedClient.adminName}" updated successfully!`);
    fetchClientUsers();
  };

  // Called by DeleteClientModal after the deletion is confirmed and done.
  const handleClientDeleted = (deletedClient) => {
    showToast(`Client "${deletedClient.facilityName || deletedClient.companyName || deletedClient.adminName}" removed.`);
    fetchClientUsers();
  };

  // Filter clients based on search and status
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.companyName?.toLowerCase().includes(q) ||
        c.facilityName?.toLowerCase().includes(q) ||
        c.adminName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

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
            Client Organizations & Admins
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Super Administrator console to provision enterprise client organizations and strictly manage Client Administrator accounts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <UserPlus size={16} />
          <span>Add Client User</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <ClientStatCards clients={clients} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search company, client admin name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            All Accounts ({clients.length})
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            Active ({clients.filter((c) => c.status === 'active').length})
          </button>

          <button
            onClick={() => setStatusFilter('invited')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'invited'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            Invited ({clients.filter((c) => c.status === 'invited').length})
          </button>

          <button
            onClick={() => setStatusFilter('no_admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'no_admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            No Admin ({clients.filter((c) => c.status === 'no_admin').length})
          </button>

          <button
            onClick={fetchClientUsers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-1 cursor-pointer"
            title="Refresh Client Users"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Client Table */}
      {loading && clients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading Client Admin accounts...</span>
        </div>
      ) : (
        <ClientTable
          clients={filteredClients}
          onEditClient={(client) => setEditingClient(client)}
          onDeleteClient={(client) => setDeletingClient(client)}
        />
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleClientCreated}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onUpdated={handleClientUpdated}
        onDelete={(client) => {
          setEditingClient(null);
          setDeletingClient(client);
        }}
      />

      {/* Delete Client Modal — shows dependency breakdown + download before confirming */}
      <DeleteClientModal
        isOpen={!!deletingClient}
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onDeleted={handleClientDeleted}
      />
    </div>
  );
}
