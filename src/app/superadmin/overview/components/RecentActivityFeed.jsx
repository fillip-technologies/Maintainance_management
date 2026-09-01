import React from 'react';
import {
  CheckCircle2,
  Cpu,
  UserCheck,
  FileCheck2
} from 'lucide-react';

export default function RecentActivityFeed() {
  const activities = [
    {
      id: 1,
      title: 'Work Order #WO-4920 Completed',
      desc: 'Carlos Vance replaced primary belt on HVAC Unit #4. Telemetry restored.',
      time: '5 mins ago',
      facility: 'Apex Tech Tower',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 2,
      title: 'Technician Dispatched for Elevator B',
      desc: 'Emergency vibration ticket assigned to David Martinez with priority SLA.',
      time: '19 mins ago',
      facility: 'Marina Bay Center',
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      id: 3,
      title: 'Monthly Generator Load Test Passed',
      desc: 'Automatic transfer switch & diesel generator passed 100% capacity check.',
      time: '45 mins ago',
      facility: 'Horizon Data Center Alpha',
      icon: FileCheck2,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      id: 4,
      title: 'Vibration Anomaly Detected by IoT Node',
      desc: 'Substation Pump #2 registered 4.2mm/s vibration (Warning Threshold).',
      time: '1h 10m ago',
      facility: 'Global Logistics Hub #4',
      icon: Cpu,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-slate-900">Live Activity & Dispatch Stream</h3>
        <p className="text-xs text-slate-500">
          System-wide audit trail of technician actions and telemetry events
        </p>
      </div>

      <div className="flex flex-col gap-4 relative pl-2 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-5 before:w-0.5 before:bg-slate-200">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-4 relative">
              <div
                className={`w-7 h-7 min-w-7 rounded-full border-2 flex items-center justify-center bg-white z-10 ${act.color}`}
              >
                <Icon size={14} />
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{act.title}</span>
                  <span className="text-[11px] text-slate-400">{act.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{act.desc}</p>
                <div className="mt-1">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {act.facility}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
