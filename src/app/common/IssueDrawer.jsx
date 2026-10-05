import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Paperclip, MapPin, Tag, Cpu, UserRound, CalendarClock, CheckCircle2 } from 'lucide-react';
import { getIssueById, getIssueHistory } from '../api/issuesApi';
import StatusHistoryLocationBadge from './components/StatusHistoryLocationBadge';
import { HEALTH, STAGE, PRIORITY, ticketRef, agoLong } from '../ui/status';
import { Skeleton, Avatar } from '../ui/primitives';

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const JOURNEY = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--line)] last:border-b-0">
      <Icon size={15} className="text-[var(--ink-3)] mt-[1px] shrink-0" />
      <div className="w-[110px] shrink-0 text-[12.5px] text-[var(--ink-3)]">{label}</div>
      <div className="flex-1 min-w-0 text-[13px] text-[var(--ink)] font-[520]">{children}</div>
    </div>
  );
}

/** Complaint detail: where it is in the repair journey, facts, evidence, and the full audit trail. */
export default function IssueDrawer({ issueId, onClose }) {
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!issueId) return;
    setLoading(true);
    setError('');
    try {
      const [iss, hist] = await Promise.all([getIssueById(issueId), getIssueHistory(issueId)]);
      setIssue(iss);
      setHistory(hist ?? []);
    } catch (err) {
      console.error('Failed to load issue details:', err);
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stage = issue ? STAGE[issue.status] : null;
  const tone = stage?.tone ?? 'idle';
  const p = issue ? PRIORITY[issue.priority] : null;
  const journeyIdx = issue
    ? (issue.status === 'reopened' ? 0 : issue.status === 'on_hold' ? 2 : JOURNEY.indexOf(issue.status))
    : -1;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Complaint details">
      <div className="absolute inset-0 bg-[rgba(12,14,17,0.32)] backdrop-blur-[2px]" onClick={onClose} />
      <aside
        className="relative h-full w-full max-w-[520px] bg-[var(--surface)] border-l border-[var(--line)] shadow-[var(--shadow-pop)] flex flex-col"
        style={{ animation: 'fx-slide-in 220ms cubic-bezier(.2,.7,.2,1) both' }}
      >
        <div className="px-6 pt-5 pb-5" style={{ background: issue ? `linear-gradient(180deg, ${HEALTH[tone].soft}, transparent)` : undefined }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[var(--ink-3)]">Complaint {ticketRef(issueId)}</span>
            <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer" aria-label="Close" title="Close (Esc)">
              <X size={17} />
            </button>
          </div>
          {loading ? (
            <div className="mt-3 flex flex-col gap-2"><Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          ) : issue && (
            <>
              <h2 className="mt-3 text-[21px] font-[650] tracking-[-0.025em] leading-snug">{issue.description || 'Problem reported'}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p && (
                  <span className="inline-flex items-center gap-1.5 h-[24px] px-2 rounded-[7px] text-[11.5px] font-[620] text-white" style={{ background: p.color }}>
                    <span className="font-mono">{p.code}</span> {p.label}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full text-[12px] font-[620]" style={{ background: HEALTH[tone].soft, color: HEALTH[tone].ink }}>
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: HEALTH[tone].color }} />
                  {stage?.label ?? issue.status}
                </span>
                <span className="text-[12px] text-[var(--ink-3)]">opened {agoLong(issue.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto fx-scroll px-6 pb-8">
          {loading ? (
            <div className="flex flex-col gap-3 pt-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : error ? (
            <div className="mt-2 px-4 py-3 rounded-[12px] text-[13px]" style={{ background: 'var(--down-soft)', color: 'var(--down-ink)' }}>{error}</div>
          ) : !issue ? (
            <p className="py-20 text-center text-[13px] text-[var(--ink-3)]">Complaint not found.</p>
          ) : (
            <>
              {/* Repair journey */}
              <div className="mb-6">
                <div className="fx-eyebrow mb-3">Repair journey</div>
                <div className="flex items-center">
                  {JOURNEY.map((s, i) => {
                    const reached = i <= journeyIdx;
                    const current = i === journeyIdx;
                    return (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1.5 min-w-0" style={{ flex: '0 0 auto' }}>
                          <span
                            className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-[700] transition-colors"
                            style={{
                              background: reached ? (current ? HEALTH[tone].color : 'var(--ink)') : 'var(--surface-3)',
                              color: reached ? '#fff' : 'var(--ink-4)',
                              boxShadow: current ? `0 0 0 4px ${HEALTH[tone].soft}` : 'none',
                            }}
                          >
                            {reached && !current ? <CheckCircle2 size={13} /> : i + 1}
                          </span>
                          <span className={`text-[10.5px] whitespace-nowrap ${current ? 'font-[650] text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}>{STAGE[s].label.replace(' · verify', '')}</span>
                        </div>
                        {i < JOURNEY.length - 1 && <span className="flex-1 h-[2px] mx-1 mb-5 rounded-full" style={{ background: i < journeyIdx ? 'var(--ink)' : 'var(--line)' }} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                {issue.status === 'on_hold' && <p className="mt-3 text-[12px] text-[var(--ink-3)]">Work is paused — waiting on a part, access or approval.</p>}
                {issue.status === 'reopened' && <p className="mt-3 text-[12px] text-[var(--down-ink)]">Reopened — the fix didn't hold.</p>}
              </div>

              <div className="fx-eyebrow mb-1">Details</div>
              <div className="mb-6">
                <Fact icon={Cpu} label="Device">{issue.device?.name ?? '—'}</Fact>
                <Fact icon={MapPin} label="Location">{issue.device?.zone?.name ?? issue.zone?.name ?? '—'}{issue.device?.zone?.client?.name ? ` · ${issue.device.zone.client.name}` : ''}</Fact>
                <Fact icon={Tag} label="Problem type">{issue.category?.name ?? '—'}</Fact>
                <Fact icon={UserRound} label="Technician">
                  {issue.assignedTechnician?.user?.name ? (
                    <span className="inline-flex items-center gap-2"><Avatar name={issue.assignedTechnician.user.name} size={22} />{issue.assignedTechnician.user.name}</span>
                  ) : <span className="text-[var(--down-ink)]">Nobody assigned yet</span>}
                </Fact>
                <Fact icon={User} label="Reported by">{issue.raisedBy?.name ?? '—'}</Fact>
                <Fact icon={CalendarClock} label="Reported">{fmtDate(issue.createdAt)}</Fact>
                {issue.resolvedAt && <Fact icon={CheckCircle2} label="Fixed">{fmtDate(issue.resolvedAt)}</Fact>}
              </div>

              {Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
                <div className="mb-6">
                  <div className="fx-eyebrow mb-2 flex items-center gap-1.5"><Paperclip size={11} /> Evidence ({issue.attachments.length})</div>
                  <div className="grid grid-cols-3 gap-2">
                    {issue.attachments.map((att, idx) => {
                      const url = typeof att === 'string' ? att : att?.url;
                      const name = typeof att === 'object' && att?.name ? att.name : `File ${idx + 1}`;
                      const isImg = typeof url === 'string' && (/\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(url) || url.includes('cloudinary') || url.includes('image'));
                      return (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" title={name}
                          className="group rounded-[10px] border border-[var(--line)] overflow-hidden bg-[var(--surface-2)] hover:border-[var(--line-strong)]">
                          {isImg ? (
                            <img src={url} alt={name} loading="lazy" className="w-full h-24 object-cover group-hover:scale-[1.03] transition-transform" />
                          ) : (
                            <span className="w-full h-24 grid place-items-center text-[var(--ink-3)]"><Paperclip size={20} /></span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="fx-eyebrow mb-3">History · {history.length} events</div>
              {history.length === 0 ? (
                <p className="text-[13px] text-[var(--ink-3)]">No history recorded yet.</p>
              ) : (
                <ol className="relative flex flex-col gap-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--line)]">
                  {history.map((h, idx) => {
                    const t = STAGE[h.toStatus]?.tone ?? 'idle';
                    return (
                      <li key={h.id ?? idx} className="relative pl-7">
                        <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-[3px] border-[var(--surface)]" style={{ background: HEALTH[t].color }} />
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-[620]">{STAGE[h.toStatus]?.label ?? h.toStatus}</span>
                          {h.fromStatus && <span className="text-[11.5px] text-[var(--ink-3)]">from {STAGE[h.fromStatus]?.label ?? h.fromStatus}</span>}
                        </div>
                        <div className="text-[12px] text-[var(--ink-3)] mt-0.5">
                          {h.changedBy?.name ? `${h.changedBy.name} · ` : ''}{fmtDate(h.changedAt)}
                        </div>
                        <StatusHistoryLocationBadge latitude={h.latitude} longitude={h.longitude} />
                        {h.notes && (
                          <p className="mt-1.5 text-[12.5px] text-[var(--ink-2)] bg-[var(--surface-2)] border border-[var(--line)] rounded-[9px] px-3 py-2 leading-relaxed">{h.notes}</p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
