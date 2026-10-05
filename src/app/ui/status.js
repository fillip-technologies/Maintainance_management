/**
 * One status language for the whole app.
 *
 * Three things are kept separate (they are often confused):
 *   1. Device health     — is the equipment working right now? (device.status)
 *   2. Today's check     — did someone physically verify it today? (daily log)
 *   3. Complaint stage   — where is the repair ticket? (issue.status)
 *
 * Health is the loudest signal and always maps to the same four colours:
 *   down (red) · fix (amber) · idle (grey) · ok (green)
 */

export const HEALTH = {
  down: { key: 'down', label: 'Broken', long: 'Not working', color: 'var(--down)', soft: 'var(--down-soft)', ink: 'var(--down-ink)', rank: 0 },
  fix:  { key: 'fix',  label: 'Being fixed', long: 'Under maintenance', color: 'var(--fix)', soft: 'var(--fix-soft)', ink: 'var(--fix-ink)', rank: 1 },
  idle: { key: 'idle', label: 'Not live', long: 'Installed, not live yet', color: 'var(--idle)', soft: 'var(--idle-soft)', ink: 'var(--idle-ink)', rank: 2 },
  ok:   { key: 'ok',   label: 'Working', long: 'Working normally', color: 'var(--ok)', soft: 'var(--ok-soft)', ink: 'var(--ok-ink)', rank: 3 },
};

export const HEALTH_ORDER = ['down', 'fix', 'idle', 'ok'];

/** Map a backend DeviceStatus to a health key. */
export function healthOf(status) {
  switch (status) {
    case 'faulty': return 'down';
    case 'under_maintenance': return 'fix';
    case 'active': return 'ok';
    default: return 'idle'; // provisioned / unknown
  }
}

/** Count devices into health buckets (+ today's-check coverage). */
export function tallyHealth(devices = []) {
  // checked/unchecked only count live equipment — a unit that isn't commissioned
  // yet has nothing to verify, so it shouldn't drag the daily-check score down.
  const t = { total: 0, down: 0, fix: 0, idle: 0, ok: 0, live: 0, checked: 0, unchecked: 0, issues: 0 };
  for (const d of devices) {
    const h = healthOf(d.status);
    t.total += 1;
    t[h] += 1;
    if (h !== 'idle') {
      t.live += 1;
      if (d.todayLog) t.checked += 1; else t.unchecked += 1;
    }
    if (d.openIssues) t.issues += d.openIssues;
  }
  return t;
}

/** Worst health present in a tally — used to colour a location / category. */
export function worstHealth(t) {
  if (!t || !t.total) return 'idle';
  if (t.down) return 'down';
  if (t.fix) return 'fix';
  if (t.ok) return 'ok';
  return 'idle';
}

export const CHECK = {
  working:         { label: 'Checked · OK', color: 'var(--ok)' },
  needs_attention: { label: 'Checked · needs attention', color: 'var(--fix)' },
  not_working:     { label: 'Checked · not working', color: 'var(--down)' },
};

export const STAGE = {
  open:        { label: 'Reported', tone: 'down' },
  reopened:    { label: 'Reopened', tone: 'down' },
  assigned:    { label: 'Assigned', tone: 'fix' },
  in_progress: { label: 'Being fixed', tone: 'fix' },
  on_hold:     { label: 'On hold', tone: 'idle' },
  resolved:    { label: 'Fixed · verify', tone: 'ok' },
  closed:      { label: 'Closed', tone: 'ok' },
};

export const OPEN_STAGES = ['open', 'assigned', 'in_progress', 'on_hold', 'reopened'];

export const PRIORITY = {
  critical: { code: 'P1', label: 'Critical', color: 'var(--down)', rank: 4 },
  high:     { code: 'P2', label: 'High', color: '#e8590c', rank: 3 },
  medium:   { code: 'P3', label: 'Medium', color: '#b45309', rank: 2 },
  low:      { code: 'P4', label: 'Low', color: '#6b7280', rank: 1 },
};

export function byUrgency(a, b) {
  return (PRIORITY[b.priority]?.rank ?? 0) - (PRIORITY[a.priority]?.rank ?? 0)
    || new Date(a.createdAt) - new Date(b.createdAt);
}

/** "4m", "3h", "2d" — compact age for dense tiles. */
export function ago(date, now = Date.now()) {
  if (!date) return '—';
  const s = Math.max(0, (now - new Date(date).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

/** "4 min ago" style for prose. */
export function agoLong(date, now = Date.now()) {
  if (!date) return 'never';
  const s = Math.max(0, (now - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) { const h = Math.floor(s / 3600); return `${h} hr${h > 1 ? 's' : ''} ago`; }
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

/** Short, human-scannable ticket reference from a UUID. */
export function ticketRef(id) {
  return id ? `#${String(id).replace(/-/g, '').slice(-5).toUpperCase()}` : '';
}

export function pct(n, d) {
  return d ? Math.round((n / d) * 100) : 0;
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '··';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}
