import React, { useState } from 'react';
import { X, Plus, AlertCircle, Calendar, Building, User, Wrench, CheckCircle } from 'lucide-react';

export default function NewWorkOrderModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    facility: 'Apex Tech Tower - Campus A',
    priority: 'high',
    category: 'HVAC & Climate',
    assignedTech: 'Carlos Vance (Lead HVAC)',
    dueDate: '2026-09-02',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onCreated(formData);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Work Order</h3>
              <p className="text-xs text-slate-400">Dispatch reactive or preventive maintenance ticket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Work Order Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Primary Chiller Pump #3 High Bearing Temperature"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 text-sm text-white outline-hidden transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Facility
              </label>
              <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 gap-2">
                <Building size={16} className="text-slate-400 shrink-0" />
                <select
                  value={formData.facility}
                  onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-white outline-hidden cursor-pointer"
                >
                  <option value="Apex Tech Tower - Campus A" className="bg-slate-900 text-white">Apex Tech Tower - Campus A</option>
                  <option value="Global Logistics Hub #4" className="bg-slate-900 text-white">Global Logistics Hub #4</option>
                  <option value="Marina Bay Medical Center" className="bg-slate-900 text-white">Marina Bay Medical Center</option>
                  <option value="Horizon Data Center Alpha" className="bg-slate-900 text-white">Horizon Data Center Alpha</option>
                  <option value="Metro Industrial Park" className="bg-slate-900 text-white">Metro Industrial Park</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Priority SLA
              </label>
              <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 gap-2">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-white outline-hidden cursor-pointer"
                >
                  <option value="critical" className="bg-slate-900 text-white">Critical (4h SLA)</option>
                  <option value="high" className="bg-slate-900 text-white">High Priority (12h SLA)</option>
                  <option value="medium" className="bg-slate-900 text-white">Medium Priority (24h SLA)</option>
                  <option value="low" className="bg-slate-900 text-white">Low Priority (72h SLA)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Equipment Category
              </label>
              <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 gap-2">
                <Wrench size={16} className="text-slate-400 shrink-0" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-white outline-hidden cursor-pointer"
                >
                  <option value="HVAC & Climate" className="bg-slate-900 text-white">HVAC & Climate</option>
                  <option value="Power & Electrical" className="bg-slate-900 text-white">Power & Electrical</option>
                  <option value="Hydraulics & Plumbing" className="bg-slate-900 text-white">Hydraulics & Plumbing</option>
                  <option value="Elevators & Lifts" className="bg-slate-900 text-white">Elevators & Lifts</option>
                  <option value="Fire & Safety" className="bg-slate-900 text-white">Fire & Safety</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Assign Lead Engineer
              </label>
              <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 gap-2">
                <User size={16} className="text-slate-400 shrink-0" />
                <select
                  value={formData.assignedTech}
                  onChange={(e) => setFormData({ ...formData, assignedTech: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-white outline-hidden cursor-pointer"
                >
                  <option value="Carlos Vance (Lead HVAC)" className="bg-slate-900 text-white">Carlos Vance (Lead HVAC)</option>
                  <option value="Sarah Lin (Electrical Eng)" className="bg-slate-900 text-white">Sarah Lin (Electrical Eng)</option>
                  <option value="David Martinez (Safety Auditor)" className="bg-slate-900 text-white">David Martinez (Safety Auditor)</option>
                  <option value="Auto-Assign by Proximity" className="bg-slate-900 text-white">Auto-Assign by Proximity</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Instructions & Diagnostic Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, sensor telemetry readings, safety requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 text-xs text-white outline-hidden transition-all placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  <span>Dispatch Work Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
