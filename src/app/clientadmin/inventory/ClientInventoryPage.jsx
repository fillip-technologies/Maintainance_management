import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Boxes, Plus, Search, RefreshCw, CheckCircle2, X, Package,
  FileSpreadsheet, MapPin, AlertTriangle,
  Zap, Archive, Clock, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, createProduct, deployProduct, retireProduct, getCategories } from '../../api/productsApi';
import { getZones } from '../../api/zonesApi';
import { getIssues } from '../../api/issuesApi';
import { socketClient } from '../../api/socketClient';
import ExcelImportModal from '../../common/ExcelImportModal';
import RaiseQueryModal from '../../common/RaiseQueryModal';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_META = {
  provisioned:       { label: 'In Stock',         color: 'bg-slate-100 text-slate-600 border-slate-300',    dot: 'bg-slate-400' },
  active:            { label: 'Active',            color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  under_maintenance: { label: 'Under Maintenance', color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  faulty:            { label: 'Faulty',            color: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  retired:           { label: 'Retired',           color: 'bg-slate-100 text-slate-400 border-slate-200',   dot: 'bg-slate-300' },
};

const STATUS_TABS = ['all', 'provisioned', 'active', 'under_maintenance', 'faulty', 'retired'];

const money = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—');
const fmt = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.provisioned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── Deploy modal ─────────────────────────────────────────────────────────────
function DeployModal({ unit, zones, onDeploy, onClose }) {
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeploy = async () => {
    if (!zoneId) { setError('Select a zone first.'); return; }
    setLoading(true); setError('');
    try {
      await onDeploy(unit.id, zoneId);
      onClose();
    } catch (err) {
      setError(err.message || 'Deploy failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><MapPin size={18} /></div>
            <div>
              <div className="text-sm font-bold">Deploy Unit</div>
              <div className="text-[11px] text-slate-400 font-mono">{unit.code}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600">
            Deploy <strong>{unit.name}</strong> from stock into a zone. The unit's status will change to <strong>Active</strong>.
          </p>
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
              <AlertTriangle size={13} />{error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Destination Zone <span className="text-rose-500">*</span></label>
            <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer">
              <option value="">Select a zone…</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            {zones.length === 0 && <p className="text-[11px] text-slate-400">No zones available. Create zones first.</p>}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50">Cancel</button>
            <button onClick={handleDeploy} disabled={loading || !zoneId}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors">
              {loading ? 'Deploying…' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Retire confirm modal ─────────────────────────────────────────────────────
function RetireModal({ unit, onRetire, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setLoading(true); setError('');
    try { await onRetire(unit.id); onClose(); }
    catch (err) { setError(err.message || 'Failed to retire unit.'); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/30 text-rose-200 flex items-center justify-center"><Archive size={18} /></div>
            <div>
              <div className="text-sm font-bold">Retire Unit</div>
              <div className="text-[11px] text-rose-300 font-mono">{unit.code}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-rose-800 text-rose-300 hover:text-white flex items-center justify-center cursor-pointer"><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600">
            This will soft-retire <strong>{unit.name}</strong>. The unit stays in the system for audit purposes but will no longer appear in the active inventory.
          </p>
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
              <AlertTriangle size={13} />{error}
            </div>
          )}
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

// ─── Add Unit modal ───────────────────────────────────────────────────────────
function AddUnitModal({ categories, zones, loadingZones, onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', categoryId: '', zoneId: '', price: '', purchaseDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Please choose a category.'); return; }
    setError(''); setSubmitting(true);
    try {
      await onAdd({
        name: form.name.trim(),
        categoryId: form.categoryId,
        zoneId: form.zoneId || undefined,
        unitPrice: form.price ? Number(form.price) : undefined,
        purchaseDate: form.purchaseDate || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add unit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"><Boxes size={20} /></div>
            <div>
              <h2 className="text-base font-bold">Add Unit to Inventory</h2>
              <p className="text-xs text-slate-400">A unique code is auto-generated. Optionally deploy to a zone now.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-rose-700">{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Unit Name <span className="text-rose-500">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., 4K Dome Camera"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category <span className="text-rose-500">*</span></label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer">
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
            <p className="text-[11px] text-slate-400">Unique code (e.g. {categories[0]?.code || 'CAM'}-000123) is generated automatically.</p>
          </div>

          {/* Deploy to Zone (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin size={12} className="text-indigo-500" />
              Deploy to Zone
              <span className="text-slate-400 font-medium">(optional — leave blank to add to stock)</span>
            </label>
            <select value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
              disabled={loadingZones}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer disabled:opacity-60">
              <option value="">In stock (no zone)</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            {!loadingZones && zones.length === 0 && (
              <p className="text-[11px] text-slate-400">No zones set up — unit will be added to stock.</p>
            )}
          </div>

          {/* Price + Date row */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Price (₹)</label>
              <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="optional"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Purchase Date</label>
              <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting || !form.name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 disabled:opacity-50 cursor-pointer transition-all">
              {submitting ? 'Adding…' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClientInventoryPage() {
  const { currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [issueCounts, setIssueCounts] = useState({});   // deviceId → open issue count

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deployTarget, setDeployTarget] = useState(null);
  const [retireTarget, setRetireTarget] = useState(null);
  const [raiseTarget, setRaiseTarget] = useState(null);   // unit to pre-fill in RaiseQueryModal

  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // ── fetch products + open issue counts ──
  // Search is intentionally excluded from deps — filtering is done client-side
  // in useMemo below so we don't fire a network request on every keystroke.
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [deviceData, issueRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getIssues({ limit: 100, status: 'open,in_progress,on_hold,reopened' }),
      ]);
      const items = deviceData?.items || [];
      setProducts(items);

      const map = {};
      for (const issue of issueRes?.items ?? []) {
        const did = issue.device?.id ?? issue.deviceId;
        if (did) map[did] = (map[did] ?? 0) + 1;
      }
      setIssueCounts(map);
    } catch (err) {
      console.error('[ClientInventory] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + real-time updates when issues or devices change.
  useEffect(() => {
    fetchProducts();
    const u1 = socketClient.on('issue:created', fetchProducts);
    const u2 = socketClient.on('issue:updated', fetchProducts);
    const u3 = socketClient.on('log:submitted', fetchProducts);
    return () => { u1(); u2(); u3(); };
  }, [fetchProducts]);

  // ── load categories once ──
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // ── load zones for the client admin's org ──
  useEffect(() => {
    if (!currentUser?.clientId) return;
    setLoadingZones(true);
    getZones({ clientId: currentUser.clientId, limit: 100 })
      .then((res) => setZones(res?.items ?? []))
      .catch(console.error)
      .finally(() => setLoadingZones(false));
  }, [currentUser?.clientId]);

  // ── client-side filter (status tab + search text) ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusTab !== 'all' && p.status !== statusTab) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.zoneName?.toLowerCase().includes(q)
      );
    });
  }, [products, statusTab, search]);

  // ── stat counts for status strip ──
  const counts = useMemo(() => products.reduce((acc, p) => {
    acc.total = (acc.total ?? 0) + 1;
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {}), [products]);

  // ── actions ──
  const handleAdd = async (payload) => {
    await createProduct(payload);
    showToast(`Unit added${payload.zoneId ? ' and deployed' : ' to stock'}.`);
    fetchProducts();
  };

  const handleDeploy = async (id, zoneId) => {
    await deployProduct(id, zoneId);
    showToast('Unit deployed to zone — status is now Active.');
    fetchProducts();
  };

  const handleRetire = async (id) => {
    await retireProduct(id);
    showToast('Unit retired from inventory.');
    fetchProducts();
  };

  const companyId = currentUser?.companyId;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle2 size={16} /></div>
          <span className="text-xs font-semibold">{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-xs text-slate-500">Hardware units for your organization — add, deploy, track status, raise defects.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={fetchProducts} disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer disabled:opacity-40" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs cursor-pointer">
            <FileSpreadsheet size={15} className="text-emerald-600" /><span>Bulk Import</span>
          </button>
          <button onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer">
            <Plus size={16} /><span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Status count strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'total',             label: 'Total',       val: counts.total ?? 0,             color: 'text-slate-900' },
          { key: 'provisioned',       label: 'In Stock',    val: counts.provisioned ?? 0,       color: 'text-slate-600' },
          { key: 'active',            label: 'Active',      val: counts.active ?? 0,            color: 'text-emerald-600' },
          { key: 'under_maintenance', label: 'Maintenance', val: counts.under_maintenance ?? 0, color: 'text-amber-600' },
          { key: 'faulty',            label: 'Faulty',      val: counts.faulty ?? 0,            color: 'text-rose-600' },
          { key: 'retired',           label: 'Retired',     val: counts.retired ?? 0,           color: 'text-slate-400' },
        ].map(({ key, label, val, color }) => (
          <button key={key}
            onClick={() => setStatusTab(key === 'total' ? 'all' : key)}
            className={`bg-white border rounded-xl px-3 py-2.5 flex flex-col text-left shadow-xs transition-all cursor-pointer ${
              (key === 'total' ? statusTab === 'all' : statusTab === key)
                ? 'border-indigo-400 ring-1 ring-indigo-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
            <span className={`text-2xl font-extrabold ${color}`}>{val}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
          </button>
        ))}
      </div>

      {/* Search + Status tabs row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name, code, category…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 w-full" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={13} /></button>}
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-0.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusTab === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {tab === 'all' ? 'All' : tab === 'provisioned' ? 'In Stock' : tab === 'under_maintenance' ? 'Maintenance' : tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Boxes size={16} className="text-emerald-600" />
          <span className="text-sm font-bold text-slate-900">Units</span>
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Zone / Location</th>
                <th className="py-3 px-4">Issues</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Purchased</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-14 text-slate-400">Loading inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-14 text-slate-400">
                  {products.length === 0 ? 'No units yet. Add one or bulk import.' : 'No units matching the selected filter.'}
                </td></tr>
              ) : (
                filtered.map((p) => {
                  const openCount = issueCounts[p.id] ?? 0;
                  const canDeploy = p.status === 'provisioned';
                  const canRaise  = !['retired', 'provisioned'].includes(p.status);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-slate-400" />
                          </div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap">{p.category || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.inStock ? (
                          <span className="text-slate-400 text-[11px] font-medium">In stock</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-indigo-500 shrink-0" />
                            <span className="text-indigo-700 font-semibold text-[11px]">{p.zoneName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {openCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            <ShieldAlert size={11} />
                            {openCount} open
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">{money(p.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {fmt(p.purchaseDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Deploy: only for in-stock units */}
                          {canDeploy && (
                            <button onClick={() => setDeployTarget(p)} title="Deploy to zone"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200 text-[11px] font-bold transition-colors cursor-pointer">
                              <Zap size={12} /><span>Deploy</span>
                            </button>
                          )}

                          {/* Raise Defect: for deployed/active units */}
                          {canRaise && (
                            <button onClick={() => setRaiseTarget(p)} title="Raise a defect on this unit"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer">
                              <ShieldAlert size={12} /><span>Defect</span>
                            </button>
                          )}

                          {/* Retire: for any non-retired unit */}
                          {p.status !== 'retired' && (
                            <button onClick={() => setRetireTarget(p)} title="Retire unit"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer">
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

      {/* ── Modals ── */}
      {isAddOpen && (
        <AddUnitModal
          categories={categories}
          zones={zones}
          loadingZones={loadingZones}
          onAdd={handleAdd}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {deployTarget && (
        <DeployModal
          unit={deployTarget}
          zones={zones}
          onDeploy={handleDeploy}
          onClose={() => setDeployTarget(null)}
        />
      )}

      {retireTarget && (
        <RetireModal
          unit={retireTarget}
          onRetire={handleRetire}
          onClose={() => setRetireTarget(null)}
        />
      )}

      {/* Raise Defect — pre-selects the unit's product type */}
      {raiseTarget && (
        <RaiseQueryModal
          isOpen={true}
          initialProductCategoryId={raiseTarget.categoryId}
          onClose={() => setRaiseTarget(null)}
          onCreated={(issue) => {
            showToast(`Defect raised on ${raiseTarget.name} — unit is now under maintenance.`);
            setRaiseTarget(null);
            fetchProducts();
          }}
        />
      )}

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        companyId={companyId}
        onImported={(res) => {
          showToast(`Imported ${res.created} unit(s)${res.skipped ? `, ${res.skipped} skipped` : ''}.`);
          fetchProducts();
        }}
      />
    </div>
  );
}
