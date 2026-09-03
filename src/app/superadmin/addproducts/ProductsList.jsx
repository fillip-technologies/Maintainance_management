import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Boxes, Plus, Search, RefreshCw, X, Package, FileSpreadsheet,
  MapPin, AlertTriangle, Zap, Archive, Clock, ShieldAlert,
  Building2, CheckCircle2, UserCheck, Calendar, ClipboardList
} from 'lucide-react';
import {
  getProducts, createProduct, deployProduct, retireProduct,
  getCategories, createCategory
} from '../../api/productsApi';
import { getCompanies } from '../../api/companiesApi';
import { getClients } from '../../api/clientsApi';
import { getZones } from '../../api/zonesApi';
import ExcelImportModal from '../../common/ExcelImportModal';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_META = {
  provisioned:       { label: 'In Stock',    color: 'bg-slate-100 text-slate-600 border-slate-300',      dot: 'bg-slate-400' },
  active:            { label: 'Active',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  under_maintenance: { label: 'Maintenance',  color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  faulty:            { label: 'Faulty',       color: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  retired:           { label: 'Retired',      color: 'bg-slate-100 text-slate-400 border-slate-200',      dot: 'bg-slate-300' },
};
const STATUS_TABS = ['all', 'provisioned', 'active', 'under_maintenance', 'faulty', 'retired'];

const money = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—');
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (v) => v ? new Date(v).toLocaleString(undefined, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.provisioned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold whitespace-nowrap ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDismiss }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span className="text-xs font-semibold">{msg}</span>
      <button onClick={onDismiss} className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"><X size={13} /></button>
    </div>
  );
}

// ─── Add Unit modal ───────────────────────────────────────────────────────────
function AddUnitModal({ companies, categories, onClose, onAdded, onCategoryCreated }) {
  const [step, setStep] = useState(1); // 1 = pick org, 2 = fill form
  const [companyId, setCompanyId] = useState('');
  const [clients, setClients] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [form, setForm] = useState({ name:'', categoryId:'', zoneId:'', price:'', purchaseDate:'', quantity:1 });
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [error, setError] = useState('');
  // Inline new-category creation
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [savingCat, setSavingCat] = useState(false);
  const [catError, setCatError] = useState('');

  // When org changes, load its client + zones
  useEffect(() => {
    if (!companyId) return;
    setLoadingZones(true);
    setZones([]);
    getClients({ companyId, limit: 10 })
      .then(async (res) => {
        const client = res?.items?.[0];
        if (!client) return;
        setClients([client]);
        const z = await getZones({ clientId: client.id, limit: 100 });
        setZones(z?.items ?? []);
      })
      .catch(console.error)
      .finally(() => setLoadingZones(false));
  }, [companyId]);

  const handleCreateCat = async () => {
    if (!newCatName.trim() || !newCatCode.trim()) { setCatError('Both name and code are required.'); return; }
    setSavingCat(true); setCatError('');
    try {
      const created = await createCategory({ name: newCatName.trim(), code: newCatCode.trim() });
      onCategoryCreated(created);           // add to parent list
      setForm((f) => ({ ...f, categoryId: created.id }));
      setShowNewCat(false); setNewCatName(''); setNewCatCode('');
    } catch (err) {
      setCatError(err.message || 'Failed to create category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Select a category.'); return; }
    const qty = Math.max(1, Math.min(50, Number(form.quantity) || 1));
    setError(''); setSubmitting(true);
    try {
      const payload = {
        companyId,
        name: form.name.trim(),
        categoryId: form.categoryId,
        zoneId: form.zoneId || undefined,
        unitPrice: form.price ? Number(form.price) : undefined,
        purchaseDate: form.purchaseDate || undefined,
      };
      // Create units one at a time so each gets its own unique code.
      for (let i = 0; i < qty; i++) {
        setSubmitProgress(`Adding unit ${i + 1} of ${qty}…`);
        await createProduct(payload);
      }
      onAdded(qty);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add units.');
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30"><Boxes size={20} /></div>
            <div>
              <h2 className="text-base font-bold">Add Unit to Inventory</h2>
              <p className="text-xs text-slate-400">
                {step === 1 ? 'Step 1 — Select an organization' : `Step 2 — Unit details for ${companies.find(c=>c.id===companyId)?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={16} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-rose-700">{error}</span>
            </div>
          )}

          {/* Step 1: org picker */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-600">Which organization should receive this unit?</p>
              <div className="flex flex-col gap-2">
                {companies.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => { setCompanyId(c.id); setStep(2); }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0"><Building2 size={16} className="text-indigo-600" /></div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">{c.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50 self-end">Cancel</button>
            </div>
          )}

          {/* Step 2: unit details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Unit Name <span className="text-rose-500">*</span></label>
                <input type="text" required placeholder="e.g., 4K Dome Camera"
                  value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Category <span className="text-rose-500">*</span></label>
                  <button type="button" onClick={() => { setShowNewCat((v) => !v); setCatError(''); }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    {showNewCat ? '← Pick existing' : '+ Create new category'}
                  </button>
                </div>

                {!showNewCat ? (
                  <>
                    <select required value={form.categoryId} onChange={(e) => setForm({...form, categoryId:e.target.value})}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer">
                      <option value="" disabled>Select a category…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code}) — {c._count?.devices ?? 0} units</option>)}
                    </select>
                    <p className="text-[11px] text-slate-400">A unique code (e.g. CAM-000123) is auto-generated from the category prefix.</p>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                    {catError && <p className="text-[11px] text-rose-600 font-semibold">{catError}</p>}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Name <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="e.g. CCTV Cameras" value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Code prefix <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="e.g. CAM" value={newCatCode} maxLength={12}
                          onChange={(e) => setNewCatCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          className="px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-bold font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">Units in this category will be coded {newCatCode || 'XXX'}-000001, {newCatCode || 'XXX'}-000002…</p>
                    <button type="button" onClick={handleCreateCat} disabled={savingCat || !newCatName.trim() || !newCatCode.trim()}
                      className="self-start px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50 transition-colors">
                      {savingCat ? 'Creating…' : 'Create & Select'}
                    </button>
                  </div>
                )}
              </div>

              {/* Zone (optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={12} className="text-indigo-500" />
                  Deploy to Zone
                  <span className="text-slate-400 font-normal">(optional — blank = in stock)</span>
                </label>
                <select value={form.zoneId} onChange={(e) => setForm({...form, zoneId:e.target.value})}
                  disabled={loadingZones}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60">
                  <option value="">In stock (no zone)</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
                {!loadingZones && zones.length === 0 && (
                  <p className="text-[11px] text-slate-400">No zones for this org yet — unit will be added to stock.</p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Number of Units <span className="text-slate-400 font-normal">(max 50)</span>
                </label>
                <input
                  type="number" min="1" max="50" step="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  onBlur={(e) => setForm({ ...form, quantity: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-28"
                />
                {Number(form.quantity) > 1 && (
                  <p className="text-[11px] text-indigo-600 font-semibold">
                    {Number(form.quantity)} units will be created — each gets a unique auto-generated code (e.g. CAM-000001, CAM-000002…).
                  </p>
                )}
              </div>

              {/* Price + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Price (₹) per unit</label>
                  <input type="number" min="0" step="1" placeholder="optional"
                    value={form.price} onChange={(e) => setForm({...form, price:e.target.value})}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={(e) => setForm({...form, purchaseDate:e.target.value})}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer">← Change org</button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={submitting || !form.name.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50 cursor-pointer transition-all min-w-[120px] text-center">
                    {submitting ? (submitProgress || 'Adding…') : `Add ${Number(form.quantity) > 1 ? `${form.quantity} Units` : 'Unit'}`}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Deploy modal ─────────────────────────────────────────────────────────────
function DeployModal({ unit, onClose, onDeployed }) {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!unit?.companyId) return;
    getClients({ companyId: unit.companyId, limit: 10 })
      .then(async (res) => {
        const client = res?.items?.[0];
        if (!client) return;
        const z = await getZones({ clientId: client.id, limit: 100 });
        setZones(z?.items ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [unit?.companyId]);

  const handle = async () => {
    if (!zoneId) { setError('Select a zone.'); return; }
    setSubmitting(true); setError('');
    try { await deployProduct(unit.id, zoneId); onDeployed(); onClose(); }
    catch (err) { setError(err.message || 'Deploy failed.'); setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><MapPin size={18} /></div>
            <div><div className="text-sm font-bold">Deploy Unit</div><div className="text-[11px] text-slate-400 font-mono">{unit?.code}</div></div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600">Deploy <strong>{unit?.name}</strong> from stock into a zone. Status will change to <strong>Active</strong>.</p>
          {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold"><AlertTriangle size={13} />{error}</div>}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Destination Zone <span className="text-rose-500">*</span></label>
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60">
              <option value="">{loading ? 'Loading zones…' : 'Select a zone…'}</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            {!loading && zones.length === 0 && <p className="text-[11px] text-slate-400">No zones for this org. Create zones first.</p>}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50">Cancel</button>
            <button onClick={handle} disabled={submitting || !zoneId}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors">
              {submitting ? 'Deploying…' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Retire modal ─────────────────────────────────────────────────────────────
function RetireModal({ unit, onClose, onRetired }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = async () => {
    setLoading(true); setError('');
    try { await retireProduct(unit.id); onRetired(); onClose(); }
    catch (err) { setError(err.message || 'Failed to retire.'); setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/30 text-rose-200 flex items-center justify-center"><Archive size={18} /></div>
            <div><div className="text-sm font-bold">Retire Unit</div><div className="text-[11px] text-rose-300 font-mono">{unit?.code}</div></div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-rose-800 text-rose-300 hover:text-white flex items-center justify-center cursor-pointer"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600">Soft-retire <strong>{unit?.name}</strong> from <strong>{unit?.companyName}</strong>. It stays in the system for audit but is removed from active inventory.</p>
          {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold"><AlertTriangle size={13} />{error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50">Cancel</button>
            <button onClick={handle} disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors">
              {loading ? 'Retiring…' : 'Yes, Retire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsList() {
  const [products, setProducts]   = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading]     = useState(true);
  const [orgFilter, setOrgFilter] = useState('all');   // companyId or 'all'
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch]       = useState('');

  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deployTarget, setDeployTarget] = useState(null);
  const [retireTarget, setRetireTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // ── load reference data once ──
  useEffect(() => {
    getCompanies({ limit: 100 }).then((r) => setCompanies(r?.items ?? [])).catch(console.error);
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // ── fetch products (scoped to selected org when not 'all') ──
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (orgFilter !== 'all') params.companyId = orgFilter;
      const data = await getProducts(params);
      setProducts(data?.items ?? []);
    } catch (err) {
      console.error('[SuperInventory] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [orgFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── client-side filter: status + search ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusTab !== 'all' && p.status !== statusTab) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.companyName?.toLowerCase().includes(q) ||
        p.zoneName?.toLowerCase().includes(q)
      );
    });
  }, [products, statusTab, search]);

  // ── status counts for the strip ──
  const counts = useMemo(() => products.reduce((acc, p) => {
    acc.total = (acc.total ?? 0) + 1;
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {}), [products]);

  const totalValue = useMemo(() =>
    filtered.reduce((sum, p) => sum + (p.unitPrice ?? 0), 0),
  [filtered]);

  // ── selected org name for import modal ──
  const importCompanyId = orgFilter !== 'all' ? orgFilter : undefined;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      <Toast msg={toast} onDismiss={() => setToast(null)} />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-xs text-slate-500">Add, deploy, and retire hardware units across all organizations.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={fetchProducts} disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer disabled:opacity-40" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs cursor-pointer">
            <FileSpreadsheet size={15} className="text-emerald-600" /><span>Bulk Import</span>
          </button>
          <button onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer">
            <Plus size={16} /><span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* ── Org filter strip ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setOrgFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            orgFilter === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
          }`}>
          <Boxes size={13} />All Organizations
        </button>
        {companies.map((c) => (
          <button key={c.id} onClick={() => setOrgFilter(c.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              orgFilter === c.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
            }`}>
            <Building2 size={13} />{c.name}
          </button>
        ))}
      </div>

      {/* ── Status count strip (clickable filters) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key:'total',             label:'Total',       val: counts.total ?? 0,             color:'text-slate-900' },
          { key:'provisioned',       label:'In Stock',    val: counts.provisioned ?? 0,       color:'text-slate-600' },
          { key:'active',            label:'Active',      val: counts.active ?? 0,            color:'text-emerald-600' },
          { key:'under_maintenance', label:'Maintenance', val: counts.under_maintenance ?? 0, color:'text-amber-600' },
          { key:'faulty',            label:'Faulty',      val: counts.faulty ?? 0,            color:'text-rose-600' },
          { key:'retired',           label:'Retired',     val: counts.retired ?? 0,           color:'text-slate-400' },
          { key:'value',             label:'Total Value', val: `₹${totalValue.toLocaleString('en-IN',{maximumFractionDigits:0})}`, color:'text-indigo-600', noFilter:true },
        ].map(({ key, label, val, color, noFilter }) => (
          <button key={key} disabled={noFilter}
            onClick={() => !noFilter && setStatusTab(key === 'total' ? 'all' : key)}
            className={`bg-white border rounded-xl px-3 py-2.5 flex flex-col text-left shadow-xs transition-all ${
              noFilter ? 'cursor-default' : 'cursor-pointer ' + (
                (key === 'total' ? statusTab === 'all' : statusTab === key)
                  ? 'border-indigo-400 ring-1 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300'
              )
            }`}>
            <span className={`text-xl font-extrabold leading-tight ${color}`}>{val}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Search + Status tabs ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search name, code, category, org, zone…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 w-full" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-0.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setStatusTab(tab)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusTab === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {tab === 'all' ? 'All' : tab === 'provisioned' ? 'In Stock' : tab === 'under_maintenance' ? 'Maintenance' : tab.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main inventory table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Boxes size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-900">Units</span>
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Zone / Stock</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Purchased</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-16 text-slate-400">Loading inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-16 text-slate-400">
                  {products.length === 0 ? 'No units yet. Add one or bulk import.' : 'No units match your filters.'}
                </td></tr>
              ) : (
                filtered.map((p) => {
                  const canDeploy = p.status === 'provisioned';
                  const canRetire = p.status !== 'retired';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"><Package size={14} className="text-slate-400" /></div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap">{p.category || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-semibold">{p.companyName || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.inStock ? (
                          <span className="text-slate-400 text-[11px]">In stock</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-indigo-500 shrink-0" />
                            <span className="text-indigo-700 font-semibold text-[11px]">{p.zoneName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">{money(p.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1"><Clock size={11} className="text-slate-400" />{fmtDate(p.purchaseDate)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {canDeploy && (
                            <button onClick={() => setDeployTarget(p)} title="Deploy to zone"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap">
                              <Zap size={12} /><span>Deploy</span>
                            </button>
                          )}
                          {canRetire && (
                            <button onClick={() => setRetireTarget(p)} title="Retire unit"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap">
                              <Archive size={12} /><span>Retire</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Additions Log ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ClipboardList size={18} /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Additions Log</h3>
            <p className="text-[11px] text-slate-500">Every unit added — who added it, to which org and zone, and when. Creation-time record only.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Date Added</th>
                <th className="py-3 px-4">Added By</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Zone / Stock</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">Loading…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-slate-400">No units added yet.</td></tr>
              ) : (
                [...products]
                  .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />{fmtDateTime(p.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.addedByName ? (
                          <div className="flex items-center gap-1.5"><UserCheck size={12} className="text-indigo-500 shrink-0" /><span className="font-semibold text-slate-800">{p.addedByName}</span></div>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[160px] truncate">{p.name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap">{p.category}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Building2 size={12} className="text-slate-400 shrink-0" /><span className="text-slate-700 font-semibold">{p.companyName}</span></div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.inStock ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">In stock</span>
                        ) : (
                          <div className="flex items-center gap-1"><MapPin size={11} className="text-indigo-500 shrink-0" /><span className="text-indigo-700 font-semibold text-[11px]">{p.zoneName}</span></div>
                        )}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {isAddOpen && (
        <AddUnitModal
          companies={companies}
          categories={categories}
          onClose={() => setIsAddOpen(false)}
          onAdded={(qty) => { showToast(qty > 1 ? `${qty} units added to inventory.` : 'Unit added to inventory.'); fetchProducts(); }}
          onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat].sort((a,b) => a.name.localeCompare(b.name)))}
        />
      )}

      {deployTarget && (
        <DeployModal
          unit={deployTarget}
          onClose={() => setDeployTarget(null)}
          onDeployed={() => { showToast(`${deployTarget.name} deployed — status is now Active.`); fetchProducts(); }}
        />
      )}

      {retireTarget && (
        <RetireModal
          unit={retireTarget}
          onClose={() => setRetireTarget(null)}
          onRetired={() => { showToast(`${retireTarget.name} retired from inventory.`); fetchProducts(); }}
        />
      )}

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        companyId={importCompanyId}
        onImported={(res) => {
          showToast(`Imported ${res.created} unit(s)${res.skipped ? `, ${res.skipped} skipped` : ''}.`);
          fetchProducts();
        }}
      />
    </div>
  );
}
