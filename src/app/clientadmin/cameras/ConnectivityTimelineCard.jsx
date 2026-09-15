import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Video,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ── Health ring ───────────────────────────────────────────────────────────────
function HealthRing({ online, total }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const color =
    pct === 100 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444';
  const S = 44;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: S, height: S }}>
      <svg width={S} height={S} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={S/2} cy={S/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle
          cx={S/2} cy={S/2} r={r}
          fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          transform={`rotate(-90 ${S/2} ${S/2})`}
        />
      </svg>
      <span className="relative text-[11px] font-bold font-mono" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Single camera block ───────────────────────────────────────────────────────
function CamBlock({ cam, onMouseEnter, onMouseLeave, onClick }) {
  const online = cam.status === 'online';
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title={`${cam.code} — ${online ? 'Active' : 'Offline'}`}
      className={[
        'w-[18px] h-[14px] rounded-[3px] flex items-center justify-center border-0 p-0 shrink-0',
        'transition-transform duration-100 hover:scale-125 hover:z-10',
        online
          ? 'bg-emerald-500 shadow-[0_0_5px_rgba(34,197,94,0.4)] cursor-default'
          : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.55)] cursor-pointer animate-[pulse_2s_ease-in-out_infinite]',
      ].join(' ')}
    >
      <Video size={8} className="text-white/70" />
    </button>
  );
}

