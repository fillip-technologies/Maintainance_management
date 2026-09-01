import React, { useState } from 'react';
import {
  ClipboardList,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function ClientTicketStatus({ tickets, onOpenRequestModal, onNotify }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'scheduled':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
            <h2 className="text-sm font-bold text-slate-900">Active Service Tickets & Dispatches</h2>
            <p className="text-[11px] text-slate-500">Live tracker for reported faults and engineer visits</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'in progress', 'scheduled', 'resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenRequestModal}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex flex-col gap-3">
        {filteredTickets.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No tickets matching the selected filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onNotify(`Opened live tracking details for Ticket ${ticket.id}`)}
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
            >
              {/* Left Column: ID, Title, Asset, Category */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {ticket.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {ticket.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                    <span>Asset: <strong className="text-slate-700">{ticket.asset}</strong></span>
                    <span>Category: <span className="text-slate-600">{ticket.category}</span></span>
                    <span>Created: <span className="text-slate-600">{ticket.createdAt}</span></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Assigned Tech, ETA, and View Details */}
              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-1.5 text-xs font-semibold text-slate-800">
                    <User size={13} className="text-emerald-600" />
                    <span>{ticket.assignedTech}</span>
                  </div>
                  <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>ETA: <strong className="text-indigo-600">{ticket.eta}</strong></span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-indigo-600 group-hover:text-white border border-slate-200 text-slate-400 flex items-center justify-center transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
