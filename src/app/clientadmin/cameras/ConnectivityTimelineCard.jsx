import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import BulletCameraIcon from './BulletCameraIcon';

// ── Health ring ───────────────────────────────────────────────────────────────
function HealthRing({ online, total }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const color =
    pct === 100 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444';
  const S = 40;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: S, height: S }}>
      <svg width={S} height={S} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={S/2} cy={S/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx={S/2} cy={S/2} r={r}
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          transform={`rotate(-90 ${S/2} ${S/2})`}
        />
      </svg>
      <span className="relative text-[10px] font-bold font-mono" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Single camera bullet icon (no border, shape of camera only) ──────────────
function CamBlock({ cam, onMouseEnter, onMouseLeave, onClick }) {
  const isWorking = cam.status === 'online'; // working / right
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title={`${cam.code} — ${isWorking ? 'Working (Right)' : 'Faulty / Inactive'}`}
      className={[
        'p-0.5 bg-transparent border-0 shrink-0 cursor-pointer',
        'transition-transform duration-100 hover:scale-125 hover:z-10 focus:outline-none',
        isWorking
          ? 'text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.55)]'
          : 'text-red-500 hover:text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.75)] animate-[pulse_2s_ease-in-out_infinite]',
      ].join(' ')}
    >
      <BulletCameraIcon className="w-5 h-5" />
    </button>
  );
}

