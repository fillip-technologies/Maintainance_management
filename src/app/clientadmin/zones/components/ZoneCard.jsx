import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Package, ArrowUpRight, MapPin, Plus, Trash2, Loader2, Settings } from 'lucide-react';
import { deleteZone } from '../../../api/zonesApi';

const GRADIENT = [
  'from-indigo-600 to-sky-500',
  'from-violet-600 to-purple-500',
  'from-emerald-600 to-teal-500',
  'from-rose-600 to-pink-500',
  'from-amber-600 to-orange-500',
  'from-cyan-600 to-blue-500',
];

export default function ZoneCard({ zone, stats = {}, index = 0, basePath = '/clientadmin', onNotWorkingClick, onRaiseIssue, onDeleted, onManage }) {
  const navigate = useNavigate();
  const gradient = GRADIENT[index % GRADIENT.length];
  const [deleting, setDeleting] = useState(false);
  const hasChildren = (zone._count?.children ?? 0) > 0;

  const handleDelete = async () => {
    if (hasChildren) {
      alert('Delete all sub-zones inside this zone first.');
      return;
    }
    if (!confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteZone(zone.id);
      onDeleted?.(zone.id);
    } catch (ex) {
      alert(ex.message || 'Failed to delete zone.');
    } finally {
      setDeleting(false);
    }
  };

  const total = stats.total ?? 0;
  const working = stats.working ?? 0;
  const faulty = (stats.faulty ?? 0) + (stats.underMaintenance ?? 0);
  const notWorking = faulty;

  const isActive = zone.status === 'active';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden min-h-[300px]">

      {/* Top */}
      <div className="p-6 pb-3 flex items-start justify-between gap-3">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer`}
          onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
        >
          <MapPin size={20} />
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : zone.status === 'inactive'
              ? 'bg-slate-100 text-slate-500 border-slate-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {zone.status}
          </span>
        </div>
      </div>

      {/* Name */}
      <div
        className="px-6 pb-3 cursor-pointer"
        onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
      >
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight truncate">
          {zone.name}
        </h3>
        {zone._count && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {zone._count.children ?? 0} sub-zone{(zone._count.children ?? 0) !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Total products banner */}
      <div className="mx-6 mb-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          <Package size={13} className="text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-600">Total Devices</span>
        </div>
        <span className="text-sm font-black text-slate-900">{total}</span>
      </div>

      {/* Working / Not Working tiles */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-3 flex-1">
        {/* Working */}
        <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 size={13} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Working</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 leading-none">{working}</span>
            <span className="text-[10px] font-semibold text-emerald-600/70">units</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 mt-1">Online & Active</span>
        </div>

        {/* Not Working — clickable */}
        <button
          type="button"
          onClick={() => notWorking > 0 && onNotWorkingClick?.(zone.id, zone.name)}
          className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all ${
            notWorking > 0
              ? 'bg-rose-50/70 border-rose-100 hover:bg-rose-100/80 hover:border-rose-300 cursor-pointer hover:shadow-sm'
              : 'bg-slate-50 border-slate-100 cursor-default'
          }`}
          title={notWorking > 0 ? 'Click to see issues' : undefined}
        >
          <div className={`flex items-center gap-1.5 ${notWorking > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
            <XCircle size={13} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Not Working</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black leading-none ${notWorking > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {notWorking}
            </span>
            <span className={`text-[10px] font-semibold ${notWorking > 0 ? 'text-rose-600/70' : 'text-slate-400'}`}>units</span>
          </div>
          <span className={`text-[10px] font-bold mt-1 ${notWorking > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {notWorking > 0 ? 'Tap to view issues →' : 'All OK'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onRaiseIssue?.(zone.id, zone.name)}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={12} /> Raise Issue
        </button>

        <div className="flex items-center gap-2">
          {/* Manage */}
          <button
            onClick={() => onManage?.(zone)}
            title="Manage zone"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Settings size={12} /> Manage
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title={hasChildren ? 'Remove sub-zones first' : 'Delete zone'}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors disabled:opacity-40 ${
              hasChildren
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-400 hover:text-rose-600 cursor-pointer'
            }`}
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>

          <button
            onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors cursor-pointer"
          >
            View Details
            <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
              <ArrowUpRight size={13} />
            </div>
          </button>
        </div>
      </div>

      {/* Color accent strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} absolute bottom-0 left-0`} />
    </div>
  );
}
