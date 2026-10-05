import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MapPinOff, CalendarCheck, Megaphone, LayoutGrid, Users, Clock3, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBoard } from '../api/boardApi';
import { socketClient } from '../api/socketClient';
import DailyLogModal from '../common/DailyLogModal';
import { PageHeader, RefreshButton, Sheet, EmptyState, Skeleton, TextLink } from '../ui/primitives';
import { SignalHero, HeroSkeleton, LocationRows, TypeCards, ProblemFeed } from '../ui/overview';
import { tallyHealth, agoLong, pct } from '../ui/status';
import { locationRollup, categoryTallies, openProblems } from '../ui/boardModel';

/**
 * Zone Officer overview — "my location". Big, icon-first actions for the
 * things a location in-charge actually does (check, report, look), then the
 * same health story as the client view, scoped by the backend to the
 * officer's assigned zone subtree.
 *
 * With no zone assignment we render an explicit empty state and make NO
 * request (a zone role has no valid client/platform scope to fall back to).
 */
export default function ZoneOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const outlet = useOutletContext() || {};
  const zoneId = currentUser?.zoneId ?? null;

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(!!zoneId);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [logModalOpen, setLogModalOpen] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!zoneId) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      setBoard(await getBoard({ scope: 'zone', id: zoneId }));
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load your location.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [zoneId]);

  useEffect(() => {
    load(false);
    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  useEffect(() => {
    if (!zoneId) return undefined;
    const offs = ['issue:created', 'issue:updated', 'log:submitted'].map((ev) => socketClient.on(ev, () => load(true)));
    return () => offs.forEach((off) => off());
  }, [load, zoneId]);

  const tally = useMemo(() => tallyHealth(board?.devices), [board]);
  const areas = useMemo(() => (board ? locationRollup(board, { rootId: zoneId }) : []), [board, zoneId]);
  const cats = useMemo(() => (board ? categoryTallies(board) : []), [board]);
  const problems = useMemo(() => (board ? openProblems(board) : []), [board]);
  const catName = useMemo(() => new Map((board?.categories ?? []).map((c) => [c.id, c.name])), [board]);

  if (!zoneId) {
    return (
      <Sheet className="max-w-xl mx-auto mt-10">
        <EmptyState
          icon={MapPinOff}
          title="No location assigned yet"
          body="You're signed in as a zone officer, but no location has been assigned to you. Ask your administrator to assign one — your equipment will appear here."
        />
      </Sheet>
    );
  }

  const zoneName = currentUser?.zoneName || board?.zones?.find((z) => z.id === zoneId)?.name || 'My location';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const checkedPct = pct(tally.checked, tally.live);

  const actions = [
    {
      key: 'check',
      icon: CalendarCheck,
      title: 'Daily check',
      sub: tally.live ? `${tally.checked} of ${tally.live} done today` : 'Mark today\'s status',
      onClick: () => setLogModalOpen(true),
      progress: tally.live ? checkedPct : null,
      primary: tally.unchecked > 0,
    },
    { key: 'report', icon: Megaphone, title: 'Report problem', sub: 'Something not working?', onClick: () => (outlet.onOpenRequestModal ? outlet.onOpenRequestModal({ zoneId }) : navigate('/zone/requests')) },
    { key: 'board', icon: LayoutGrid, title: 'All equipment', sub: `${tally.total} devices here`, onClick: () => navigate('/zone/board') },
    { key: 'team', icon: Users, title: 'My team', sub: 'People at this location', onClick: () => navigate('/zone/team') },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        eyebrow={<>{today}</>}
        title={zoneName}
        meta={board && (
          <>
            {currentUser?.clientName && <span>{currentUser.clientName}</span>}
            <span><span className="num font-[620] text-[var(--ink-2)]">{tally.total}</span> devices</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Updated {agoLong(board.generatedAt)}</span>
          </>
        )}
        actions={<RefreshButton onClick={() => load(true)} spinning={refreshing} />}
      />

      {/* Big, icon-first actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a, i) => (
          <button
            key={a.key}
            type="button"
            onClick={a.onClick}
            className={`group fx-rise relative overflow-hidden text-left rounded-[14px] p-5 min-h-[128px] flex flex-col justify-between cursor-pointer transition-[transform,box-shadow] hover:-translate-y-[1px] ${
              a.primary
                ? 'bg-[var(--accent)] text-white shadow-[0_10px_30px_-12px_var(--accent-line)]'
                : 'fx-sheet hover:shadow-[var(--shadow-2)]'
            }`}
            style={{ '--i': i }}
          >
            <span className={`w-11 h-11 rounded-[12px] grid place-items-center ${a.primary ? 'bg-white/15' : 'bg-[var(--surface-3)] text-[var(--ink)]'}`}>
              <a.icon size={22} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-[16px] font-[650] tracking-[-0.02em]">{a.title}</span>
              <span className={`block text-[12.5px] mt-0.5 ${a.primary ? 'text-white/80' : 'text-[var(--ink-3)]'}`}>{a.sub}</span>
            </span>
            {a.progress != null && (
              <span className={`absolute left-0 bottom-0 h-[4px] ${a.primary ? 'bg-white/70' : 'bg-[var(--ok)]'}`} style={{ width: `${a.progress}%` }} />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <HeroSkeleton />
          <Skeleton className="h-[320px] !rounded-[14px]" />
        </>
      ) : error ? (
        <Sheet>
          <EmptyState title="Couldn't load your location" body={error} action={<button className="fx-btn" onClick={() => load(false)}>Try again</button>} />
        </Sheet>
      ) : (
        <>
          <SignalHero
            tally={tally}
            places={areas.length > 1 ? `${areas.length} areas` : null}
            openComplaints={problems.length}
            onFilter={(show) => navigate(`/zone/board?show=${show}`)}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6 items-start">
            {areas.length > 0 ? (
              <LocationRows
                rows={areas}
                title="Areas"
                eyebrow="Worst first"
                onOpen={(z) => navigate(`/zone/board/${z.id}`)}
              />
            ) : (
              <Sheet title="Equipment" eyebrow="By type" bodyClassName="px-5 pb-5">
                <TypeCards cats={cats} onOpen={(c) => navigate(`/zone/board${c.id ? `?cat=${c.id}` : '?cat=none'}`)} />
              </Sheet>
            )}
            <ProblemFeed
              problems={problems}
              catName={catName}
              title="Open problems"
              onOpen={(p) => navigate(`/zone/board/${p.device.zoneId}?device=${p.device.id}`)}
              action={<TextLink onClick={() => navigate('/zone/requests')}>Track <ArrowRight size={13} /></TextLink>}
            />
          </div>

          {areas.length > 0 && cats.length > 0 && (
            <section className="flex flex-col gap-3">
              <div>
                <div className="fx-eyebrow mb-1">By equipment type</div>
                <h2 className="text-[17px] font-[640] tracking-[-0.02em]">Equipment</h2>
              </div>
              <TypeCards cats={cats} onOpen={(c) => navigate(`/zone/board${c.id ? `?cat=${c.id}` : '?cat=none'}`)} />
            </section>
          )}
        </>
      )}

      <DailyLogModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSubmitted={() => load(true)}
      />
    </div>
  );
}
