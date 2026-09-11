import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, X, ChevronRight, User, Clock, History,
  Paperclip, Loader2
} from 'lucide-react';
import { getIssueById, getIssueHistory } from '../api/issuesApi';
import { getPriorityBadge, getIssueStatusBadge } from '../../tokens';
import StatusHistoryLocationBadge from './components/StatusHistoryLocationBadge';

const pretty = (s) => (s ?? '').replace(/_/g, ' ');

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function IssueDrawer({ issueId, onClose, onUpdated }) {
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!issueId) return;
    setLoading(true);
    setError('');
    try {
      const [iss, hist] = await Promise.all([
        getIssueById(issueId),
        getIssueHistory(issueId)
      ]);
      setIssue(iss);
      setHistory(hist ?? []);
    } catch (err) {
      console.error('Failed to load issue details:', err);
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-xl h-full bg-[var(--bg-card)] border-l border-[var(--border-color)] text-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-slate-900/90 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <ClipboardList size={20} />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>Issue Detail & Log</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {issueId ? (issueId.length > 12 ? `${issueId.slice(0, 8).toUpperCase()}...` : issueId) : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-700"
            title="Close drawer (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {loading ? (
            <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
              <span>Loading issue details…</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          ) : !issue ? (
            <div className="py-24 text-center text-slate-400 text-xs">
              Issue not found.
            </div>
          ) : (
            <>
              {/* Status & Priority Overview Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                  <span className={`inline-block text-center px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${getIssueStatusBadge(issue.status)}`}>
                    {pretty(issue.status)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</span>
                  <span className={`inline-block text-center px-2 py-0.5 rounded border text-[11px] font-bold capitalize ${getPriorityBadge(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Raised</span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {fmtDate(issue.createdAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {fmtDate(issue.resolvedAt)}
                  </span>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit / Asset</span>
                  <span className="text-xs font-semibold text-slate-100">{issue.device?.name ?? '—'}</span>
                  {issue.device?.serialNumber && (
                    <span className="text-[11px] text-slate-400 font-mono">SN: {issue.device.serialNumber}</span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zone</span>
                  <span className="text-xs font-semibold text-indigo-400">
                    {issue.device?.zone?.name ?? issue.zone?.name ?? '—'}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</span>
                  <span className="text-xs font-semibold text-slate-200">{issue.category?.name ?? '—'}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Raised By</span>
                  <span className="text-xs font-semibold text-slate-200">{issue.raisedBy?.name ?? '—'}</span>
                  {issue.raisedBy?.email && (
                    <span className="text-[11px] text-slate-400">{issue.raisedBy.email}</span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Technician</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mt-0.5">
                    <User size={13} className={issue.assignedTechnician ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{issue.assignedTechnician?.user?.name ?? 'Unassigned'}</span>
                    {issue.assignedTechnician?.phone && (
                      <span className="text-slate-400 font-mono text-[11px]">({issue.assignedTechnician.phone})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <div className="text-xs text-slate-200 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap">
                  {issue.description || 'No description provided.'}
                </div>
              </div>

              {/* Attachments if any */}
              {Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Paperclip size={12} className="text-indigo-400" />
                    Attachments ({issue.attachments.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {issue.attachments.map((att, idx) => {
                      const url = typeof att === 'string' ? att : att?.url;
                      const name = typeof att === 'object' && att?.name ? att.name : `File ${idx + 1}`;
                      const isImg = typeof url === 'string' && (
                        url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
                        url.includes('cloudinary') ||
                        url.includes('image')
                      );
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden p-2 flex flex-col items-center gap-1.5 hover:border-indigo-500/60 transition-all text-center"
                          title="Click to view file"
                        >
                          {isImg ? (
                            <img
                              src={url}
                              alt={name}
                              className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-24 flex flex-col items-center justify-center bg-slate-800/80 rounded-lg text-slate-400 group-hover:text-indigo-300">
                              <Paperclip size={24} />
                            </div>
                          )}
                          <span className="text-[11px] text-slate-300 font-medium truncate w-full group-hover:text-indigo-300">
                            {name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status History Log with GPS Badges */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <History size={15} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white">Status History Log</span>
                  <span className="text-[11px] text-slate-400 font-medium">({history.length} events)</span>
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 pl-4">No history recorded yet.</p>
                ) : (
                  <ol className="relative border-l-2 border-slate-700 ml-2 flex flex-col gap-0">
                    {history.map((h, idx) => (
                      <li key={h.id ?? idx} className="pl-4 pb-4 relative">
                        {/* Timeline node */}
                        <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-400" />

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-slate-400">
                              {h.fromStatus ? pretty(h.fromStatus) : 'created'}
                            </span>
                            <ChevronRight size={11} className="text-slate-500" />
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border capitalize ${getIssueStatusBadge(h.toStatus)}`}>
                              {pretty(h.toStatus)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap mt-0.5">
                            {h.changedBy?.name && (
                              <span className="flex items-center gap-1">
                                <User size={10} className="text-slate-400" />
                                {h.changedBy.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={10} className="text-slate-400" />
                              {fmtDate(h.changedAt)}
                            </span>
                          </div>

                          {/* Coordinates / Location Display with Map Preview & Google Maps */}
                          <StatusHistoryLocationBadge
                            latitude={h.latitude}
                            longitude={h.longitude}
                          />

                          {h.notes && (
                            <p className="text-[11px] text-slate-300 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 mt-1 leading-relaxed">
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
