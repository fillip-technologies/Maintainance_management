import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { createCompany, updateCompany } from '../../../api/companiesApi';

/**
 * Create or edit a company (organization). `company` prop:
 *   null       → create mode
 *   { id,... } → edit mode
 * Matches backend contract: POST/PATCH /companies { name, status }.
 */
export default function CompanyModal({ isOpen, company, onClose, onSaved }) {
  const isEdit = !!company?.id;
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(company?.name || '');
    setStatus(company?.status || 'active');
    setErrorMsg(null);
  }, [isOpen, company]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Company name is required.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), status };
      const saved = isEdit
        ? await updateCompany(company.id, payload)
        : await createCompany(payload);
      if (!saved?.id) throw new Error('Company was not saved (no id returned).');
      onSaved(saved, isEdit ? 'edit' : 'create');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isEdit ? 'Edit Organization' : 'Add Organization'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update this organization' : 'Provision a new top-level organization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Organization Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                maxLength={160}
                placeholder="e.g. Acme Facilities Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <div className="flex gap-2">
              {['active', 'inactive'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                    status === s
                      ? s === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-600 text-white border-slate-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
