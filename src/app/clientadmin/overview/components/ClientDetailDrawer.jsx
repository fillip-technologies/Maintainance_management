import React, { useState, useEffect } from 'react';
import {
  X, Package, MapPin, CheckCircle2, XCircle, Wrench, Box,
  PauseCircle, User, Shield, UserCheck, Loader2, AlertTriangle,
  Calendar, Tag
} from 'lucide-react';
import { getDevices } from '../../../api/devicesApi';
import { getIssues } from '../../../api/issuesApi';
import { getUsers } from '../../../api/usersApi';
import { getTechnicians } from '../../../api/techniciansApi';
import { DEVICE_STATUS_BADGE, ISSUE_STATUS_BADGE, PRIORITY_BADGE } from '../../../../tokens';

// ── config per drawer type ────────────────────────────────────────────────────
const TYPE_CONFIG = {
  all_devices: {
    title: 'All Products',
    subtitle: 'Every registered device in your facility',
    icon: Package,
    iconBg: 'bg-indigo-100 text-indigo-600',
    fetch: () => getDevices({ limit: 100 }),
    render: 'devices',
  },
  working: {
    title: 'Working Products',
    subtitle: 'Devices that are active and operational',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 text-emerald-600',
    fetch: () => getDevices({ status: 'active', limit: 100 }),
    render: 'devices',
  },
  not_working: {
    title: 'Not Working Products',
    subtitle: 'Devices flagged faulty or under active maintenance',
    icon: XCircle,
    iconBg: 'bg-rose-100 text-rose-600',
    // two parallel fetches merged client-side
    fetch: async () => {
      const [a, b] = await Promise.all([
        getDevices({ status: 'faulty', limit: 100 }),
        getDevices({ status: 'under_maintenance', limit: 100 }),
      ]);
      return { items: [...(a.items ?? []), ...(b.items ?? [])] };
    },
    render: 'devices',
  },
  on_hold: {
    title: 'Services On Hold',
    subtitle: 'Queries paused — awaiting parts, access, or approval',
    icon: PauseCircle,
    iconBg: 'bg-orange-100 text-orange-600',
    fetch: () => getIssues({ status: 'on_hold', limit: 100 }),
    render: 'issues',
  },
  zone_officers: {
    title: 'Zone Officers',
    subtitle: 'Zone leads with operational authority',
    icon: Shield,
    iconBg: 'bg-purple-100 text-purple-600',
    fetch: () => getUsers({ role: 'zone_incharge', limit: 100 }),
    render: 'users',
  },
  staff: {
    title: 'Staff Members',
    subtitle: 'Floor staff responsible for daily logs',
    icon: UserCheck,
    iconBg: 'bg-emerald-100 text-emerald-600',
    fetch: () => getUsers({ role: 'zone_staff', limit: 100 }),
    render: 'users',
  },
  technicians: {
    title: 'Technicians',
    subtitle: 'Certified repair and service engineers',
    icon: Wrench,
    iconBg: 'bg-amber-100 text-amber-600',
    fetch: () => getTechnicians({ limit: 100 }),
    render: 'technicians',
  },
};

// ── status helpers ─────────────────────────────────────────────────────────────
const DEVICE_STATUS = {
  active:            { label: 'Active',            badge: DEVICE_STATUS_BADGE.active.color, dot: DEVICE_STATUS_BADGE.active.dot },
  under_maintenance: { label: 'Under Maintenance', badge: DEVICE_STATUS_BADGE.under_maintenance.color, dot: DEVICE_STATUS_BADGE.under_maintenance.dot },
  faulty:            { label: 'Faulty',            badge: DEVICE_STATUS_BADGE.faulty.color, dot: DEVICE_STATUS_BADGE.faulty.dot },
  provisioned:       { label: 'Provisioned',       badge: DEVICE_STATUS_BADGE.provisioned.color, dot: DEVICE_STATUS_BADGE.provisioned.dot },
  retired:           { label: 'Retired',           badge: DEVICE_STATUS_BADGE.retired.color, dot: DEVICE_STATUS_BADGE.retired.dot },
};

