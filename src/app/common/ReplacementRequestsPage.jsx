import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, AlertTriangle, Check, X, Clock, User, Cpu, Tag, Wrench, MapPin, Repeat,
} from 'lucide-react';
import {
  getReplacementRequests,
  approveReplacementRequest,
  rejectReplacementRequest,
} from '../api/replacementRequestsApi';
import { socketClient } from '../api/socketClient';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'all'];

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:  'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const pretty = (s) => (s ?? '').replace(/_/g, ' ');

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function replacementLabel(r) {
  if (r.replacementChoice === 'in_stock') {
    return `In-stock spare: ${r.spareDeviceName ?? '—'}${r.spareDeviceCode ? ` (${r.spareDeviceCode})` : ''}`;
  }
  if (r.replacementChoice === 'new_device') return 'New hardware unit';
  return 'No replacement (slot left vacant)';
}

/**
 * Approval queue for technician equipment-replacement requests.
 * Shared by super_admin and client_admin — the backend scopes the list
 * (client_admin only ever receives requests for their own organization).
 */
export default function ReplacementRequestsPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('pending');
  const [busyId, setBusyId]     = useState(null);
  const [rejecting, setRejecting] = useState(null); // request being rejected
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReplacementRequests({ limit: 100 });
      setItems(res?.items ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load replacement requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const offs = ['replacement:requested', 'replacement:approved', 'replacement:rejected', 'replacement:completed']
      .map((evt) => socketClient.on(evt, load));
    return () => offs.forEach((off) => off && off());
  }, [load]);

  const counts = items.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  const visible = tab === 'all' ? items : items.filter((r) => r.status === tab);

  const handleApprove = async (r) => {
    setBusyId(r.id);
    setError('');
    try {
      await approveReplacementRequest(r.id);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    setError('');
    try {
      await rejectReplacementRequest(rejecting.id, rejectNote.trim());
      setRejecting(null);
      setRejectNote('');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Replacement Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Technicians must get approval before replacing equipment. Approve a request to let the
            technician proceed with the replacement.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {STATUS_TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                active ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{t}</span>
              <span className={`text-[10px] px-1.5 rounded-full font-bold ${active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {counts[t] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {loading && items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 py-14 text-center text-xs text-slate-400">
            Loading requests…
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 py-14 text-center text-xs text-slate-400">
            No {tab === 'all' ? '' : tab} replacement requests.
          </div>
        ) : (
          visible.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${STATUS_STYLE[r.status] ?? STATUS_STYLE.cancelled}`}>
                      {r.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <Cpu size={14} className="text-slate-400" />
                      {r.issue?.device?.name ?? 'Unit'}
                      {r.issue?.device?.code ? <span className="text-xs font-medium text-slate-400">· {r.issue.device.code}</span> : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Tag size={11} />{r.issue?.category?.name ?? '—'}</span>
                    {r.issue?.device?.zone?.name && (
                      <span className="flex items-center gap-1"><MapPin size={11} />{r.issue.device.zone.name}</span>
                    )}
                    <span className="flex items-center gap-1"><Wrench size={11} />{r.requestedBy?.name ?? 'Technician'}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{fmtDate(r.createdAt)}</span>
                  </div>
                </div>

                {r.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setRejecting(r); setRejectNote(''); }}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(r)}
                      disabled={busyId === r.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} /> {busyId === r.id ? 'Approving…' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason</p>
                  <p className="font-semibold text-slate-800 capitalize">{pretty(r.reason)}</p>
                  {r.notes && <p className="text-slate-600 mt-1">{r.notes}</p>}
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Replacement</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Repeat size={12} className="text-slate-400" />{replacementLabel(r)}
                  </p>
                </div>
              </div>

              {r.issue?.description && (
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Defect: </span>{r.issue.description}
                </p>
              )}

              {r.reviewedBy && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                  <User size={11} />
                  <span>
                    {r.status === 'rejected' ? 'Rejected' : 'Approved'} by{' '}
                    <span className="font-semibold text-slate-700">{r.reviewedBy.name}</span> · {fmtDate(r.reviewedAt)}
                  </span>
                  {r.reviewNote && <span className="text-slate-600">— “{r.reviewNote}”</span>}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Reject replacement request</h2>
              <p className="text-xs text-slate-500 mt-1">
                {rejecting.issue?.device?.name} — the technician will be notified.
              </p>
            </div>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Reason for rejecting (optional)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejecting(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejecting.id}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {busyId === rejecting.id ? 'Rejecting…' : 'Reject request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
