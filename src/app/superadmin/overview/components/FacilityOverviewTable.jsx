import React, { useState } from 'react';
import {
  Building,
  MapPin,
  ExternalLink,
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function FacilityOverviewTable({ onNotify }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const facilities = [
    {
      id: 'FAC-01',
      name: 'Apex Tech Tower (Campus Alpha)',
      client: 'Apex Global Corp',
      location: 'Silicon Valley, CA',
      openTickets: 8,
      slaRate: '99.2%',
      slaNum: 99.2,
      techsAssigned: 6,
      status: 'optimal'
    },
    {
      id: 'FAC-02',
      name: 'Global Logistics Hub #4',
      client: 'SwiftFreight Worldwide',
      location: 'Dallas, TX',
      openTickets: 12,
      slaRate: '97.5%',
      slaNum: 97.5,
      techsAssigned: 8,
      status: 'warning'
    },
    {
      id: 'FAC-03',
      name: 'Marina Bay Medical Center',
      client: 'Marina Healthcare Group',
      location: 'San Diego, CA',
      openTickets: 6,
      slaRate: '100%',
      slaNum: 100,
      techsAssigned: 5,
      status: 'optimal'
    },
    {
      id: 'FAC-04',
      name: 'Horizon Data Center Alpha',
      client: 'CloudScale Infrastructure',
      location: 'Ashburn, VA',
      openTickets: 4,
      slaRate: '98.8%',
      slaNum: 98.8,
      techsAssigned: 4,
      status: 'optimal'
    },
    {
      id: 'FAC-05',
      name: 'Metro Industrial Manufacturing',
      client: 'Titan Industrial Systems',
      location: 'Detroit, MI',
      openTickets: 8,
      slaRate: '95.1%',
      slaNum: 95.1,
      techsAssigned: 7,
      status: 'warning'
    },
    {
      id: 'FAC-06',
      name: 'Pinnacle Commercial Plaza',
      client: 'Pinnacle REIT',
      location: 'Chicago, IL',
      openTickets: 5,
      slaRate: '99.0%',
      slaNum: 99.0,
      techsAssigned: 4,
      status: 'optimal'
    }
  ];

  const filteredFacilities = facilities.filter((fac) => {
    const matchSearch =
      fac.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      fac.client.toLowerCase().includes(searchFilter.toLowerCase()) ||
      fac.location.toLowerCase().includes(searchFilter.toLowerCase());

    const matchStatus =
      statusFilter === 'all' || fac.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">Client Facility Portfolio & Workload</h3>
            <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              24 Active Sites
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Multi-tenant maintenance health, active work orders, and SLA compliance
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-2 text-xs">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Filter site or client..."
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
              All ({facilities.length})
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
            href="#/superadmin/facilities"
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
              <th className="py-3 px-4">Facility & Client</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Open Tickets</th>
              <th className="py-3 px-4">SLA Compliance</th>
              <th className="py-3 px-4">Field Techs</th>
              <th className="py-3 px-4">Health Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredFacilities.map((fac) => (
              <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Building size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {fac.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{fac.client}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{fac.location}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px]">
                    {fac.openTickets} Active
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1 min-w-[90px]">
                    <span className="font-bold text-slate-900 text-xs">{fac.slaRate}</span>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          fac.slaNum >= 98 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${fac.slaNum}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {fac.techsAssigned} on duty
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
                    onClick={() => onNotify?.(`Inspecting facility diagnostics for ${fac.name}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Site Options"
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
