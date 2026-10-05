import React from 'react';
import { ChevronRight, MapPin, UserRound, ArrowUpRight, CalendarCheck } from 'lucide-react';
import { HEALTH, STAGE, worstHealth, pct, ago } from './status';
import { categoryShort } from './categoryIcon';
import { HealthStrip, HealthLegend, HealthGlyph, Sheet, Skeleton, EmptyState, CategoryIcon } from './primitives';
import { PriorityTag } from './DeviceTile';

/* ─────────────────────────────────────────────────────────────────────────────
   Signal hero — the one-look answer to "is everything OK?"
   ───────────────────────────────────────────────────────────────────────────── */

function sentence(t, places) {
  if (!t.total) return 'No equipment has been deployed here yet.';
  const where = places ? ` across ${places}` : '';
  const are = (n) => (n === 1 ? 'device is' : 'devices are');
  if (t.down && t.fix) return `${t.down} ${are(t.down)} broken and ${t.fix} ${t.fix === 1 ? 'is' : 'are'} being fixed${where}.`;
  if (t.down) return `${t.down} ${are(t.down)} broken${where}.`;
  if (t.fix) return `${t.fix} ${are(t.fix)} being fixed${where}.`;
  return `Everything is working${where}.`;
}

export function SignalHero({ tally, places, onFilter, openComplaints }) {
  const ok = pct(tally.ok, tally.total);
  const tiles = [
    { key: 'down', label: 'Broken', sub: 'needs repair', value: tally.down, filter: 'down' },
    { key: 'fix', label: 'Being fixed', sub: 'technician on it', value: tally.fix, filter: 'fix' },
    { key: 'unchecked', label: 'Not checked', sub: 'today, on site', value: tally.unchecked, filter: 'unchecked' },
    { key: 'complaints', label: 'Open complaints', sub: 'all stages', value: openComplaints, filter: 'problems' },
  ];
  return (
    <section className="fx-sheet relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-7 flex flex-col justify-between gap-6 lg:border-r border-[var(--line)]">
          <div>
            <div className="fx-eyebrow">Equipment working right now</div>
            <div className="mt-3 flex items-end gap-4">
              <span className="num text-[72px] sm:text-[88px] leading-[0.85] font-[620] tracking-[-0.06em]">
                {ok}<span className="text-[0.45em] tracking-[-0.02em] text-[var(--ink-3)] font-[560]">%</span>
              </span>
              <span className="pb-2 text-[13px] text-[var(--ink-3)] leading-snug">
                <span className="num font-[620] text-[var(--ink)]">{tally.ok}</span> of{' '}
                <span className="num">{tally.total}</span>
                <br />devices
              </span>
            </div>
            <p className="mt-4 text-[17px] sm:text-[19px] leading-snug font-[540] tracking-[-0.015em] text-[var(--ink)] max-w-[34ch]">
              {sentence(tally, places)}
            </p>
          </div>
          <div>
            <HealthStrip tally={tally} maxTicks={120} height={12} />
            <HealthLegend tally={tally} className="mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-2">
          {tiles.map((t, i) => {
            const tone = t.key === 'down' ? 'down' : t.key === 'fix' ? 'fix' : null;
            const hot = t.value > 0 && (t.key === 'down' || t.key === 'fix');
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onFilter?.(t.filter)}
                className={`group relative text-left p-5 sm:p-6 cursor-pointer transition-colors hover:bg-[var(--surface-2)] ${
                  i % 2 === 0 ? 'border-r' : ''
                } ${i < 2 ? 'border-b' : ''} border-[var(--line)]`}
                style={hot ? { background: `linear-gradient(160deg, ${HEALTH[tone].soft}, transparent 70%)` } : undefined}
              >
                <div className="flex items-center gap-2">
                  {tone ? (
                    <HealthGlyph health={tone} size={20} />
                  ) : t.key === 'unchecked' ? (
                    <span className="w-5 h-5 rounded-full border-2 border-dashed border-[var(--ink-4)]" />
                  ) : (
                    <span className="w-5 h-5 rounded-full grid place-items-center bg-[var(--ink)] text-[var(--paper)] text-[11px] font-[700]">!</span>
                  )}
                  <span className="text-[13px] font-[600] text-[var(--ink-2)]">{t.label}</span>
                  <ArrowUpRight size={14} className="ml-auto text-[var(--ink-4)] group-hover:text-[var(--ink)] transition-colors" />
                </div>
                <div
                  className="num mt-4 text-[44px] leading-none font-[620] tracking-[-0.05em]"
                  style={{ color: hot ? HEALTH[tone].color : 'var(--ink)' }}
                >
                  {t.value}
                </div>
                <div className="mt-2 text-[12px] text-[var(--ink-3)]">{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="h-[300px] !rounded-[14px]" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Locations — one row per location, equipment types as status-coloured icons
   ───────────────────────────────────────────────────────────────────────────── */

export function LocationRows({ rows, onOpen, title = 'Locations', eyebrow, action, emptyText = 'No locations yet.' }) {
  return (
    <Sheet title={title} eyebrow={eyebrow} action={action} bodyClassName="pb-1">
      {rows.length === 0 ? (
        <EmptyState icon={MapPin} title={emptyText} />
      ) : (
        <ul>
          {rows.map((r, i) => {
            const worst = worstHealth(r.tally);
            return (
              <li key={r.zone.id} className="fx-rise" style={{ '--i': i }}>
                <button
                  type="button"
                  onClick={() => onOpen(r.zone)}
                  className="group w-full text-left grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(200px,1.2fr)_minmax(0,1.5fr)_150px_20px] items-center gap-x-5 gap-y-3 px-5 py-4 border-t border-[var(--line)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="relative w-10 h-10 rounded-[11px] grid place-items-center bg-[var(--surface-3)] text-[var(--ink-2)] shrink-0">
                      <MapPin size={18} />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[var(--surface)]" style={{ background: HEALTH[worst].color }} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-[630] tracking-[-0.015em] truncate group-hover:text-[var(--accent)]">{r.zone.name}</div>
                      <div className="text-[12px] text-[var(--ink-3)] truncate">
                        <span className="num">{r.tally.total}</span> devices{r.areas ? <> · <span className="num">{r.areas}</span> areas</> : null}
                        {r.issues.length > 0 && <> · <span className="text-[var(--down-ink)] font-[560]"><span className="num">{r.issues.length}</span> open</span></>}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {r.categories.slice(0, r.categories.length > 5 ? 4 : 5).map((c) => {
                      const w = worstHealth(c.tally);
                      const bad = w === 'down' || w === 'fix';
                      return (
                        <span
                          key={c.id}
                          title={`${c.name}: ${c.tally.total} (${HEALTH[w].label.toLowerCase()})`}
                          className="flex flex-col items-center gap-1 w-[54px] shrink-0 py-1.5 rounded-[9px]"
                          style={{ background: bad ? HEALTH[w].soft : 'transparent' }}
                        >
                          <CategoryIcon name={c.name} size={17} style={{ color: bad ? HEALTH[w].color : 'var(--ink-3)' }} />
                          <span className="text-[10.5px] leading-none text-[var(--ink-2)] truncate max-w-[50px]">{categoryShort(c.name)}</span>
                          <span className="num text-[10.5px] leading-none font-[640]" style={{ color: bad ? HEALTH[w].ink : 'var(--ink-3)' }}>
                            {bad ? (c.tally.down || c.tally.fix) : c.tally.total}
                          </span>
                        </span>
                      );
                    })}
                    {r.categories.length > 5 && (
                      <span className="w-[40px] shrink-0 grid place-items-center text-[11px] font-[600] text-[var(--ink-3)] num">+{r.categories.length - 4}</span>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                    <HealthStrip tally={r.tally} maxTicks={24} height={8} />
                    <div className="flex justify-between text-[11px] text-[var(--ink-3)]">
                      <span><span className="num font-[620] text-[var(--ink-2)]">{pct(r.tally.ok, r.tally.total)}%</span> working</span>
                      {r.tally.live > 0 && (
                        <span className="inline-flex items-center gap-1"><CalendarCheck size={11} /><span className="num">{pct(r.tally.checked, r.tally.live)}%</span></span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="hidden md:block text-[var(--ink-4)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Equipment types — one card per category, worst first
   ───────────────────────────────────────────────────────────────────────────── */

export function TypeCards({ cats, onOpen }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {cats.map((c, i) => {
        const w = worstHealth(c.tally);
        const bad = w === 'down' || w === 'fix';
        return (
          <button
            key={c.id ?? 'none'}
            type="button"
            onClick={() => onOpen(c)}
            className="group fx-sheet fx-rise text-left p-4 flex flex-col gap-3.5 cursor-pointer transition-[transform,box-shadow] hover:-translate-y-[1px] hover:shadow-[var(--shadow-2)]"
            style={{ '--i': i }}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="w-10 h-10 rounded-[11px] grid place-items-center"
                style={{ background: bad ? HEALTH[w].soft : 'var(--surface-3)', color: bad ? HEALTH[w].color : 'var(--ink-2)' }}
              >
                <CategoryIcon name={c.name} size={20} strokeWidth={1.8} />
              </span>
              <span className="num text-[28px] leading-none font-[640] tracking-[-0.045em]">{c.tally.total}</span>
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-[620] truncate">{c.name}</div>
              <div className="text-[11.5px] mt-0.5 truncate" style={{ color: bad ? HEALTH[w].ink : 'var(--ink-3)' }}>
                {c.tally.down ? `${c.tally.down} broken` : ''}
                {c.tally.down && c.tally.fix ? ' · ' : ''}
                {c.tally.fix ? `${c.tally.fix} being fixed` : ''}
                {!bad && (c.tally.ok === c.tally.total ? 'All working' : `${c.tally.ok} working`)}
              </div>
            </div>
            <HealthStrip tally={c.tally} maxTicks={30} height={7} />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Problem feed — most urgent first, who's on it, how long
   ───────────────────────────────────────────────────────────────────────────── */

export function ProblemFeed({ problems, onOpen, limit = 7, action, title = 'Needs attention', catName }) {
  const list = problems.slice(0, limit);
  return (
    <Sheet title={title} eyebrow={`${problems.length} open`} action={action} bodyClassName="pb-1">
      {list.length === 0 ? (
        <div className="px-5 pb-6 pt-2 flex items-center gap-3">
          <HealthGlyph health="ok" size={30} />
          <div>
            <div className="text-[14px] font-[620]">Nothing needs attention</div>
            <div className="text-[12.5px] text-[var(--ink-3)]">No open complaints right now.</div>
          </div>
        </div>
      ) : (
        <ul>
          {list.map((p) => {
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onOpen(p)}
                  className="w-full text-left flex gap-3 px-5 py-3.5 border-t border-[var(--line)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  <span className="relative w-9 h-9 rounded-[10px] grid place-items-center shrink-0" style={{ background: HEALTH[p.health]?.soft, color: HEALTH[p.health]?.color }}>
                    <CategoryIcon name={catName?.get(p.device?.categoryId) || p.device?.name} size={17} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[13.5px] font-[620] truncate">{p.description || 'Problem reported'}</span>
                      <PriorityTag priority={p.priority} />
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] mt-0.5 min-w-0">
                      <span className="font-[560] text-[var(--ink-2)] truncate">{p.device?.name}</span>
                      {p.zone && <><span className="text-[var(--ink-4)]">·</span><span className="truncate">{p.zone.name}</span></>}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)] mt-1">
                      <UserRound size={11} />
                      <span className={p.technician ? '' : 'text-[var(--down-ink)] font-[560]'}>{p.technician || 'Nobody assigned'}</span>
                      <span className="text-[var(--ink-4)]">·</span>
                      {STAGE[p.status]?.label ?? p.status}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--ink-3)] whitespace-nowrap pt-0.5">{ago(p.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Small stat for secondary rows (people, tenancy, …)
   ───────────────────────────────────────────────────────────────────────────── */

export function MiniStat({ icon: Icon, label, value, sub, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`fx-sheet flex items-center gap-4 p-4 text-left ${onClick ? 'cursor-pointer hover:shadow-[var(--shadow-2)] hover:-translate-y-[1px] transition-[transform,box-shadow]' : ''}`}
    >
      <span className="w-10 h-10 rounded-[11px] grid place-items-center bg-[var(--surface-3)] text-[var(--ink-2)] shrink-0">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-[var(--ink-3)] font-[540]">{label}</div>
        <div className="num text-[24px] leading-tight font-[640] tracking-[-0.035em]">{value}</div>
        {sub && <div className="text-[11.5px] text-[var(--ink-3)] truncate">{sub}</div>}
      </div>
      {onClick && <ChevronRight size={16} className="text-[var(--ink-4)]" />}
    </Tag>
  );
}
