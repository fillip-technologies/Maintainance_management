import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tag, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle2, X, Upload, ImageIcon, Loader2,
  ChevronDown, ChevronRight, Boxes,
} from 'lucide-react';
import {
  getCategories, createCategory, deleteCategory, uploadCategoryLogo,
  getProductTypes, createProductType, uploadProductTypeLogo, deleteProductType,
} from '../../api/productsApi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState('');
  const [code, setCode]             = useState('');
  const [logoFile, setLogoFile]     = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingLogoId, setUploadingLogoId] = useState(null);
  const [toast, setToast]           = useState(null);
  const logoInputRef = useRef(null);
  const rowLogoRefs  = useRef({});

  // ── Product Types state ──────────────────────────────────────────────────────
  const [expandedCatId, setExpandedCatId]       = useState(null);
  const [productTypesByCat, setProductTypesByCat] = useState({}); // catId → ProductType[]
  const [ptLoading, setPtLoading]               = useState(null); // catId currently loading
  const [ptSaving, setPtSaving]                 = useState(null); // catId currently saving a new type
  const [ptUploadingId, setPtUploadingId]       = useState(null); // productTypeId uploading logo
  const [ptDeletingId, setPtDeletingId]         = useState(null); // productTypeId deleting
  const [newTypeName, setNewTypeName]           = useState('');
  const [newTypeFile, setNewTypeFile]           = useState(null);
  const [newTypePreview, setNewTypePreview]     = useState(null);
  const newTypeFileRefs = useRef({});
  const ptLogoRefs      = useRef({});

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

  const toggleExpand = async (catId) => {
    if (expandedCatId === catId) { setExpandedCatId(null); return; }
    setExpandedCatId(catId);
    setNewTypeName(''); setNewTypeFile(null); setNewTypePreview(null);
    if (!productTypesByCat[catId]) {
      setPtLoading(catId);
      try {
        const types = await getProductTypes(catId);
        setProductTypesByCat((prev) => ({ ...prev, [catId]: types }));
      } catch { /* ignore */ } finally { setPtLoading(null); }
    }
  };

  const handleAddProductType = async (catId) => {
    if (!newTypeName.trim()) return;
    setPtSaving(catId);
    try {
      let pt = await createProductType({ categoryId: catId, name: newTypeName.trim() });
      if (newTypeFile) {
        try { pt = await uploadProductTypeLogo(pt.id, newTypeFile); } catch { /* logo optional */ }
      }
      setProductTypesByCat((prev) => ({
        ...prev,
        [catId]: [...(prev[catId] ?? []), pt].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      setNewTypeName(''); setNewTypeFile(null); setNewTypePreview(null);
      if (newTypeFileRefs.current[catId]) newTypeFileRefs.current[catId].value = '';
      showToast(`Product type "${pt.name}" added.`);
    } catch (err) {
      showToast(err.message || 'Failed to add product type.');
    } finally { setPtSaving(null); }
  };

  const handlePtUploadLogo = async (pt) => {
    // triggered via ref file input
  };

  const handlePtLogoChange = async (pt, file) => {
    setPtUploadingId(pt.id);
    try {
      const updated = await uploadProductTypeLogo(pt.id, file);
      setProductTypesByCat((prev) => ({
        ...prev,
        [pt.categoryId]: (prev[pt.categoryId] ?? []).map((t) => (t.id === pt.id ? updated : t)),
      }));
      showToast(`Logo updated for "${pt.name}".`);
    } catch (err) {
      showToast(err.message || 'Logo upload failed.');
    } finally {
      setPtUploadingId(null);
      if (ptLogoRefs.current[pt.id]) ptLogoRefs.current[pt.id].value = '';
    }
  };

  const handleDeleteProductType = async (pt) => {
    setPtDeletingId(pt.id);
    try {
      await deleteProductType(pt.id);
      setProductTypesByCat((prev) => ({
        ...prev,
        [pt.categoryId]: (prev[pt.categoryId] ?? []).filter((t) => t.id !== pt.id),
      }));
      showToast(`Product type "${pt.name}" deleted.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete product type.');
    } finally { setPtDeletingId(null); }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { setError('Both name and code are required.'); return; }
    setSaving(true); setError('');
    try {
      let cat = await createCategory({ name: name.trim(), code: code.trim() });
      // Upload logo immediately after creation if one was selected
      if (logoFile) {
        try {
          cat = await uploadCategoryLogo(cat.id, logoFile);
        } catch {
          showToast(`Category "${cat.name}" created — logo upload failed, try again via the table.`);
        }
      }
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setName(''); setCode(''); setLogoFile(null); setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      showToast(`Category "${cat.name}" (${cat.code}) created.`);
    } catch (err) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (cat, file) => {
    setUploadingLogoId(cat.id);
    try {
      const updated = await uploadCategoryLogo(cat.id, file);
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      showToast(`Logo updated for "${cat.name}".`);
    } catch (err) {
      showToast(err.message || 'Logo upload failed.');
    } finally {
      setUploadingLogoId(null);
      if (rowLogoRefs.current[cat.id]) rowLogoRefs.current[cat.id].value = '';
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

            {/* Logo upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Logo <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="flex items-center gap-2">
                {logoPreview
                  ? <img src={logoPreview} alt="preview" className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" />
                  : <div className="w-9 h-9 rounded-xl border border-dashed border-slate-300 flex items-center justify-center shrink-0 bg-slate-50">
                      <ImageIcon size={14} className="text-slate-400" />
                    </div>
                }
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                  <Upload size={13} /> Browse
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                </label>
              </div>
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
                <th className="py-3 px-5">Logo</th>
                <th className="py-3 px-5">Code Prefix</th>
                <th className="py-3 px-5">Category Name</th>
                <th className="py-3 px-5">Units Assigned</th>
                <th className="py-3 px-5">Example Code</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-14 text-slate-400">Loading categories…</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-14 text-slate-400">No categories yet. Add one above.</td></tr>
              ) : (
                categories.map((cat) => {
                  const unitCount = cat._count?.devices ?? 0;
                  const canDelete = unitCount === 0;
                  return (
                    <React.Fragment key={cat.id}>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      {/* Logo cell */}
                      <td className="py-4 px-5">
                        <label className="flex items-center gap-2 cursor-pointer group w-fit" title="Click to upload logo">
                          {cat.imageUrl
                            ? <img src={cat.imageUrl} alt={cat.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:opacity-80 transition-opacity" />
                            : <div className="w-9 h-9 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center group-hover:border-amber-400 group-hover:bg-amber-50 transition-colors">
                                {uploadingLogoId === cat.id
                                  ? <Loader2 size={13} className="animate-spin text-amber-500" />
                                  : <ImageIcon size={13} className="text-slate-400 group-hover:text-amber-500" />}
                              </div>
                          }
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-amber-600 transition-colors">
                            {uploadingLogoId === cat.id ? 'Uploading…' : cat.imageUrl ? 'Change' : 'Upload'}
                          </span>
                          <input
                            ref={(el) => { rowLogoRefs.current[cat.id] = el; }}
                            type="file" accept="image/*" className="hidden"
                            disabled={uploadingLogoId === cat.id}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadLogo(cat, f); }}
                          />
                        </label>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[12px]">
                          {cat.code}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">{cat.name}</td>
                      <td className="py-4 px-5">
                        {unitCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            {unitCount} product{unitCount !== 1 ? 's' : ''}
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
                        <div className="flex items-center justify-end gap-2">
                          {/* Expand product types */}
                          <button
                            onClick={() => toggleExpand(cat.id)}
                            title="Manage product types"
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
                          >
                            {expandedCatId === cat.id
                              ? <ChevronDown size={15} />
                              : <ChevronRight size={15} />}
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            disabled={!canDelete || deletingId === cat.id}
                            title={canDelete ? `Delete "${cat.name}"` : `Cannot delete — ${unitCount} product(s) use this category`}
                            className={`p-2 rounded-xl border transition-colors ${
                              canDelete
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 cursor-pointer'
                                : 'text-slate-200 border-slate-100 cursor-not-allowed'
                            }`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expandable Product Types Panel ── */}
                    {expandedCatId === cat.id && (
                      <tr>
                        <td colSpan="6" className="bg-slate-50/70 border-b border-slate-200 px-6 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Boxes size={14} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-700">Product Types in "{cat.name}"</span>
                          </div>

                          {ptLoading === cat.id ? (
                            <div className="flex items-center gap-2 py-2 text-slate-400 text-xs">
                              <Loader2 size={13} className="animate-spin" /> Loading…
                            </div>
                          ) : (
                            <>
                              {/* List of existing product types */}
                              {(productTypesByCat[cat.id] ?? []).length === 0 ? (
                                <p className="text-[11px] text-slate-400 mb-3">No product types yet. Add one below.</p>
                              ) : (
                                <div className="flex flex-col divide-y divide-slate-200 mb-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
                                  {(productTypesByCat[cat.id] ?? []).map((pt) => (
                                    <div key={pt.id} className="flex items-center gap-3 px-4 py-2.5">
                                      {/* Logo upload */}
                                      <label className="cursor-pointer group/ptlogo shrink-0" title="Click to upload logo">
                                        {ptUploadingId === pt.id ? (
                                          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50">
                                            <Loader2 size={12} className="animate-spin text-indigo-500" />
                                          </div>
                                        ) : pt.imageUrl ? (
                                          <img src={pt.imageUrl} alt={pt.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 group-hover/ptlogo:opacity-70 transition-opacity" />
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center group-hover/ptlogo:border-indigo-400 group-hover/ptlogo:bg-indigo-50 transition-colors">
                                            <ImageIcon size={12} className="text-slate-400 group-hover/ptlogo:text-indigo-500" />
                                          </div>
                                        )}
                                        <input
                                          ref={(el) => { ptLogoRefs.current[pt.id] = el; }}
                                          type="file" accept="image/*" className="hidden"
                                          disabled={ptUploadingId === pt.id}
                                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePtLogoChange(pt, f); }}
                                        />
                                      </label>
                                      <span className="flex-1 text-xs font-semibold text-slate-800">{pt.name}</span>
                                      <span className="text-[10px] text-slate-400">{pt._count?.devices ?? 0} product{(pt._count?.devices ?? 0) !== 1 ? 's' : ''}</span>
                                      <button
                                        onClick={() => handleDeleteProductType(pt)}
                                        disabled={ptDeletingId === pt.id || (pt._count?.devices ?? 0) > 0}
                                        title={(pt._count?.devices ?? 0) > 0 ? 'Cannot delete — products reference this type' : `Delete "${pt.name}"`}
                                        className={`p-1.5 rounded-lg border transition-colors ${
                                          (pt._count?.devices ?? 0) > 0
                                            ? 'text-slate-200 border-slate-100 cursor-not-allowed'
                                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 cursor-pointer'
                                        }`}
                                      >
                                        {ptDeletingId === pt.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add new product type */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <input
                                  type="text"
                                  placeholder="New type name (e.g. LPR Camera)"
                                  value={newTypeName}
                                  onChange={(e) => setNewTypeName(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddProductType(cat.id); }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 flex-1 min-w-[180px]"
                                />
                                {/* Logo for new type */}
                                <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap">
                                  {newTypePreview
                                    ? <img src={newTypePreview} alt="preview" className="w-4 h-4 rounded object-cover" />
                                    : <ImageIcon size={12} />}
                                  {newTypeFile ? 'Logo selected' : 'Add logo'}
                                  <input
                                    ref={(el) => { newTypeFileRefs.current[cat.id] = el; }}
                                    type="file" accept="image/*" className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (!f) return;
                                      setNewTypeFile(f);
                                      setNewTypePreview(URL.createObjectURL(f));
                                    }}
                                  />
                                </label>
                                <button
                                  onClick={() => handleAddProductType(cat.id)}
                                  disabled={!newTypeName.trim() || ptSaving === cat.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap"
                                >
                                  {ptSaving === cat.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                  Add Type
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
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
