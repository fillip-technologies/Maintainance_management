import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Lock, Eye, EyeOff, MapPin, ChevronDown } from 'lucide-react';
import { createUser } from '../../../api/usersApi';
import { createClient } from '../../../api/clientsApi';
import { getCompanies } from '../../../api/companiesApi';

const EMPTY_FORM = {
  companyId: '',
  clientName: '',
  adminName: '',
  email: '',
  location: '',
  password: ''
};

export default function CreateClientModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingOrgs(true);
    getCompanies({ limit: 100 })
      .then((data) => setOrganizations(data?.items || []))
      .catch(() => setOrganizations([]))
      .finally(() => setLoadingOrgs(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      setErrorMsg('Please select an organization.');
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
      const client = await createClient({
        companyId: formData.companyId,
        name: formData.clientName.trim(),
        location: formData.location.trim() || undefined,
      });
      if (!client?.id) throw new Error('Client was not created (no id returned).');

      const newAdmin = await createUser({
        name: formData.adminName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: 'client_admin',
        clientId: client.id,
        password: formData.password.trim(),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Provision Client</h2>
              <p className="text-xs text-slate-400">Creates a client under an existing organization and sets up its admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Organization selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Organization <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none z-10" />
              <select
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                disabled={loadingOrgs}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {loadingOrgs ? 'Loading organizations…' : 'Select an organization'}
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
            </div>
            {organizations.length === 0 && !loadingOrgs && (
              <p className="text-[11px] text-amber-600 font-medium">
                No organizations found. Create one first under Organizations.
              </p>
            )}
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Apex Tower Mumbai"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Admin Name & Email */}
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
                  placeholder="Full name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Admin Email <span className="text-rose-500">*</span>
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

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Location / City</label>
            <div className="relative flex items-center">
              <MapPin size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Initial Admin Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">min. 8 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
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
              disabled={
                isSubmitting ||
                !formData.companyId ||
                !formData.clientName.trim() ||
                !formData.adminName.trim() ||
                !formData.email.trim() ||
                !formData.password.trim()
              }
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Provisioning…' : 'Create Client & Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
