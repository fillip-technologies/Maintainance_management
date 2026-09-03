import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, Search, X, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getZones } from '../../api/zonesApi';
import { getZoneBreakdown } from '../../api/dashboardApi';
import ZoneCard from './components/ZoneCard';
import ZoneIssuesModal from './components/ZoneIssuesModal';
import RaiseQueryModal from '../../common/RaiseQueryModal';

export default function ZonesPage() {
  const { currentUser } = useAuth();
  const clientId = currentUser?.clientId;

  const [zones, setZones] = useState([]);
  const [statsMap, setStatsMap] = useState({}); // zoneId → { total, working, faulty, underMaintenance }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // "Not Working" drill-down modal
  const [issuesModal, setIssuesModal] = useState(null); // { zoneId, zoneName }

  // Raise issue modal
  const [raiseModal, setRaiseModal] = useState(null); // { zoneId }

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true); setError('');
    try {
      const [zonesData, breakdown] = await Promise.all([
        getZones({ clientId, topLevel: 'true', limit: 100 }),
        getZoneBreakdown({ scope: 'client', id: clientId }),
      ]);
      setZones(zonesData.items ?? []);
      const map = {};
      (breakdown ?? []).forEach((z) => { map[z.zoneId] = z; });
      setStatsMap(map);
    } catch (ex) {
      setError(ex.message || 'Failed to load zones.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const filtered = zones.filter((z) => {
    const q = search.toLowerCase().trim();
    if (q && !z.name.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && z.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    all: zones.length,
    active: zones.filter((z) => z.status === 'active').length,
    draft: zones.filter((z) => z.status === 'draft').length,
    inactive: zones.filter((z) => z.status === 'inactive').length,
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Zones</h1>
          <p className="text-xs text-slate-500 mt-0.5">Click "Not Working" on any card to see active issues. Click "Raise Issue" to log a new defect.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search zones…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-900 outline-none w-full placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: `All (${counts.all})` },
            { key: 'active', label: `Active (${counts.active})` },
            { key: 'draft', label: `Draft (${counts.draft})` },
            { key: 'inactive', label: `Inactive (${counts.inactive})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 justify-center p-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
          <span className="text-xs text-slate-500">Loading zones…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-16 bg-white rounded-2xl border border-slate-200">
          <MapPin size={24} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            {zones.length === 0 ? 'No zones yet — ask your administrator to create zones.' : 'No zones match your search.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((zone, i) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              stats={statsMap[zone.id] ?? {}}
              index={i}
              onNotWorkingClick={(zoneId, zoneName) => setIssuesModal({ zoneId, zoneName })}
              onRaiseIssue={(zoneId) => setRaiseModal({ zoneId })}
              onDeleted={(deletedId) => setZones((prev) => prev.filter((z) => z.id !== deletedId))}
            />
          ))}
        </div>
      )}

      {/* Not-working issues drill-down modal */}
      {issuesModal && (
        <ZoneIssuesModal
          zoneId={issuesModal.zoneId}
          zoneName={issuesModal.zoneName}
          onClose={() => setIssuesModal(null)}
        />
      )}

      {/* Raise issue modal (zone-scoped) */}
      {raiseModal && (
        <RaiseQueryModal
          isOpen
          initialZoneId={raiseModal.zoneId}
          onClose={() => setRaiseModal(null)}
          onCreated={() => { setRaiseModal(null); load(); }}
        />
      )}
    </div>
  );
}
