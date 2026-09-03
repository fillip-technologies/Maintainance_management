import React, { useState, useEffect, useCallback } from 'react';
import { Boxes, Plus, Search, Trash2, RefreshCw, CheckCircle2, X, Package, FileSpreadsheet } from 'lucide-react';
import { getProducts, createProduct, deleteProduct, getCategories } from '../../api/productsApi';
import ExcelImportModal from '../../common/ExcelImportModal';

const emptyForm = {
  name: '',
  categoryId: '',
  price: '',
  purchaseDate: '',
  location: ''
};

export default function ClientInventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Company is derived server-side from the client_admin's own org.
      const data = await getProducts({ limit: 200, search: search.trim() || undefined });
      setProducts(data?.items || []);
    } catch (err) {
      console.error('[ClientInventory] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats || []))
      .catch((e) => console.error('[ClientInventory] categories:', e.message));
  }, []);

  const openAdd = () => {
    setErrorMsg(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setIsAddOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.categoryId) { setErrorMsg('Please choose a category.'); return; }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name.trim(),
        categoryId: form.categoryId,          // company locked to caller's org by backend
        unitPrice: form.price ? Number(form.price) : undefined,
        purchaseDate: form.purchaseDate || undefined,
        location: form.location || undefined
        // no zoneId → unit is added "in stock"; deploy to a zone later
      });
      setIsAddOpen(false);
      setForm(emptyForm);
      showToast('Unit added to inventory (in stock).');
      fetchProducts();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Retire "${p.name}" (${p.code}) from inventory?`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      showToast(`"${p.name}" retired.`);
    } catch (err) {
      showToast(err.message || 'Failed to retire unit.');
    }
  };

  const onImported = (res) => {
    showToast(`Imported ${res.created} unit(s)${res.skipped ? `, ${res.skipped} skipped` : ''}.`);
    fetchProducts();
  };

  const money = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—');

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle2 size={16} /></div>
          <span className="text-xs font-semibold">{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Hardware units for your organization. Each unit has a unique code; changes are logged for the platform administrator.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchProducts} disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-40" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button type="button" onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs cursor-pointer">
            <FileSpreadsheet size={15} className="text-emerald-600" /> <span>Bulk Import</span>
          </button>
          <button type="button" onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer">
            <Plus size={16} /> <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 text-xs max-w-sm shadow-xs">
        <Search size={15} className="text-slate-400" />
        <input type="text" placeholder="Search units…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-slate-900 outline-hidden w-full text-xs placeholder:text-slate-400" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Units</h3>
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{products.length}</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location / Zone</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Loading inventory…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-400">No units yet. Add one or bulk import.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"><Package size={16} className="text-slate-400" /></div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap">{p.category || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.inStock ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">In stock</span>
                      ) : (
                        <span className="text-slate-700 font-medium">{p.zoneName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{money(p.unitPrice)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button type="button" onClick={() => handleDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Retire unit">
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

      {/* Add Unit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"><Boxes size={20} /></div>
                <div>
                  <h2 className="text-base font-bold">Add Unit</h2>
                  <p className="text-xs text-slate-400">A unique code is generated automatically. Added in stock.</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 overflow-y-auto">
              {errorMsg && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">{errorMsg}</div>}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Unit Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., 4K Dome Camera"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Category <span className="text-rose-500">*</span></label>
                  <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer">
                    <option value="" disabled>Select a category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Price (₹)</label>
                  <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="optional"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="optional"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting || !form.name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Adding…' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImported={onImported} />
    </div>
  );
}
