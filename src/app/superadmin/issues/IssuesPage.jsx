import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, RefreshCw, Search, ChevronRight, X,
  AlertTriangle, Clock, User, Cpu, Tag
} from 'lucide-react';
import { getIssues } from '../../api/issuesApi';
import { socketClient } from '../../api/socketClient';
import { getPriorityBadge, getIssueStatusBadge } from '../../../tokens';
import IssueDrawer from '../../common/IssueDrawer';

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

const priorityBadge = getPriorityBadge;
const statusBadge = getIssueStatusBadge;

export default function IssuesPage() {
  const [issues, setIssues]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [selectedId, setSelectedId]   = useState(null);

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

  return (
    <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issues & Defects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all defects logged across your organization. Click any defect to inspect details and audit history.
          </p>
        </div>

        <button
          onClick={fetchIssues}
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
          {STATUS_TABS.map((tab) => {
            const count = tab === 'all' ? counts.total ?? 0 : counts[tab] ?? 0;
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{pretty(tab)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Priority:</span>
            {PRIORITY_TABS.map((tab) => {
              const active = priorityFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setPriority(tab)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by unit, description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
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
                <th className="py-3 px-4 text-right">Details</th>
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

      {/* Issue detail drawer (read-only inspection of details & audit history) */}
      {selectedId && (
        <IssueDrawer
          issueId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={fetchIssues}
        />
      )}
    </div>
  );
}
