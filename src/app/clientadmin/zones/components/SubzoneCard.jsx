import React from "react";
import { CheckCircle2, XCircle, Wrench, Layers } from "lucide-react";

/**
 * SubzoneCard — Clean square card.
 * Shows: Sub-zone name + Working / Not Working / Maintenance product counts.
 */
export default function SubzoneCard({ sz, color }) {
  const stats = [
    {
      label: "Working",
      value: sz.working,
      Icon: CheckCircle2,
      valueCls: "text-emerald-600",
      iconCls:  "text-emerald-500",
      bg:       "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Not Working",
      value: sz.notWorking,
      Icon: XCircle,
      valueCls: "text-rose-600",
      iconCls:  "text-rose-500",
      bg:       "bg-rose-50 border-rose-100",
    },
    {
      label: "Maintenance",
      value: sz.maintenance,
      Icon: Wrench,
      valueCls: "text-amber-600",
      iconCls:  "text-amber-500",
      bg:       "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* ── Header: zone number + name ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        {/* Numbered badge */}
        <div
          className={`w-10 h-10 rounded-xl ${color.light} ${color.text} border ${color.border} flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <span className="text-[13px] font-extrabold">{sz.id.split("-SZ")[1]}</span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight truncate">
            {sz.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate">
            {sz.floor}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-slate-100" />

      {/* ── Total products count ── */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
        <Layers size={12} className="text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500">
          {sz.total} total products
        </span>
      </div>

      {/* ── 3 stat rows: Working / Not Working / Maintenance ── */}
      <div className="flex flex-col gap-2 px-4 pb-3 pt-2">
        {stats.map(({ label, value, Icon, valueCls, iconCls, bg }) => (
          <div
            key={label}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${bg}`}
          >
            <span className={`flex items-center gap-2 text-[11px] font-semibold text-slate-600`}>
              <Icon size={13} className={iconCls} />
              {label}
            </span>
            <span className={`text-[15px] font-extrabold ${valueCls}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-slate-100" />

      {/* ── Zone Officer (After the Data) ── */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-full ${color.light} ${color.text} border ${color.border} flex items-center justify-center shrink-0`}>
            <span className="text-[9px] font-extrabold">{sz.incharge.charAt(0)}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Zone Officer</span>
        </div>
        <span className="text-[12px] font-bold text-slate-800 truncate">{sz.incharge}</span>
      </div>

      {/* ── Bottom accent bar ── */}
      <div className={`h-1 w-full bg-gradient-to-r ${color.gradient} mt-auto`} />
    </div>
  );
}
