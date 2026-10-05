import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowUpRight, MapPin, Plus, Trash2, Loader2, Settings, LayoutGrid } from 'lucide-react';
import { deleteZone } from '../../../api/zonesApi';
import { HealthStrip } from '../../../ui/primitives';
import { HEALTH, worstHealth, pct } from '../../../ui/status';

export default function ZoneCard({ zone, stats = {}, basePath = '/clientadmin', onNotWorkingClick, onRaiseIssue, onDeleted, onManage }) {
  const navigate = useNavigate();
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
  const down = stats.faulty ?? 0;
  const fixing = stats.underMaintenance ?? 0;
  const notWorking = down + fixing;
  const tally = { total, ok: working, down, fix: fixing, idle: Math.max(0, total - working - down - fixing) };
  const worst = worstHealth(tally);
  const isActive = zone.status === 'active';
  const open = () => navigate(`${basePath}/board/${zone.id}`);

  return (
    <div className="group fx-sheet flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-2)]">
      <button type="button" onClick={open} className="text-left p-5 pb-4 flex items-start gap-3.5 cursor-pointer">
        <span className="relative w-11 h-11 rounded-[12px] overflow-hidden grid place-items-center bg-[var(--surface-3)] text-[var(--ink-2)] shrink-0">
          {zone.logoUrl ? <img src={zone.logoUrl} alt="" className="w-full h-full object-cover" /> : <MapPin size={19} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: HEALTH[worst].color }} />
            <span className="text-[15.5px] font-[640] tracking-[-0.02em] truncate group-hover:text-[var(--accent)]">{zone.name}</span>
          </span>
          <span className="block text-[12px] text-[var(--ink-3)] mt-0.5">
            <span className="num">{total}</span> devices
            {zone._count && <> · <span className="num">{zone._count.children ?? 0}</span> area{(zone._count.children ?? 0) !== 1 ? 's' : ''}</>}
          </span>
        </span>
        {!isActive && (
          <span className="text-[11px] font-[600] px-2 h-[22px] inline-flex items-center rounded-full bg-[var(--fix-soft)] text-[var(--fix-ink)] capitalize">{zone.status}</span>
        )}
      </button>

      <div className="px-5 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="num text-[34px] leading-none font-[640] tracking-[-0.05em]">
              {pct(working, total)}<span className="text-[16px] text-[var(--ink-3)] font-[560]">%</span>
            </div>
            <div className="text-[11.5px] text-[var(--ink-3)] mt-1">working now</div>
          </div>
          {notWorking > 0 ? (
            <button
              type="button"
              onClick={() => onNotWorkingClick?.(zone.id, zone.name)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-[620] cursor-pointer hover:brightness-95"
              style={{ background: HEALTH[down ? 'down' : 'fix'].soft, color: HEALTH[down ? 'down' : 'fix'].ink }}
            >
              <span className="num">{notWorking}</span> not working <ArrowUpRight size={13} />
            </button>
          ) : total > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-[var(--ok-ink)]"><CheckCircle2 size={14} /> All working</span>
          ) : null}
        </div>
        <HealthStrip tally={tally} maxTicks={32} height={8} className="mt-3.5" />
      </div>

      <div className="mt-auto flex items-center gap-1 px-3 py-2.5 border-t border-[var(--line)] bg-[var(--surface-2)]">
        <button type="button" onClick={open} className="fx-btn !h-8 !px-3 !text-[12.5px]">
          <LayoutGrid size={14} /> Open board
        </button>
        <button type="button" onClick={() => onRaiseIssue?.(zone.id)} className="fx-btn fx-btn-ghost !h-8 !px-2.5 !text-[12.5px]" title="Raise an issue here">
          <Plus size={14} /> Issue
        </button>
        <span className="flex-1" />
        <button type="button" onClick={() => navigate(`${basePath}/zones/${zone.id}`)} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer" title="Zone details & activity">
          <Package size={15} />
        </button>
        {onManage && (
          <button type="button" onClick={() => onManage(zone)} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer" title="Manage zone">
            <Settings size={15} />
          </button>
        )}
        <button type="button" onClick={handleDelete} disabled={deleting} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--down)] hover:bg-[var(--color-interactive-hover)] cursor-pointer disabled:opacity-50" title="Delete zone">
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </div>
  );
}
