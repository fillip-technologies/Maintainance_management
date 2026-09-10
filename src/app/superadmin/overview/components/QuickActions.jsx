import React from 'react';
import {
  PlusCircle,
  Building2,
  CalendarPlus,
  UserCheck,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';

export default function QuickActions({ onOpenNewWorkOrder, onNotify }) {
  const actions = [
    {
      id: 'create_wo',
      title: 'Create Work Order',
      description: 'Log reactive or breakdown maintenance ticket',
      icon: PlusCircle,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Immediate Dispatch',
      handler: () => onOpenNewWorkOrder?.()
    },
    {
      id: 'reg_facility',
      title: 'Register Facility / Site',
      description: 'Add new client property or building zone',
      icon: Building2,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: 'Client Admin',
      handler: () => onNotify?.('Facility Wizard opened for onboarding new client campus.')
    },
    {
      id: 'schedule_pm',
      title: 'Schedule PM Routine',
      description: 'Set recurring inspection & service checklist',
      icon: CalendarPlus,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Preventive',
      handler: () => onNotify?.('PM Scheduler template loaded for 24 client facilities.')
    },
    {
      id: 'assign_tech',
      title: 'Assign Field Technician',
      description: 'Dispatch crew by proximity & skill match',
      icon: UserCheck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'Resource',
      handler: () => onNotify?.('Engineer dispatch pool: 9 technicians ready on standby.')
    },
    {
      id: 'scan_qr',
      title: 'Scan Asset QR / Barcode',
      description: 'Instant lookup for machinery telemetry & history',
      icon: QrCode,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'IoT Scanner',
      handler: () => onNotify?.('IoT Scanner initialized. Ready for machinery tag scan.')
    },
    {
      id: 'export_audit',
      title: 'Export CMMS Audit Report',
      description: 'Generate SLA compliance and MTTR PDF/CSV',
      icon: FileSpreadsheet,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: 'Superadmin',
      handler: () => onNotify?.('CMMS Compliance Audit report generated and downloaded.')
    }
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-white">Superadmin Quick Actions</h3>
        <p className="text-xs text-slate-400">
          Frequent operations & central control actions across all client facilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.handler}
              className="bg-[var(--bg-main)]/50 hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-blue-500/50 rounded-xl p-3.5 flex flex-col text-left gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105 ${act.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 group-hover:bg-blue-950/50 group-hover:text-blue-300 transition-colors px-1.5 py-0.5 rounded">
                  {act.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                {act.title}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {act.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
