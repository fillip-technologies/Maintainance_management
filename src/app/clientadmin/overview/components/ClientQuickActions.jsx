import React from 'react';
import { PlusCircle, CalendarClock, Download, Headset, ShieldAlert } from 'lucide-react';

export default function ClientQuickActions({ onOpenRequestModal, onNotify }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Client Facility Quick Actions
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">Instant Operational Triggers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Action 1: Raise Request */}
        <button
          onClick={onOpenRequestModal}
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/70 text-emerald-900 transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <PlusCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">New Service Ticket</span>
            <span className="text-[11px] text-slate-600">Report issue or breakdown</span>
          </div>
        </button>

        {/* Action 2: Schedule PM */}
        <button
          onClick={() => onNotify('Preventive maintenance scheduling window opened. Engineer will confirm slot within 2h.')}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <CalendarClock size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Book PM Window</span>
            <span className="text-[11px] text-slate-500">Schedule certified servicing</span>
          </div>
        </button>

        {/* Action 3: Download SLA */}
        <button
          onClick={() => onNotify('Downloading August 2026 Comprehensive SLA Performance Report (PDF)...')}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Download size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Download SLA Report</span>
            <span className="text-[11px] text-slate-500">August 2026 Audit Report</span>
          </div>
        </button>

        {/* Action 4: Contact Dedicated Ops */}
        <button
          onClick={() => onNotify('Connecting you to Dedicated Fixly Account Lead: Sarah Jenkins (+91 98450 11223)')}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Headset size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Ops Lead Support</span>
            <span className="text-[11px] text-slate-500">24/7 dedicated escalation</span>
          </div>
        </button>
      </div>
    </div>
  );
}
