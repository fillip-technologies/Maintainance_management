import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
      console.error('Fetch companies error:', err);
      showToast('Could not load companies. Is the backend running?');
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
    showToast(`Company "${company.name}" ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    fetchCompanies();
  };

  const handleDelete = async (company) => {
    const count = clientCounts[company.id] || 0;
    if (count > 0) {
      showToast(`"${company.name}" still has ${count} client(s) — remove them first.`);
      return;
    }
    if (!window.confirm(`Delete company "${company.name}"? This cannot be undone.`)) return;
    setDeletingId(company.id);
    try {
      await deleteCompany(company.id);
      showToast(`Company "${company.name}" deleted.`);
      fetchCompanies();
    } catch (err) {
      showToast(err.message || 'Failed to delete company.');
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

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Companies & Organizations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Provision the top-level tenant organizations. Every client is created under a company.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, color: 'text-slate-900' },
          { label: 'Active', value: activeCount, color: 'text-emerald-600' },
          { label: 'Inactive', value: inactiveCount, color: 'text-slate-500' }
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{k.label}</span>
              <span className={`text-3xl font-extrabold tracking-tight ${k.color}`}>{k.value}</span>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs">
              <Building2 size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search company name..."
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

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'all', label: `All (${companies.length})`, active: 'bg-slate-900 text-white' },
            { key: 'active', label: `Active (${activeCount})`, active: 'bg-emerald-600 text-white' },
            { key: 'inactive', label: `Inactive (${inactiveCount})`, active: 'bg-slate-600 text-white' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === t.key ? `${t.active} shadow-xs` : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={fetchCompanies}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-1 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && companies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading companies...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700">No companies yet</span>
          <span className="text-xs text-slate-500 max-w-sm">
            Create your first organization to start onboarding clients and facilities.
          </span>
          <button
            onClick={openCreate}
            className="mt-1 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Company
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Clients</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((c) => {
                const status = c.status || 'active';
                const count = clientCounts[c.id] || 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                          status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{count}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit company"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c.id || count > 0}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={count > 0 ? 'Remove clients before deleting' : 'Delete company'}
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
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          A company with attached clients can't be deleted until its clients are removed.
        </p>
      )}

      {/* Create / Edit modal */}
      <CompanyModal
        isOpen={modalOpen}
        company={modalCompany}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
