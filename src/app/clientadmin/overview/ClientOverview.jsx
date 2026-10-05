import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LayoutGrid, Plus, Shield, UserCheck, Wrench, Clock3, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../api/dashboardApi';
import { getBoard } from '../../api/boardApi';
import { getUsers } from '../../api/usersApi';
import { socketClient } from '../../api/socketClient';
import ClientDetailDrawer from './components/ClientDetailDrawer';
import { PageHeader, RefreshButton, Sheet, Skeleton, TextLink, EmptyState } from '../../ui/primitives';
import { SignalHero, HeroSkeleton, LocationRows, TypeCards, ProblemFeed, MiniStat } from '../../ui/overview';
import { tallyHealth, agoLong } from '../../ui/status';
import { locationRollup, categoryTallies, openProblems } from '../../ui/boardModel';

/**
 * Client "command" overview: is everything OK, where isn't it, what is being
 * done about it. Everything is derived from one board payload so numbers agree
 * across the hero, the locations and the equipment types.
 */
export default function ClientOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const outlet = useOutletContext() || {};

  const scope = useMemo(() => {
    if (currentUser?.clientId) return { scope: 'client', id: currentUser.clientId };
    if (currentUser?.zoneId) return { scope: 'zone', id: currentUser.zoneId };
    return null;
  }, [currentUser]);

  const [board, setBoard] = useState(null);
  const [team, setTeam] = useState({ zoneOfficers: 0, staffMembers: 0, technicians: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!scope) { setLoading(false); return; }
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [b, users, summary] = await Promise.all([
        getBoard(scope),
        getUsers({ limit: 100 }).catch(() => ({ items: [] })),
        getDashboardSummary({ ...scope, includeSubzones: true }).catch(() => null),
      ]);
      setBoard(b);
      const active = (users?.items ?? []).filter((u) => u.accountStatus !== 'removed');
      setTeam({
        zoneOfficers: active.filter((u) => u.role === 'zone_incharge').length,
        staffMembers: active.filter((u) => u.role === 'zone_staff').length,
        technicians: summary?.assignedTechnicians ?? 0,
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load your overview.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope]);

  useEffect(() => { load(false); }, [load]);

  // Live: silent revalidation on any fault / repair / daily-check event.
  useEffect(() => {
    const offs = ['issue:created', 'issue:updated', 'log:submitted'].map((ev) => socketClient.on(ev, () => load(true)));
    const onLocal = () => load(true);
    window.addEventListener('fixly:users_changed', onLocal);
    window.addEventListener('fixly:issue_created', onLocal);
    return () => {
      offs.forEach((off) => off());
      window.removeEventListener('fixly:users_changed', onLocal);
      window.removeEventListener('fixly:issue_created', onLocal);
    };
  }, [load]);

  const tally = useMemo(() => tallyHealth(board?.devices), [board]);
  const rows = useMemo(() => (board ? locationRollup(board) : []), [board]);
  const cats = useMemo(() => (board ? categoryTallies(board) : []), [board]);
  const problems = useMemo(() => (board ? openProblems(board) : []), [board]);
  const catName = useMemo(() => new Map((board?.categories ?? []).map((c) => [c.id, c.name])), [board]);

  const toBoard = (q = '') => navigate(`/clientadmin/board${q}`);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        eyebrow={<>{today}</>}
        title={currentUser?.clientName || 'Overview'}
        meta={board && (
          <>
            <span><span className="num font-[620] text-[var(--ink-2)]">{tally.total}</span> devices</span>
            <span><span className="num font-[620] text-[var(--ink-2)]">{rows.length}</span> locations</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Updated {agoLong(board.generatedAt)}</span>
          </>
        )}
        actions={
          <>
            <RefreshButton onClick={() => load(true)} spinning={refreshing} />
            <button type="button" className="fx-btn" onClick={() => toBoard()}>
              <LayoutGrid size={15} /> Equipment board
            </button>
            {outlet.onOpenRequestModal && (
              <button type="button" className="fx-btn fx-btn-primary" onClick={outlet.onOpenRequestModal}>
                <Plus size={15} /> Raise problem
              </button>
            )}
          </>
        }
      />

      {loading ? (
        <>
          <HeroSkeleton />
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6">
            <Skeleton className="h-[360px] !rounded-[14px]" />
            <Skeleton className="h-[360px] !rounded-[14px]" />
          </div>
        </>
      ) : error ? (
        <Sheet>
          <EmptyState title="Couldn't load your overview" body={error} action={<button className="fx-btn" onClick={() => load(false)}>Try again</button>} />
        </Sheet>
      ) : (
        <>
          <SignalHero
            tally={tally}
            places={rows.length > 1 ? `${rows.length} locations` : null}
            openComplaints={problems.length}
            onFilter={(show) => toBoard(`?show=${show}`)}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6 items-start">
            <LocationRows
              rows={rows}
              onOpen={(z) => navigate(`/clientadmin/board/${z.id}`)}
              title="Locations"
              eyebrow="Worst first"
              action={<TextLink onClick={() => navigate('/clientadmin/zones')}>Manage <ArrowRight size={13} /></TextLink>}
            />
            <ProblemFeed
              problems={problems}
              catName={catName}
              onOpen={(p) => navigate(`/clientadmin/board/${p.device.zoneId}?device=${p.device.id}`)}
              action={<TextLink onClick={() => navigate('/clientadmin/requests')}>All <ArrowRight size={13} /></TextLink>}
            />
          </div>

          {cats.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <div>
                  <div className="fx-eyebrow mb-1">By equipment type</div>
                  <h2 className="text-[17px] font-[640] tracking-[-0.02em]">Equipment</h2>
                </div>
                <TextLink onClick={() => toBoard()}>Open board <ArrowRight size={13} /></TextLink>
              </div>
              <TypeCards cats={cats} onOpen={(c) => toBoard(c.id ? `?cat=${c.id}` : '?cat=none')} />
            </section>
          )}

          <section className="flex flex-col gap-3">
            <div>
              <div className="fx-eyebrow mb-1">People</div>
              <h2 className="text-[17px] font-[640] tracking-[-0.02em]">Who looks after it</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MiniStat icon={Shield} label="Location in-charges" value={team.zoneOfficers} sub="Own a location's equipment" onClick={() => setDrawer('zone_officers')} />
              <MiniStat icon={UserCheck} label="Location staff" value={team.staffMembers} sub="Do the daily checks" onClick={() => setDrawer('staff')} />
              <MiniStat icon={Wrench} label="Technicians" value={team.technicians} sub="Fix what breaks" onClick={() => setDrawer('technicians')} />
            </div>
          </section>
        </>
      )}

      {drawer && <ClientDetailDrawer type={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
