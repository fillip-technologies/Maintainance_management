import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, RefreshCw, Search, X, Loader2, AlertTriangle, Building2, Plus
} from 'lucide-react';
import { getClients } from '../../api/clientsApi';
import { getZones } from '../../api/zonesApi';
import { getZoneBreakdown } from '../../api/dashboardApi';
import ZoneCard from '../../clientadmin/zones/components/ZoneCard';
import ZoneIssuesModal from '../../clientadmin/zones/components/ZoneIssuesModal';
import RaiseQueryModal from '../../common/RaiseQueryModal';
import CreateZoneModal from '../../clientadmin/zones/components/CreateZoneModal';
import ManageZoneModal from '../../clientadmin/zones/components/ManageZoneModal';

export default function SuperadminZonesPage() {
  const [clients, setClients]             = useState([]);
  const [selectedClientId, setSelected]   = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  const [zones, setZones]     = useState([]);
  const [statsMap, setStats]  = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [issuesModal, setIssuesModal] = useState(null);
  const [raiseModal, setRaiseModal]   = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [managingZone, setManagingZone] = useState(null);

  // Load all clients once
  useEffect(() => {
    getClients({ limit: 100 })
      .then((d) => {
        const items = d.items ?? [];
        setClients(items);
        if (items.length === 1) setSelected(items[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingClients(false));
  }, []);

  const loadZones = useCallback(async (clientId) => {
    if (!clientId) { setZones([]); setStats({}); return; }
    setLoading(true); setError('');
    try {
      const [zonesData, breakdown] = await Promise.all([
        getZones({ clientId, topLevel: 'true', limit: 100 }),
        getZoneBreakdown({ scope: 'client', id: clientId }),
      ]);
      setZones(zonesData.items ?? []);
      const map = {};
      (breakdown ?? []).forEach((z) => { map[z.zoneId] = z; });
      setStats(map);
    } catch (ex) {
      setError(ex.message || 'Failed to load zones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setZones([]); setStats({}); setSearch(''); setStatusFilter('all');
    loadZones(selectedClientId);
  }, [selectedClientId, loadZones]);

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

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Zone Management</h1>
          <p className="text-xs text-slate-500 mt-1">Select a company to manage its zones.</p>
        </div>
        {selectedClientId && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-indigo-200"
            >
              <Plus size={14} /> Create Zone
            </button>
            <button onClick={() => loadZones(selectedClientId)} disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Company selector */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 size={15} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-300">Company:</span>
        </div>
        <select
          value={selectedClientId}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loadingClients}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-white text-xs font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60"
        >
          <option value="" className="bg-slate-900 text-white">{loadingClients ? 'Loading…' : '— choose a company —'}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}{c.location ? ` · ${c.location}` : ''}</option>
          ))}
        </select>
        {selectedClient?.location && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
            <MapPin size={10} /> {selectedClient.location}
          </span>
        )}
      </div>

      {/* No company selected */}
      {!selectedClientId && !loadingClients && (
        <div className="flex flex-col items-center gap-3 p-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-center">
          <MapPin size={28} className="text-slate-500" />
          <p className="text-sm font-semibold text-slate-400">Select a company above to view and manage its zones.</p>
        </div>
      )}

      {/* Zone list (mirrors client admin exactly) */}
      {selectedClientId && (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search zones…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs font-medium text-white outline-none w-full placeholder:text-slate-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white cursor-pointer">
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
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 justify-center p-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-xs text-slate-400">Loading zones…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-sm font-semibold">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <MapPin size={24} className="text-slate-500" />
              <p className="text-sm font-semibold text-slate-400">
                {zones.length === 0 ? 'No zones yet — use the Zone Management tool to create zones for this company.' : 'No zones match your search.'}
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
                  basePath="/superadmin"
                  onNotWorkingClick={(zoneId, zoneName) => setIssuesModal({ zoneId, zoneName })}
                  onRaiseIssue={(zoneId) => setRaiseModal({ zoneId })}
                  onDeleted={(deletedId) => setZones((prev) => prev.filter((z) => z.id !== deletedId))}
                  onManage={(z) => setManagingZone(z)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {issuesModal && (
        <ZoneIssuesModal
          zoneId={issuesModal.zoneId}
          zoneName={issuesModal.zoneName}
          onClose={() => setIssuesModal(null)}
        />
      )}
      {raiseModal && (
        <RaiseQueryModal
          isOpen
          initialZoneId={raiseModal.zoneId}
          onClose={() => setRaiseModal(null)}
          onCreated={() => { setRaiseModal(null); loadZones(selectedClientId); }}
        />
      )}

      <CreateZoneModal
        isOpen={createModal}
        clientId={selectedClientId}
        onClose={() => setCreateModal(false)}
        onCreated={() => { setCreateModal(false); loadZones(selectedClientId); }}
      />

      {managingZone && (
        <ManageZoneModal
          zone={managingZone}
          clientId={selectedClientId}
          onClose={() => setManagingZone(null)}
          onUpdated={() => loadZones(selectedClientId)}
        />
      )}
    </div>
  );
}
