import React, { useState, useEffect, useMemo } from 'react';
import { X, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getDevices } from '../api/devicesApi';
import { getIssueCategories } from '../api/issueCategoriesApi';
import { createIssue } from '../api/issuesApi';

// Shared "raise a query / report a defect" modal used by every role that can
// report a faulty unit (client_admin, zone_incharge, zone_staff). It is
// role-agnostic: the backend scopes the unit list and the defect it creates to
// the caller.
//
// The caller picks a PRODUCT TYPE (from the products assigned to their company)
// or "Other" to type a product name, plus how many units are affected. A defect
// in the backend is always raised against one specific tracked unit, so on
// submit we attach it to an available unit and record the product type/name and
// affected-unit count in the description.

const PRIORITIES = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high',     label: '🟠 High' },
  { value: 'medium',   label: '🔵 Medium' },
  { value: 'low',      label: '⚪ Low' }
];

const OTHER = '__other__';

const EMPTY_FORM = {
  productCategoryId: '',
  customProductName: '',
  categoryId: '',
  priority: 'medium',
  quantity: 1,
  description: ''
};

// initialProductCategoryId — when opened from inventory, pre-selects the unit's
// product type so the user doesn't have to pick it manually.
export default function RaiseQueryModal({ isOpen, onClose, onCreated, initialProductCategoryId }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load the units in the caller's scope once the modal opens; product types are
  // derived from them so we only ever offer types that actually have units.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError('');
    // Pre-select product type when launched from the inventory row.
    if (initialProductCategoryId) {
      setFormData((f) => ({ ...f, productCategoryId: initialProductCategoryId }));
    }
    setLoadingRefs(true);
    getDevices({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setDevices(res?.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load units.');
      })
      .finally(() => !cancelled && setLoadingRefs(false));
    return () => { cancelled = true; };
  }, [isOpen]);

  // Distinct product types (categories) with the units available to raise a
  // defect against (anything not retired).
  const productTypes = useMemo(() => {
    const byId = new Map();
    for (const d of devices) {
      const id = d.category?.id ?? d.categoryId;
      const name = d.categoryName ?? d.category?.name;
      if (!id) continue;
      if (!byId.has(id)) byId.set(id, { id, name, available: [] });
      if (d.status !== 'retired') byId.get(id).available.push(d);
    }
    return Array.from(byId.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [devices]);

  // Any non-retired unit — the fallback a free-typed "Other" defect attaches to.
  const allAvailable = useMemo(() => devices.filter((d) => d.status !== 'retired'), [devices]);

  const isOther = formData.productCategoryId === OTHER;
  const selectedType = productTypes.find((t) => t.id === formData.productCategoryId) || null;
  const availableUnits = isOther ? allAvailable : (selectedType?.available ?? []);
  const availableCount = availableUnits.length;
  const productName = isOther ? formData.customProductName.trim() : (selectedType?.name ?? '');

  // Defect categories depend on the chosen product type (global + that type's).
  // "Other" (or none) → global categories only.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const param = formData.productCategoryId && !isOther ? { categoryId: formData.productCategoryId } : {};
    getIssueCategories(param)
      .then((items) => {
        if (cancelled) return;
        setCategories(items);
        setFormData((f) => (items.some((c) => c.id === f.categoryId) ? f : { ...f, categoryId: '' }));
      })
      .catch(() => !cancelled && setCategories([]));
    return () => { cancelled = true; };
  }, [isOpen, formData.productCategoryId, isOther]);

  if (!isOpen) return null;

  const canSubmit =
    (isOther ? formData.customProductName.trim() : formData.productCategoryId) &&
    formData.categoryId &&
    formData.description.trim() &&
    availableCount > 0 &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');
    try {
      const units = Math.max(1, Math.min(Number(formData.quantity) || 1, availableCount));
      // A defect targets one specific unit — attach it to an available unit and
      // record the product type/name + affected count in the description.
      const targetDevice = availableUnits[0];
      const header = `Product: ${productName} · Units affected: ${units}`;
      const description = `${header}\n${formData.description.trim()}`;

      const issue = await createIssue({
        deviceId: targetDevice.id,
        categoryId: formData.categoryId,
        priority: formData.priority,
        description
      });
      onCreated?.(issue);
      onClose();
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.message || 'Could not raise the defect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Raise a Query / Report a Defect</h2>
              <p className="text-xs text-slate-400">Report a faulty unit — your team and the CEO are notified.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-rose-800">{error}</span>
            </div>
          )}

          {/* Product Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Product Type <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.productCategoryId}
              onChange={(e) => setFormData({ ...formData, productCategoryId: e.target.value, quantity: 1 })}
              disabled={loadingRefs}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer disabled:opacity-60"
            >
              <option value="">{loadingRefs ? 'Loading product types…' : 'Select a product type…'}</option>
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.available.length} available)
                </option>
              ))}
              <option value={OTHER}>Other (type a product name)…</option>
            </select>

            {isOther && (
              <input
                type="text"
                required
                autoFocus
                placeholder="Enter the product name"
                value={formData.customProductName}
                onChange={(e) => setFormData({ ...formData, customProductName: e.target.value })}
                className="mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            )}

            {!loadingRefs && productTypes.length === 0 && (
              <span className="text-[11px] text-slate-500">
                No units in your scope yet. Units must be added (and deployed to your zone) before you can raise a defect.
              </span>
            )}
          </div>

          {/* Defect Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Defect Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Urgency & Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Number of units affected */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Number of Units Affected</label>
            <input
              type="number"
              min={1}
              max={Math.max(1, availableCount)}
              step={1}
              value={formData.quantity}
              disabled={!formData.productCategoryId}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              onBlur={(e) =>
                setFormData({
                  ...formData,
                  quantity: Math.max(1, Math.min(Number(e.target.value) || 1, Math.max(1, availableCount)))
                })
              }
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 w-32 disabled:opacity-60"
            />
            <span className="text-[11px] text-slate-500">
              {formData.productCategoryId
                ? `How many units are affected${availableCount ? ` (max ${availableCount})` : ''}. Recorded on the defect.`
                : 'Select a product type first.'}
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Describe the Problem <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the symptoms, noise, error codes, or impact on operations…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
          </div>

          {/* Info note */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-900">The unit moves to “Under Maintenance”</span>
              <span className="text-[11px] text-emerald-700">
                Raising a defect notifies the zone in-charge, org head, and CEO, and starts an audited timeline.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Raising Defect…' : 'Raise Defect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
