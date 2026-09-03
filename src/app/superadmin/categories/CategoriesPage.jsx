import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '../../api/productsApi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState('');
  const [code, setCode]             = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[CategoriesPage]', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { setError('Both name and code are required.'); return; }
    setSaving(true); setError('');
    try {
      const cat = await createCategory({ name: name.trim(), code: code.trim() });
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setName(''); setCode('');
      showToast(`Category "${cat.name}" (${cat.code}) created.`);
    } catch (err) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const unitCount = cat._count?.devices ?? 0;
    if (unitCount > 0) {
      showToast(`Cannot delete "${cat.name}" — ${unitCount} unit(s) are assigned to it. Retire those units first.`);
      return;
    }
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      showToast(`Category "${cat.name}" deleted.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalUnits = categories.reduce((s, c) => s + (c._count?.devices ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"><X size={13} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Categories
          </h1>
          <p className="text-xs text-slate-500">
            Global list managed by you. Each category's code prefix auto-generates unit codes (e.g. CAM-000001).
            Categories with units assigned cannot be deleted.
          </p>
        </div>
        <button onClick={fetch_} disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-40 self-start"
          title="Refresh">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Categories', value: categories.length,                         color: 'text-slate-900' },
          { label: 'Units Assigned',   value: totalUnits,                                 color: 'text-indigo-600' },
          { label: 'Empty (deletable)',value: categories.filter(c=>(c._count?.devices??0)===0).length, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col shadow-xs">
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Create form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
            <p className="text-[11px] text-slate-500">The code prefix is normalized to uppercase letters and digits (e.g. "CAM", "NET01").</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              <AlertTriangle size={13} />{error}
            </div>
          )}

          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-700">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Security & CCTV Cameras"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-40">
              <label className="text-xs font-bold text-slate-700">
                Code Prefix <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CAM"
                value={code}
                maxLength={12}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim() || !code.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm shadow-amber-200"
            >
              <Plus size={14} />
              {saving ? 'Creating…' : 'Add Category'}
            </button>
          </div>

          {code && (
            <p className="text-[11px] text-slate-500">
              Units in this category will be coded{' '}
              <span className="font-mono font-bold text-slate-700">{code}-000001</span>,{' '}
              <span className="font-mono font-bold text-slate-700">{code}-000002</span>…
            </p>
          )}
        </form>
      </div>

      {/* Category table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Tag size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-slate-900">All Categories</span>
          <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            {categories.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Code Prefix</th>
                <th className="py-3 px-5">Category Name</th>
                <th className="py-3 px-5">Units Assigned</th>
                <th className="py-3 px-5">Example Code</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-14 text-slate-400">Loading categories…</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-14 text-slate-400">No categories yet. Add one above.</td></tr>
              ) : (
                categories.map((cat) => {
                  const unitCount = cat._count?.devices ?? 0;
                  const canDelete = unitCount === 0;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[12px]">
                          {cat.code}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">{cat.name}</td>
                      <td className="py-4 px-5">
                        {unitCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            {unitCount} unit{unitCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            Empty — can delete
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-500 text-[11px]">
                        {cat.code}-000001
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={!canDelete || deletingId === cat.id}
                          title={
                            canDelete
                              ? `Delete "${cat.name}"`
                              : `Cannot delete — ${unitCount} unit(s) use this category`
                          }
                          className={`p-2 rounded-xl border transition-colors ${
                            canDelete
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 cursor-pointer'
                              : 'text-slate-200 border-slate-100 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
