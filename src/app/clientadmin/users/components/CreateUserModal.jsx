import React, { useState, useEffect } from 'react';
import { X, UserPlus, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { createUser } from '../../../api/usersApi';
import { getZones, assignUserToZone } from '../../../api/zonesApi';
import { useAuth } from '../../../context/AuthContext';

export default function CreateUserModal({ isOpen, onClose, onCreated }) {
  const { currentUser } = useAuth();
  const clientId = currentUser?.clientId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'zone_staff',
    password: ''
  });
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isZoneOfficer = formData.role === 'zone_staff' || formData.role === 'zone_incharge';

  // Load zones whenever modal opens or client changes
  useEffect(() => {
    if (!isOpen || !clientId) return;
    let cancelled = false;
    setLoadingZones(true);
    getZones({ clientId, limit: 100 })
      .then((d) => { if (!cancelled) setZones(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingZones(false); });
    return () => { cancelled = true; };
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const roles = [
    { id: 'zone_staff',    label: 'Zone Floor Staff',   desc: 'Submits daily device logs and reports faults' },
    { id: 'zone_incharge', label: 'Zone In-Charge',      desc: 'Supervises assigned zone assets, issues, and staff' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!formData.password || formData.password.trim().length < 8) {
      setErrorMsg('Password is mandatory and must contain at least 8 characters.');
      return;
    }
    if (isZoneOfficer && !selectedZoneId) {
      setErrorMsg('Please select a zone to assign this officer to.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Create the user
      const newUser = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        password: formData.password.trim(),
      });

      // 2. Assign to zone immediately if one was selected
      if (selectedZoneId && newUser?.id) {
        const assignRole = formData.role === 'zone_incharge' ? 'incharge' : 'staff';
        await assignUserToZone(selectedZoneId, newUser.id, assignRole);
      }

      onCreated(newUser);
      onClose();
      setFormData({ name: '', email: '', role: 'zone_staff', password: '' });
      setSelectedZoneId('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user. Email may already exist.');
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
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Add / Invite Facility User</h2>
              <p className="text-xs text-slate-400">Define role, assign to a zone, set credentials</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                required
                placeholder="name@facility.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Operational Role <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((r) => {
                const isSelected = formData.role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{r.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zone assignment — shown for zone officer roles */}
          {isZoneOfficer && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin size={12} className="text-indigo-500" />
                Assign to Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                disabled={loadingZones}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60"
              >
                <option value="">{loadingZones ? 'Loading zones…' : 'Select a zone…'}</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
              {zones.length === 0 && !loadingZones && (
                <p className="text-[11px] text-amber-600 font-medium">
                  No zones found — create zones first before assigning officers.
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password <span className="text-rose-500">*</span></label>
              <span className="text-[10px] text-indigo-600 font-semibold">min. 8 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Enter password (minimum 8 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.password.trim() ||
                (isZoneOfficer && !selectedZoneId)
              }
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating…' : 'Add User & Assign Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