// ── Camera block grid + offline list ─────────────────────────────────────────
function CamGrid({ cameras, zoneId, onOpenAlerts, onCreateAlert, onShowTooltip, onHideTooltip }) {
  const offlineCams = cameras.filter((c) => c.status === 'offline');
  return (
    <div>
      <div className="flex flex-wrap gap-[4px]">
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
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <AlertTriangle size={10} className="text-red-400 shrink-0" />
          <span className="text-[10px] text-red-400 font-semibold shrink-0">
            {offlineCams.length} offline:
          </span>
          <span className="text-[10px] font-mono text-red-300/70 truncate">
            {offlineCams.slice(0, 5).map((c) => c.code).join(', ')}
            {offlineCams.length > 5 && ` +${offlineCams.length - 5}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Nested zone mini-card (only shows zone name, no parent repeat) ────────────
function NestedZoneCard({ zone, onOpenAlerts, onCreateAlert, onShowTooltip, onHideTooltip }) {
  const { id, name, cameras } = zone;
  const offline = cameras.filter((c) => c.status === 'offline').length;
  const online = cameras.filter((c) => c.status === 'online').length;
  const hasOffline = offline > 0;

  return (
    <div
      className={[
        'flex flex-col rounded-xl border overflow-hidden bg-[#0b1628]',
        hasOffline
          ? 'border-red-800/35 shadow-[0_0_12px_rgba(239,68,68,0.06)]'
          : 'border-slate-700/30',
      ].join(' ')}
    >
      {/* Sub-card header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={[
                'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                hasOffline ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/12 text-emerald-400',
              ].join(' ')}
            >
              <Video size={12} />
            </div>
            <span className="text-[12px] font-semibold text-slate-100 truncate leading-tight">
              {name}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0">
            {online}/{cameras.length}
          </span>
        </div>
      </div>

      {/* Camera blocks */}
      <div className="px-3 pb-2 flex-1">
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
          'px-3 py-1.5 flex items-center gap-1.5 border-t text-[10px] mt-auto',
          hasOffline
            ? 'bg-red-950/25 border-red-800/25 text-red-400'
            : 'bg-emerald-950/15 border-emerald-900/20 text-emerald-400',
        ].join(' ')}
      >
        {hasOffline ? (
          <>
            <AlertTriangle size={9} className="shrink-0" />
            <span className="font-semibold">{offline} Offline</span>
            <button
              type="button"
              onClick={() => onOpenAlerts?.(id)}
              className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/12 border border-amber-500/25 text-amber-300 text-[9px] font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Bell size={8} /> Alert
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 size={9} className="shrink-0" />
            <span className="font-semibold">All Active</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Top-level zone card (outer box) ──────────────────────────────────────────
function TopLevelZoneCard({
  section,
  collapsed,
  onToggle,
  onOpenAlerts,
  onCreateAlert,
  onShowTooltip,
  onHideTooltip,
}) {
  const { header, cards } = section;
  const { id, name, cameras: directCams, stats } = header;
  const hasDirectCams = directCams.length > 0;
  const hasNested = cards.length > 0;
  const isCollapsed = !!collapsed[id];
  const hasOffline = stats.offline > 0;

  return (
    <div
      className={[
        'flex flex-col rounded-2xl border overflow-hidden',
        'bg-[#0c1427]',
        hasOffline
          ? 'border-red-800/40 shadow-[0_0_20px_rgba(239,68,68,0.07)]'
          : 'border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.35)]',
      ].join(' ')}
    >
      {/* ── Top-level zone header ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => (hasNested || hasDirectCams) && onToggle(id)}
        className={[
          'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b',
          hasOffline
            ? 'bg-gradient-to-r from-red-950/60 to-[#0a1120] border-red-800/40'
            : 'bg-gradient-to-r from-blue-950/60 to-[#0a1120] border-slate-800/60',
          (hasNested || hasDirectCams) ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        {/* Left accent bar */}
        <span className={`w-1 self-stretch rounded-full shrink-0 ${hasOffline ? 'bg-red-500' : 'bg-blue-500'}`} />

        {/* Chevron */}
        {(hasNested || hasDirectCams) && (
          <span className="text-slate-400 shrink-0">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </span>
        )}

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <span className={`block text-[14px] font-extrabold uppercase tracking-widest truncate ${hasOffline ? 'text-red-300' : 'text-white'}`}>
            {name}
          </span>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono">
            <span className="text-slate-500">{stats.total} products</span>
            {hasNested && (
              <span className="text-slate-500">
                {cards.length} subzone{cards.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-emerald-400 font-bold">●{stats.online}</span>
            {stats.offline > 0 && (
              <span className="text-red-400 font-bold animate-pulse">○{stats.offline}</span>
            )}
          </div>
        </div>

        {/* Health ring */}
        <HealthRing online={stats.online} total={stats.total} />
      </button>

      {/* ── Body (collapsible) ────────────────────────────────────────── */}
      {!isCollapsed && (
        <div className="flex-1">

          {/* Direct cameras on this top-level zone */}
          {hasDirectCams && (
            <div className={['px-4 py-3', hasNested ? 'border-b border-slate-800/50' : ''].join(' ')}>
              <p className="text-[10px] text-slate-500 font-medium mb-2 uppercase tracking-wide">
                Direct Products
              </p>
              <CamGrid
                cameras={directCams}
                zoneId={id}
                onOpenAlerts={onOpenAlerts}
                onCreateAlert={onCreateAlert}
                onShowTooltip={onShowTooltip}
                onHideTooltip={onHideTooltip}
              />
            </div>
          )}

          {/* Nested zone sub-cards — 2 per row */}
          {hasNested && (
            <div className="grid grid-cols-2 gap-3 p-3">
              {cards.map((zone) => (
                <NestedZoneCard
                  key={zone.id}
                  zone={zone}
                  onOpenAlerts={onOpenAlerts}
                  onCreateAlert={onCreateAlert}
                  onShowTooltip={onShowTooltip}
                  onHideTooltip={onHideTooltip}
                />
              ))}
            </div>
          )}

          {/* Empty zone */}
          {!hasDirectCams && !hasNested && (
            <div className="px-4 py-6 text-center text-[11px] text-slate-600">
              No cameras match current filter.
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="px-4 py-2.5 text-[11px] text-slate-600 italic">
          {stats.total} cameras hidden — click to expand
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
            {online ? 'Active' : 'Offline'}
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

  // Group flat DFS list into top-level sections
  const sections = useMemo(() => {
    const result = [];
    let current = null;
    for (const row of zoneRows) {
      if (row.depth === 0) {
        current = { header: row, cards: [] };
        result.push(current);
      } else if (current) {
        current.cards.push(row);
      }
    }
    return result;
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
      {/* Masonry columns — each card ends at its own height, next starts right below */}
      <div className="columns-1 xl:columns-2 gap-5">
        {sections.map((section) => (
          <div key={section.header.id} className="break-inside-avoid mb-5">
            <TopLevelZoneCard
              section={section}
              collapsed={collapsed}
              onToggle={toggle}
              onOpenAlerts={onOpenAlerts}
              onCreateAlert={onCreateAlert}
              onShowTooltip={showTooltip}
              onHideTooltip={hideTooltip}
            />
          </div>
        ))}
      </div>

      <CamTooltip tooltip={tooltip} />
    </>
  );
}
