import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, LayoutGrid, Clock3, ArrowRight, Users, MapPinned, Wrench, Boxes } from 'lucide-react';
import LocationsOverviewMap from './components/LocationsOverviewMap';
import { getPlatformOverview } from '../../api/dashboardApi';
import { socketClient } from '../../api/socketClient';
import { PageHeader, RefreshButton, Sheet, Skeleton, EmptyState, HealthStrip, TextLink, Avatar } from '../../ui/primitives';
import { SignalHero, HeroSkeleton, TypeCards, ProblemFeed, MiniStat } from '../../ui/overview';
import { HEALTH, STAGE, worstHealth, pct, ago } from '../../ui/status';

const PIPELINE = ['open', 'reopened', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed'];

/**
 * Platform overview for Fillip operations: portfolio health, which client
 * needs help, what's critical, and how the repair pipeline is flowing. One
 * aggregated call (GET /dashboard/overview).
 */
export default function Overview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getPlatformOverview();
      if (data) { setOverview(data); setError(null); }
    } catch (err) {
      setError(err.message || 'Failed to load platform overview');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const offs = ['issue:created', 'issue:updated', 'log:submitted'].map((ev) => socketClient.on(ev, () => load(true)));
    return () => offs.forEach((off) => off());
  }, [load]);

  const d = overview?.devices;
  const tally = useMemo(() => {
    if (!d) return { total: 0, ok: 0, down: 0, fix: 0, idle: 0, live: 0, checked: 0, unchecked: 0 };
    const live = d.working + d.faulty + d.underMaintenance;
    const unchecked = Math.min(live, Math.max(0, (d.missingTodayLog ?? 0) - (d.provisioned ?? 0)));
    return { total: d.total, ok: d.working, down: d.faulty, fix: d.underMaintenance, idle: d.provisioned, live, unchecked, checked: live - unchecked };
  }, [d]);

  const clients = useMemo(() => (overview?.facilities ?? []).map((f) => ({
    ...f,
    tally: {
      total: f.devices,
      ok: f.workingDevices,
      down: f.faultyDevices,
      fix: f.underMaintenanceDevices,
      idle: Math.max(0, f.devices - f.workingDevices - f.faultyDevices - f.underMaintenanceDevices),
    },
  })).sort((a, b) => (b.tally.down * 3 + b.tally.fix) - (a.tally.down * 3 + a.tally.fix) || b.devices - a.devices), [overview]);

  const types = useMemo(() => (overview?.byHardwareType ?? []).filter((t) => t.total).map((t) => ({
    id: t.hardwareTypeId,
    name: t.name,
    tally: { total: t.total, ok: t.working, down: t.faulty, fix: t.underMaintenance, idle: Math.max(0, t.total - t.working - t.faulty - t.underMaintenance) },
  })), [overview]);

  const alerts = useMemo(() => (overview?.criticalAlerts ?? []).map((a) => ({
    id: a.id,
    description: a.title,
    priority: a.priority,
    status: a.status,
    technician: a.assignedTo,
    createdAt: a.createdAt,
    health: 'down',
    device: { name: a.deviceName },
    zone: { name: [a.zoneName, a.clientName].filter(Boolean).join(' · ') },
  })), [overview]);

  const t = overview?.tenancy;
  const issues = overview?.issues;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        eyebrow={<>Fillip Technologies · platform</>}
        title="Operations overview"
        meta={t && (
          <>
            <span><span className="num font-[620] text-[var(--ink-2)]">{t.clients}</span> clients</span>
            <span><span className="num font-[620] text-[var(--ink-2)]">{t.zones}</span> locations</span>
            <span><span className="num font-[620] text-[var(--ink-2)]">{tally.total}</span> devices</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Live from all clients</span>
          </>
        )}
        actions={
          <>
            <RefreshButton onClick={() => load(true)} spinning={refreshing} />
            <button type="button" className="fx-btn fx-btn-primary" onClick={() => navigate('/superadmin/board')}>
              <LayoutGrid size={15} /> Equipment board
            </button>
          </>
        }
      />

      {loading ? (
        <>
          <HeroSkeleton />
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6">
            <Skeleton className="h-[320px] !rounded-[14px]" />
            <Skeleton className="h-[320px] !rounded-[14px]" />
          </div>
        </>
      ) : error ? (
        <Sheet><EmptyState title="Couldn't load the platform overview" body={error} action={<button className="fx-btn" onClick={() => load(false)}>Try again</button>} /></Sheet>
      ) : (
        <>
          <SignalHero
            tally={tally}
            places={clients.length > 1 ? `${clients.length} clients` : null}
            openComplaints={issues?.open ?? 0}
            onFilter={(show) => navigate(`/superadmin/board?show=${show}`)}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6 items-start">
            <Sheet title="Clients" eyebrow="Worst first" action={<TextLink onClick={() => navigate('/superadmin/clients')}>Manage <ArrowRight size={13} /></TextLink>} bodyClassName="pb-1">
              {clients.length === 0 ? (
                <EmptyState icon={Building2} title="No clients yet" />
              ) : (
                <ul>
                  {clients.map((c, i) => {
                    const w = worstHealth(c.tally);
                    return (
                      <li key={c.clientId} className="fx-rise" style={{ '--i': i }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/superadmin/board?client=${c.clientId}`)}
                          className="group w-full text-left grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.3fr)_90px_90px_170px_20px] items-center gap-x-5 gap-y-2 px-5 py-4 border-t border-[var(--line)] hover:bg-[var(--surface-2)] cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="relative w-10 h-10 rounded-[11px] overflow-hidden grid place-items-center bg-[var(--surface-3)] text-[var(--ink-2)] shrink-0">
                              {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-cover" /> : <Building2 size={18} />}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: HEALTH[w].color }} />
                                <span className="text-[14.5px] font-[630] tracking-[-0.015em] truncate group-hover:text-[var(--accent)]">{c.name}</span>
                              </div>
                              <div className="text-[12px] text-[var(--ink-3)] truncate">{c.facilityName !== c.name ? c.facilityName : c.location || c.companyName}</div>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <div className="num text-[17px] font-[640] tracking-[-0.02em]">{c.devices}</div>
                            <div className="text-[11px] text-[var(--ink-3)]">{c.zones} locations</div>
                          </div>
                          <div className="hidden md:block">
                            <div className="num text-[17px] font-[640] tracking-[-0.02em]" style={{ color: c.openIssues ? 'var(--down-ink)' : 'var(--ink)' }}>{c.openIssues}</div>
                            <div className="text-[11px] text-[var(--ink-3)]">open</div>
                          </div>
                          <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                            <HealthStrip tally={c.tally} maxTicks={24} height={8} />
                            <div className="text-[11px] text-[var(--ink-3)]"><span className="num font-[620] text-[var(--ink-2)]">{pct(c.tally.ok, c.tally.total)}%</span> working</div>
                          </div>
                          <ChevronRight size={16} className="hidden md:block text-[var(--ink-4)] group-hover:text-[var(--ink)]" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Sheet>

            <ProblemFeed
              problems={alerts}
              title="Critical & high"
              onOpen={() => navigate('/superadmin/issues')}
              action={<TextLink onClick={() => navigate('/superadmin/issues')}>All issues <ArrowRight size={13} /></TextLink>}
            />
          </div>

          {/* Repair pipeline */}
          {issues && (
            <Sheet title="Repair pipeline" eyebrow="Every complaint, by stage" bodyClassName="px-5 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {PIPELINE.map((s, i) => {
                  const n = issues.byStatus?.[s] ?? 0;
                  const tone = STAGE[s]?.tone ?? 'idle';
                  return (
                    <div key={s} className="relative rounded-[11px] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 fx-rise" style={{ '--i': i }}>
                      <div className="flex items-center gap-1.5 text-[11.5px] font-[560] text-[var(--ink-3)]">
                        <span className="w-[7px] h-[7px] rounded-full" style={{ background: HEALTH[tone].color }} />
                        {STAGE[s]?.label}
                      </div>
                      <div className="num mt-2 text-[26px] leading-none font-[640] tracking-[-0.04em]">{n}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-[var(--ink-3)]">
                <span>Today: <span className="num font-[640] text-[var(--ink)]">{issues.createdToday}</span> reported</span>
                <span><span className="num font-[640] text-[var(--ok-ink)]">{issues.resolvedToday}</span> fixed</span>
                <span><span className="num font-[640] text-[var(--ink)]">{issues.closedToday}</span> closed</span>
                <span className="ml-auto">
                  Open by priority:{' '}
                  {['critical', 'high', 'medium', 'low'].map((p) => (
                    <span key={p} className="ml-2"><span className="num font-[640] text-[var(--ink)]">{issues.byPriority?.[p] ?? 0}</span> {p}</span>
                  ))}
                </span>
              </div>
            </Sheet>
          )}

          {types.length > 0 && (
            <section className="flex flex-col gap-3">
              <div>
                <div className="fx-eyebrow mb-1">Across all clients</div>
                <h2 className="text-[17px] font-[640] tracking-[-0.02em]">Equipment</h2>
              </div>
              <TypeCards cats={types} onOpen={() => navigate('/superadmin/board')} />
            </section>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <Sheet title="Technician load" eyebrow={`${overview.technicians?.busy ?? 0} busy · ${overview.technicians?.idle ?? 0} free`} action={<TextLink onClick={() => navigate('/superadmin/technicians')}>All <ArrowRight size={13} /></TextLink>} bodyClassName="px-5 pb-4">
              {(overview.technicians?.top ?? []).length === 0 ? (
                <p className="text-[13px] text-[var(--ink-3)] pb-2">No technicians yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {overview.technicians.top.map((tech) => {
                    const max = Math.max(1, ...overview.technicians.top.map((x) => x.openAssigned));
                    return (
                      <li key={tech.id} className="flex items-center gap-3">
                        <Avatar name={tech.name} size={30} />
                        <div className="w-[150px] min-w-0">
                          <div className="text-[13px] font-[600] truncate">{tech.name}</div>
                          <div className="text-[11.5px] text-[var(--ink-3)] truncate">{tech.specialization || 'General'}</div>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(tech.openAssigned / max) * 100}%`, background: tech.openAssigned >= 5 ? 'var(--down)' : tech.openAssigned >= 3 ? 'var(--fix)' : 'var(--ok)', transformOrigin: 'left', animation: 'fx-grow 700ms cubic-bezier(.2,.7,.2,1) both' }} />
                        </div>
                        <span className="num w-8 text-right text-[13px] font-[640]">{tech.openAssigned}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Sheet>

            <Sheet title="Latest activity" eyebrow="Repair updates" bodyClassName="px-5 pb-4">
              {(overview.recentActivity ?? []).length === 0 ? (
                <p className="text-[13px] text-[var(--ink-3)] pb-2">Nothing yet.</p>
              ) : (
                <ol className="relative flex flex-col gap-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--line)]">
                  {overview.recentActivity.slice(0, 7).map((a) => {
                    const tone = STAGE[a.toStatus]?.tone ?? 'idle';
                    return (
                      <li key={a.id} className="relative pl-7">
                        <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-[3px] border-[var(--surface)]" style={{ background: HEALTH[tone].color }} />
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-[600] truncate">{a.deviceName || 'Device'}</span>
                          <span className="text-[12px] text-[var(--ink-3)]">→ {STAGE[a.toStatus]?.label ?? a.toStatus}</span>
                          <span className="ml-auto font-mono text-[11px] text-[var(--ink-3)] whitespace-nowrap">{ago(a.changedAt)}</span>
                        </div>
                        <div className="text-[12px] text-[var(--ink-3)] truncate">
                          {[a.title, a.zoneName, a.clientName].filter(Boolean).join(' · ')}{a.changedBy ? ` — ${a.changedBy}` : ''}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Sheet>
          </div>

          {t && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MiniStat icon={Building2} label="Organizations" value={t.companies} sub={`${t.activeCompanies} active`} onClick={() => navigate('/superadmin/organizations')} />
              <MiniStat icon={MapPinned} label="Locations" value={t.zones} sub={`${t.activeZones} active`} onClick={() => navigate('/superadmin/zones')} />
              <MiniStat icon={Users} label="Users" value={t.users} sub="Client & zone accounts" onClick={() => navigate('/superadmin/clients')} />
              <MiniStat icon={Wrench} label="Technicians" value={t.technicians} sub="Field engineers" onClick={() => navigate('/superadmin/technicians')} />
            </div>
          )}

          {(overview?.facilities ?? []).some((f) => f.latitude && f.longitude) && (
            <section className="flex flex-col gap-3">
              <div>
                <div className="fx-eyebrow mb-1">Where</div>
                <h2 className="text-[17px] font-[640] tracking-[-0.02em]">Client sites</h2>
              </div>
              <LocationsOverviewMap facilities={overview?.facilities} loading={false} />
            </section>
          )}
          <p className="text-[12px] text-[var(--ink-3)] inline-flex items-center gap-1.5"><Boxes size={12} /> Device counts exclude retired units.</p>
        </>
      )}
    </div>
  );
}
