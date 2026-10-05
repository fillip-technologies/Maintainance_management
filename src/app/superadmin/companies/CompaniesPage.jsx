import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  X,
  CheckCircle2,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { getCompanies, deleteCompany } from '../../api/companiesApi';
import { getClients } from '../../api/clientsApi';
import CompanyModal from './components/CompanyModal';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [clientCounts, setClientCounts] = useState({}); // companyId -> #clients
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [modalCompany, setModalCompany] = useState(null); // null = closed
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const [companiesData, clientsData] = await Promise.all([
        getCompanies({ limit: 100 }),
        getClients({ limit: 100 })
      ]);
      setCompanies(companiesData?.items || []);

      const counts = {};
      for (const c of clientsData?.items || []) {
        counts[c.companyId] = (counts[c.companyId] || 0) + 1;
      }
      setClientCounts(counts);
    } catch (err) {
      console.error('Fetch organizations error:', err);
      showToast('Could not load organizations. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openCreate = () => {
    setModalCompany(null);
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setModalCompany(company);
    setModalOpen(true);
  };

  const handleSaved = (company, mode) => {
    showToast(`Organization "${company.name}" ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    fetchCompanies();
  };

  const handleDelete = async (company) => {
    const count = clientCounts[company.id] || 0;
    const msg = count > 0
      ? `Delete organization "${company.name}"? This will also delete its ${count} client(s) and all associated zones, devices, and users. This cannot be undone.`
      : `Delete organization "${company.name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    setDeletingId(company.id);
    try {
      await deleteCompany(company.id);
      showToast(`Organization "${company.name}" deleted.`);
      fetchCompanies();
    } catch (err) {
      showToast(err.message || 'Failed to delete organization.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || c.name?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (c.status || 'active') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchQuery, statusFilter]);

  const activeCount = companies.filter((c) => (c.status || 'active') === 'active').length;
  const inactiveCount = companies.length - activeCount;
  const locationsCount = new Set(companies.filter((c) => c.location).map((c) => c.location)).size;
  const totalClientsCount = Object.values(clientCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-2)] text-[var(--ink)] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[var(--line)] animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--ink-3)] hover:text-[var(--ink)] p-1 ml-2 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            Organizations
          </h1>
          <p className="text-xs md:text-sm text-[var(--ink-3)] max-w-2xl">
            Manage top-level organizations. Each client facility is created under an organization.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus size={16} />
          <span>Add Organization</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Organizations', value: companies.length, color: 'text-[var(--ink)]', badge: 'Registered orgs' },
          { label: 'Active Orgs', value: activeCount, color: 'text-emerald-700 dark:text-emerald-400', badge: 'In operation' },
          { label: 'Inactive Orgs', value: inactiveCount, color: 'text-[var(--ink-3)]', badge: 'Suspended/Inactive' },
          { label: 'Managed Clients', value: totalClientsCount, color: 'text-indigo-700 dark:text-indigo-400', badge: 'Active sites' },
        ].map((k) => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-center justify-between shadow-md transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-3)]">{k.label}</span>
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${k.color}`}>{k.value}</span>
              <span className="text-[11px] text-slate-500 font-medium">{k.badge}</span>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-xs shrink-0">
              <Building2 size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)] transition-all">
          <Search size={16} className="text-[var(--ink-3)] shrink-0" />
          <input
            type="text"
            placeholder="Search organization name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-[var(--ink)] w-full outline-hidden placeholder:text-slate-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize ${
                statusFilter === s
                  ? s === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : s === 'inactive'
                    ? 'bg-[var(--line)] text-[var(--ink)] shadow-xs'
                    : 'bg-[var(--accent)] text-white shadow-xs'
                  : 'bg-[var(--surface-3)] text-[var(--ink-2)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]'
              }`}
            >
              {s} ({s === 'all' ? companies.length : s === 'active' ? activeCount : inactiveCount})
            </button>
          ))}
          <button
            onClick={fetchCompanies}
            disabled={loading}
            className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition-colors ml-1 cursor-pointer"
            title="Refresh organizations"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && companies.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-[var(--ink-3)]">Loading organizations...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-3)] border border-[var(--line)] text-[var(--ink-3)] flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <span className="text-sm font-bold text-[var(--ink)]">No organizations yet</span>
          <span className="text-xs text-[var(--ink-3)] max-w-sm">
            Create your first organization to start onboarding clients and facilities.
          </span>
          <button
            onClick={openCreate}
            className="mt-1 flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Organization
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)]/80 border-b border-[var(--border-color)] text-[11px] font-bold uppercase tracking-wider text-[var(--ink-3)]">
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Clients</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/60 text-xs text-[var(--ink-2)]">
              {filtered.map((c) => {
                const status = c.status || 'active';
                const count = clientCounts[c.id] || 0;
                return (
                  <tr key={c.id} className="hover:bg-[var(--bg-main)]/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          <Building2 size={18} />
                        </div>
                        <span className="font-bold text-[var(--ink)] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                          status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                            : 'bg-[var(--surface-3)] text-[var(--ink-3)] border-[var(--line)]'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/superadmin/clients?companyId=${c.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors group/link"
                        title={`View and manage clients for ${c.name}`}
                      >
                        <span>{count}</span>
                        <span className="text-[10px] text-slate-500 font-normal group-hover/link:text-blue-300">
                          manage →
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--ink-3)]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-[var(--ink-3)] hover:text-blue-700 dark:hover:text-blue-400 hover:bg-[var(--surface-3)] rounded-lg transition-colors cursor-pointer"
                          title="Edit organization"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c.id}
                          className="p-1.5 text-[var(--ink-3)] hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete organization"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {companies.some((c) => (clientCounts[c.id] || 0) > 0) && (
        <p className="text-[11px] text-[var(--ink-3)] flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Deleting an organization with clients will also remove those clients and all their data.
        </p>
      )}

      <CompanyModal
        isOpen={modalOpen}
        company={modalCompany}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
