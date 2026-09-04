import React, { useState } from 'react';
import {
  ClipboardList, Clock, User, ChevronRight, Plus,
  CheckSquare, Square, CheckCheck, Zap, X
} from 'lucide-react';
import { bulkUpdateStatus } from '../api/issuesApi';

const STATUS_TABS = ['all', 'open', 'in_progress', 'on_hold', 'resolved', 'closed'];

const BULK_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold',     label: 'On Hold'     },
  { value: 'resolved',    label: 'Resolved'    },
  { value: 'closed',      label: 'Closed'      },
  { value: 'reopened',    label: 'Reopen'      },
];

const prettyStatus = (s) => (s || '').replace(/_/g, ' ');

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getPriorityBadge = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high':     return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'medium':   return 'bg-sky-50 text-sky-700 border-sky-200';
    default:         return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'open':
    case 'reopened':    return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'assigned':    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'in_progress':
    case 'on_hold':     return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resolved':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed':      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:            return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// onRefresh — called after a successful bulk update so the parent can reload
export default function TicketList({ tickets = [], loading = false, onOpenRequestModal, onNotify, onRefresh }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected]         = useState(new Set());
  const [bulkStatus, setBulkStatus]     = useState('resolved');
  const [notes, setNotes]               = useState('');
  const [applying, setApplying]         = useState(false);

  const filteredTickets = tickets.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  const allSelected = filteredTickets.length > 0 && filteredTickets.every((t) => selected.has(t.id));

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filteredTickets.map((t) => t.id)));

  const handleApply = async () => {
    if (selected.size === 0 || applying) return;
    setApplying(true);
    try {
      const { updated, errors } = await bulkUpdateStatus({ ids: [...selected], status: bulkStatus, notes });
      setSelected(new Set());
      setNotes('');
      const msg = errors.length === 0
        ? `${updated.length} ticket${updated.length !== 1 ? 's' : ''} moved to "${prettyStatus(bulkStatus)}".`
        : `${updated.length} updated, ${errors.length} skipped (invalid transitions).`;
      onNotify?.(msg);
      onRefresh?.();
    } catch (err) {
      onNotify?.(err.message || 'Bulk update failed.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Defects & Service Tickets</h2>
            <p className="text-[11px] text-slate-500">Select tickets to bulk-update their status</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilterStatus(tab); setSelected(new Set()); }}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filterStatus === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {prettyStatus(tab)}
              </button>
            ))}
          </div>

          {onOpenRequestModal && (
            <button
              onClick={onOpenRequestModal}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Raise Query</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar — appears when anything is selected */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
            <CheckCheck size={14} />
            {selected.size} selected
          </div>

          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500 cursor-pointer text-slate-800"
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
            className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 placeholder:text-slate-400 flex-1 min-w-[140px]"
          />

          <button
            onClick={handleApply}
            disabled={applying}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Zap size={13} />
            {applying ? 'Applying…' : 'Apply to selected'}
          </button>

          <button
            onClick={() => setSelected(new Set())}
            className="text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer p-1"
            title="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tickets List */}
      <div className="flex flex-col gap-3">
        {/* Select-all row */}
        {filteredTickets.length > 1 && (
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={toggleAll}
              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              title={allSelected ? 'Deselect all' : 'Select all visible'}
            >
              {allSelected
                ? <CheckSquare size={14} className="text-indigo-600" />
                : <Square size={14} />}
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              {allSelected ? 'Deselect all' : `Select all ${filteredTickets.length}`}
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading service requests…</div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {tickets.length === 0
              ? 'No defects raised yet. Use "Raise Query" to report a faulty unit.'
              : 'No tickets matching the selected filter.'}
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = selected.has(ticket.id);
            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 hover:border-indigo-300'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleRow(ticket.id)}
                  className="self-start md:self-center text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                >
                  {isSelected
                    ? <CheckSquare size={16} className="text-indigo-600" />
                    : <Square size={16} />}
                </button>

                {/* Left Column */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {ticket.shortId || ticket.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadge(ticket.status)}`}>
                        {prettyStatus(ticket.status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {ticket.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                      <span>Unit: <strong className="text-slate-700">{ticket.asset}</strong></span>
                      {ticket.zone && ticket.zone !== '—' && (
                        <span>Zone: <strong className="text-indigo-600">{ticket.zone}</strong></span>
                      )}
                      <span>Category: <span className="text-slate-600">{ticket.category}</span></span>
                      <span>Raised: <span className="text-slate-600">{formatDate(ticket.createdAt)}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div
                  onClick={() => onNotify?.(`Ticket ${ticket.shortId || ticket.id} — ${prettyStatus(ticket.status)}`)}
                  className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 cursor-pointer"
                >
                  <div className="flex flex-col md:text-right">
                    <div className="flex items-center md:justify-end gap-1.5 text-xs font-semibold text-slate-800">
                      <User size={13} className={ticket.assignedTech ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>{ticket.assignedTech || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Clock size={12} className="text-slate-400" />
                      <span className="capitalize">{prettyStatus(ticket.status)}</span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-indigo-600 group-hover:text-white border border-slate-200 text-slate-400 flex items-center justify-center transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
