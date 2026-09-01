import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { createClientTicket } from '../../../api/clientAdminApi';

export default function ClientRaiseRequestModal({ isOpen, onClose, onCreated }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    category: 'HVAC & Climate',
    asset: 'Chiller Unit #2 (Floor 8)',
    priority: 'High',
    locationDetail: 'Floor 4, East Wing Server Room',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'HVAC & Climate',
    'Elevators & Mobility',
    'Power & Electrical',
    'Fire Safety & Pumps',
    'Plumbing & Sanitation',
    'Access Control & Security'
  ];

  const assets = [
    'Chiller Unit #2 (Floor 8)',
    'York Central Water Chiller 450 TR',
    'Cummins 500 kVA Diesel Generator #1',
    'Schindler 18-Passenger High Speed Lift A',
    'Grundfos High Pressure Fire Sprinkler Pump',
    'Main Water RO Treatment Unit',
    'Other / Unlisted Asset'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const newTicket = await createClientTicket(formData);
      onCreated(newTicket);
      onClose();
      setFormData({
        title: '',
        category: 'HVAC & Climate',
        asset: 'Chiller Unit #2 (Floor 8)',
        priority: 'High',
        locationDetail: '',
        description: ''
      });
    } catch (err) {
      console.error(err);
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Raise Client Maintenance Request</h2>
              <p className="text-xs text-slate-400">Direct dispatch to Fixly Certified Field Operations</p>
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
          {/* Issue Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Issue Summary / Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chiller #2 abnormal vibration and temperature spike"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-xs font-medium outline-hidden"
            />
          </div>

          {/* Category & Asset Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">System Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Affected Asset / Machinery</label>
              <select
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Specific Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Urgency & Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                <option value="Critical">🔴 Critical (Immediate SLA Dispatch - &lt;1h)</option>
                <option value="High">🟠 High (&lt;4h response)</option>
                <option value="Medium">🔵 Medium (Same Day)</option>
                <option value="Low">⚪ Low (Standard Maintenance)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Facility Location / Floor</label>
              <input
                type="text"
                placeholder="e.g. Tower A - Floor 4 East Wing"
                value={formData.locationDetail}
                onChange={(e) => setFormData({ ...formData, locationDetail: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Detailed Observations / Symptoms</label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, noise, error codes on display, or impact on tenant operations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
          </div>

          {/* Fixly SLA Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-900">Covered Under Platinum Enterprise SLA</span>
              <span className="text-[11px] text-emerald-700">
                Fixly dispatch engineers will receive immediate telemetry push notifications. No separate diagnostic fee required.
              </span>
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
              disabled={isSubmitting || !formData.title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Dispatching Ticket...' : 'Submit Service Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
