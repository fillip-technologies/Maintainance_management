// ═══════════════════════════════════════════════════════════════════════════════
// FIXLY — SHARED BADGE & STATUS CLASS UTILITIES
// Single source of truth for Tailwind class strings used by status/priority badges.
// These get overridden by the dark-mode CSS in tokens/colors.css.
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Priority Badge Classes
// Used by: IssuesPage, TicketList, ClientDetailDrawer, WorkOrderStatus
// ─────────────────────────────────────────────────────────────────────────────
export const PRIORITY_BADGE = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high:     'bg-amber-50 text-amber-700 border-amber-200',
  medium:   'bg-sky-50 text-sky-700 border-sky-200',
  low:      'bg-slate-50 text-slate-600 border-slate-200',
};

export const getPriorityBadge = (priority) => {
  return PRIORITY_BADGE[priority] || PRIORITY_BADGE.low;
};

// ─────────────────────────────────────────────────────────────────────────────
// Issue / Work-Order Status Badge Classes
// Used by: IssuesPage, TicketList, ClientDetailDrawer
// ─────────────────────────────────────────────────────────────────────────────
export const ISSUE_STATUS_BADGE = {
  open:        'bg-rose-50 text-rose-700 border-rose-200',
  assigned:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  on_hold:     'bg-orange-50 text-orange-700 border-orange-200',
  resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  reopened:    'bg-rose-50 text-rose-700 border-rose-200',
  closed:      'bg-slate-100 text-slate-500 border-slate-200',
};

export const getIssueStatusBadge = (status) => {
  return ISSUE_STATUS_BADGE[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

// ─────────────────────────────────────────────────────────────────────────────
// Device / Equipment Status Badge Classes
// Used by: ProductsList, ClientInventoryPage, ClientDetailDrawer
// ─────────────────────────────────────────────────────────────────────────────
export const DEVICE_STATUS_BADGE = {
  provisioned:       { label: 'In Stock',    color: 'bg-slate-100 text-slate-600 border-slate-300',      dot: 'bg-slate-400' },
  active:            { label: 'Active',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  under_maintenance: { label: 'Maintenance',  color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  faulty:            { label: 'Faulty',       color: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  retired:           { label: 'Retired',      color: 'bg-slate-100 text-slate-400 border-slate-200',      dot: 'bg-slate-300' },
  working:           { label: 'Working',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  not_working:       { label: 'Not Working',  color: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  needs_attention:   { label: 'Needs Attention', color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
};

export const getDeviceStatusBadge = (status) => {
  return DEVICE_STATUS_BADGE[status] || DEVICE_STATUS_BADGE.active;
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily Log Status Config
// Used by: LogEntryPanel, ZoneDailyLogPage
// ─────────────────────────────────────────────────────────────────────────────
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const LOG_STATUS_CONFIG = [
  {
    key:    'working',
    label:  'Working',
    icon:   CheckCircle2,
    active: 'bg-emerald-600 border-emerald-500 text-white shadow-sm',
    idle:   'bg-[var(--bg-main)] border-[var(--border-color)] text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10',
    dot:    'bg-emerald-500',
    badge:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    key:    'needs_attention',
    label:  'Needs Attention',
    icon:   AlertTriangle,
    active: 'bg-amber-500 border-amber-400 text-white shadow-sm',
    idle:   'bg-[var(--bg-main)] border-[var(--border-color)] text-slate-400 hover:border-amber-500/50 hover:text-amber-300 hover:bg-amber-500/10',
    dot:    'bg-amber-500',
    badge:  'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    key:    'not_working',
    label:  'Not Working',
    icon:   XCircle,
    active: 'bg-rose-600 border-rose-500 text-white shadow-sm',
    idle:   'bg-[var(--bg-main)] border-[var(--border-color)] text-slate-400 hover:border-rose-500/50 hover:text-rose-300 hover:bg-rose-500/10',
    dot:    'bg-rose-500',
    badge:  'bg-rose-100 text-rose-700 border-rose-200',
  },
];

export const getLogStatusConfig = (key) => LOG_STATUS_CONFIG.find((s) => s.key === key);
