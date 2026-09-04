import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Layers, Package, CheckCircle2, XCircle,
  Wrench, Loader2, AlertTriangle, RefreshCw, Clock, User,
  ChevronRight, Plus, Activity, Trash2, Settings
} from 'lucide-react';
import { getZoneById, getZoneDescendants, getZoneActivity, deleteZone } from '../../api/zonesApi';
import { getDashboardSummary } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import ZoneIssuesModal from './components/ZoneIssuesModal';
import RaiseQueryModal from '../../common/RaiseQueryModal';
import CreateZoneModal from './components/CreateZoneModal';
import ManageZoneModal from './components/ManageZoneModal';

// ── Activity log colour per transition ───────────────────────────────────
const ACTIVITY_STYLE = {
  open:        { dot: 'bg-rose-500',    text: 'text-rose-700',    label: 'Opened' },
  assigned:    { dot: 'bg-sky-500',     text: 'text-sky-700',     label: 'Assigned' },
  in_progress: { dot: 'bg-indigo-500',  text: 'text-indigo-700',  label: 'In Progress' },
  on_hold:     { dot: 'bg-amber-500',   text: 'text-amber-700',   label: 'On Hold' },
  resolved:    { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Resolved' },
  closed:      { dot: 'bg-slate-400',   text: 'text-slate-600',   label: 'Closed' },
  reopened:    { dot: 'bg-orange-500',  text: 'text-orange-700',  label: 'Reopened' },
};

const PRIORITY_DOT = {
  critical: 'bg-rose-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-slate-400',
};

function ActivityFeed({ zoneId }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const data = await getZoneActivity(zoneId, { page: p, limit: 20 });
      const newItems = data.items ?? [];
      setItems((prev) => p === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(p < (data.totalPages ?? 1));
      setPage(p);
    } catch (ex) {
      setError(ex.message || 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => { load(1); }, [load]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center gap-3 py-10 justify-center text-slate-400">
        <Loader2 size={18} className="animate-spin" /> Loading activity…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
        <AlertTriangle size={14} /> {error}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-slate-400">
        <Activity size={22} className="text-slate-300" />
        <p className="text-xs font-semibold">No activity yet — status changes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, idx) => {
        const s = ACTIVITY_STYLE[item.toStatus] ?? ACTIVITY_STYLE.open;
        const pDot = PRIORITY_DOT[item.issue?.priority] ?? PRIORITY_DOT.medium;
        return (
          <div key={item.id ?? idx} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
              {idx < items.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] font-bold ${s.text}`}>{s.label}</span>
                  {item.fromStatus && (
                    <span className="text-[10px] text-slate-400">
                      from <span className="font-semibold text-slate-600">{item.fromStatus?.replace('_', ' ')}</span>
                    </span>
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full ${pDot} shrink-0`} title={item.issue?.priority} />
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  {new Date(item.changedAt).toLocaleDateString()} {new Date(item.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                {item.issue?.device?.name ?? 'Device'}
              </p>

              {item.notes && (
                <p className="text-[11px] text-slate-500 mt-0.5 italic">"{item.notes}"</p>
              )}

              <div className="flex items-center gap-1.5 mt-1">
                <User size={10} className="text-slate-400" />
                <span className="text-[10px] text-slate-400">
                  {item.changedBy?.name ?? 'System'}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={() => load(page + 1)}
          disabled={loading}
          className="mt-3 w-full py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}

// ── Sub-zone row ──────────────────────────────────────────────────────────
function SubzoneRow({ zone, depth = 0, allZones, onDeleted, backRoute }) {
  const navigate = useNavigate();
  const children = allZones.filter((z) => z.parentZoneId === zone.id);
  const [deleting, setDeleting] = useState(false);
  const hasChildren = children.length > 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (hasChildren) {
      alert('Delete all sub-zones inside this zone first.');
      return;
    }
    if (!confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteZone(zone.id);
      onDeleted(zone.id);
    } catch (ex) {
      alert(ex.message || 'Failed to delete zone.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-indigo-50/60 transition-colors group"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {depth > 0 && <ChevronRight size={12} className="text-slate-300 shrink-0" />}
        <MapPin size={13} className="text-indigo-400 shrink-0" />

        {/* Name — navigate on click */}
        <span
          onClick={() => navigate(`${backRoute}/${zone.id}`)}
          className="text-xs font-semibold text-slate-800 flex-1 truncate group-hover:text-indigo-700 cursor-pointer"
        >
          {zone.name}
        </span>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
          zone.status === 'active'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          zone.status === 'inactive' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                       'bg-amber-50 text-amber-700 border-amber-200'
        }`}>{zone.status}</span>

        <span className="text-[10px] text-slate-400 shrink-0">L{(zone.depth ?? depth) + 1}</span>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting || hasChildren}
          title={hasChildren ? 'Remove sub-zones first' : 'Delete zone'}
          className={`p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-30 ${
            hasChildren
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
          }`}
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>

      {children.map((ch) => (
        <SubzoneRow
          key={ch.id}
          zone={ch}
          depth={depth + 1}
          allZones={allZones}
          onDeleted={onDeleted}
          backRoute={backRoute}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ZoneDetailPage({ backRoute = '/clientadmin/zones' }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const clientId = currentUser?.clientId;

  const [zone, setZone]         = useState(null);
  const [stats, setStats]       = useState(null);
  const [descendants, setDesc]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activity'

  const [issuesModal, setIssuesModal]       = useState(false);
  const [raiseModal, setRaiseModal]         = useState(false);
  const [createSubzoneModal, setCreateSubzoneModal] = useState(false);
  const [manageModal, setManageModal]       = useState(false);

  const load = useCallback(async () => {
    if (!zoneId) return;
    setLoading(true); setError('');
    try {
      const [z, st, desc] = await Promise.all([
        getZoneById(zoneId),
        getDashboardSummary({ scope: 'zone', id: zoneId, includeSubzones: true }),
        getZoneDescendants(zoneId),
      ]);
      setZone(z);
      setStats(st);
      setDesc(Array.isArray(desc) ? desc.filter((d) => d.id !== zoneId) : []);
    } catch (ex) {
      setError(ex.message || 'Could not load zone.');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 justify-center min-h-[40vh] text-slate-400">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="text-sm">Loading zone…</span>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="flex flex-col items-center gap-4 min-h-[40vh] justify-center">
        <AlertTriangle size={32} className="text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">{error || 'Zone not found.'}</p>
        <button onClick={() => navigate(backRoute)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
          <ArrowLeft size={13} /> Back to Zones
        </button>
      </div>
    );
  }

  const total = stats?.totalDevices ?? 0;
  const working = stats?.workingDevices ?? 0;
  const faulty = stats?.faultyDevices ?? 0;
  const openIssues = stats?.openIssues ?? 0;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(backRoute)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer">
          <ArrowLeft size={13} /> Zones
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900 truncate">{zone.name}</h1>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin size={10} />
            <span className={`font-bold ${zone.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>{zone.status}</span>
            &nbsp;·&nbsp;{descendants.length} sub-zone{descendants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button onClick={() => setCreateSubzoneModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer">
            <Plus size={12} /> Add Sub-Zone
          </button>
          <button onClick={() => setManageModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer">
            <Settings size={12} /> Manage Zone
          </button>
          <button onClick={() => setRaiseModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer">
            <Plus size={12} /> Raise Issue
          </button>
          <button onClick={load}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Devices', value: total, icon: Package, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: 'Working', value: working, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Faulty', value: faulty, icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', onClick: faulty > 0 ? () => setIssuesModal(true) : undefined },
          { label: 'Open Issues', value: openIssues, icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', onClick: openIssues > 0 ? () => setIssuesModal(true) : undefined },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              onClick={c.onClick}
              className={`${c.bg} border ${c.border} rounded-2xl p-4 flex flex-col gap-2 ${c.onClick ? 'cursor-pointer hover:shadow-sm hover:scale-[1.02] transition-all' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
                <Icon size={15} className={c.color} />
              </div>
              <span className={`text-2xl font-black ${c.color} leading-none`}>{c.value}</span>
              {c.onClick && <span className="text-[10px] font-bold text-rose-500">Tap to view →</span>}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { key: 'overview', label: 'Sub-zones', icon: Layers },
          { key: 'activity', label: 'Activity Log', icon: Activity },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {descendants.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-slate-400">
              <Layers size={22} className="text-slate-300" />
              <p className="text-xs font-semibold">No sub-zones under this zone.</p>
            </div>
          ) : (
            <div className="py-2 px-2">
              {descendants
                .filter((d) => !d.parentZoneId || d.parentZoneId === zoneId)
                .map((z) => (
                  <SubzoneRow
                    key={z.id}
                    zone={z}
                    depth={0}
                    allZones={descendants}
                    backRoute={backRoute}
                    onDeleted={(deletedId) => {
                      // Remove the zone and all its descendants from local state
                      setDesc((prev) => {
                        const removedIds = new Set();
                        const collect = (id) => {
                          removedIds.add(id);
                          prev.filter((s) => s.parentZoneId === id).forEach((s) => collect(s.id));
                        };
                        collect(deletedId);
                        return prev.filter((s) => !removedIds.has(s.id));
                      });
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Issue Status History</h3>
          </div>
          <ActivityFeed zoneId={zoneId} />
        </div>
      )}

      {/* Modals */}
      {issuesModal && (
        <ZoneIssuesModal zoneId={zoneId} zoneName={zone.name} onClose={() => setIssuesModal(false)} />
      )}
      {raiseModal && (
        <RaiseQueryModal
          isOpen
          initialZoneId={zoneId}
          onClose={() => setRaiseModal(false)}
          onCreated={() => { setRaiseModal(false); load(); }}
        />
      )}
      <CreateZoneModal
        isOpen={createSubzoneModal}
        clientId={clientId}
        initialParentZoneId={zoneId}
        onClose={() => setCreateSubzoneModal(false)}
        onCreated={() => { setCreateSubzoneModal(false); load(); }}
      />
      {manageModal && zone && (
        <ManageZoneModal
          zone={zone}
          clientId={clientId}
          onClose={() => setManageModal(false)}
          onUpdated={(updated) => { setZone((z) => ({ ...z, ...updated })); }}
        />
      )}
    </div>
  );
}
