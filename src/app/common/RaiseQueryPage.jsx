import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, Plus } from 'lucide-react';
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
    category: issue.category?.name ?? 'Uncategorized',
    priority: issue.priority,
    status: issue.status,
    createdAt: issue.createdAt,
    assignedTech: issue.assignedTechnician?.user?.name ?? null
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

  const handleCreated = (issue) => {
    const unit = issue?.device?.name || 'unit';
    showToast(`Defect raised on ${unit} — the unit is now under maintenance.`);
    fetchIssues();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Raise a Query</h1>
          <p className="text-xs text-slate-500">Report a problem with your units and track it through to resolution.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Raise Query</span>
          </button>
          <button
            onClick={fetchIssues}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      <TicketList
        tickets={tickets}
        loading={loading}
        onOpenRequestModal={openModal}
        onNotify={showToast}
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
