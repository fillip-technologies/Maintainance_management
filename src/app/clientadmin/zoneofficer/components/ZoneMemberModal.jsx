import React, { useState } from 'react';
import { X, UserCheck, Wrench, Shield, CheckCircle2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { createUser } from '../../../api/usersApi';

export default function ZoneMemberModal({ isOpen, onClose, onCreated, defaultZone = 'North Wing - Floor 1-4' }) {
  if (!isOpen) return null;

  // Strictly TWO roles allowed for Zone Officer: zone_staff or technician
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'zone_staff', // 'zone_staff' | 'technician' only
    zoneName: defaultZone,
    specialization: 'HVAC & Chiller Plant',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const allowedRoles = [
    {
      id: 'zone_staff',
      label: 'Staff ID (Floor Staff)',
      desc: 'Submits daily logs & operational checks for zone equipment',
      icon: UserCheck,
      color: 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-200',
      activeBadge: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'technician',
      label: 'Technician ID (Field Engineer)',
      desc: 'Assigned to diagnose, service & resolve zone repair work orders',
      icon: Wrench,
      color: 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-200',
      activeBadge: 'bg-amber-100 text-amber-800'
    }
  ];

  const specializations = [
    'HVAC & Chiller Plant',
    'Electrical & Power Systems',
    'Elevators & Mobility',
    'Fire Safety & Pumps',
    'Access Control & CCTV',
    'Plumbing & Sanitation'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (!formData.password || formData.password.trim().length < 8) {
      setErrorMsg('Password is mandatory and must contain at least 8 characters.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role, // strictly zone_staff or technician
        zoneName: formData.zoneName,
        specialization: formData.role === 'technician' ? formData.specialization : null,
        password: formData.password.trim()
      };

      const newUser = await createUser(payload);
      onCreated(newUser);
      onClose();
      setFormData({
        name: '',
        email: '',
        role: 'zone_staff',
        zoneName: defaultZone,
        specialization: 'HVAC & Chiller Plant',
        password: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create zone member.');
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
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Zone Officer • Create Member ID</h2>
              <p className="text-xs text-slate-400">Provision Staff & Technician Credentials for {defaultZone}</p>
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Role Choice: Strictly Staff vs Technician */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Select ID Type to Provision <span className="text-indigo-600 font-normal">(Zone Officer Authority)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allowedRoles.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? r.color
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon size={16} />
                        <span>{r.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-snug">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder={formData.role === 'technician' ? 'e.g. Sam Wilson (Field Tech)' : 'e.g. Ravi Kumar (Floor Staff)'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Email Address / Login ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="member@apexestates.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Assigned Zone (Pre-filled to Zone Officer's zone) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Assigned Zone</label>
            <input
              type="text"
              readOnly
              value={formData.zoneName}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-700 text-xs font-semibold outline-hidden cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400">Scoped automatically to your officer zone</span>
          </div>

          {/* Technician Field Specialization (Only shown when Technician ID is chosen) */}
          {formData.role === 'technician' && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700">Technical Specialization</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Password (Compulsory) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Assign Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">Required (min. 8 characters)</span>
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
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Provisioning ID...' : `Create ${formData.role === 'technician' ? 'Technician' : 'Staff'} ID`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
