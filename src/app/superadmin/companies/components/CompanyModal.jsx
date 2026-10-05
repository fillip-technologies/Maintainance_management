import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { createCompany, updateCompany } from '../../../api/companiesApi';

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
      setErrorMsg('Organization name is required.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), status };
      const saved = isEdit
        ? await updateCompany(company.id, payload)
        : await createCompany(payload);
      if (!saved?.id) throw new Error('Organization was not saved (no id returned).');
      onSaved(saved, isEdit ? 'edit' : 'create');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save organization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[var(--bg-card)] rounded-3xl shadow-2xl max-w-md w-full border border-[var(--border-color)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--surface-2)] text-[var(--ink)] px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                {isEdit ? 'Edit Organization' : 'Add Organization'}
              </h2>
              <p className="text-xs text-[var(--ink-3)]">
                {isEdit ? 'Update this organization' : 'Provision a new top-level organization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--surface-3)] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink-2)]">
              Organization Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-[var(--ink-3)] pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                maxLength={160}
                placeholder="e.g. Acme Facilities Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--ink)] text-xs font-medium outline-hidden focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink-2)]">Status</label>
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
                        : 'bg-[var(--line)] text-[var(--ink)] border-[var(--line)]'
                      : 'bg-[var(--bg-main)] text-[var(--ink-3)] border-[var(--border-color)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--ink-2)] hover:text-[var(--ink)] bg-[var(--surface-3)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
