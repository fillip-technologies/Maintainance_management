import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle2, X, Globe, Tag
} from 'lucide-react';
import { getIssueCategories, createIssueCategory, deleteIssueCategory } from '../../api/issueCategoriesApi';
import { getCategories } from '../../api/productsApi';

export default function DefectCategoriesPage() {
  const [items, setItems]           = useState([]);
  const [productCats, setProductCats] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState('');
  const [scopeId, setScopeId]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getIssueCategories(),
        getCategories(),
      ]);
      setItems(Array.isArray(cats) ? cats : []);
      setProductCats(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error('[DefectCategoriesPage]', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hasOther = items.some((c) => c.name.toLowerCase() === 'other' && !c.categoryId);

  const handleQuickOther = async () => {
    setSaving(true);
    try {
      const created = await createIssueCategory({ name: 'Other', categoryId: null });
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('"Other" global category created.');
    } catch (err) {
      showToast(err.message || 'Failed to create "Other" category.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Category name is required.'); return; }
    setSaving(true); setError('');
    try {
      const created = await createIssueCategory({ name: name.trim(), categoryId: scopeId || null });
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName(''); setScopeId('');
      showToast(`Defect category "${created.name}" created.`);
    } catch (err) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      await deleteIssueCategory(item.id);
      setItems((prev) => prev.filter((c) => c.id !== item.id));
      showToast(`"${item.name}" deleted.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const globals   = items.filter((c) => !c.categoryId);
  const specific  = items.filter((c) =>  c.categoryId);

  const productCatName = (id) => productCats.find((p) => p.id === id)?.name ?? id;

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
            Defect Categories
          </h1>
          <p className="text-xs text-slate-500">
            Curate the category list shown in the "Raise a Query" dropdown. Global categories apply to all units;
            product-scoped ones appear only when that product type is selected.
          </p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer disabled:opacity-40 self-start"
          title="Refresh">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Categories', value: items.length,    color: 'text-slate-900' },
          { label: 'Global',           value: globals.length,  color: 'text-indigo-600' },
          { label: 'Product-scoped',   value: specific.length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col shadow-xs">
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Quick-add "Other" banner */}
      {!hasOther && !loading && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-amber-900">No "Other" global category yet</span>
            <span className="text-[11px] text-amber-700">
              The "Raise a Query" form lets users pick "Other" — it needs a matching category to work.
            </span>
          </div>
          <button
            onClick={handleQuickOther}
            disabled={saving}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Plus size={13} />
            Create "Other"
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Defect Category</h3>
            <p className="text-[11px] text-slate-500">
              Leave scope as "Global" to show for all product types; pick a product category to scope it.
            </p>
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
                placeholder="e.g. Not Working, Physical Damage, Other"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-56">
              <label className="text-xs font-bold text-slate-700">Scope</label>
              <select
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="">Global (all product types)</option>
                {productCats.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm shadow-indigo-200"
            >
              <Plus size={14} />
              {saving ? 'Creating…' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      {/* Category table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <ShieldAlert size={16} className="text-indigo-600" />
          <span className="text-sm font-bold text-slate-900">All Defect Categories</span>
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Category Name</th>
                <th className="py-3 px-5">Scope</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-14 text-slate-400">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-14 text-slate-400">No defect categories yet. Add one above.</td></tr>
              ) : (
                items.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-4 px-5">
                      {cat.categoryId ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          <Tag size={10} />
                          {productCatName(cat.categoryId)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          <Globe size={10} />
                          Global
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        title={`Delete "${cat.name}"`}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-40"
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
    </div>
  );
}
