import React, { useState } from 'react';
import {
  ClipboardList, Clock, User, ChevronRight, Plus, Loader2
} from 'lucide-react';
import { getPriorityBadge as _getPriorityBadge, getIssueStatusBadge as _getIssueStatusBadge } from '../../tokens';
import IssueDrawer from './IssueDrawer';

const STATUS_TABS = ['all', 'open', 'in_progress', 'on_hold', 'resolved', 'closed'];

const prettyStatus = (s) => (s || '').replace(/_/g, ' ');

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getPriorityBadge = (priority) => _getPriorityBadge(priority?.toLowerCase());

const getStatusBadge = (status) => _getIssueStatusBadge(status);

export default function TicketList({
  tickets = [],
  loading = false,
  onOpenRequestModal,
  onNotify,
  onRefresh
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const filteredTickets = tickets.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] shadow-xs flex flex-col gap-4 text-white">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25">
            <ClipboardList size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Defects & Service Tickets</h2>
            <p className="text-[11px] text-slate-400">Click any ticket to view details and status history log</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-color)] p-1 rounded-xl text-xs font-semibold">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {prettyStatus(tab)}
              </button>
            ))}
          </div>

          {onOpenRequestModal && (
            <button
              onClick={onOpenRequestModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Raise Query</span>
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-indigo-400" />
            <span>Loading service requests…</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            {tickets.length === 0
              ? 'No defects raised yet. Use "Raise Query" to report a faulty unit.'
              : 'No tickets matching the selected filter.'}
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedIssueId(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIssueId(ticket.id);
                }
              }}
              className="bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-indigo-500/60 rounded-xl p-4 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer shadow-xs hover:shadow-md outline-none focus:border-indigo-500"
            >
              {/* Left Column: ID, Badges, Title, Details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {ticket.shortId || ticket.id?.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadge(ticket.status)}`}>
                      {prettyStatus(ticket.status)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {ticket.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-0.5">
                    <span>Unit: <strong className="text-slate-200">{ticket.asset}</strong></span>
                    {ticket.zone && ticket.zone !== '—' && (
                      <span>Zone: <strong className="text-indigo-400">{ticket.zone}</strong></span>
                    )}
                    <span>Category: <span className="text-slate-300">{ticket.category}</span></span>
                    <span>Raised: <span className="text-slate-400">{formatDate(ticket.createdAt)}</span></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Assigned Tech, Status time, Chevron */}
              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[var(--border-color)]">
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-1.5 text-xs font-semibold text-slate-200">
                    <User size={13} className={ticket.assignedTech ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{ticket.assignedTech || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Clock size={12} className="text-slate-500" />
                    <span className="capitalize">{prettyStatus(ticket.status)}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] group-hover:bg-indigo-600 group-hover:text-white border border-[var(--border-color)] text-slate-400 flex items-center justify-center transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reusable Issue Drawer to open and view the defect log */}
      {selectedIssueId && (
        <IssueDrawer
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={onRefresh}
        />
      )}
    </div>
  );
}
