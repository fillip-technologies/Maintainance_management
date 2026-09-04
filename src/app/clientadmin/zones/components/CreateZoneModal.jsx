import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { createZone, getZones } from '../../../api/zonesApi';

export default function CreateZoneModal({ isOpen, clientId, initialParentZoneId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [parentZoneId, setParentZoneId] = useState(initialParentZoneId ?? '');
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen || !clientId) return;
    setName('');
    setParentZoneId(initialParentZoneId ?? '');
    setErrorMsg(null);
    let cancelled = false;
    setLoadingZones(true);
    getZones({ clientId, limit: 100 })
      .then((d) => { if (!cancelled) setZones(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingZones(false); });
    return () => { cancelled = true; };
  }, [isOpen, clientId, initialParentZoneId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), clientId };
      if (parentZoneId) payload.parentZoneId = parentZoneId;
      const newZone = await createZone(payload);
      onCreated(newZone);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create zone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isParentLocked = !!initialParentZoneId;
  const parentZoneName = zones.find((z) => z.id === initialParentZoneId)?.name;

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
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isParentLocked ? 'Add Sub-Zone' : 'Create Zone'}
              </h2>
              <p className="text-xs text-slate-400">
                {isParentLocked && parentZoneName
                  ? `Under: ${parentZoneName}`
                  : 'Define a new zone for this facility'}
              </p>
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

          {/* Zone Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Zone Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Ground Floor, Block A, Server Room"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Parent Zone — hidden when locked */}
          {!isParentLocked && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Parent Zone <span className="text-slate-400 font-normal">(optional — leave blank for top-level)</span>
              </label>
              <select
                value={parentZoneId}
                onChange={(e) => setParentZoneId(e.target.value)}
                disabled={loadingZones}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60"
              >
                <option value="">{loadingZones ? 'Loading zones…' : 'No parent (top-level zone)'}</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          )}

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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating…' : isParentLocked ? 'Add Sub-Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
