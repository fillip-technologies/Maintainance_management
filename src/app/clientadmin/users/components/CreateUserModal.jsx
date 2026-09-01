import React, { useState } from 'react';
import { X, UserPlus, Shield, UserCheck, Wrench, Mail, Lock, Building, CheckCircle2, Eye, EyeOff, MapPin } from 'lucide-react';
import { createUser } from '../../../api/usersApi';

export default function CreateUserModal({ isOpen, onClose, onCreated }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'zone_staff',
    zoneName: 'North Wing - Floor 1-4',
    specialization: 'HVAC & Chiller Plant',
    password: ''
  });
  const [isCustomZone, setIsCustomZone] = useState(false);
  const [customZoneText, setCustomZoneText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const roles = [
    {
      id: 'zone_staff',
      label: 'Zone Floor Staff',
      desc: 'Submits daily device logs and reports faults'
    },
    {
      id: 'zone_incharge',
      label: 'Zone In-Charge',
      desc: 'Supervises assigned zone assets, issues, and staff'
    },
    {
      id: 'technician',
      label: 'Field Technician',
      desc: 'Assigned to diagnose & resolve maintenance work orders'
    },
    {
      id: 'client_admin',
      label: 'Client Administrator',
      desc: 'Full facility configuration & user management access'
    }
  ];

  const presetZones = [
    'North Wing - Floor 1-4',
    'South Wing & Basement Bay',
    'Roof Plant & Chiller Bay',
    'Entire Facility Core',
    'External Parking & Utilities',
    '__custom__'
  ];

  const specializations = [
    'HVAC & Chiller Plant',
    'Electrical & Power Systems',
    'Elevators & Mobility',
    'Fire Safety & Pumps',
    'Access Control & CCTV',
    'Plumbing & Sanitation'
  ];

  const handleZoneSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomZone(true);
      setFormData({ ...formData, zoneName: customZoneText || '' });
    } else {
      setIsCustomZone(false);
      setFormData({ ...formData, zoneName: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const assignedZone = isCustomZone ? customZoneText.trim() : formData.zoneName;
    if (!assignedZone) {
      setErrorMsg('Please specify an assigned facility zone or area.');
      return;
    }

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
        role: formData.role,
        zoneName: assignedZone,
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
        zoneName: 'North Wing - Floor 1-4',
        specialization: 'HVAC & Chiller Plant',
        password: ''
      });
      setIsCustomZone(false);
      setCustomZoneText('');
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
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Add / Invite Facility User</h2>
              <p className="text-xs text-slate-400">Define operational role & zone assignments</p>
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

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
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
              <label className="text-xs font-bold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@apexestates.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Select Operational Role</label>
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
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {r.label}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Facility Zone / Custom Zone Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Assigned Facility Zone / Area <span className="text-rose-500">*</span>
              </label>
              {isCustomZone ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomZone(false);
                    setFormData({ ...formData, zoneName: 'North Wing - Floor 1-4' });
                  }}
                  className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Choose from preset zones
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomZone(true)}
                  className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  + Type custom zone/area
                </button>
              )}
            </div>

            {!isCustomZone ? (
              <select
                value={formData.zoneName}
                onChange={handleZoneSelectChange}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                {presetZones.map((z) => (
                  <option key={z} value={z}>
                    {z === '__custom__' ? '+ Enter custom zone / area...' : z}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <MapPin size={15} className="absolute left-3.5 text-indigo-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter custom zone / area name (e.g. 5th Floor Server Room, East Tower B2)"
                  value={customZoneText}
                  onChange={(e) => {
                    setCustomZoneText(e.target.value);
                    setFormData({ ...formData, zoneName: e.target.value });
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/30 text-xs font-semibold text-slate-900 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}
            <span className="text-[10px] text-slate-400">
              Assigned location area for operational logs and maintenance scoping
            </span>
          </div>

          {/* Technician Specialization (if role === technician) */}
          {formData.role === 'technician' && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700">Field Specialization</label>
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

          {/* Assign Password (Compulsory) */}
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
              disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Adding User...' : 'Add / Invite User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
