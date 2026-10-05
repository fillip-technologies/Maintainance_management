import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { Search, LayoutGrid, Rows3, ChevronRight, MapPin, Plus, Inbox, Building2, UserRound, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBoard } from '../api/boardApi';
import { getClients } from '../api/clientsApi';
import { getZoneById } from '../api/zonesApi';
import { socketClient } from '../api/socketClient';
import {
  PageHeader, Sheet, HealthStrip, HealthLegend, Segmented, RefreshButton, EmptyState, Skeleton, StatusPill, CategoryIcon,
} from '../ui/primitives';
import DeviceTile, { CheckMark, PriorityTag } from '../ui/DeviceTile';
import DeviceDrawer from '../ui/DeviceDrawer';
import { HEALTH, STAGE, healthOf, tallyHealth, worstHealth, agoLong, ago, pct } from '../ui/status';
import { categoryShort } from '../ui/categoryIcon';
import { indexZones, subtreeIds, zonePath, openProblems } from '../ui/boardModel';
import { boardBaseFor } from '../ui/nav';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'problems', label: 'Problems' },
  { value: 'down', label: 'Broken' },
  { value: 'fix', label: 'Being fixed' },
  { value: 'unchecked', label: 'Not checked' },
];

function matchesFilter(d, show) {
  const h = healthOf(d.status);
  if (show === 'problems') return h === 'down' || h === 'fix' || !!d.issue;
  if (show === 'down') return h === 'down';
  if (show === 'fix') return h === 'fix';
  if (show === 'idle') return h === 'idle';
  if (show === 'unchecked') return !d.todayLog && h !== 'idle';
  return true;
}

/**
 * Equipment board — the research's "Location equipment overview": every
 * device at a location, by equipment type, grouped by area, with the faults
 * and who is on them. Without a location it shows all locations in scope.
 */
