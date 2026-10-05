import React from 'react';
import { Check, Wrench, X, CircleDashed, RefreshCw } from 'lucide-react';
import { HEALTH, HEALTH_ORDER } from './status';
import { categoryIcon } from './categoryIcon';

/* ─────────────────────────────────────────────────────────────────────────────
   Brand
   ───────────────────────────────────────────────────────────────────────────── */

/** Logomark: a 2×2 "signal grid" — three working tiles and one live amber tick. */
export function BrandMark({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1b2027" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="rgba(255,255,255,0.08)" />
      <rect x="8" y="8" width="7" height="7" rx="2" fill="#eceef1" />
      <rect x="17" y="8" width="7" height="7" rx="2" fill="#eceef1" opacity="0.55" />
      <rect x="8" y="17" width="7" height="7" rx="2" fill="#eceef1" opacity="0.55" />
      <rect x="17" y="17" width="7" height="7" rx="2" fill="#2fc276" />
    </svg>
  );
}

export function Wordmark({ tone = 'light' }) {
  return (
    <span className="flex items-baseline gap-1.5 leading-none">
      <span className={`text-[19px] font-[680] tracking-[-0.03em] ${tone === 'light' ? 'text-[var(--rail-ink)]' : 'text-[var(--ink)]'}`}>
        fixly
      </span>
    </span>
  );
}

/** Line icon for an equipment type, looked up from its (free-text) name. */
export function CategoryIcon({ name, ...props }) {
  return React.createElement(categoryIcon(name), props);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Status
   ───────────────────────────────────────────────────────────────────────────── */

const GLYPH_ICON = { down: X, fix: Wrench, idle: CircleDashed, ok: Check };

/** Filled round chip with a shape-coded icon — readable without colour. */
export function HealthGlyph({ health = 'idle', size = 20, className = '' }) {
  const Icon = GLYPH_ICON[health] ?? CircleDashed;
  const h = HEALTH[health] ?? HEALTH.idle;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size, background: h.color, color: '#fff' }}
      title={h.label}
    >
      <Icon size={Math.round(size * 0.58)} strokeWidth={2.75} />
    </span>
  );
}

export function StatusDot({ health = 'idle', size = 8, live = false }) {
  const h = HEALTH[health] ?? HEALTH.idle;
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${live ? 'fx-live-dot' : ''}`}
      style={{ width: size, height: size, background: h.color, color: h.color }}
    />
  );
}

/** Soft pill: dot + one word. */
export function StatusPill({ health = 'idle', label, className = '', size = 'md' }) {
  const h = HEALTH[health] ?? HEALTH.idle;
  const pad = size === 'sm' ? 'h-[22px] px-2 text-[11px] gap-1.5' : 'h-[26px] px-2.5 text-[12px] gap-1.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-[600] whitespace-nowrap ${pad} ${className}`}
      style={{ background: h.soft, color: h.ink }}
    >
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: h.color }} />
      {label ?? h.label}
    </span>
  );
}

/**
 * The signature element: one tick per device, sorted worst-first, so a glance
 * reads "24 cameras — 2 red, 1 amber". Falls back to a proportional bar when
 * there are too many devices for ticks to stay legible.
 */
