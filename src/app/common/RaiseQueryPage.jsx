import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader, RefreshButton } from '../ui/primitives';
import TicketList from './TicketList';
import RaiseQueryModal from './RaiseQueryModal';
import { getIssues } from '../api/issuesApi';
import { socketClient } from '../api/socketClient';

// Dedicated "Raise Query" panel shared by client_admin and zone officers. It is
// self-contained: it lists the caller's in-scope defects and owns its own modal,
// so it works in any layout. If the layout already provides a global modal
// (client-admin exposes `onOpenRequestModal` via outlet context) it reuses that
// instead of opening a second one.

function mapIssue(issue) {
  return {
    id: issue.id,
    shortId: issue.id.slice(0, 8).toUpperCase(),
    title: issue.description,
    asset: issue.device?.name ?? '—',
    zone: issue.device?.zone?.name ?? '—',
    category: issue.category?.name ?? 'Uncategorized',
    priority: issue.priority,
    status: issue.status,
    createdAt: issue.createdAt,
    assignedTech: issue.assignedTechnician?.user?.name ?? null,
  };
}

export default function RaiseQueryPage() {
  const context = useOutletContext() || {};
  const showToast = context.showToast || (() => {});

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localModalOpen, setLocalModalOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIssues({ limit: 100 });
      setTickets((res?.items ?? []).map(mapIssue));
    } catch (err) {
      setError(err.message || 'Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + refresh on a new defect (local event or realtime socket).
  useEffect(() => {
    fetchIssues();
    const unsubCreated = socketClient.on('issue:created', fetchIssues);
    const unsubUpdated = socketClient.on('issue:updated', fetchIssues);
    window.addEventListener('fixly:issue_created', fetchIssues);
    return () => {
      unsubCreated();
      unsubUpdated();
      window.removeEventListener('fixly:issue_created', fetchIssues);
    };
  }, [fetchIssues]);

  // Prefer the layout's global modal when present; otherwise use the local one.
  const openModal = context.onOpenRequestModal || (() => setLocalModalOpen(true));

  const handleCreated = (issues) => {
    const count = Array.isArray(issues) ? issues.length : 1;
    const unit = (Array.isArray(issues) ? issues[0] : issues)?.device?.name || 'unit';
    const msg = count > 1
      ? `${count} defects raised — units are now under maintenance.`
      : `Defect raised on ${unit} — the unit is now under maintenance.`;
    showToast(msg);
    fetchIssues();
  };

  const open = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
  const unassigned = tickets.filter((t) => !['resolved', 'closed'].includes(t.status) && !t.assignedTech).length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        eyebrow={<>Report · follow · close</>}
        title="Problems & repairs"
        meta={!loading && (
          <>
            <span><span className="num font-[620] text-[var(--ink-2)]">{open}</span> open</span>
            {unassigned > 0 && <span className="text-[var(--down-ink)]"><span className="num font-[620]">{unassigned}</span> waiting for a technician</span>}
            <span><span className="num font-[620] text-[var(--ink-2)]">{tickets.length}</span> total</span>
          </>
        )}
        actions={
          <>
            <RefreshButton onClick={fetchIssues} spinning={loading} />
            <button type="button" onClick={openModal} className="fx-btn fx-btn-primary">
              <Plus size={15} /> Report a problem
            </button>
          </>
        }
      />

      {error && (
        <div className="px-4 py-3 rounded-[12px] text-[13px] font-[520]" style={{ background: 'var(--down-soft)', color: 'var(--down-ink)' }}>
          {error}
        </div>
      )}

      <TicketList
        tickets={tickets}
        loading={loading}
        onOpenRequestModal={openModal}
        onRefresh={fetchIssues}
      />

      {/* Only render a local modal when the layout doesn't already own one. */}
      {!context.onOpenRequestModal && (
        <RaiseQueryModal
          isOpen={localModalOpen}
          onClose={() => setLocalModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
