import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, RefreshCw, Search, X, Loader2, AlertTriangle, Building2
} from 'lucide-react';
import { getClients } from '../../api/clientsApi';
import { getZones } from '../../api/zonesApi';
import { getZoneBreakdown } from '../../api/dashboardApi';
import ZoneCard from '../../clientadmin/zones/components/ZoneCard';
import ZoneIssuesModal from '../../clientadmin/zones/components/ZoneIssuesModal';
import RaiseQueryModal from '../../common/RaiseQueryModal';

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
          <button onClick={() => loadZones(selectedClientId)} disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        )}
      </div>

      {/* Company selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 size={15} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-700">Company:</span>
        </div>
        <select
          value={selectedClientId}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loadingClients}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-60"
        >
          <option value="">{loadingClients ? 'Loading…' : '— choose a company —'}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.location ? ` · ${c.location}` : ''}</option>
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
        <div className="flex flex-col items-center gap-3 p-16 bg-white rounded-2xl border border-slate-200 text-center">
          <MapPin size={28} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Select a company above to view and manage its zones.</p>
        </div>
      )}

      {/* Zone list (mirrors client admin exactly) */}
      {selectedClientId && (
        <>
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
    </div>
  );
}