// ── Camera block grid + offline list ─────────────────────────────────────────
function CamGrid({ cameras, zoneId, onOpenAlerts, onCreateAlert, onShowTooltip, onHideTooltip }) {
  const offlineCams = cameras.filter((c) => c.status === 'offline');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {cameras.map((cam, i) => (
          <CamBlock
            key={cam.id || i}
            cam={cam}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onShowTooltip(cam, rect.left + rect.width / 2, rect.top);
            }}
            onMouseLeave={onHideTooltip}
            onClick={() => {
              if (cam.status !== 'online') {
                cam.hasAlert ? onOpenAlerts?.(zoneId) : onCreateAlert?.(cam);
              }
            }}
          />
        ))}
      </div>
      {offlineCams.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <AlertTriangle size={10} className="text-red-400 shrink-0" />
          <span className="text-[10px] text-red-400 font-semibold shrink-0">
            {offlineCams.length} offline:
          </span>
          <span className="text-[10px] font-mono text-red-300/80 truncate">
            {offlineCams.slice(0, 5).map((c) => c.code).join(', ')}
            {offlineCams.length > 5 && ` +${offlineCams.length - 5}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Top-level zone card (showcases top level heading & all cameras inside it) ─
function TopLevelZoneCard({
  zone,
  collapsed,
  onToggle,
  onOpenAlerts,
  onCreateAlert,
  onShowTooltip,
  onHideTooltip,
}) {
  const { id, name, cameras = [], stats = {} } = zone;
  const hasCameras = cameras.length > 0;
  const isCollapsed = !!collapsed[id];
  const hasOffline = (stats.offline ?? 0) > 0;

  return (
    <div
      className={[
        'flex flex-col rounded-2xl border overflow-hidden',
        'bg-[#0c1427]',
        hasOffline
          ? 'border-red-800/40 shadow-[0_0_18px_rgba(239,68,68,0.07)]'
          : 'border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
      ].join(' ')}
    >
      {/* ── Top-level zone header ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => hasCameras && onToggle(id)}
        className={[
          'w-full flex items-center gap-2.5 px-3.5 py-3 text-left transition-colors border-b',
          hasOffline
            ? 'bg-gradient-to-r from-red-950/60 to-[#0a1120] border-red-800/40'
            : 'bg-gradient-to-r from-blue-950/60 to-[#0a1120] border-slate-800/60',
          hasCameras ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        {/* Left accent bar */}
        <span className={`w-1 self-stretch rounded-full shrink-0 ${hasOffline ? 'bg-red-500' : 'bg-blue-500'}`} />

        {/* Chevron */}
        {hasCameras && (
          <span className="text-slate-400 shrink-0">
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </span>
        )}

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <span className={`block text-[13px] font-extrabold uppercase tracking-wide truncate ${hasOffline ? 'text-red-300' : 'text-white'}`}>
            {name}
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
            <span className="text-slate-400">
              {stats.total ?? cameras.length} {(stats.total ?? cameras.length) === 1 ? 'product' : 'products'}
            </span>
            <span className="text-emerald-400 font-bold">● {stats.online ?? 0}</span>
            {(stats.offline ?? 0) > 0 && (
              <span className="text-red-400 font-bold animate-pulse">○ {stats.offline}</span>
            )}
          </div>
        </div>

        {/* Health ring */}
        <HealthRing online={stats.online ?? 0} total={stats.total ?? cameras.length} />
      </button>

      {/* ── Body (collapsible) ────────────────────────────────────────── */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col">
          {hasCameras ? (
            <>
              <div className="p-3.5 flex-1">
                <CamGrid
                  cameras={cameras}
                  zoneId={id}
                  onOpenAlerts={onOpenAlerts}
                  onCreateAlert={onCreateAlert}
                  onShowTooltip={onShowTooltip}
                  onHideTooltip={onHideTooltip}
                />
              </div>

              {/* Status footer */}
              <div
                className={[
                  'px-3.5 py-2 flex items-center justify-between border-t text-[10px] mt-auto',
                  hasOffline
                    ? 'bg-red-950/25 border-red-800/30 text-red-400'
                    : 'bg-emerald-950/15 border-emerald-900/20 text-emerald-400',
                ].join(' ')}
              >
                {hasOffline ? (
                  <>
                    <div className="flex items-center gap-1 font-semibold">
                      <AlertTriangle size={11} className="shrink-0" />
                      <span>{stats.offline} Faulty</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenAlerts?.(id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      <Bell size={9} /> Alerts
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={11} className="shrink-0" />
                    <span>All Cameras Working</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="px-3.5 py-5 text-center text-[11px] text-slate-600">
              No cameras match current filter.
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="px-3.5 py-2 text-[10px] text-slate-600 italic">
          {stats.total ?? cameras.length} cameras hidden — click to expand
        </div>
      )}
    </div>
  );
}

// ── Floating tooltip ──────────────────────────────────────────────────────────
function CamTooltip({ tooltip }) {
  if (!tooltip) return null;
  const { cam, x, y } = tooltip;
  const online = cam.status === 'online';
  return (
    <div
      className="fixed z-[9999] pointer-events-none bg-[#0d1626]/98 border border-slate-700/60 rounded-xl px-3 py-2.5 shadow-2xl text-xs backdrop-blur-sm animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y - 10, transform: 'translate(-50%,-100%)', minWidth: 210 }}
    >
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-800">
        <span className="font-bold text-white truncate">{cam.name}</span>
        <span className="font-mono text-blue-400 text-[10px] shrink-0">{cam.code}</span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Status</span>
          <span className={online ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {online ? 'Working (Right)' : 'Faulty / Inactive'}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">IP</span>
          <span className="font-mono text-slate-300">{cam.ip}</span>
        </div>
        {cam.zoneName && (
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">Zone</span>
            <span className="text-slate-300 truncate max-w-[130px]">{cam.zoneName}</span>
          </div>
        )}
      </div>
      {cam.alertDetails?.message && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 italic leading-snug">
          ⚠ {cam.alertDetails.message}
        </div>
      )}
      {!online && (
        <p className="mt-1.5 text-[10px] text-blue-400 font-semibold text-center">
          Click to raise alert →
        </p>
      )}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function ConnectivityTimelineCard({
  zoneRows = [],
  onOpenAlerts,
  onCreateAlert,
}) {
  const [collapsed, setCollapsed] = useState({});
  const [tooltip, setTooltip] = useState(null);

  const toggle = (id) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));
  const showTooltip = (cam, x, y) => setTooltip({ cam, x, y });
  const hideTooltip = () => setTooltip(null);

  // Normalize zone items (support direct parent zone objects or legacy header-card objects)
  const sections = useMemo(() => {
    return zoneRows.map((item) => {
      if (item.header) {
        return {
          id: item.header.id,
          name: item.header.name,
          cameras: item.header.cameras || [],
          stats: item.header.stats || {},
        };
      }
      return item;
    });
  }, [zoneRows]);

  if (sections.length === 0) {
    return (
      <div className="bg-[#0c1427] border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-sm">
        No zones match the current filter.
      </div>
    );
  }

  return (
    <>
      {/* 3 boxes in one line on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {sections.map((zone) => (
          <TopLevelZoneCard
            key={zone.id}
            zone={zone}
            collapsed={collapsed}
            onToggle={toggle}
            onOpenAlerts={onOpenAlerts}
            onCreateAlert={onCreateAlert}
            onShowTooltip={showTooltip}
            onHideTooltip={hideTooltip}
          />
        ))}
      </div>

      <CamTooltip tooltip={tooltip} />
    </>
  );
}
