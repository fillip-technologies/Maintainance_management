import React, { useEffect } from 'react';
import { X, MapPin, CalendarCheck, Tag, Hash, UserRound, Clock3, Plus, Layers } from 'lucide-react';
import { HEALTH, PRIORITY, STAGE, CHECK, healthOf, agoLong, ticketRef } from './status';
import { HealthGlyph, CategoryIcon } from './primitives';
import { CheckMark } from './DeviceTile';

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--line)] last:border-b-0">
      <Icon size={15} className="text-[var(--ink-3)] mt-[1px] shrink-0" />
      <div className="w-[108px] shrink-0 text-[12.5px] text-[var(--ink-3)]">{label}</div>
      <div className="flex-1 min-w-0 text-[13px] text-[var(--ink)] font-[520]">{children}</div>
    </div>
  );
}

/** Right-side detail panel for one device on the board. */
export default function DeviceDrawer({ device, categoryName, path = [], onClose, onRaiseProblem }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!device) return null;
  const health = healthOf(device.status);
  const h = HEALTH[health];
  const issue = device.issue;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label={`${device.name} details`}>
      <div className="absolute inset-0 bg-[rgba(12,14,17,0.32)] backdrop-blur-[2px]" onClick={onClose} />
      <aside
        className="relative h-full w-full max-w-[440px] bg-[var(--surface)] border-l border-[var(--line)] shadow-[var(--shadow-pop)] flex flex-col"
        style={{ animation: 'fx-slide-in 220ms cubic-bezier(.2,.7,.2,1) both' }}
      >
        {/* Header band, tinted by health */}
        <div className="px-6 pt-5 pb-6" style={{ background: `linear-gradient(180deg, ${h.soft}, transparent)` }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[var(--ink-3)]">{device.code || 'NO CODE'}</span>
            <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer" aria-label="Close">
              <X size={17} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <span className="w-14 h-14 rounded-[16px] grid place-items-center bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-1)]" style={{ color: h.color }}>
              <CategoryIcon name={categoryName || device.name} size={28} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[21px] font-[660] tracking-[-0.025em] text-[var(--ink)] leading-tight truncate">{device.name}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                <HealthGlyph health={health} size={18} />
                <span className="text-[13px] font-[620]" style={{ color: h.ink }}>{h.long}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto fx-scroll px-6 pb-6">
          {issue && (
            <div className="mb-5 rounded-[12px] border p-4" style={{ borderColor: `color-mix(in oklab, ${h.color} 35%, var(--line))`, background: `color-mix(in oklab, ${h.soft} 55%, var(--surface))` }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center h-[20px] px-1.5 rounded-[5px] font-mono text-[10.5px] font-[600] text-white" style={{ background: PRIORITY[issue.priority]?.color }}>
                  {PRIORITY[issue.priority]?.code}
                </span>
                <span className="text-[12px] font-[620] text-[var(--ink-2)]">{PRIORITY[issue.priority]?.label} priority</span>
                <span className="ml-auto font-mono text-[11px] text-[var(--ink-3)]">{ticketRef(issue.id)}</span>
              </div>
              <p className="mt-3 text-[14px] text-[var(--ink)] leading-snug font-[540]">{issue.description || 'Problem reported'}</p>
              {issue.category && <p className="mt-1 text-[12px] text-[var(--ink-3)]">{issue.category}</p>}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[9px] bg-[var(--surface)] border border-[var(--line)] px-2.5 py-2">
                  <div className="fx-eyebrow !text-[9.5px]">Stage</div>
                  <div className="mt-1 text-[12.5px] font-[620] text-[var(--ink)] truncate">{STAGE[issue.status]?.label ?? issue.status}</div>
                </div>
                <div className="rounded-[9px] bg-[var(--surface)] border border-[var(--line)] px-2.5 py-2">
                  <div className="fx-eyebrow !text-[9.5px]">On it</div>
                  <div className="mt-1 text-[12.5px] font-[620] text-[var(--ink)] truncate">{issue.technician || 'Nobody yet'}</div>
                </div>
                <div className="rounded-[9px] bg-[var(--surface)] border border-[var(--line)] px-2.5 py-2">
                  <div className="fx-eyebrow !text-[9.5px]">Open for</div>
                  <div className="mt-1 text-[12.5px] font-[620] text-[var(--ink)] truncate">{agoLong(issue.createdAt).replace(' ago', '')}</div>
                </div>
              </div>
              {device.openIssues > 1 && (
                <p className="mt-3 text-[12px] text-[var(--ink-3)]">+ {device.openIssues - 1} more open complaint{device.openIssues > 2 ? 's' : ''} on this device.</p>
              )}
            </div>
          )}

          <div className="fx-eyebrow mb-1">Details</div>
          <div>
            <Fact icon={Layers} label="Location">
              {path.length ? path.map((z) => z.name).join(' › ') : '—'}
            </Fact>
            <Fact icon={MapPin} label="Spot">{device.location || '—'}</Fact>
            <Fact icon={Tag} label="Type">{categoryName || '—'}{device.productType ? ` · ${device.productType}` : ''}</Fact>
            <Fact icon={CalendarCheck} label="Today's check">
              <span className="inline-flex items-center gap-2">
                <CheckMark log={device.todayLog} size={14} />
                {device.todayLog ? (CHECK[device.todayLog.status]?.label ?? 'Checked') : 'Not checked yet'}
              </span>
            </Fact>
            <Fact icon={Clock3} label="Last checked">
              {device.lastLogDate ? new Date(device.lastLogDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
            </Fact>
            <Fact icon={Hash} label="Open complaints"><span className="num">{device.openIssues || 0}</span></Fact>
            {issue?.technician && <Fact icon={UserRound} label="Technician">{issue.technician}</Fact>}
          </div>
        </div>

        {onRaiseProblem && (
          <div className="p-4 border-t border-[var(--line)] flex gap-2">
            <button type="button" className="fx-btn fx-btn-primary flex-1 h-10" onClick={onRaiseProblem}>
              <Plus size={16} />
              Raise a problem
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
