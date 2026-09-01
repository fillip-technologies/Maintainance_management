import React from 'react';
import { Calendar, Clock, UserCheck, CheckCircle2 } from 'lucide-react';

export default function ClientMaintenanceSchedule({ schedule, onNotify }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Upcoming Preventive Servicing (PM)</h2>
            <p className="text-[11px] text-slate-500">Scheduled maintenance by certified Fixly engineers</p>
          </div>
        </div>

        <button
          onClick={() => onNotify('Requesting calendar sync for maintenance visits...')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          Sync to Outlook / Google
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {schedule.map((item) => (
          <div
            key={item.id}
            onClick={() => onNotify(`Viewing details for schedule item: ${item.title}`)}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-indigo-400 transition-colors">
                <span className="text-[9px] font-extrabold uppercase text-indigo-600">PM</span>
                <span className="text-xs font-bold text-slate-800">Fixly</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">ID: {item.id}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-1">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <UserCheck size={12} className="text-emerald-600" />
                  <span>{item.team}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-xs font-bold text-slate-800">{item.date}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock size={11} className="text-slate-400" />
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
