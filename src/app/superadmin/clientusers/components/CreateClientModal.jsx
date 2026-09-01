import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Lock, Eye, EyeOff, MapPin, Layers, Plus } from 'lucide-react';
import { createUser } from '../../../api/usersApi';
import { createClient } from '../../../api/clientsApi';
import { getCompanies, createCompany } from '../../../api/companiesApi';

const EMPTY_FORM = {
  companyId: '',
  clientName: '',
  facilityName: '',
  adminName: '',
  email: '',
  location: '',
  password: ''
};

export default function CreateClientModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Inline "create a new company" flow — so an empty platform isn't a dead end.
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companySaving, setCompanySaving] = useState(false);

  // Load the companies the new client will belong to (super_admin selects one).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setCompaniesLoading(true);
    getCompanies({ limit: 100 })
      .then((data) => {
        if (!cancelled) setCompanies(data?.items || []);
      })
      .catch(() => {
        if (!cancelled) setErrorMsg('Could not load companies. Is the backend running?');
      })
      .finally(() => {
        if (!cancelled) setCompaniesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      setErrorMsg('Please select the parent company for this client.');
      return;
    }
    if (!formData.clientName.trim() || !formData.adminName.trim() || !formData.email.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!formData.password || formData.password.trim().length < 8) {
      setErrorMsg('Password is mandatory and must contain at least 8 characters.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Create the client (tenant) under the selected company.
      const client = await createClient({
        companyId: formData.companyId,
        name: formData.clientName.trim(),
        facilityName: formData.facilityName.trim() || undefined,
        location: formData.location.trim() || undefined
      });
      if (!client?.id) {
        throw new Error('Client was not created (no id returned).');
      }

      // 2. Provision the client_admin user linked to that client.
      const newAdmin = await createUser({
        name: formData.adminName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: 'client_admin',
        clientId: client.id,
        password: formData.password.trim()
      });

      onCreated({ ...newAdmin, client });
      onClose();
      setFormData(EMPTY_FORM);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to provision client. The email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) {
      setErrorMsg('Enter a company name.');
      return;
    }
    setErrorMsg(null);
    setCompanySaving(true);
    try {
      const company = await createCompany({ name, status: 'active' });
      if (!company?.id) throw new Error('Company was not created (no id returned).');
      setCompanies((prev) => [company, ...prev]);
      setFormData((prev) => ({ ...prev, companyId: company.id }));
      setNewCompanyName('');
      setCreatingCompany(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create company.');
    } finally {
      setCompanySaving(false);
    }
  };

  const noCompanies = !companiesLoading && companies.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Super Admin • Provision Client</h2>
              <p className="text-xs text-slate-400">Create a client under a company and its Client Administrator</p>
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {noCompanies && !creatingCompany && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center justify-between gap-3">
              <span>No companies exist yet. A client must belong to a company.</span>
              <button
                type="button"
                onClick={() => setCreatingCompany(true)}
                className="shrink-0 inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={13} /> New company
              </button>
            </div>
          )}

          {/* Parent Company */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Parent Company <span className="text-rose-500">*</span>
              </label>
              {!creatingCompany && (
                <button
                  type="button"
                  onClick={() => setCreatingCompany(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  <Plus size={12} /> New company
                </button>
              )}
            </div>

            {creatingCompany ? (
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <div className="relative flex items-center">
                  <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    maxLength={160}
                    placeholder="New company name (e.g. Acme Facilities Group)"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCompany();
                      }
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingCompany(false);
                      setNewCompanyName('');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCompany}
                    disabled={companySaving || !newCompanyName.trim()}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {companySaving ? 'Creating…' : 'Create & select'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative flex items-center">
                <Layers size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <select
                  required
                  disabled={companiesLoading || noCompanies}
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60"
                >
                  <option value="">
                    {companiesLoading ? 'Loading companies…' : 'Select a company…'}
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Client Name & Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Client / Site Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Estates — Bangalore"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Primary Facility / Campus
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Tech Tower - Campus A"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Admin Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Client Admin Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. full name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Admin Email / Login ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Facility Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Facility Location / City</label>
            <div className="relative flex items-center">
              <MapPin size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Bangalore Sector 4, Tech Park Campus"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Password (Compulsory) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Initial Admin Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">Required (min. 8 characters)</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Enter strong password (minimum 8 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
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
              disabled={
                isSubmitting ||
                noCompanies ||
                !formData.companyId ||
                !formData.clientName.trim() ||
                !formData.adminName.trim() ||
                !formData.email.trim() ||
                !formData.password.trim()
              }
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Provisioning Client…' : 'Create Client & Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
