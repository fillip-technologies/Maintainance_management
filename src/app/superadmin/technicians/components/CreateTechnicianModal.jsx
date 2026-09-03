import React, { useState, useEffect } from 'react';
import { X, Wrench, Lock, Eye, EyeOff, Building2, MapPin, AlertTriangle } from 'lucide-react';
import { provisionTechnician } from '../../../api/techniciansApi';
import { getClients } from '../../../api/clientsApi';
import { getZones } from '../../../api/zonesApi';

const EMPTY = { name: '', email: '', specialization: '', password: '' };

export default function CreateTechnicianModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Assignment: step 1 = pick org, step 2 = whole-org or specific zone
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');   // org chosen
  const [scope, setScope] = useState('org');                       // 'org' | 'zone'
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState('');

  // Load all clients once on open.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingClients(true);
    getClients({ limit: 100 })
      .then((res) => { if (!cancelled) setClients(res?.items ?? []); })
      .finally(() => { if (!cancelled) setLoadingClients(false); });
    return () => { cancelled = true; };
  }, [isOpen]);

  // Load zones for the selected org whenever the org changes.
  useEffect(() => {
    if (!selectedClientId) { setZones([]); setSelectedZoneId(''); return; }
    let cancelled = false;
    setLoadingZones(true);
    setSelectedZoneId('');
    getZones({ clientId: selectedClientId, limit: 100 })
      .then((res) => { if (!cancelled) setZones(res?.items ?? []); })
      .finally(() => { if (!cancelled) setLoadingZones(false); });
    return () => { cancelled = true; };
  }, [selectedClientId]);

  if (!isOpen) return null;

  const assignmentValid =
    !selectedClientId ||                        // no assignment = valid (optional)
    scope === 'org' ||                          // whole-org = just needs clientId
    (scope === 'zone' && selectedZoneId);       // zone = also needs a zone

  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&    // raw length, no trim — matches what the backend receives
    assignmentValid &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,           // never trim passwords — spaces are valid
        specialization: formData.specialization.trim() || undefined,
        // Only include assignment if an org was actually chosen.
        ...(selectedClientId && scope === 'org'  ? { clientId: selectedClientId } : {}),
        ...(selectedClientId && scope === 'zone' && selectedZoneId ? { zoneId: selectedZoneId } : {}),
      };
      const tech = await provisionTechnician(payload);
      onCreated?.(tech);
      onClose();
      // Reset all state.
      setFormData(EMPTY);
      setSelectedClientId('');
      setScope('org');
      setSelectedZoneId('');
    } catch (err) {
      // Surface specific field errors from the backend validation if available.
      const detail = err.details?.[0];
      setError(
        detail
          ? `${detail.path.replace('body.', '')}: ${detail.message}`
          : err.message || 'Failed to create technician. The email may already be in use.'
      );
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Add Technician</h2>
              <p className="text-xs text-slate-400">Creates a login account, emails credentials, and optionally assigns coverage.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-rose-700">{error}</span>
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
              <input
                type="text" required
                placeholder="e.g. Amit Shah"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Email <span className="text-rose-500">*</span></label>
              <input
                type="email" required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          {/* Specialization */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Specialization</label>
            <input
              type="text"
              placeholder="e.g. HVAC, Electrical (optional)"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password <span className="text-rose-500">*</span></label>
              <span className="text-[10px] text-amber-600 font-semibold">Min. 8 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required minLength={8}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* ─── Coverage Assignment ─── */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div>
              <div className="text-xs font-bold text-slate-700">
                Coverage Assignment <span className="text-slate-400 font-medium">(optional)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Defects raised in the assigned area will automatically route to this technician.
              </p>
            </div>

            {/* Step 1: Organization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                Organization
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); setScope('org'); setSelectedZoneId(''); }}
                disabled={loadingClients}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 cursor-pointer disabled:opacity-60"
              >
                <option value="">{loadingClients ? 'Loading…' : 'No assignment (free agent)'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: whole-org vs specific zone — only shown once an org is chosen */}
            {selectedClientId && (
              <div className="flex flex-col gap-2.5 pl-3 border-l-2 border-amber-300">
                <div className="text-[11px] font-bold text-slate-600">Assign coverage to:</div>

                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setScope('org'); setSelectedZoneId(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      scope === 'org'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <Building2 size={12} />
                    Whole organization
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope('zone')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      scope === 'zone'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <MapPin size={12} />
                    Specific zone
                  </button>
                </div>

                {/* Description of the chosen scope */}
                {scope === 'org' && (
                  <p className="text-[11px] text-slate-500">
                    This technician covers the entire organization. Zone-specific assignments by other technicians take priority.
                  </p>
                )}

                {/* Zone picker — only when "Specific zone" is chosen */}
                {scope === 'zone' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin size={13} className="text-indigo-600" />
                      Zone <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      disabled={loadingZones}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 cursor-pointer disabled:opacity-60"
                    >
                      <option value="">{loadingZones ? 'Loading zones…' : 'Select a zone…'}</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                    {!loadingZones && zones.length === 0 && (
                      <span className="text-[11px] text-slate-500">
                        No zones found for this organization. Create zones first.
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Defects in this zone route to this technician first. Org-level coverage is the fallback.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all disabled:opacity-50 cursor-pointer">
              {isSubmitting ? 'Creating…' : 'Add Technician'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
