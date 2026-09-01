import React, { useState, useMemo } from 'react';
import { Building, ExternalLink, MoreVertical, Search } from 'lucide-react';

/**
 * Client facility portfolio — backed by GET /dashboard/overview `facilities`:
 *   [{ clientId, name, companyName, zones, devices, faultyDevices, openIssues }]
 * Health is derived from real counts (faulty devices > 0 → Needs Review). No
 * fabricated SLA / GPS location / assigned-tech columns.
 */
export default function FacilityOverviewTable({ facilities, loading, onNotify }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = useMemo(
    () =>
      (facilities || []).map((f) => ({
        ...f,
        status: f.faultyDevices > 0 ? 'warning' : 'optimal'
      })),
    [facilities]
  );

  const filtered = rows.filter((fac) => {
    const q = searchFilter.toLowerCase();
    const matchSearch =
      fac.name?.toLowerCase().includes(q) || (fac.companyName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || fac.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Client Facility Portfolio & Workload</h3>
            <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              {loading ? '—' : `${rows.length} Clients`}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Multi-tenant device fleet and open work-order load per client
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-2 text-xs">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Filter client or company..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent border-none text-slate-900 outline-hidden w-32 sm:w-44 text-xs placeholder:text-slate-400"
            />
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All ({rows.length})
            </button>
            <button
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'optimal' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
              onClick={() => setStatusFilter('optimal')}
            >
              Healthy
            </button>
            <button
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'warning' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
              onClick={() => setStatusFilter('warning')}
            >
              Needs Review
            </button>
          </div>

          <a
            href="#/superadmin/clients"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            <span>Manage All</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Client & Company</th>
              <th className="py-3 px-4">Zones</th>
              <th className="py-3 px-4">Devices</th>
              <th className="py-3 px-4">Faulty</th>
              <th className="py-3 px-4">Open Tickets</th>
              <th className="py-3 px-4">Health</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-slate-400">Loading facilities…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-slate-400">No matching clients.</td>
              </tr>
            ) : (
              filtered.map((fac) => (
                <tr key={fac.clientId} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Building size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {fac.name}
                        </span>
                        <span className="text-[11px] text-slate-400">{fac.companyName || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{fac.zones}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{fac.devices}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                        fac.faultyDevices > 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {fac.faultyDevices}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px]">
                      {fac.openIssues} Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                        fac.status === 'optimal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {fac.status === 'optimal' ? 'Healthy' : 'Needs Review'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNotify?.(`Opening ${fac.name}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Client Options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
