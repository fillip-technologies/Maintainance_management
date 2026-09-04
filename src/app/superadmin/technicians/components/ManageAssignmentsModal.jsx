import React, { useState, useEffect } from 'react';
import {
  X, Settings2, Building2, MapPin, Trash2, Plus, AlertTriangle, ShieldCheck, ChevronRight
} from 'lucide-react';
import { addTechnicianAssignment, removeTechnicianAssignment } from '../../../api/techniciansApi';
import { getClients } from '../../../api/clientsApi';
import { getZones } from '../../../api/zonesApi';

export default function ManageAssignmentsModal({ isOpen, technician, onClose, onUpdated }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);

  // Add-assignment form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [scope, setScope] = useState('org');   // 'org' | 'zone'
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Per-row remove state
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setAddError('');
    setRemoveError('');
    setSelectedClientId('');
    setScope('org');
    setSelectedZoneId('');
    setLoadingClients(true);
    getClients({ limit: 100 })
      .then((res) => setClients(res?.items ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedClientId) { setZones([]); setSelectedZoneId(''); return; }
    setLoadingZones(true);
    setSelectedZoneId('');
    getZones({ clientId: selectedClientId, limit: 100 })
      .then((res) => setZones(res?.items ?? []))
      .catch(() => setZones([]))
      .finally(() => setLoadingZones(false));
  }, [selectedClientId]);

  if (!isOpen || !technician) return null;

  const assignments = technician.assignments ?? [];

  const canAdd =
    selectedClientId &&
    (scope === 'org' || (scope === 'zone' && selectedZoneId)) &&
    !adding;

  const handleAdd = async () => {
    if (!canAdd) return;
    setAddError('');
    setAdding(true);
    try {
      const payload =
        scope === 'org'
          ? { clientId: selectedClientId }
          : { zoneId: selectedZoneId };
      await addTechnicianAssignment(technician.id, payload);
      onUpdated();
      setSelectedClientId('');
      setScope('org');
      setSelectedZoneId('');
    } catch (err) {
      setAddError(err.message || 'Failed to add assignment.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    setRemoveError('');
    setRemovingId(assignmentId);
    try {
      await removeTechnicianAssignment(technician.id, assignmentId);
      onUpdated();
    } catch (err) {
      setRemoveError(err.message || 'Failed to remove assignment.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Settings2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Manage Coverage</h2>
              <p className="text-xs text-slate-400">{technician.user?.name} — {technician.user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6 overflow-y-auto">

          {/* ── Current Assignments ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Current Coverage Assignments</span>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                {assignments.length}
              </span>
            </div>

            {removeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-rose-700">{removeError}</span>
              </div>
            )}

            {assignments.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed text-center">
                <span className="text-xs text-slate-400">No coverage assigned yet. Add one below.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {assignments.map((a) => {
                  const isOrg = !!a.clientId && !a.zoneId;
                  const isZone = !!a.zoneId;
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                        isOrg
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-indigo-50/60 border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isOrg ? (
                          <Building2 size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <MapPin size={14} className="text-indigo-600 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-bold truncate ${isOrg ? 'text-emerald-800' : 'text-indigo-800'}`}>
                            {isOrg ? a.client?.name : a.zone?.name}
                          </span>
                          {isOrg && (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <ShieldCheck size={10} />
                              Entire organization — covers all zones
                            </span>
                          )}
                          {isZone && a.zone?.client && (
                            <span className="text-[10px] text-indigo-500 font-medium">
                              {a.zone.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={removingId === a.id}
                        onClick={() => handleRemove(a.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                        title="Remove this assignment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Hierarchy note ── */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <ChevronRight size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              <strong>Hierarchy rule:</strong> Once assigned to an organization, the technician covers all its zones — you cannot add a specific zone under that organization. Once assigned to a zone, you cannot add any sub-zone under it (only higher-level units are allowed).
            </p>
          </div>

          {/* ── Add New Assignment ── */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700">Add New Assignment</span>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-rose-700">{addError}</span>
              </div>
            )}

            {/* Step 1: Pick organization / client */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                Organization
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); setScope('org'); setSelectedZoneId(''); setAddError(''); }}
                disabled={loadingClients}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 cursor-pointer disabled:opacity-60"
              >
                <option value="">{loadingClients ? 'Loading…' : '— Select organization —'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: scope toggle (only after org picked) */}
            {selectedClientId && (
              <div className="flex flex-col gap-2.5 pl-3 border-l-2 border-amber-300">
                <div className="text-[11px] font-bold text-slate-600">Assign coverage to:</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setScope('org'); setSelectedZoneId(''); setAddError(''); }}
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
                    onClick={() => { setScope('zone'); setAddError(''); }}
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

                {scope === 'org' && (
                  <p className="text-[11px] text-slate-500">
                    Covers the entire organization — issues from all zones route to this technician.
                  </p>
                )}

                {scope === 'zone' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <MapPin size={13} className="text-indigo-600" />
                      Zone
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => { setSelectedZoneId(e.target.value); setAddError(''); }}
                      disabled={loadingZones}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 cursor-pointer disabled:opacity-60"
                    >
                      <option value="">{loadingZones ? 'Loading zones…' : '— Select zone —'}</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                    {!loadingZones && zones.length === 0 && (
                      <span className="text-[11px] text-slate-500">No zones found for this organization.</span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!canAdd}
                  className="flex items-center gap-1.5 self-start px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm shadow-amber-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  {adding ? 'Adding…' : 'Add Assignment'}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
