// ═══════════════════════════════════════════════════════════════════════════════
// FIXLY — COLOR TOKENS (JavaScript)
// Single source of truth for programmatic color access.
// Used by charts, maps, dynamic badge/status logic, and color map objects.
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Surfaces
// Dark-navy ramp: elevation via lighter surfaces, not shadows
// ─────────────────────────────────────────────────────────────────────────────
export const SURFACES = {
  base:      '#0a0f1e',
  sidebar:   '#070b16',
  card:      '#111a2f',
  cardHover: '#15213b',
  elevated:  '#182540',
  inset:     '#0a1120',
};

// ─────────────────────────────────────────────────────────────────────────────
// Borders
// Light white-alpha strokes instead of heavy shadows
// ─────────────────────────────────────────────────────────────────────────────
export const BORDERS = {
  default: 'rgba(255, 255, 255, 0.10)',
  hover:   'rgba(255, 255, 255, 0.18)',
  focus:   'rgba(99, 102, 241, 0.55)',
  divider: 'rgba(255, 255, 255, 0.07)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Text
// Primary off-white to avoid halation; secondary/tertiary ≥ 6:1
// ─────────────────────────────────────────────────────────────────────────────
export const TEXT = {
  primary:   '#f1f5f9',
  secondary: '#94a3b8',
  tertiary:  '#7c8db5',
  disabled:  '#55627a',
};

// ─────────────────────────────────────────────────────────────────────────────
// Brand
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND = {
  primary:      '#6366f1',
  primaryHover: '#818cf8',
  primaryMuted: 'rgba(99, 102, 241, 0.15)',
  primaryRing:  'rgba(129, 140, 248, 0.55)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Semantic Status Colors
// Each has: solid (badge dot/icon), muted (badge bg), text (badge text on dark), border
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS = {
  success: {
    solid:  '#22c55e',
    muted:  'rgba(34, 197, 94, 0.15)',
    text:   '#4ade80',
    border: 'rgba(34, 197, 94, 0.30)',
  },
  warning: {
    solid:  '#f59e0b',
    muted:  'rgba(245, 158, 11, 0.15)',
    text:   '#fbbf24',
    border: 'rgba(245, 158, 11, 0.30)',
  },
  danger: {
    solid:  '#ef4444',
    muted:  'rgba(239, 68, 68, 0.15)',
    text:   '#fda4af',
    border: 'rgba(239, 68, 68, 0.30)',
  },
  info: {
    solid:  '#3b82f6',
    muted:  'rgba(59, 130, 246, 0.15)',
    text:   '#7dd3fc',
    border: 'rgba(59, 130, 246, 0.30)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Priority Levels (for issues / work orders)
// Returns Tailwind class strings for badge rendering
// ─────────────────────────────────────────────────────────────────────────────
export const PRIORITY = {
  critical: {
    label: 'Critical',
    solid:  '#f43f5e',
    muted:  'rgba(244, 63, 94, 0.15)',
    text:   '#fda4af',
    border: 'rgba(244, 63, 94, 0.30)',
  },
  high: {
    label: 'High',
    solid:  '#f59e0b',
    muted:  'rgba(245, 158, 11, 0.15)',
    text:   '#fbbf24',
    border: 'rgba(245, 158, 11, 0.30)',
  },
  medium: {
    label: 'Medium',
    solid:  '#0ea5e9',
    muted:  'rgba(14, 165, 233, 0.15)',
    text:   '#38bdf8',
    border: 'rgba(14, 165, 233, 0.30)',
  },
  low: {
    label: 'Low',
    solid:  '#64748b',
    muted:  'rgba(100, 116, 139, 0.15)',
    text:   '#94a3b8',
    border: 'rgba(100, 116, 139, 0.30)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Device / Equipment Status
// ─────────────────────────────────────────────────────────────────────────────
export const DEVICE_STATUS = {
  active: {
    label: 'Active',
    solid:  '#22c55e',
    muted:  'rgba(34, 197, 94, 0.15)',
    text:   '#4ade80',
    border: 'rgba(34, 197, 94, 0.30)',
  },
  faulty: {
    label: 'Faulty',
    solid:  '#ef4444',
    muted:  'rgba(239, 68, 68, 0.15)',
    text:   '#fda4af',
    border: 'rgba(239, 68, 68, 0.30)',
  },
  under_maintenance: {
    label: 'Under Maintenance',
    solid:  '#f59e0b',
    muted:  'rgba(245, 158, 11, 0.15)',
    text:   '#fbbf24',
    border: 'rgba(245, 158, 11, 0.30)',
  },
  provisioned: {
    label: 'Provisioned',
    solid:  '#0ea5e9',
    muted:  'rgba(14, 165, 233, 0.15)',
    text:   '#38bdf8',
    border: 'rgba(14, 165, 233, 0.30)',
  },
  retired: {
    label: 'Retired',
    solid:  '#64748b',
    muted:  'rgba(100, 116, 139, 0.15)',
    text:   '#94a3b8',
    border: 'rgba(100, 116, 139, 0.30)',
  },
  working: {
    label: 'Working',
    solid:  '#22c55e',
    muted:  'rgba(34, 197, 94, 0.15)',
    text:   '#4ade80',
    border: 'rgba(34, 197, 94, 0.30)',
  },
  not_working: {
    label: 'Not Working',
    solid:  '#ef4444',
    muted:  'rgba(239, 68, 68, 0.15)',
    text:   '#fda4af',
    border: 'rgba(239, 68, 68, 0.30)',
  },
  needs_attention: {
    label: 'Needs Attention',
    solid:  '#f59e0b',
    muted:  'rgba(245, 158, 11, 0.15)',
    text:   '#fbbf24',
    border: 'rgba(245, 158, 11, 0.30)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Issue / Work-Order Status
// ─────────────────────────────────────────────────────────────────────────────
export const ISSUE_STATUS = {
  open: {
    label: 'Open',
    solid:  '#6366f1',
    muted:  'rgba(99, 102, 241, 0.15)',
    text:   '#a5b4fc',
    border: 'rgba(99, 102, 241, 0.30)',
  },
  assigned: {
    label: 'Assigned',
    solid:  '#0ea5e9',
    muted:  'rgba(14, 165, 233, 0.15)',
    text:   '#38bdf8',
    border: 'rgba(14, 165, 233, 0.30)',
  },
  in_progress: {
    label: 'In Progress',
    solid:  '#8b5cf6',
    muted:  'rgba(139, 92, 246, 0.15)',
    text:   '#c4b5fd',
    border: 'rgba(139, 92, 246, 0.30)',
  },
  on_hold: {
    label: 'On Hold',
    solid:  '#f59e0b',
    muted:  'rgba(245, 158, 11, 0.15)',
    text:   '#fbbf24',
    border: 'rgba(245, 158, 11, 0.30)',
  },
  resolved: {
    label: 'Resolved',
    solid:  '#22c55e',
    muted:  'rgba(34, 197, 94, 0.15)',
    text:   '#4ade80',
    border: 'rgba(34, 197, 94, 0.30)',
  },
  reopened: {
    label: 'Reopened',
    solid:  '#f43f5e',
    muted:  'rgba(244, 63, 94, 0.15)',
    text:   '#fda4af',
    border: 'rgba(244, 63, 94, 0.30)',
  },
  closed: {
    label: 'Closed',
    solid:  '#64748b',
    muted:  'rgba(100, 116, 139, 0.15)',
    text:   '#94a3b8',
    border: 'rgba(100, 116, 139, 0.30)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Chart / Data Visualization Palette
// 8 accessible, distinct colors for charts, maps, and data viz
// ─────────────────────────────────────────────────────────────────────────────
export const CHART_PALETTE = [
  '#6366f1', // indigo (brand)
  '#22c55e', // green
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
];

// ─────────────────────────────────────────────────────────────────────────────
// Zone Gradients
// Each entry: { gradient, badge, text, border, dot }
// gradient = from-* to-* classes
// ─────────────────────────────────────────────────────────────────────────────
export const ZONE_GRADIENTS = [
  { gradient: 'from-indigo-600/80 to-blue-500/60',  badge: 'bg-indigo-500/15',  text: 'text-indigo-300',  border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
  { gradient: 'from-violet-600/80 to-purple-500/60', badge: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  { gradient: 'from-emerald-600/80 to-teal-500/60',  badge: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  { gradient: 'from-rose-600/80 to-pink-500/60',     badge: 'bg-rose-500/15',   text: 'text-rose-300',   border: 'border-rose-500/30',   dot: 'bg-rose-400' },
  { gradient: 'from-amber-600/80 to-orange-500/60',  badge: 'bg-amber-500/15',  text: 'text-amber-300',  border: 'border-amber-500/30',  dot: 'bg-amber-400' },
  { gradient: 'from-cyan-600/80 to-blue-400/60',     badge: 'bg-cyan-500/15',   text: 'text-cyan-300',   border: 'border-cyan-500/30',   dot: 'bg-cyan-400' },
  { gradient: 'from-rose-600/80 to-amber-500/60',    badge: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  { gradient: 'from-teal-600/80 to-emerald-500/60',  badge: 'bg-teal-500/15',   text: 'text-teal-300',   border: 'border-teal-500/30',   dot: 'bg-teal-400' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Equipment Category Colors
// Used by equipmentIcons.jsx getCategoryBadgeConfig()
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  cameras:       { bg: '#22c55e', text: '#4ade80', border: 'rgba(34, 197, 94, 0.30)' },
  nvr:           { bg: '#3b82f6', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.30)' },
  switches:      { bg: '#8b5cf6', text: '#c4b5fd', border: 'rgba(139, 92, 246, 0.30)' },
  routers:       { bg: '#06b6d4', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.30)' },
  fiber:         { bg: '#f59e0b', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.30)' },
  ups:           { bg: '#ef4444', text: '#fda4af', border: 'rgba(239, 68, 68, 0.30)' },
  accessControl: { bg: '#6366f1', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.30)' },
  default:       { bg: '#3b82f6', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.30)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Role Colors
// For personnel/team cards (purple=officers, teal=staff, amber=technicians)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_COLORS = {
  zone_officer: {
    solid: '#8b5cf6',
    muted: 'rgba(139, 92, 246, 0.15)',
    text:  '#c4b5fd',
    bg:    'bg-purple-950/70',
    border: 'border-purple-800/60',
    label: 'text-purple-300',
  },
  zone_staff: {
    solid: '#14b8a6',
    muted: 'rgba(20, 184, 166, 0.15)',
    text:  '#5eead4',
    bg:    'bg-teal-950/70',
    border: 'border-teal-800/60',
    label: 'text-teal-300',
  },
  technician: {
    solid: '#f59e0b',
    muted: 'rgba(245, 158, 11, 0.15)',
    text:  '#fbbf24',
    bg:    'bg-amber-950/70',
    border: 'border-amber-800/60',
    label: 'text-amber-300',
  },
  default: {
    solid: '#6366f1',
    muted: 'rgba(99, 102, 241, 0.15)',
    text:  '#a5b4fc',
    bg:    'bg-indigo-950/70',
    border: 'border-indigo-800/60',
    label: 'text-indigo-300',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Map Pin Color
// ─────────────────────────────────────────────────────────────────────────────
export const MAP_PIN_DEFAULT = '#6366f1';

// ─────────────────────────────────────────────────────────────────────────────
// Equipment Health Segments (for donut/pie charts)
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTH_SEGMENTS = {
  working: {
    color:      '#22c55e',
    hoverColor: '#16a34a',
    dotClass:   'bg-green-500',
    textClass:  'text-green-400',
  },
  faulty: {
    color:      '#ef4444',
    hoverColor: '#dc2626',
    dotClass:   'bg-red-500',
    textClass:  'text-red-400',
  },
  underMaintenance: {
    color:      '#f59e0b',
    hoverColor: '#d97706',
    dotClass:   'bg-amber-500',
    textClass:  'text-amber-400',
  },
  provisioned: {
    color:      '#0ea5e9',
    hoverColor: '#0284c7',
    dotClass:   'bg-sky-500',
    textClass:  'text-sky-400',
  },
};
