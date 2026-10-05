import React from 'react';
import { MapPin, UserRound, Clock3 } from 'lucide-react';
import { HEALTH, PRIORITY, STAGE, healthOf, ago } from './status';
import { CategoryIcon } from './primitives';

/** Small "checked today?" mark: solid when someone verified it today, dashed ring when not. */
export function CheckMark({ log, size = 14 }) {
  if (!log) {
    return (
      <span
        title="Not checked today"
        className="inline-block rounded-full border-[1.5px] border-dashed border-[var(--ink-4)] shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const color = log.status === 'working' ? 'var(--ok)' : log.status === 'not_working' ? 'var(--down)' : 'var(--fix)';
  const glyph = log.status === 'working'
    ? <path d="M2 5.2 4.1 7.2 8 2.9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    : log.status === 'not_working'
      ? <path d="M3 3l4 4M7 3 3 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      : <path d="M5 2.4v3.2M5 7.4v.1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />;
  return (
    <span
      title={log.status === 'working' ? 'Checked today · OK' : log.status === 'not_working' ? 'Checked today · not working' : 'Checked today · needs attention'}
      className="inline-grid place-items-center rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10" fill="none" aria-hidden="true">
        {glyph}
      </svg>
    </span>
  );
}

export function PriorityTag({ priority }) {
  const p = PRIORITY[priority];
  if (!p) return null;
  return (
    <span
      className="inline-flex items-center h-[18px] px-1.5 rounded-[5px] font-mono text-[10px] font-[600] text-white shrink-0"
      style={{ background: p.color }}
      title={`${p.label} priority`}
    >
      {p.code}
    </span>
  );
}

/**
 * One device on the board. Always shows: icon, code, name, area, health,
 * today's check. When something is wrong it also shows: priority, problem,
 * who's on it and how long it's been — the minimum the research asked for.
 */
export default function DeviceTile({ device, categoryName, areaName, onClick, highlight = false, style }) {
  const health = healthOf(device.status);
  const h = HEALTH[health];
  const issue = device.issue;
  const tinted = health === 'down' || health === 'fix';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...style,
        background: tinted ? `color-mix(in oklab, ${h.soft} 70%, var(--surface))` : 'var(--surface)',
        borderColor: tinted ? `color-mix(in oklab, ${h.color} 30%, var(--line))` : undefined,
        boxShadow: highlight ? `0 0 0 2px var(--accent), var(--shadow-2)` : undefined,
      }}
      className="group relative text-left w-full rounded-[12px] border border-[var(--line)] p-3 flex flex-col gap-2 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[1px] hover:shadow-[var(--shadow-2)] hover:border-[var(--line-strong)] cursor-pointer fx-rise"
    >
      {/* health spine */}
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: h.color }} />

      <div className="flex items-start gap-2.5">
        <span
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{ background: tinted ? 'var(--surface)' : 'var(--surface-2)', color: tinted ? h.color : 'var(--ink-2)' }}
        >
          <CategoryIcon name={categoryName || device.name} size={18} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10.5px] text-[var(--ink-3)] truncate">{device.code || '—'}</span>
            {health !== 'idle' && <span className="ml-auto"><CheckMark log={device.todayLog} size={13} /></span>}
          </div>
          <div className="text-[13.5px] font-[620] tracking-[-0.01em] text-[var(--ink)] truncate leading-tight mt-[2px]">
            {device.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)] min-w-0">
        <MapPin size={11.5} className="shrink-0" />
        <span className="truncate">{device.location || areaName || 'No area set'}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px] font-[620]" style={{ background: tinted ? 'var(--surface)' : h.soft, color: h.ink }}>
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: h.color }} />
          {h.label}
        </span>
        {issue && <PriorityTag priority={issue.priority} />}
        {device.openIssues > 1 && (
          <span className="text-[10.5px] font-mono text-[var(--ink-3)]">+{device.openIssues - 1}</span>
        )}
      </div>

      {issue && (
        <div className="pt-2 mt-0.5 border-t border-dashed" style={{ borderColor: `color-mix(in oklab, ${h.color} 25%, var(--line))` }}>
          <p className="text-[12px] text-[var(--ink)] leading-snug line-clamp-2">{issue.description || issue.category || 'Problem reported'}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--ink-3)]">
            <span className="inline-flex items-center gap-1 min-w-0">
              <UserRound size={11} className="shrink-0" />
              <span className="truncate">{issue.technician || 'Unassigned'}</span>
            </span>
            <span className="text-[var(--ink-4)]">·</span>
            <span className="whitespace-nowrap">{STAGE[issue.status]?.label ?? issue.status}</span>
            <span className="ml-auto inline-flex items-center gap-1 font-mono whitespace-nowrap">
              <Clock3 size={10.5} />
              {ago(issue.createdAt)}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
