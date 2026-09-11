import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Package, ArrowUpRight, MapPin, Plus, Trash2, Loader2, Settings } from 'lucide-react';
import { deleteZone } from '../../../api/zonesApi';
import { ZONE_GRADIENTS } from '../../../../tokens';

const GRADIENT = ZONE_GRADIENTS.map((g) => g.gradient);

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
    <div className="group bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] hover:border-indigo-500/50 shadow-md hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden min-h-[300px] text-white">

      {/* Top */}
      <div className="p-6 pb-3 flex items-start justify-between gap-3">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden`}
          onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
        >
          {zone.logoUrl
            ? <img src={zone.logoUrl} alt={zone.name} className="w-full h-full object-cover" />
            : <MapPin size={20} />
          }
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isActive
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : zone.status === 'inactive'
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {zone.status}
          </span>
        </div>
      </div>

      {/* Name */}
      <div
        className="px-6 pb-3 cursor-pointer"
        onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
      >
        <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors tracking-tight truncate">
          {zone.name}
        </h3>
        {zone._count && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {zone._count.children ?? 0} sub-zone{(zone._count.children ?? 0) !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Total products banner */}
      <div className="mx-6 mb-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Package size={13} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-slate-300">Total Devices</span>
        </div>
        <span className="text-sm font-black text-white">{total}</span>
      </div>

      {/* Working / Not Working tiles */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-3 flex-1">
        {/* Working */}
        <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Working</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 leading-none">{working}</span>
            <span className="text-[11px] font-bold text-emerald-300/80">units</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 mt-1">Online & Active</span>
        </div>

        {/* Not Working — high contrast red alert tile */}
        <button
          type="button"
          onClick={() => notWorking > 0 && onNotWorkingClick?.(zone.id, zone.name)}
          className={`group/btn flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all ${
            notWorking > 0
              ? 'bg-rose-500/15 border-rose-500/40 hover:bg-rose-500/25 hover:border-rose-400/70 cursor-pointer shadow-xs hover:shadow-rose-500/10'
              : 'bg-[var(--bg-main)] border-[var(--border-color)] opacity-75 cursor-default'
          }`}
          title={notWorking > 0 ? 'Click to see issues' : undefined}
        >
          <div className={`flex items-center gap-1.5 ${notWorking > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            <XCircle size={14} className={`shrink-0 ${notWorking > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${notWorking > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              Not Working
            </span>
            {notWorking > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse ml-auto" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black leading-none ${notWorking > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
              {notWorking}
            </span>
            <span className={`text-[11px] font-bold ${notWorking > 0 ? 'text-rose-300/90' : 'text-slate-500'}`}>
              units
            </span>
          </div>
          <span className={`text-[10px] font-bold mt-1 transition-colors ${
            notWorking > 0
              ? 'text-rose-300 group-hover/btn:text-white'
              : 'text-slate-400'
          }`}>
            {notWorking > 0 ? 'Tap to view issues →' : 'All OK'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2 bg-[var(--bg-card)]">
        <button
          onClick={() => onRaiseIssue?.(zone.id, zone.name)}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <Plus size={12} /> Raise Issue
        </button>

        <div className="flex items-center gap-2">
          {/* Manage */}
          <button
            onClick={() => onManage?.(zone)}
            title="Manage zone"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
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
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-rose-400 cursor-pointer'
            }`}
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>

          <button
            onClick={() => navigate(`${basePath}/zones/${zone.id}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors cursor-pointer"
          >
            View Details
            <div className="w-7 h-7 rounded-xl bg-[var(--bg-main)] group-hover:bg-indigo-600 text-slate-400 group-hover:text-white border border-[var(--border-color)] flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
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
