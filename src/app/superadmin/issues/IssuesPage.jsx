import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, RefreshCw, Search, ChevronRight, X,
  AlertTriangle, Clock, User, Cpu, Tag, History, CheckSquare, Square,
  CheckCheck, Zap
} from 'lucide-react';
import { getIssues, getIssueById, getIssueHistory, bulkUpdateStatus } from '../../api/issuesApi';
import { socketClient } from '../../api/socketClient';

// ─── helpers ────────────────────────────────────────────────────────────────

const PRIORITY_TABS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_TABS   = ['all', 'open', 'in_progress', 'on_hold', 'resolved', 'closed'];

const BULK_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold',     label: 'On Hold'     },
  { value: 'resolved',    label: 'Resolved'    },
  { value: 'closed',      label: 'Closed'      },
  { value: 'reopened',    label: 'Reopen'      },
];

const pretty = (s) => (s ?? '').replace(/_/g, ' ');

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const priorityBadge = (p) => {
  switch (p) {
    case 'critical': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high':     return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'medium':   return 'bg-sky-50 text-sky-700 border-sky-200';
    default:         return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const statusBadge = (s) => {
  switch (s) {
    case 'open':
    case 'reopened':    return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'assigned':    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'on_hold':     return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'resolved':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed':      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:            return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

// ─── Issue detail / log drawer ───────────────────────────────────────────────

function IssueDrawer({ issueId, onClose }) {
  const [issue, setIssue]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    setLoading(true);
    Promise.all([getIssueById(issueId), getIssueHistory(issueId)])
      .then(([iss, hist]) => { setIssue(iss); setHistory(hist ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [issueId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="text-sm font-bold">Issue Detail & Log</div>
              <div className="text-[11px] text-slate-400 font-mono">{issueId?.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading…</div>
          ) : !issue ? (
            <div className="py-16 text-center text-slate-400 text-xs">Issue not found.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Status',    value: <span className={`px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${statusBadge(issue.status)}`}>{pretty(issue.status)}</span> },
                  { label: 'Priority',  value: <span className={`px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${priorityBadge(issue.priority)}`}>{issue.priority}</span> },
                  { label: 'Unit',      value: issue.device?.name ?? '—' },
                  { label: 'Category',  value: issue.category?.name ?? '—' },
                  { label: 'Raised by', value: issue.raisedBy?.name ?? '—' },
                  { label: 'Assigned',  value: issue.assignedTechnician?.user?.name ?? 'Unassigned' },
                  { label: 'Raised',    value: fmtDate(issue.createdAt) },
                  { label: 'Resolved',  value: fmtDate(issue.resolvedAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="text-xs font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                  {issue.description || '—'}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800">Status History Log</span>
                  <span className="text-[11px] text-slate-400 font-medium">({history.length} entries)</span>
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 pl-5">No history recorded yet.</p>
                ) : (
                  <ol className="relative border-l-2 border-slate-200 ml-2 flex flex-col gap-0">
                    {history.map((h, idx) => (
                      <li key={h.id ?? idx} className="pl-4 pb-4 relative">
                        <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400" />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-slate-400">
                              {h.fromStatus ? pretty(h.fromStatus) : 'created'}
                            </span>
                            <ChevronRight size={11} className="text-slate-300" />
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border capitalize ${statusBadge(h.toStatus)}`}>
                              {pretty(h.toStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            {h.changedBy?.name && (
                              <span className="flex items-center gap-1"><User size={10} />{h.changedBy.name}</span>
                            )}
                            <span className="flex items-center gap-1"><Clock size={10} />{fmtDate(h.changedAt)}</span>
                          </div>
                          {h.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 mt-1">
                              {h.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk action bar ─────────────────────────────────────────────────────────

function BulkActionBar({ selectedCount, onApply, onClear, applying }) {
  const [bulkStatus, setBulkStatus] = useState('resolved');
  const [notes, setNotes]           = useState('');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 shrink-0">
        <CheckCheck size={16} className="text-indigo-400" />
        <span className="text-xs font-bold">{selectedCount} selected</span>
      </div>

      <div className="w-px h-6 bg-slate-700" />

      <select
        value={bulkStatus}
        onChange={(e) => setBulkStatus(e.target.value)}
        className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500 cursor-pointer"
      >
        {BULK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Note (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 placeholder:text-slate-500 w-40"
      />

      <button
        onClick={() => onApply(bulkStatus, notes)}
        disabled={applying}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
      >
        <Zap size={13} />
        {applying ? 'Applying…' : 'Apply'}
      </button>

      <button onClick={onClear} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function IssuesPage() {
  const [issues, setIssues]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [selectedId, setSelectedId]   = useState(null);

  // Multi-select
  const [selected, setSelected] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [bulkToast, setBulkToast] = useState(null);

  const showBulkToast = (msg) => { setBulkToast(msg); setTimeout(() => setBulkToast(null), 3500); };

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (statusFilter   !== 'all') params.status   = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const res = await getIssues(params);
      setIssues(res?.items ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchIssues();
    const u1 = socketClient.on('issue:created', fetchIssues);
    const u2 = socketClient.on('issue:updated', fetchIssues);
    return () => { u1(); u2(); };
  }, [fetchIssues]);

  // Clear selection whenever the list refreshes
  useEffect(() => { setSelected(new Set()); }, [issues]);

  const filtered = issues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.device?.name?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.category?.name?.toLowerCase().includes(q)
    );
  });

  const counts = issues.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    acc.total = (acc.total ?? 0) + 1;
    return acc;
  }, {});

  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const handleBulkApply = async (status, notes) => {
    if (selected.size === 0) return;
    setApplying(true);
    try {
      const { updated, errors } = await bulkUpdateStatus({ ids: [...selected], status, notes });
      await fetchIssues();
      if (errors.length === 0) {
        showBulkToast(`${updated.length} issue${updated.length !== 1 ? 's' : ''} moved to "${pretty(status)}".`);
      } else {
        showBulkToast(`${updated.length} updated, ${errors.length} skipped (invalid transitions).`);
      }
      setSelected(new Set());
    } catch (err) {
      showBulkToast(err.message || 'Bulk update failed.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-200">
      {/* Bulk toast */}
      {bulkToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCheck size={15} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{bulkToast}</span>
          <button onClick={() => setBulkToast(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X size={13} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Issues & Defects</h1>
          <p className="text-xs text-slate-500">
            All defects across every organization. Select rows with the checkbox to bulk-update status.
          </p>
        </div>
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer disabled:opacity-40 self-start"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Quick-count strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total',       value: counts.total ?? 0,       color: 'text-slate-900' },
          { label: 'Open',        value: counts.open ?? 0,        color: 'text-rose-600' },
          { label: 'In Progress', value: counts.in_progress ?? 0, color: 'text-amber-600' },
          { label: 'On Hold',     value: counts.on_hold ?? 0,     color: 'text-orange-600' },
          { label: 'Resolved',    value: counts.resolved ?? 0,    color: 'text-emerald-600' },
          { label: 'Closed',      value: counts.closed ?? 0,      color: 'text-slate-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex flex-col shadow-xs">
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search unit name, description, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={13} /></button>
          )}
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pretty(tab) || 'all'}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-0.5">
          {PRIORITY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setPriority(tab)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                priorityFilter === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertTriangle size={14} />{error}
        </div>
      )}

      {/* Issues table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <ClipboardList size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-900">All Issues</span>
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
          {selected.size > 0 && (
            <span className="ml-auto text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {selected.size} selected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={toggleAll}
                    className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allFilteredSelected ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
                  </button>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Raised By</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Raised</th>
                <th className="py-3 px-4 text-right">Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="10" className="text-center py-14 text-slate-400">Loading issues…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-14 text-slate-400">No issues matching your filters.</td></tr>
              ) : (
                filtered.map((issue) => {
                  const isSelected = selected.has(issue.id);
                  return (
                    <tr
                      key={issue.id}
                      onClick={() => setSelectedId(issue.id)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => toggleRow(issue.id, e)}
                          className="text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {isSelected
                            ? <CheckSquare size={15} className="text-indigo-600" />
                            : <Square size={15} />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${statusBadge(issue.status)}`}>
                          {pretty(issue.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${priorityBadge(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Cpu size={12} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{issue.device?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-600">{issue.category?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="text-slate-700 truncate" title={issue.description}>{issue.description}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400 shrink-0" />
                          <span className="text-slate-600">{issue.raisedBy?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={issue.assignedTechnician ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {issue.assignedTechnician?.user?.name ?? 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {fmtDate(issue.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-indigo-600 group-hover:text-white border border-slate-200 text-slate-400 flex items-center justify-center transition-all ml-auto">
                          <ChevronRight size={15} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue detail drawer */}
      {selectedId && (
        <IssueDrawer issueId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <BulkActionBar
          selectedCount={selected.size}
          onApply={handleBulkApply}
          onClear={() => setSelected(new Set())}
          applying={applying}
        />
      )}
    </div>
  );
}
