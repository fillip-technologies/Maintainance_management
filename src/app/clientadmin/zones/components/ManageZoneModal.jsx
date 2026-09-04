import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings, UserCheck, Loader2, AlertTriangle, UserMinus, UserPlus } from 'lucide-react';
import { updateZone, setZoneStatus, getZoneAssignments, assignUserToZone, removeUserFromZone } from '../../../api/zonesApi';
import { getUsers } from '../../../api/usersApi';

const STATUS_ACTIONS = {
  draft:    { label: 'Activate',     next: 'active',   color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  active:   { label: 'Deactivate',   next: 'inactive', color: 'bg-slate-200 hover:bg-slate-300 text-slate-700' },
  inactive: { label: 'Re-activate',  next: 'active',   color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
};

// ── In-Charge tab ─────────────────────────────────────────────────────────
function InChargeTab({ zone, clientId }) {
  const [assignments, setAssignments] = useState([]);
  const [allUsers, setAllUsers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning]     = useState(false);
  const [removingId, setRemovingId]   = useState(null);
  const [error, setError]             = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [asgn, users] = await Promise.all([
        getZoneAssignments(zone.id),
        getUsers({ clientId, role: 'zone_incharge', limit: 100 }),
      ]);
      const incharges = (asgn ?? []).filter((a) => a.role === 'incharge');
      setAssignments(incharges);
      setAllUsers(users.items ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load in-charge data.');
    } finally {
      setLoading(false);
    }
  }, [zone.id, clientId]);

  useEffect(() => { reload(); }, [reload]);

  const assignedIds = new Set(assignments.map((a) => a.userId ?? a.user?.id));
  const available   = allUsers.filter((u) => !assignedIds.has(u.id));

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setAssigning(true);
    setError(null);
    try {
      await assignUserToZone(zone.id, selectedUserId, 'incharge');
      setSelectedUserId('');
      await reload();
    } catch (err) {
      setError(err.message || 'Failed to assign in-charge.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    setRemovingId(assignmentId);
    setError(null);
    try {
      await removeUserFromZone(zone.id, assignmentId);
      await reload();
    } catch (err) {
      setError(err.message || 'Failed to remove assignment.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 justify-center py-12 text-slate-400 text-xs">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {/* Current in-charges */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current In-Charges</p>
        {assignments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No in-charge assigned yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-3.5 py-3 bg-indigo-50/60 border border-indigo-100 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {(a.user?.name ?? '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{a.user?.name ?? '—'}</p>
                    <p className="text-[11px] text-slate-500">{a.user?.email ?? '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={removingId === a.id}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  {removingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <UserMinus size={12} />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign new */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assign In-Charge</p>
        {available.length === 0 ? (
          <p className="text-xs text-slate-400">
            {allUsers.length === 0
              ? 'No zone in-charge accounts exist — create one from Team & Roles first.'
              : 'All available in-charges are already assigned to this zone.'}
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              <option value="">Select a person…</option>
              {available.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedUserId || assigning}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              {assigning ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
              Assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function ManageZoneModal({ zone: initialZone, clientId, onClose, onUpdated }) {
  const [zone, setZone]           = useState(initialZone);
  const [tab, setTab]             = useState('details');
  const [name, setName]           = useState(initialZone.name);
  const [savingName, setSavingName] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const statusAction = STATUS_ACTIONS[zone.status];

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === zone.name) return;
    setSavingName(true);
    setDetailsError(null);
    try {
      const updated = await updateZone(zone.id, { name: name.trim() });
      setZone((z) => ({ ...z, name: updated.name }));
      onUpdated?.(updated);
    } catch (err) {
      setDetailsError(err.message || 'Failed to rename zone.');
    } finally {
      setSavingName(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!statusAction) return;
    setTogglingStatus(true);
    setDetailsError(null);
    try {
      const updated = await setZoneStatus(zone.id, statusAction.next);
      setZone((z) => ({ ...z, status: updated.status }));
      onUpdated?.(updated);
    } catch (err) {
      setDetailsError(err.message || 'Failed to change zone status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  const STATUS_BADGE = {
    active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    draft:    'bg-amber-50 text-amber-700 border-amber-200',
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
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold truncate max-w-[240px]">Manage: {zone.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[zone.status]}`}>
                  {zone.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-1">
          {[
            { key: 'details', label: 'Details', icon: Settings },
            { key: 'incharge', label: 'In-Charge', icon: UserCheck },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-1 py-3 mr-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  tab === t.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {tab === 'details' && (
            <>
              {detailsError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  <AlertTriangle size={13} /> {detailsError}
                </div>
              )}

              {/* Rename */}
              <form onSubmit={handleSaveName} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Zone Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Zone name"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="submit"
                    disabled={savingName || !name.trim() || name.trim() === zone.name}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>

              {/* Status */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Zone Status</p>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 capitalize">{zone.status}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {zone.status === 'active' && 'Zone is live — devices and issues are tracked.'}
                      {zone.status === 'draft' && 'Assigning an in-charge will auto-activate this zone.'}
                      {zone.status === 'inactive' && 'Zone is paused — no new issues can be raised.'}
                    </p>
                  </div>
                  {statusAction && (
                    <button
                      onClick={handleStatusToggle}
                      disabled={togglingStatus}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0 ${statusAction.color}`}
                    >
                      {togglingStatus && <Loader2 size={12} className="animate-spin" />}
                      {statusAction.label}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'incharge' && (
            <InChargeTab zone={zone} clientId={clientId} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