export default function EquipmentBoardPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role;
  const { zoneId: focusParam } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const outlet = useOutletContext() || {};
  const base = boardBaseFor(role);

  const isZoneRole = role === 'zone_incharge' || role === 'zone_staff';
  const isSuper = role === 'super_admin';

  // Super admin picks a client; everyone else is fixed to their own scope.
  const [clients, setClients] = useState([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const clientParam = params.get('client');
  useEffect(() => {
    if (!isSuper) return;
    getClients({ limit: 100 })
      .then((r) => setClients(r?.items ?? []))
      .catch(() => setClients([]))
      .finally(() => setClientsLoaded(true));
  }, [isSuper]);
  // Deep link to a zone (e.g. from Zones or ⌘K): use that zone's client.
  const [zoneClientId, setZoneClientId] = useState(null);
  useEffect(() => {
    if (!isSuper || clientParam || !focusParam) { setZoneClientId(null); return; }
    let cancelled = false;
    getZoneById(focusParam)
      .then((z) => { if (!cancelled) setZoneClientId(z?.clientId ?? z?.client?.id ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isSuper, clientParam, focusParam]);
  const superClientId = clientParam || zoneClientId || (focusParam ? null : clients[0]?.id) || null;

  const scope = useMemo(() => {
    if (isSuper) return superClientId ? { scope: 'client', id: superClientId } : null;
    if (isZoneRole) return currentUser?.zoneId ? { scope: 'zone', id: currentUser.zoneId } : null;
    if (currentUser?.clientId) return { scope: 'client', id: currentUser.clientId };
    if (currentUser?.zoneId) return { scope: 'zone', id: currentUser.zoneId };
    return null;
  }, [isSuper, isZoneRole, superClientId, currentUser]);

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    // Super admin: scope resolves once the client list / deep-linked zone loads.
    if (!scope) { setLoading(isSuper && !clientsLoaded); return; }
    silent ? setRefreshing(true) : setLoading(true);
    try {
      setBoard(await getBoard(scope));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load equipment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope, isSuper, clientsLoaded]);

  useEffect(() => { load(false); }, [load]);
  useEffect(() => {
    const offs = ['issue:created', 'issue:updated', 'log:submitted'].map((ev) => socketClient.on(ev, () => load(true)));
    return () => offs.forEach((off) => off());
  }, [load]);

  // ── derived ──
  const idx = useMemo(() => indexZones(board?.zones), [board]);
  const rootZoneId = scope?.scope === 'zone' ? scope.id : null;
  const focusId = focusParam && idx.byId.has(focusParam) ? focusParam : rootZoneId;
  const focusZone = focusId ? idx.byId.get(focusId) : null;
  const inFocus = useMemo(() => {
    if (!board) return [];
    if (!focusId) return board.devices;
    const ids = new Set(subtreeIds(focusId, idx.children));
    return board.devices.filter((d) => ids.has(d.zoneId));
  }, [board, focusId, idx]);

  const catId = params.get('cat') || 'all';
  const show = params.get('show') || 'all';
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');
  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (!v || v === 'all') next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };

  const catList = useMemo(() => {
    const byId = new Map((board?.categories ?? []).map((c) => [c.id, c]));
    const m = new Map();
    for (const d of inFocus) {
      const k = d.categoryId ?? 'none';
      if (!m.has(k)) m.set(k, { id: k, name: byId.get(d.categoryId)?.name ?? 'Other', devices: [] });
      m.get(k).devices.push(d);
    }
    return [...m.values()].map((c) => ({ ...c, tally: tallyHealth(c.devices) })).sort((a, b) => b.tally.total - a.tally.total);
  }, [board, inFocus]);
  const catName = useMemo(() => new Map((board?.categories ?? []).map((c) => [c.id, c.name])), [board]);

  const inCat = useMemo(
    () => (catId === 'all' ? inFocus : inFocus.filter((d) => (d.categoryId ?? 'none') === catId)),
    [inFocus, catId],
  );
  const tally = useMemo(() => tallyHealth(inCat), [inCat]);
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return inCat
      .filter((d) => matchesFilter(d, show))
      .filter((d) => !needle || [d.name, d.code, d.location].some((s) => String(s || '').toLowerCase().includes(needle)))
      .sort((a, b) => HEALTH[healthOf(a.status)].rank - HEALTH[healthOf(b.status)].rank || String(a.code || a.name).localeCompare(String(b.code || b.name)));
  }, [inCat, show, q]);

  // Group by area = the direct child of the focused zone (or top-level location).
  const groups = useMemo(() => {
    const m = new Map();
    for (const d of visible) {
      let z = idx.byId.get(d.zoneId);
      while (z && z.parentZoneId && z.parentZoneId !== focusId && idx.byId.has(z.parentZoneId)) z = idx.byId.get(z.parentZoneId);
      const key = z?.id ?? 'unknown';
      if (!m.has(key)) m.set(key, { zone: z, devices: [] });
      m.get(key).devices.push(d);
    }
    return [...m.values()]
      .map((g) => ({ ...g, tally: tallyHealth(g.devices) }))
      .sort((a, b) => HEALTH[worstHealth(a.tally)].rank - HEALTH[worstHealth(b.tally)].rank || (a.zone?.name ?? '').localeCompare(b.zone?.name ?? ''));
  }, [visible, idx, focusId]);

  const problems = useMemo(() => openProblems({ ...board, devices: inCat }).slice(0, 8), [board, inCat]);

  // Drawer (also opened from ⌘K via ?device=)
  const deviceParam = params.get('device');
  const drawerDevice = deviceParam ? board?.devices.find((d) => d.id === deviceParam) : null;
  const openDevice = (d) => setParam('device', d.id);

  const path = focusId ? zonePath(focusId, idx.byId) : [];
  const title = focusZone?.name ?? (isSuper ? clients.find((c) => c.id === superClientId)?.name ?? 'Equipment board' : currentUser?.clientName ?? 'All locations');
  const zoneOptions = useMemo(() => {
    const out = [];
    const walk = (list, depth) => list.forEach((z) => { out.push({ z, depth }); walk(idx.children.get(z.id) ?? [], depth + 1); });
    walk(rootZoneId ? [idx.byId.get(rootZoneId)].filter(Boolean) : idx.roots, 0);
    return out;
  }, [idx, rootZoneId]);
  const goZone = (id) => {
    const next = new URLSearchParams(params);
    next.delete('device');
    navigate(`${id && id !== rootZoneId ? `${base}/${id}` : base}${next.toString() ? `?${next}` : ''}`);
  };

  if (!scope && !loading) {
    return (
      <Sheet>
        {isSuper ? (
          <EmptyState icon={Building2} title="No clients yet" body="Create a client and deploy equipment to see it here." />
        ) : (
          <EmptyState icon={MapPin} title="No location assigned yet" body="Once an administrator assigns you to a location, its equipment will appear here." />
        )}
      </Sheet>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={
          <nav className="flex items-center gap-1.5 flex-wrap normal-case tracking-normal font-sans text-[12px]">
            <button className="hover:text-[var(--ink)] cursor-pointer" onClick={() => goZone(rootZoneId)}>
              {rootZoneId ? 'My location' : 'All locations'}
            </button>
            {path.filter((z) => z.id !== rootZoneId).map((z) => (
              <React.Fragment key={z.id}>
                <ChevronRight size={12} className="text-[var(--ink-4)]" />
                <button className="hover:text-[var(--ink)] cursor-pointer" onClick={() => goZone(z.id)}>{z.name}</button>
              </React.Fragment>
            ))}
          </nav>
        }
        title={title}
        meta={
          board && (
            <>
              <span><span className="num font-[620] text-[var(--ink-2)]">{inFocus.length}</span> devices</span>
              {(idx.children.get(focusId ?? '__root__') ?? []).length > 0 && (
                <span><span className="num font-[620] text-[var(--ink-2)]">{(idx.children.get(focusId ?? '__root__') ?? []).length}</span> {focusId ? 'areas' : 'locations'}</span>
              )}
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Updated {agoLong(board.generatedAt)}</span>
            </>
          )
        }
        actions={
          <>
            {isSuper && clients.length > 0 && (
              <label className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none" />
                <select
                  className="fx-input !h-9 !w-[200px] pl-8 pr-8 appearance-none cursor-pointer"
                  value={superClientId ?? ''}
                  onChange={(e) => navigate(`${base}?client=${e.target.value}`)}
                >
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}
            {zoneOptions.length > 1 && (
              <label className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none" />
                <select
                  className="fx-input !h-9 !w-[220px] pl-8 pr-8 appearance-none cursor-pointer"
                  value={focusId ?? ''}
                  onChange={(e) => goZone(e.target.value || null)}
                  aria-label="Jump to location"
                >
                  {!rootZoneId && <option value="">All locations</option>}
                  {zoneOptions.map(({ z, depth }) => (
                    <option key={z.id} value={z.id}>{`${' '.repeat(depth)}${z.name}`}</option>
                  ))}
                </select>
              </label>
            )}
            <RefreshButton onClick={() => load(true)} spinning={refreshing} />
            {outlet.onOpenRequestModal && (
              <button type="button" className="fx-btn fx-btn-primary" onClick={() => outlet.onOpenRequestModal(focusId ? { zoneId: focusId } : undefined)}>
                <Plus size={15} /> Raise problem
              </button>
            )}
          </>
        }
      />

      {loading ? (
        <BoardSkeleton />
      ) : error ? (
        <Sheet><EmptyState icon={Inbox} title="Couldn't load the board" body={error} action={<button className="fx-btn" onClick={() => load(false)}>Try again</button>} /></Sheet>
      ) : (
        <>
          {/* Equipment-type tabs */}
          <div className="-mx-1 overflow-x-auto fx-scroll">
            <div className="flex gap-2 px-1 pt-1.5 pb-1 min-w-max">
              <TypeTab active={catId === 'all'} onClick={() => setParam('cat', 'all')} label="All types" count={inFocus.length} tally={tallyHealth(inFocus)} />
              {catList.map((c) => (
                <TypeTab
                  key={c.id}
                  active={catId === c.id}
                  onClick={() => setParam('cat', c.id)}
                  label={categoryShort(c.name)}
                  title={c.name}
                  iconName={c.name}
                  count={c.tally.total}
                  tally={c.tally}
                />
              ))}
            </div>
          </div>

          {/* Status summary */}
          <Sheet bodyClassName="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4">
              <SummaryCell label="Total" value={tally.total} sub={catId === 'all' ? 'all types' : categoryShort(catList.find((c) => c.id === catId)?.name)} />
              <SummaryCell label="Working" value={tally.ok} sub={`${pct(tally.ok, tally.total)}% of all`} tone="ok" onClick={() => setParam('show', 'all')} />
              <SummaryCell label="Broken" value={tally.down} sub="needs repair" tone="down" active={show === 'down'} onClick={() => setParam('show', show === 'down' ? 'all' : 'down')} />
              <SummaryCell label="Being fixed" value={tally.fix} sub="work in progress" tone="fix" active={show === 'fix'} onClick={() => setParam('show', show === 'fix' ? 'all' : 'fix')} />
              <SummaryCell label="Not live" value={tally.idle} sub="installed, not active" tone="idle" active={show === 'idle'} onClick={() => setParam('show', show === 'idle' ? 'all' : 'idle')} />
              <SummaryCell
                label="Checked today"
                value={`${tally.checked}`}
                suffix={`/${tally.live}`}
                sub={tally.unchecked ? `${tally.unchecked} not checked` : 'all checked'}
                active={show === 'unchecked'}
                onClick={() => setParam('show', show === 'unchecked' ? 'all' : 'unchecked')}
                hatch
              />
            </div>
            <HealthStrip tally={tally} maxTicks={90} height={10} className="mt-5" />
          </Sheet>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div className="flex flex-col gap-5 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Segmented
                  value={show}
                  onChange={(v) => setParam('show', v)}
                  options={FILTERS.map((f) => ({ ...f, count: f.value === 'all' ? tally.total : inCat.filter((d) => matchesFilter(d, f.value)).length }))}
                  size="sm"
                />
                <div className="relative flex-1 min-w-[180px] max-w-[320px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name, code or spot" className="fx-input !h-8 pl-8" />
                </div>
                <div className="ml-auto">
                  <Segmented
                    size="sm"
                    value={view}
                    onChange={setView}
                    options={[
                      { value: 'grid', label: <span className="sr-only">Grid</span>, icon: <LayoutGrid size={14} /> },
                      { value: 'list', label: <span className="sr-only">List</span>, icon: <Rows3 size={14} /> },
                    ]}
                  />
                </div>
              </div>

              {visible.length === 0 ? (
                <Sheet>
                  <EmptyState
                    icon={Inbox}
                    title={show === 'all' && !q ? 'No equipment here yet' : 'Nothing matches'}
                    body={show !== 'all' ? 'Good news — no devices in this state right now.' : q ? 'Try a different name or code.' : 'Equipment deployed to this location will appear here.'}
                    action={(show !== 'all' || q) && <button className="fx-btn" onClick={() => { setQ(''); setParam('show', 'all'); }}>Show everything</button>}
                  />
                </Sheet>
              ) : (
                groups.map((g) => (
                  <section key={g.zone?.id ?? 'unknown'} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => g.zone && g.zone.id !== focusId && goZone(g.zone.id)}
                        className={`flex items-center gap-2 min-w-0 ${g.zone && g.zone.id !== focusId ? 'cursor-pointer hover:text-[var(--accent)]' : 'cursor-default'}`}
                      >
                        <MapPin size={14} className="text-[var(--ink-3)] shrink-0" />
                        <h3 className="text-[14.5px] font-[640] tracking-[-0.015em] truncate">
                          {g.zone?.id === focusId ? `At ${g.zone?.name}` : g.zone?.name ?? 'Unassigned area'}
                        </h3>
                        {g.zone && g.zone.id !== focusId && <ChevronRight size={14} className="text-[var(--ink-4)]" />}
                      </button>
                      <span className="num text-[12px] text-[var(--ink-3)]">{g.devices.length}</span>
                      <HealthStrip tally={g.tally} maxTicks={60} height={8} className="w-[180px] shrink-0 hidden sm:flex" />
                      <HealthLegend tally={g.tally} showOk={false} className="ml-auto hidden md:flex" />
                    </div>
                    {view === 'grid' ? (
                      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(212px,1fr))]">
                        {g.devices.map((d, i) => (
                          <DeviceTile
                            key={d.id}
                            device={d}
                            categoryName={catName.get(d.categoryId)}
                            areaName={idx.byId.get(d.zoneId)?.name}
                            onClick={() => openDevice(d)}
                            highlight={d.id === deviceParam}
                            style={{ '--i': Math.min(i, 24) }}
                          />
                        ))}
                      </div>
                    ) : (
                      <DeviceList devices={g.devices} catName={catName} idx={idx} onOpen={openDevice} />
                    )}
                  </section>
                ))
              )}
            </div>

            {/* Right rail */}
            <div className="flex flex-col gap-4 xl:sticky xl:top-[84px]">
              <Sheet
                title="Active faults"
                eyebrow={`${problems.length ? openProblems({ ...board, devices: inCat }).length : 0} open`}
                bodyClassName="pb-2"
              >
                {problems.length === 0 ? (
                  <div className="px-5 pb-5 flex items-center gap-3 text-[13px] text-[var(--ink-2)]">
                    <span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>✓</span>
                    No open faults here.
                  </div>
                ) : (
                  <ul>
                    {problems.map((p) => (
                      <li key={p.id}>
                        <button type="button" onClick={() => openDevice(p.device)} className="w-full text-left px-5 py-3 flex gap-3 hover:bg-[var(--surface-2)] cursor-pointer border-t border-[var(--line)]">
                          <span className="mt-[3px] w-2 h-2 rounded-full shrink-0" style={{ background: HEALTH[p.health].color }} />
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="text-[13px] font-[620] truncate">{p.device.name}</span>
                              <PriorityTag priority={p.priority} />
                            </span>
                            <span className="block text-[12px] text-[var(--ink-2)] truncate mt-0.5">{p.description}</span>
                            <span className="flex items-center gap-1.5 text-[11px] text-[var(--ink-3)] mt-1">
                              <UserRound size={11} /> {p.technician || 'Unassigned'}
                              <span className="text-[var(--ink-4)]">·</span>
                              {STAGE[p.status]?.label}
                              <span className="ml-auto font-mono">{ago(p.createdAt)}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Sheet>

              <Sheet title="Today's checks" eyebrow="Daily verification" bodyClassName="px-5 pb-5">
                <CheckRing checked={tally.checked} total={tally.live} />
                {tally.unchecked > 0 && (
                  <button type="button" className="fx-btn w-full mt-4" onClick={() => setParam('show', 'unchecked')}>
                    Show {tally.unchecked} not checked
                  </button>
                )}
              </Sheet>
            </div>
          </div>
        </>
      )}

      {drawerDevice && (
        <DeviceDrawer
          device={drawerDevice}
          categoryName={catName.get(drawerDevice.categoryId)}
          path={zonePath(drawerDevice.zoneId, idx.byId)}
          onClose={() => setParam('device', null)}
          onRaiseProblem={outlet.onOpenRequestModal ? () => { setParam('device', null); outlet.onOpenRequestModal({ zoneId: drawerDevice.zoneId, categoryId: drawerDevice.categoryId }); } : undefined}
        />
      )}
    </div>
  );
}

function TypeTab({ active, onClick, label, title, iconName, count, tally }) {
  const worst = worstHealth(tally);
  const alert = worst === 'down' || worst === 'fix';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative flex items-center gap-2.5 h-[52px] pl-3 pr-4 rounded-[12px] border transition-all cursor-pointer ${
        active
          ? 'bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)] shadow-[var(--shadow-2)]'
          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line-strong)]'
      }`}
    >
      <span className={`w-8 h-8 rounded-[9px] grid place-items-center ${active ? 'bg-white/10' : 'bg-[var(--surface-2)] text-[var(--ink-2)]'}`}>
        {iconName ? <CategoryIcon name={iconName} size={16} /> : <LayoutGrid size={16} />}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[13px] font-[620]">{label}</span>
        <span className={`text-[11px] num ${active ? 'opacity-70' : 'text-[var(--ink-3)]'}`}>
          {count} {tally?.down ? `· ${tally.down} broken` : tally?.fix ? `· ${tally.fix} fixing` : ''}
        </span>
      </span>
      {alert && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--paper)]" style={{ background: HEALTH[worst].color }} />}
    </button>
  );
}

function SummaryCell({ label, value, suffix, sub, tone, active, onClick, hatch }) {
  const color = tone ? HEALTH[tone].color : 'var(--ink)';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`text-left lg:px-4 lg:border-l border-[var(--line)] lg:first:border-l-0 lg:first:pl-0 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-2 text-[12px] font-[560] text-[var(--ink-3)]">
        {tone && <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
        {hatch && <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-dashed border-[var(--ink-4)]" />}
        <span className={active ? 'text-[var(--ink)] underline underline-offset-4 decoration-2' : 'group-hover:text-[var(--ink)]'} style={active ? { textDecorationColor: color } : undefined}>{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-0.5">
        <span className="num text-[30px] leading-none font-[640] tracking-[-0.04em]" style={{ color: tone && tone !== 'ok' && Number(value) > 0 ? color : 'var(--ink)' }}>{value}</span>
        {suffix && <span className="num text-[15px] text-[var(--ink-3)] font-[560]">{suffix}</span>}
      </div>
      <div className="mt-1 text-[11.5px] text-[var(--ink-3)]">{sub}</div>
    </Tag>
  );
}

function CheckRing({ checked, total }) {
  const p = total ? checked / total : 0;
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
        <circle
          cx="38" cy="38" r={r} fill="none" stroke="var(--ok)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`} style={{ transition: 'stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div>
        <div className="num text-[26px] font-[650] tracking-[-0.03em] leading-none">{Math.round(p * 100)}%</div>
        <div className="mt-1.5 text-[12.5px] text-[var(--ink-2)]"><span className="num font-[620]">{checked}</span> of <span className="num">{total}</span> live devices verified on site today</div>
      </div>
    </div>
  );
}

function DeviceList({ devices, catName, idx, onOpen }) {
  return (
    <div className="fx-sheet overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11.5px] text-[var(--ink-3)] border-b border-[var(--line)]">
              <th className="font-[560] px-4 py-2.5">Device</th>
              <th className="font-[560] px-3 py-2.5">Type</th>
              <th className="font-[560] px-3 py-2.5">Spot</th>
              <th className="font-[560] px-3 py-2.5">Health</th>
              <th className="font-[560] px-3 py-2.5">Today</th>
              <th className="font-[560] px-3 py-2.5">Problem</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => {
              return (
                <tr key={d.id} onClick={() => onOpen(d)} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)] cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon name={catName.get(d.categoryId) || d.name} size={16} className="text-[var(--ink-3)] shrink-0" />
                      <div className="min-w-0">
                        <div className="font-[600] truncate">{d.name}</div>
                        <div className="font-mono text-[10.5px] text-[var(--ink-3)]">{d.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--ink-2)] whitespace-nowrap">{categoryShort(catName.get(d.categoryId))}</td>
                  <td className="px-3 py-2.5 text-[var(--ink-2)] truncate max-w-[180px]">{d.location || idx.byId.get(d.zoneId)?.name}</td>
                  <td className="px-3 py-2.5"><StatusPill health={healthOf(d.status)} size="sm" /></td>
                  <td className="px-3 py-2.5">{healthOf(d.status) !== 'idle' && <CheckMark log={d.todayLog} />}</td>
                  <td className="px-3 py-2.5 max-w-[260px]">
                    {d.issue ? (
                      <span className="flex items-center gap-2 min-w-0">
                        <PriorityTag priority={d.issue.priority} />
                        <span className="truncate text-[var(--ink-2)]">{d.issue.description}</span>
                      </span>
                    ) : <span className="text-[var(--ink-4)]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[52px] w-[130px] !rounded-[12px]" />)}</div>
      <Skeleton className="h-[132px] !rounded-[14px]" />
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(212px,1fr))]">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-[132px] !rounded-[12px]" />)}
      </div>
    </div>
  );
}
