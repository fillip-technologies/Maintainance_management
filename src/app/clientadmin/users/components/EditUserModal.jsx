import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield, Wrench, CheckCircle2, AlertTriangle, Trash2, MapPin } from 'lucide-react';
import { updateUser, deleteUser } from '../../../api/usersApi';
import { useAuth } from '../../../context/AuthContext';

export default function EditUserModal({ isOpen, user, onClose, onUpdated, onDeleted }) {
  const { currentUser } = useAuth();

  if (!isOpen || !user) return null;

  const isSelf = currentUser?.id === user.id;

  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || 'zone_staff',
    accountStatus: user.accountStatus || 'active',
    zoneName: user.zoneName || 'North Wing - Floor 1-4',
    specialization: user.specialization || 'HVAC & Chiller Plant'
  });
  const [isCustomZone, setIsCustomZone] = useState(false);
  const [customZoneText, setCustomZoneText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const presetZones = [
    'North Wing - Floor 1-4',
    'South Wing & Basement Bay',
    'Roof Plant & Chiller Bay',
    'Entire Facility Core',
    'External Parking & Utilities'
  ];

  useEffect(() => {
    setError('');
    if (user) {
      const isPreset = presetZones.includes(user.zoneName);
      setFormData({
        name: user.name || '',
        role: user.role || 'zone_staff',
        accountStatus: user.accountStatus || 'active',
        zoneName: user.zoneName || 'North Wing - Floor 1-4',
        specialization: user.specialization || 'HVAC & Chiller Plant'
      });
      if (!isPreset && user.zoneName) {
        setIsCustomZone(true);
        setCustomZoneText(user.zoneName);
      } else {
        setIsCustomZone(false);
        setCustomZoneText('');
      }
    }
  }, [user]);

  const roles = [
    { id: 'zone_staff', label: 'Zone Floor Staff' },
    { id: 'zone_incharge', label: 'Zone In-Charge' },
    { id: 'client_admin', label: 'Client Administrator' }
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
    setError('');
    setIsSubmitting(true);
    try {
      const assignedZone = isCustomZone ? customZoneText.trim() : formData.zoneName;
      const updated = await updateUser(user.id, {
        ...formData,
        zoneName: assignedZone
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSelf) {
      setError("You can't remove your own account. Ask another admin to do this.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${user.name}? This will soft-remove their account.`)) return;

    setError('');
    setIsSubmitting(true);
    try {
      const deleted = await deleteUser(user.id);
      onDeleted(deleted || { ...user, accountStatus: 'removed' });
      onClose();
    } catch (err) {
      const isSelfError = err.code === 'CANNOT_DELETE_SELF' || err.message?.toLowerCase().includes('self');
      setError(
        isSelfError
          ? "You can't remove your own account. Ask another admin to do this."
          : err.message || 'Failed to remove user. Please try again.'
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
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Edit User Role & Status</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
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
          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-rose-700">{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Operational Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Assigned Facility Zone / Custom Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Assigned Facility Zone</label>
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
                  <option key={z} value={z}>{z}</option>
                ))}
                <option value="__custom__">+ Enter custom zone / area...</option>
              </select>
            ) : (
              <div className="relative flex items-center animate-in fade-in duration-150">
                <MapPin size={15} className="absolute left-3.5 text-indigo-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter custom zone / area name (e.g. 5th Floor Server Room)"
                  value={customZoneText}
                  onChange={(e) => {
                    setCustomZoneText(e.target.value);
                    setFormData({ ...formData, zoneName: e.target.value });
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/30 text-xs font-semibold text-slate-900 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}
          </div>

          {/* Technician Specialization */}
          {formData.role === 'technician' && (
            <div className="flex flex-col gap-1.5">
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

          {/* Account Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Account Access Status</label>
            <select
              value={formData.accountStatus}
              onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              <option value="active">Active (Full operational access)</option>
              <option value="suspended">Suspended (Access blocked)</option>
              <option value="invited">Invited (Pending first login)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              title={isSelf ? "You can't remove your own account" : 'Remove this user'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                isSelf
                  ? 'text-rose-300 border-rose-100 bg-rose-50/40 cursor-not-allowed'
                  : 'text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer'
              }`}
            >
              <Trash2 size={14} />
              <span>{isSelf ? "Can't remove self" : 'Remove User'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
