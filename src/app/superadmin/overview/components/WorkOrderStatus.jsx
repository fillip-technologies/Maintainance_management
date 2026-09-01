import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function WorkOrderStatus() {
  const [activeTab, setActiveTab] = useState('all');

  const tabData = {
    all: {
      total: 78,
      pctPreventive: 64,
      pctCorrective: 36,
      slaOnTime: '98.6%',
      segments: [
        { label: 'Open / Unassigned', count: 14, color: '#6366f1', pct: '18%', icon: Clock },
        { label: 'In Progress', count: 32, color: '#0ea5e9', pct: '41%', icon: PieIcon },
        { label: 'Waiting Spare Parts', count: 9, color: '#f59e0b', pct: '12%', icon: PauseCircle },
        { label: 'Overdue / Escalated', count: 5, color: '#f43f5e', pct: '6%', icon: AlertCircle },
        { label: 'Completed Today', count: 18, color: '#10b981', pct: '23%', icon: CheckCircle2 }
      ]
    },
    emergency: {
      total: 18,
      pctPreventive: 10,
      pctCorrective: 90,
      slaOnTime: '94.2%',
      segments: [
        { label: 'Open Critical', count: 4, color: '#6366f1', pct: '22%', icon: Clock },
        { label: 'Dispatched Team', count: 9, color: '#0ea5e9', pct: '50%', icon: PieIcon },
        { label: 'Awaiting OEM Parts', count: 2, color: '#f59e0b', pct: '11%', icon: PauseCircle },
        { label: 'SLA Breach Risk', count: 1, color: '#f43f5e', pct: '6%', icon: AlertCircle },
        { label: 'Resolved Today', count: 2, color: '#10b981', pct: '11%', icon: CheckCircle2 }
      ]
    },
    pm: {
      total: 50,
      pctPreventive: 100,
      pctCorrective: 0,
      slaOnTime: '99.8%',
      segments: [
        { label: 'Scheduled Ahead', count: 10, color: '#6366f1', pct: '20%', icon: Clock },
        { label: 'Under Routine Service', count: 23, color: '#0ea5e9', pct: '46%', icon: PieIcon },
        { label: 'Consumables Prep', count: 7, color: '#f59e0b', pct: '14%', icon: PauseCircle },
        { label: 'Action Follow-up', count: 4, color: '#f43f5e', pct: '8%', icon: AlertCircle },
        { label: 'Signed-off PMs', count: 6, color: '#10b981', pct: '12%', icon: CheckCircle2 }
      ]
    }
  };

  const current = tabData[activeTab];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Work Order Real-Time Pulse</h3>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              {current.total} Total Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Lifecycle tracking across Preventive ({current.pctPreventive}%) & Corrective ({current.pctCorrective}%) tickets
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
          <button
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Tickets
          </button>
          <button
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('emergency')}
          >
            Urgent SLA
          </button>
          <button
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pm'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('pm')}
          >
            Preventive
          </button>
        </div>
      </div>

      {/* Progress Bar Distribution */}
      <div className="py-1">
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
          {current.segments.map((seg, idx) => (
            <div
              key={idx}
              className="h-full transition-all duration-300"
              style={{ width: seg.pct, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.count}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {current.segments.map((status, i) => {
          const Icon = status.icon;
          return (
            <div key={i} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 gap-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status.color }}></span>
                  <span className="text-[11px] font-medium truncate">{status.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{status.pct}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{status.count}</span>
                <Icon size={16} className="text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer SLA Quick Benchmark */}
      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-sky-950 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-sky-600" />
          <span>
            <strong>{current.slaOnTime} On-Time Resolution</strong> across 24 Managed Facilities
          </span>
        </div>
        <a href="#/superadmin/work-orders" className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline">
          <span>Explore All Work Orders</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