const ISSUE_STATUS = {
  on_hold:     { label: 'On Hold',     badge: ISSUE_STATUS_BADGE.on_hold },
  open:        { label: 'Open',        badge: ISSUE_STATUS_BADGE.open },
  in_progress: { label: 'In Progress', badge: ISSUE_STATUS_BADGE.in_progress },
  resolved:    { label: 'Resolved',    badge: ISSUE_STATUS_BADGE.resolved },
  closed:      { label: 'Closed',      badge: ISSUE_STATUS_BADGE.closed },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Row renderers ──────────────────────────────────────────────────────────────
function DeviceRow({ device }) {
  const s = DEVICE_STATUS[device.status] ?? DEVICE_STATUS.provisioned;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
        <Package size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{device.name ?? '—'}</p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="shrink-0" />
          {device.zone?.name ?? 'In Stock'} · {device.hardwareType?.name ?? device.category?.name ?? '—'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
        </span>
        {device.code && <span className="text-[10px] text-slate-400 font-mono">{device.code}</span>}
      </div>
    </div>
  );
}

function IssueRow({ issue }) {
  const s = ISSUE_STATUS[issue.status] ?? ISSUE_STATUS.open;
  const p = PRIORITY_BADGE[issue.priority] ?? PRIORITY_BADGE.medium;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
        <Wrench size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{issue.device?.name ?? '—'}</p>
        {issue.device?.zone?.name && (
          <p className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
            <MapPin size={9} className="shrink-0" />{issue.device.zone.name}
          </p>
        )}
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{issue.description?.slice(0, 80)}{issue.description?.length > 80 ? '…' : ''}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Tag size={10} className="text-slate-400 shrink-0" />
          <span className="text-[10px] text-slate-400">{issue.category?.name ?? '—'}</span>
          <span className="text-slate-600">·</span>
          <Calendar size={10} className="text-slate-400 shrink-0" />
          <span className="text-[10px] text-slate-400">{fmt(issue.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>{s.label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${p}`}>{issue.priority}</span>
      </div>
    </div>
  );
}

function UserRow({ user }) {
  const roleLabel = user.role?.replace(/_/g, ' ') ?? '—';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-slate-200 flex items-center justify-center shrink-0 font-bold text-sm uppercase">
        {(user.name ?? '?').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{user.name ?? '—'}</p>
        <p className="text-[11px] text-slate-400 truncate">{user.email ?? '—'}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-slate-300 border border-[var(--border-color)] capitalize">
          {roleLabel}
        </span>
        <span className={`text-[10px] font-semibold ${user.accountStatus === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {user.accountStatus}
        </span>
      </div>
    </div>
  );
}

function TechnicianRow({ tech }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm uppercase">
        {(tech.user?.name ?? '?').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{tech.user?.name ?? '—'}</p>
        <p className="text-[11px] text-slate-400 truncate">{tech.user?.email ?? '—'}</p>
        {tech.specialization && (
          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{tech.specialization}</p>
        )}
      </div>
      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
        <Wrench size={14} />
      </div>
    </div>
  );
}

// ── Main drawer ────────────────────────────────────────────────────────────────
export default function ClientDetailDrawer({ type, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const cfg = TYPE_CONFIG[type];

  useEffect(() => {
    if (!cfg) return;
    setLoading(true); setError(''); setItems([]);
    cfg.fetch()
      .then((res) => setItems(res?.items ?? []))
      .catch((err) => setError(err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [type]);

  if (!cfg) return null;

  const Icon = cfg.icon;
  const q = search.toLowerCase().trim();
  const filtered = q
    ? items.filter((item) => {
        const text = [
          item.name, item.description, item.user?.name, item.user?.email,
          item.email, item.zone?.name, item.device?.name, item.specialization,
        ].filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      })
    : items;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 text-white">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-color)] shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-white">{cfg.title}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{cfg.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[var(--border-color)] shrink-0">
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Count badge */}
        <div className="px-5 py-2 shrink-0 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">
            {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-medium">Loading…</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold mt-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
              <Icon size={28} className="text-slate-300" />
              <p className="text-xs font-semibold">
                {items.length === 0 ? `No ${cfg.title.toLowerCase()} found.` : 'No results match your search.'}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div>
              {cfg.render === 'devices'     && filtered.map((d)    => <DeviceRow     key={d.id} device={d} />)}
              {cfg.render === 'issues'      && filtered.map((i)    => <IssueRow      key={i.id} issue={i} />)}
              {cfg.render === 'users'       && filtered.map((u)    => <UserRow       key={u.id} user={u} />)}
              {cfg.render === 'technicians' && filtered.map((t)    => <TechnicianRow key={t.id} tech={t} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
