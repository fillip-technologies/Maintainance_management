import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Zap,
  Droplets,
  ArrowRight,
  Check
} from 'lucide-react';

export default function CriticalAlerts({ onNotify }) {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-1092',
      title: 'HVAC Chiller #4 High Compressor Vibration',
      facility: 'Horizon Data Center Alpha • Sector 3',
      severity: 'critical',
      time: '4 mins ago',
      assignedTo: 'Carlos Vance (Lead HVAC)',
      icon: Flame,
      action: 'Dispatch Team',
      dispatched: false
    },
    {
      id: 'ALT-1088',
      title: 'Main Transformer Backup Generator Voltage Fluctuation',
      facility: 'Global Logistics Hub #4 • Power Substation',
      severity: 'high',
      time: '18 mins ago',
      assignedTo: 'Sarah Lin (Electrical Eng)',
      icon: Zap,
      action: 'Review Telemetry',
      dispatched: false
    },
    {
      id: 'ALT-1074',
      title: 'Secondary Water Pump Line Pressure Drop < 30 PSI',
      facility: 'Marina Bay Medical Center • Basement 2',
      severity: 'warning',
      time: '42 mins ago',
      assignedTo: 'David Martinez',
      icon: Droplets,
      action: 'Assign Tech',
      dispatched: false
    }
  ]);

  const handleAction = (id, title, action) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dispatched: true } : a))
    );
    onNotify?.(`${action} triggered for ${id}: ${title}`);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Critical Faults & Emergency Logs</h3>
            <span className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
              {alerts.filter((a) => !a.dispatched).length} Active Incidents
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sensors and client emergency hotlines requiring Superadmin supervision
          </p>
        </div>

        <button className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer">
          <span>Incident Center</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';

          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                alert.dispatched
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : isCritical
                  ? 'bg-rose-50/40 border-rose-200 border-l-4 border-l-rose-500'
                  : isHigh
                  ? 'bg-amber-50/40 border-amber-200 border-l-4 border-l-amber-500'
                  : 'bg-blue-50/40 border-blue-200 border-l-4 border-l-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 min-w-9 rounded-lg flex items-center justify-center ${
                    alert.dispatched
                      ? 'bg-slate-100 text-slate-500'
                      : isCritical
                      ? 'bg-rose-100 text-rose-600'
                      : isHigh
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{alert.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        alert.dispatched
                          ? 'bg-slate-200 text-slate-700'
                          : isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isHigh
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.dispatched ? 'Actioned' : alert.severity}
                    </span>
                    <span className="text-[11px] text-slate-400">{alert.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{alert.title}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                    <span>{alert.facility}</span>
                    <span>• Assignee: <strong className="text-slate-700">{alert.assignedTo}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 ml-3">
                {alert.dispatched ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <Check size={14} />
                    <span>Dispatched</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAction(alert.id, alert.title, alert.action)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
