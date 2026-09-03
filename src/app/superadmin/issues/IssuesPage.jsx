import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, RefreshCw, Search, ChevronRight, X,
  AlertTriangle, Clock, User, Cpu, Tag, History, Building2, MapPin
} from 'lucide-react';
import { getIssues, getIssueById, getIssueHistory } from '../../api/issuesApi';
import { socketClient } from '../../api/socketClient';

// ─── helpers ────────────────────────────────────────────────────────────────

const PRIORITY_TABS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_TABS   = ['all', 'open', 'in_progress', 'on_hold', 'resolved', 'closed'];

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
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* header */}
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
              {/* Meta grid */}
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

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                  {issue.description || '—'}
                </p>
              </div>

              {/* Status history log */}
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
                        {/* dot */}
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
                              <span className="flex items-center gap-1">
                                <User size={10} />
                                {h.changedBy.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {fmtDate(h.changedAt)}
                            </span>
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

// ─── Main page ───────────────────────────────────────────────────────────────

export default function IssuesPage() {
  const [issues, setIssues]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

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

  // Client-side search on device name or description
  const filtered = issues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.device?.name?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.category?.name?.toLowerCase().includes(q)
    );
  });

  // Counts for the status strip
  const counts = issues.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    acc.total = (acc.total ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Issues & Defects
          </h1>
          <p className="text-xs text-slate-500">
            All defects raised across every organization — click a row to see its full status log.
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
        {/* Search */}
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
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
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

        {/* Priority filter */}
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
          <AlertTriangle size={14} />
          {error}
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                <tr><td colSpan="9" className="text-center py-14 text-slate-400">Loading issues…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-14 text-slate-400">No issues matching your filters.</td></tr>
              ) : (
                filtered.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedId(issue.id)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  >
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue detail drawer */}
      {selectedId && (
        <IssueDrawer issueId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
