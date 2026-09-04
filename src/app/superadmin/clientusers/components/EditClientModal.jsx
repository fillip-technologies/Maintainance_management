import React, { useState, useEffect } from 'react';
import { X, Building2, User, MapPin, Trash2 } from 'lucide-react';
import { updateUser } from '../../../api/usersApi';

export default function EditClientModal({ isOpen, client, onClose, onUpdated, onDelete }) {
  if (!isOpen || !client) return null;

  const [formData, setFormData] = useState({
    facilityName: client.facilityName || '',
    adminName: client.name || client.adminName || '',
    location: client.location || '',
    accountStatus: client.accountStatus || client.status || 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (client) {
      setFormData({
        facilityName: client.facilityName || '',
        adminName: client.name || client.adminName || '',
        location: client.location || '',
        accountStatus: client.accountStatus || client.status || 'active'
      });
      setErrorMsg(null);
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: formData.adminName.trim(),
        role: 'client_admin',
        facilityName: formData.facilityName.trim(),
        location: formData.location.trim(),
        accountStatus: formData.accountStatus
      };
      const updated = await updateUser(client.id, payload);
      onUpdated(updated || { ...client, ...payload });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    onClose();
    onDelete(client);
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
              <h2 className="text-base font-bold">Edit Client Admin Account</h2>
              <p className="text-xs text-slate-400">{client.email}</p>
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

          {/* Organization — read-only, fixed at creation */}
          {client.companyName && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Organization</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <Building2 size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600">{client.companyName}</span>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fixed</span>
              </div>
            </div>
          )}

          {/* Facility / Campus Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Facility / Campus Name</label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Client Admin Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Client Admin Name</label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Location / City</label>
            <div className="relative flex items-center">
              <MapPin size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Account Access Status</label>
            <select
              value={formData.accountStatus}
              onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              <option value="active">Active (Operational Access)</option>
              <option value="suspended">Suspended (Access Blocked)</option>
              <option value="invited">Invited (Pending Confirmation)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Remove Client</span>
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
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
