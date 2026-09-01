import React from 'react';
import { Building2, ShieldCheck, PhoneCall, CheckCircle2, User, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ClientHeaderBanner({ facilityData, onOpenRequestModal }) {
  const { currentUser, isSuperAdmin } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-700/50">
      {/* Decorative background grid pattern and glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Facility Operations Active
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck size={13} className="text-indigo-400" />
              {facilityData.slaTier}
            </span>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Superadmin Inspection Mode
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Building2 className="text-emerald-400 shrink-0" size={28} />
            <span>{facilityData.facilityName}</span>
          </h1>

          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Client Portal for <span className="font-semibold text-white">{facilityData.clientOrganization}</span>. Monitor live asset health, raise maintenance work tickets, track engineer dispatches, and review SLA telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-2 text-xs text-slate-300 border-t border-slate-700/60 mt-1">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-indigo-400" />
              <span>Fixly Account Manager: <strong className="text-white">{facilityData.assignedAccountManager}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall size={14} className="text-emerald-400" />
              <span>24/7 Hotline: <strong className="text-emerald-300">{facilityData.emergencyContact}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-sky-400" />
              <span>Last Audit: <span className="text-slate-300">{facilityData.facilityStats.lastAuditDate}</span></span>
            </div>
          </div>
        </div>

        {/* Quick CTA inside banner */}
        <div className="flex flex-row lg:flex-col gap-3 shrink-0">
          <button
            onClick={onOpenRequestModal}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+ Raise Service Request</span>
          </button>
          <a
            href={`tel:${facilityData.emergencyContact}`}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-2xl border border-slate-700 transition-all"
          >
            <PhoneCall size={14} className="text-emerald-400" />
            <span>Emergency Dispatch</span>
          </a>
        </div>
      </div>
    </div>
  );
}
