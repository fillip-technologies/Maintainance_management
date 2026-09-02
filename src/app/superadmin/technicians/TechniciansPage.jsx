import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Search, Trash2, RefreshCw, Mail, CheckCircle2, X } from 'lucide-react';
import { getTechnicians, deleteTechnician } from '../../api/techniciansApi';
import CreateTechnicianModal from './components/CreateTechnicianModal';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTechnicians({ limit: 100, search: search.trim() || undefined });
      setTechnicians(data?.items || []);
    } catch (err) {
      console.error('[TechniciansPage] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const handleDelete = async (tech) => {
    const name = tech.user?.name || 'this technician';
    if (!window.confirm(`Delete ${name}? This permanently removes their login account and profile.`)) {
      return;
    }
    setDeletingId(tech.id);
    try {
      await deleteTechnician(tech.id);
      setTechnicians((prev) => prev.filter((t) => t.id !== tech.id));
      showToast(`Technician "${name}" removed.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete technician.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (tech) => {
    showToast(`Technician "${tech?.user?.name || 'new technician'}" created — credentials emailed.`);
    fetchTechnicians();
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
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
      <div className="flex items-center justify-between gap-4 flex-wrap py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Technicians</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Field service engineers. Day-to-day work is managed in the mobile app — here you create and remove technician accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTechnicians}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-amber-200 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 text-xs max-w-sm shadow-xs">
        <Search size={15} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-slate-900 outline-hidden w-full text-xs placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Registered Technicians</h3>
          <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            {technicians.length}
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400">Loading technicians…</td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400">
                    No technicians yet. Click “Add Technician” to create one.
                  </td>
                </tr>
              ) : (
                technicians.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center font-bold text-[11px] text-white shrink-0">
                          {getInitials(tech.user?.name)}
                        </div>
                        <span className="font-bold text-slate-900">{tech.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{tech.user?.email || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {tech.specialization ? (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {tech.specialization}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(tech)}
                        disabled={deletingId === tech.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Delete Technician"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTechnicianModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