export function HealthStrip({ tally, maxTicks = 40, height = 14, className = '', animate = true }) {
  const total = tally?.total ?? 0;
  if (!total) {
    return <div className={`rounded-[3px] fx-hatch opacity-40 ${className}`} style={{ height }} />;
  }
  if (total <= maxTicks) {
    const ticks = [];
    for (const k of HEALTH_ORDER) for (let i = 0; i < (tally[k] ?? 0); i++) ticks.push(k);
    return (
      <div className={`flex gap-[2px] overflow-hidden min-w-0 ${className}`} style={{ height }} role="img" aria-label={stripLabel(tally)}>
        {ticks.map((k, i) => (
          <span
            key={i}
            className="flex-1 rounded-[2px] min-w-[2px] max-w-[10px]"
            style={{
              background: HEALTH[k].color,
              opacity: k === 'ok' ? 0.9 : 1,
              animation: animate ? `fx-rise 360ms ${Math.min(i * 12, 400)}ms both` : undefined,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className={`flex gap-[2px] overflow-hidden rounded-[3px] ${className}`} style={{ height }} role="img" aria-label={stripLabel(tally)}>
      {HEALTH_ORDER.filter((k) => tally[k]).map((k) => (
        <span
          key={k}
          className="h-full first:rounded-l-[3px] last:rounded-r-[3px]"
          style={{
            flexGrow: tally[k],
            flexBasis: 0,
            minWidth: 4,
            background: HEALTH[k].color,
            transformOrigin: 'left',
            animation: animate ? 'fx-grow 700ms cubic-bezier(.2,.7,.2,1) both' : undefined,
          }}
        />
      ))}
    </div>
  );
}

function stripLabel(t) {
  return HEALTH_ORDER.filter((k) => t[k]).map((k) => `${t[k]} ${HEALTH[k].label.toLowerCase()}`).join(', ');
}

/** Inline legend that only mentions the states that exist ("2 broken · 1 being fixed"). */
export function HealthLegend({ tally, className = '', showOk = true }) {
  const keys = HEALTH_ORDER.filter((k) => (tally?.[k] ?? 0) > 0 && (showOk || k !== 'ok'));
  if (!keys.length) return <span className={`text-[12px] text-[var(--ink-3)] ${className}`}>No equipment</span>;
  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] ${className}`}>
      {keys.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5 text-[var(--ink-2)]">
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: HEALTH[k].color }} />
          <span className="num font-[650] text-[var(--ink)]">{tally[k]}</span>
          {HEALTH[k].label.toLowerCase()}
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Layout
   ───────────────────────────────────────────────────────────────────────────── */

export function PageHeader({ eyebrow, title, meta, actions, className = '' }) {
  return (
    <header className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="fx-eyebrow mb-2 flex items-center gap-2">{eyebrow}</div>}
        <h1 className="text-[26px] sm:text-[30px] leading-[1.05] font-[660] tracking-[-0.035em] text-[var(--ink)] truncate">
          {title}
        </h1>
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--ink-3)]">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function Sheet({ title, eyebrow, action, children, className = '', bodyClassName = '', as: Tag = 'section', style }) {
  return (
    <Tag className={`fx-sheet overflow-hidden ${className}`} style={style}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {eyebrow && <div className="fx-eyebrow mb-1">{eyebrow}</div>}
            {title && <h2 className="text-[15px] font-[640] tracking-[-0.015em] text-[var(--ink)] truncate">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}

export function TextLink({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[12.5px] font-[600] text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer whitespace-nowrap ${className}`}
    >
      {children}
    </button>
  );
}

/** Segmented control — used for status filters and view switches. */
export function Segmented({ value, onChange, options, size = 'md', className = '' }) {
  const h = size === 'sm' ? 'h-8 text-[12px]' : 'h-9 text-[12.5px]';
  return (
    <div className={`inline-flex items-center p-[3px] rounded-[11px] bg-[var(--surface-3)] border border-[var(--line)] ${className}`} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`${h} px-3 rounded-[8px] inline-flex items-center gap-1.5 font-[600] cursor-pointer transition-all whitespace-nowrap ${
              active
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-1)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            {o.icon}
            {o.label}
            {o.count != null && (
              <span className="num text-[11px] text-[var(--ink-3)]">{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function RefreshButton({ onClick, spinning, label = 'Refresh' }) {
  return (
    <button type="button" onClick={onClick} className="fx-btn" title={label}>
      <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function EmptyState({ icon: Icon, title, body, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}>
      {Icon && (
        <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[var(--surface-3)] text-[var(--ink-3)] mb-4">
          <Icon size={22} />
        </span>
      )}
      <p className="text-[15px] font-[640] text-[var(--ink)]">{title}</p>
      {body && <p className="mt-1 text-[13px] text-[var(--ink-3)] max-w-sm">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '', style }) {
  return <div className={`fx-skel ${className}`} style={style} />;
}

export function Avatar({ name = '', size = 28, tone }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = tone ?? `hsl(${hue} 45% 92%)`;
  const fg = tone ? '#fff' : `hsl(${hue} 45% 28%)`;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const ini = (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] || '··').slice(0, 2)).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-[650] shrink-0 dark:opacity-90"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}
    >
      {ini}
    </span>
  );
}
