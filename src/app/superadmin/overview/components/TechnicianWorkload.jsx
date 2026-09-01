import React from 'react';
import { Star, ArrowUpRight } from 'lucide-react';

export default function TechnicianWorkload() {
  const topTechs = [
    {
      name: 'Carlos Vance',
      role: 'Lead HVAC Specialist',
      tasksCompleted: 42,
      onTimeRate: '99.4%',
      status: 'On Job',
      rating: 4.9
    },
    {
      name: 'Sarah Lin',
      role: 'Electrical & Power Systems',
      tasksCompleted: 38,
      onTimeRate: '98.8%',
      status: 'Available',
      rating: 5.0
    },
    {
      name: 'David Martinez',
      role: 'Hydraulics & Safety Auditor',
      tasksCompleted: 35,
      onTimeRate: '97.6%',
      status: 'On Job',
      rating: 4.8
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Technician Dispatch & Capacity</h3>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              42 Active Techs
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time crew allocation and performance ratings
          </p>
        </div>

        <a href="#/superadmin/technicians" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
          <span>Team Roster</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Capacity Allocation Summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl flex flex-col items-center bg-sky-50 border border-sky-200 text-sky-700">
          <span className="text-xl font-extrabold text-sky-900">28</span>
          <span className="text-[11px] font-semibold">On Active Job</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-emerald-50 border border-emerald-200 text-emerald-700">
          <span className="text-xl font-extrabold text-emerald-900">9</span>
          <span className="text-[11px] font-semibold">Ready / Standby</span>
        </div>
        <div className="p-3 rounded-xl flex flex-col items-center bg-slate-50 border border-slate-200 text-slate-500">
          <span className="text-xl font-extrabold text-slate-700">5</span>
          <span className="text-[11px] font-semibold">Off Shift</span>
        </div>
      </div>

      {/* Top Performers List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Top Duty Engineers Today
        </span>
        {topTechs.map((tech, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {tech.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{tech.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    tech.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {tech.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{tech.role}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-extrabold text-slate-900">{tech.tasksCompleted}</span>
                <span className="text-[10px] text-slate-400">Jobs</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                <Star size={12} fill="#d97706" color="#d97706" />
                <span>{tech.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
