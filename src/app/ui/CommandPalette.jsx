import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CornerDownLeft, Moon, Sun, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllZones } from '../api/zonesApi';
import { getDevices } from '../api/devicesApi';
import { navFor, boardBaseFor, COMMAND_EVENT as OPEN_EVENT } from './nav';
import { useTheme } from './theme';
import { categoryIcon } from './categoryIcon';
import { healthOf } from './status';
import { StatusDot } from './primitives';


/**
 * ⌘K / Ctrl+K — jump to any page, location or device. Locations load once on
 * first open; equipment is searched server-side (by name/code) as you type.
 */
export default function CommandPalette({ onRaiseProblem }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role;
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [zones, setZones] = useState(null);
  const [devices, setDevices] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 10);
    if (zones === null) {
      getAllZones({ clientId: role === 'client_admin' ? currentUser?.clientId : undefined })
        .then(setZones)
        .catch(() => setZones([]));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Server-side equipment search, debounced.
  useEffect(() => {
    if (!open || q.trim().length < 2) { setDevices([]); return undefined; }
    const t = setTimeout(() => {
      getDevices({ search: q.trim(), limit: 8 })
        .then((r) => setDevices(r?.items ?? []))
        .catch(() => setDevices([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  const board = boardBaseFor(role);

  const sections = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (s) => !needle || String(s || '').toLowerCase().includes(needle);
    const out = [];

    const pages = navFor(role).flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })))
      .filter((i) => match(i.name) || match(i.hint))
      .map((i) => ({ key: i.path, icon: i.icon, title: i.name, sub: i.hint, run: () => navigate(i.path) }));
    if (pages.length) out.push({ title: 'Go to', items: pages.slice(0, needle ? 6 : 8) });

    const zoneById = new Map((zones ?? []).map((z) => [z.id, z]));
    const locs = (zones ?? [])
      .filter((z) => match(z.name))
      .slice(0, needle ? 8 : 5)
      .map((z) => {
        const parent = z.parentZoneId ? zoneById.get(z.parentZoneId)?.name : null;
        return {
          key: z.id,
          icon: MapPin,
          title: z.name,
          sub: parent ? `in ${parent}` : (z._count?.devices != null ? `${z._count.devices} devices here` : 'Location'),
          run: () => navigate(`${board}/${z.id}`),
        };
      });
    if (locs.length) out.push({ title: 'Locations', items: locs });

    if (devices.length) {
      out.push({
        title: 'Equipment',
        items: devices.map((d) => ({
          key: d.id,
          icon: categoryIcon(d.category?.name || d.name),
          title: d.name,
          sub: [d.code, d.zone?.name, d.location].filter(Boolean).join(' · '),
          trailing: <StatusDot health={healthOf(d.status)} />,
          run: () => navigate(d.zoneId ? `${board}/${d.zoneId}?device=${d.id}` : board),
        })),
      });
    }

    const actions = [];
    if (onRaiseProblem && match('raise report problem fault complaint')) {
      actions.push({ key: 'raise', icon: Plus, title: 'Raise a problem', sub: 'Report a fault on any equipment', run: onRaiseProblem });
    }
    if (match('theme dark light mode')) {
      actions.push({
        key: 'theme',
        icon: theme === 'dark' ? Sun : Moon,
        title: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        sub: 'Appearance',
        run: toggle,
      });
    }
    if (actions.length) out.push({ title: 'Actions', items: actions });
    return out;
  }, [q, zones, devices, role, theme, board, navigate, onRaiseProblem, toggle]);

  const flat = sections.flatMap((s) => s.items);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (item) => { setOpen(false); item?.run?.(); };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(flat[active]); }
  };

  let idx = -1;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-[rgba(12,14,17,0.42)] backdrop-blur-[3px]" onClick={() => setOpen(false)} />
      <div
        className="relative w-full max-w-[600px] rounded-[16px] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-pop)] overflow-hidden"
        style={{ animation: 'fx-pop 160ms ease-out both' }}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 h-[54px] border-b border-[var(--line)]">
          <Search size={18} className="text-[var(--ink-3)] shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, locations, equipment code…"
            className="flex-1 bg-transparent border-0 outline-none text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
          />
          <span className="fx-kbd">esc</span>
        </div>

        <div ref={listRef} className="max-h-[56vh] overflow-y-auto fx-scroll py-2">
          {flat.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[var(--ink-3)]">
              Nothing matches “{q}”. Try a device code like <span className="font-mono text-[var(--ink-2)]">CAM-0012</span>.
            </div>
          ) : (
            sections.map((s) => (
              <div key={s.title} className="px-2 pb-1">
                <div className="fx-eyebrow px-3 pt-2 pb-1.5">{s.title}</div>
                {s.items.map((item) => {
                  idx += 1;
                  const i = idx;
                  const Icon = item.icon;
                  const isActive = i === active;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      data-idx={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={`w-full flex items-center gap-3 px-3 h-[46px] rounded-[10px] text-left cursor-pointer ${
                        isActive ? 'bg-[var(--surface-3)]' : ''
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-[9px] grid place-items-center shrink-0 ${isActive ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-1)]' : 'bg-[var(--surface-2)] text-[var(--ink-3)]'}`}>
                        {Icon && <Icon size={16} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13.5px] font-[580] text-[var(--ink)] truncate">{item.title}</span>
                        {item.sub && <span className="block text-[11.5px] text-[var(--ink-3)] truncate">{item.sub}</span>}
                      </span>
                      {item.trailing}
                      {isActive && <ArrowRight size={14} className="text-[var(--ink-3)]" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-4 h-10 border-t border-[var(--line)] text-[11px] text-[var(--ink-3)]">
          <span className="inline-flex items-center gap-1.5"><span className="fx-kbd">↑</span><span className="fx-kbd">↓</span> move</span>
          <span className="inline-flex items-center gap-1.5"><span className="fx-kbd"><CornerDownLeft size={10} /></span> open</span>
          <span className="ml-auto">fixly</span>
        </div>
      </div>
    </div>
  );
}
