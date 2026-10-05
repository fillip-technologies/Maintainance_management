import React, { useMemo, useState } from 'react';
import { Search, ChevronRight, MapPin, Clock3, Plus, Inbox } from 'lucide-react';
import IssueDrawer from './IssueDrawer';
import { HEALTH, STAGE, PRIORITY, ago, ticketRef, byUrgency } from '../ui/status';
import { Avatar, EmptyState, Skeleton } from '../ui/primitives';
import { PriorityTag } from '../ui/DeviceTile';

/**
 * The repair pipeline as filters: each stage is a step with its count.
 * "Reported" folds in reopened tickets — both mean nobody has fixed it yet.
 */
const STEPS = [
  { key: 'reported', label: 'Reported', match: (s) => s === 'open' || s === 'reopened', tone: 'down' },
  { key: 'assigned', label: 'Assigned', match: (s) => s === 'assigned', tone: 'fix' },
  { key: 'in_progress', label: 'Being fixed', match: (s) => s === 'in_progress', tone: 'fix' },
  { key: 'on_hold', label: 'On hold', match: (s) => s === 'on_hold', tone: 'idle' },
  { key: 'resolved', label: 'Fixed · verify', match: (s) => s === 'resolved', tone: 'ok' },
  { key: 'closed', label: 'Closed', match: (s) => s === 'closed', tone: 'ok' },
];
const OPEN = new Set(['open', 'reopened', 'assigned', 'in_progress', 'on_hold']);

export default function TicketList({ tickets = [], loading = false, onOpenRequestModal, onRefresh }) {
  const [step, setStep] = useState('active');
  const [q, setQ] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const counts = useMemo(() => {
    const c = { active: 0, all: tickets.length };
    for (const s of STEPS) c[s.key] = 0;
    for (const t of tickets) {
      if (OPEN.has(t.status)) c.active += 1;
      const st = STEPS.find((s) => s.match(t.status));
      if (st) c[st.key] += 1;
    }
    return c;
  }, [tickets]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tickets
      .filter((t) => (step === 'all' ? true : step === 'active' ? OPEN.has(t.status) : STEPS.find((s) => s.key === step)?.match(t.status)))
      .filter((t) => !needle || [t.title, t.asset, t.zone, t.category, t.assignedTech, t.shortId].some((v) => String(v || '').toLowerCase().includes(needle)))
      .sort((a, b) => (OPEN.has(b.status) - OPEN.has(a.status)) || byUrgency(a, b));
  }, [tickets, step, q]);

  return (
    <div className="flex flex-col gap-5">
      {/* Pipeline */}
      <div className="fx-sheet p-2 overflow-x-auto fx-scroll">
        <div className="flex items-stretch gap-1 min-w-max">
          <StepButton active={step === 'active'} onClick={() => setStep('active')} label="Needs action" count={counts.active} strong />
          <span className="w-px bg-[var(--line)] mx-1 my-2" />
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <StepButton active={step === s.key} onClick={() => setStep(s.key)} label={s.label} count={counts[s.key]} tone={s.tone} />
              {i < STEPS.length - 1 && <ChevronRight size={14} className="self-center text-[var(--ink-4)] shrink-0" />}
            </React.Fragment>
          ))}
          <span className="w-px bg-[var(--line)] mx-1 my-2" />
          <StepButton active={step === 'all'} onClick={() => setStep('all')} label="All" count={counts.all} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px] max-w-[380px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problem, device, location, technician" className="fx-input pl-8" />
        </div>
        <span className="text-[12.5px] text-[var(--ink-3)]"><span className="num font-[620] text-[var(--ink-2)]">{visible.length}</span> shown</span>
      </div>

      <div className="fx-sheet overflow-hidden">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[68px]" />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={tickets.length === 0 ? 'No problems reported yet' : step === 'active' ? 'Nothing needs action' : 'Nothing in this stage'}
            body={tickets.length === 0 ? 'When something stops working, report it here and follow the repair to closure.' : 'Try another stage or clear the search.'}
            action={onOpenRequestModal && tickets.length === 0 && (
              <button className="fx-btn fx-btn-primary" onClick={onOpenRequestModal}><Plus size={15} /> Report a problem</button>
            )}
          />
        ) : (
          <ul>
            {visible.map((t, i) => {
              const stepMeta = STEPS.find((s) => s.match(t.status));
              const tone = stepMeta?.tone ?? 'idle';
              const done = !OPEN.has(t.status);
              return (
                <li key={t.id} className="fx-rise" style={{ '--i': Math.min(i, 20) }}>
                  <button
                    type="button"
                    onClick={() => setSelectedIssueId(t.id)}
                    className="group relative w-full text-left grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_170px_150px_24px] items-center gap-x-5 gap-y-2 pl-6 pr-5 py-4 border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] cursor-pointer"
                  >
                    <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: done ? 'var(--line-strong)' : PRIORITY[t.priority]?.color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <PriorityTag priority={t.priority} />
                        <span className={`text-[14px] font-[620] tracking-[-0.01em] truncate ${done ? 'text-[var(--ink-2)]' : ''}`}>{t.title || 'Problem reported'}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[var(--ink-3)]">
                        <span className="font-[580] text-[var(--ink-2)]">{t.asset}</span>
                        {t.zone && t.zone !== '—' && <span className="inline-flex items-center gap-1"><MapPin size={11} />{t.zone}</span>}
                        <span>{t.category}</span>
                        <span className="font-mono text-[11px]">{ticketRef(t.id)}</span>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 min-w-0">
                      {t.assignedTech ? (
                        <>
                          <Avatar name={t.assignedTech} size={24} />
                          <span className="text-[12.5px] font-[560] truncate">{t.assignedTech}</span>
                        </>
                      ) : (
                        <span className="text-[12.5px] font-[560]" style={{ color: done ? 'var(--ink-3)' : 'var(--down-ink)' }}>Nobody assigned</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end lg:items-start gap-1">
                      <span className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11.5px] font-[620]" style={{ background: HEALTH[tone].soft, color: HEALTH[tone].ink }}>
                        <span className="w-[6px] h-[6px] rounded-full" style={{ background: HEALTH[tone].color }} />
                        {STAGE[t.status]?.label ?? t.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-3)] font-mono"><Clock3 size={10.5} />{ago(t.createdAt)} ago</span>
                    </div>
                    <ChevronRight size={16} className="hidden lg:block text-[var(--ink-4)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedIssueId && (
        <IssueDrawer issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} onUpdated={onRefresh} />
      )}
    </div>
  );
}

function StepButton({ active, onClick, label, count, tone, strong }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start justify-center gap-1 px-4 py-2.5 rounded-[10px] min-w-[104px] cursor-pointer transition-colors ${
        active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-[var(--surface-2)]'
      }`}
    >
      <span className={`flex items-center gap-1.5 text-[11.5px] font-[580] whitespace-nowrap ${active ? 'opacity-75' : 'text-[var(--ink-3)]'}`}>
        {tone && <span className="w-[7px] h-[7px] rounded-full" style={{ background: HEALTH[tone].color }} />}
        {label}
      </span>
      <span className={`num leading-none tracking-[-0.04em] font-[640] ${strong ? 'text-[24px]' : 'text-[20px]'}`}>{count}</span>
    </button>
  );
}
