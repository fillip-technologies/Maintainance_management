import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getZoneAssignments, assignUserToZone, removeUserFromZone } from '../api/zonesApi';
import { getUsers } from '../api/usersApi';
import {
  Users, UserPlus, UserMinus, Loader2, AlertTriangle, RefreshCw, X
} from 'lucide-react';

// ── Assign Staff modal (inline, zone_incharge only) ───────────────────────
function AssignStaffModal({ zoneId, clientId, assignedIds, onClose, onAssigned }) {
  const [users, setUsers]           = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsers({ clientId, role: 'zone_staff', limit: 100 })
      .then((d) => { if (!cancelled) setUsers(d.items ?? []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load staff.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clientId]);

  const available = users.filter((u) => !assignedIds.has(u.id));

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      await assignUserToZone(zoneId, selectedUserId, 'staff');
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign staff.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Assign Zone Staff</h2>
              <p className="text-xs text-slate-400">Add a staff member to your zone</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertTriangle size={13} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 justify-center py-8 text-slate-400 text-xs">
              <Loader2 size={16} className="animate-spin" /> Loading staff…
            </div>
          ) : available.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {users.length === 0
                ? 'No zone staff accounts found. Ask your admin to create staff accounts first.'
                : 'All available staff are already assigned to this zone.'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Select Staff Member</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 cursor-pointer"
              >
                <option value="">Choose a person…</option>
                {available.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedUserId || submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Assigning…' : 'Assign to Zone'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ZoneTeamPage() {
  const { currentUser } = useAuth();
  const zoneId   = currentUser?.zoneId ?? null;
  const clientId = currentUser?.clientId ?? null;
  const isIncharge = currentUser?.role === 'zone_incharge';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [removingId, setRemovingId]   = useState(null);
  const [assignModal, setAssignModal] = useState(false);

  const load = useCallback(async () => {
    if (!zoneId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getZoneAssignments(zoneId);
      setAssignments((data ?? []).filter((a) => a.role === 'staff'));
    } catch (err) {
      setError(err.message || 'Failed to load team.');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (assignmentId) => {
    if (!confirm('Remove this staff member from the zone?')) return;
    setRemovingId(assignmentId);
    try {
      await removeUserFromZone(zoneId, assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      alert(err.message || 'Failed to remove assignment.');
    } finally {
      setRemovingId(null);
    }
  };

  const assignedIds = new Set(assignments.map((a) => a.userId ?? a.user?.id));

  if (!zoneId) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
          <Users size={26} />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">No zone assigned</h1>
        <p className="text-sm text-slate-500 max-w-md">
          You aren't assigned to a zone yet. Contact your administrator to get assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 py-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Team</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {isIncharge
              ? 'Manage zone staff assigned to your zone.'
              : 'Staff members assigned to your zone.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isIncharge && (
            <button
              onClick={() => setAssignModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-amber-200"
            >
              <UserPlus size={14} /> Assign Staff
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && assignments.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-16 bg-white rounded-2xl border border-slate-200">
          <Users size={24} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            {isIncharge
              ? 'No staff assigned yet — use "Assign Staff" to add team members.'
              : 'No staff assigned to this zone yet.'}
          </p>
        </div>
      )}

      {/* Staff list */}
      {!loading && !error && assignments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Staff Members ({assignments.length})
            </span>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            {assignments.map((a) => {
              const user = a.user ?? {};
              const initials = (user.name ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name ?? '—'}</p>
                      <p className="text-[11px] text-slate-500">{user.email ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Zone Staff
                    </span>
                    {isIncharge && (
                      <button
                        onClick={() => handleRemove(a.id)}
                        disabled={removingId === a.id}
                        title="Remove from zone"
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {removingId === a.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <UserMinus size={12} />}
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignModal && (
        <AssignStaffModal
          zoneId={zoneId}
          clientId={clientId}
          assignedIds={assignedIds}
          onClose={() => setAssignModal(false)}
          onAssigned={load}
        />
      )}
    </div>
  );
}
