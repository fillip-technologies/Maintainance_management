import React, { useState, useMemo } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  X,
  Clock,
  MapPin,
  Building
} from 'lucide-react';

export default function DailyLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'working' | 'not_working'
  const [selectedZone, setSelectedZone] = useState('all');

  // Daily log records for facility products with assigned zones
  const [logs] = useState([
    {
      id: 'log_01',
      name: 'Chiller Plant Unit #1 (Roof Deck)',
      code: 'HVAC-CHL-001',
      zoneName: 'Roof Plant & Chiller Bay',
      date: '2026-09-01T10:30:00.000Z',
      status: 'working'
    },
    {
      id: 'log_02',
      name: 'Main Passenger Elevator Shaft A',
      code: 'ELV-A-102',
      zoneName: 'North Wing - Floor 1-4',
      date: '2026-09-01T09:45:00.000Z',
      status: 'working'
    },
    {
      id: 'log_03',
      name: 'High-Voltage DG Genset 500kVA',
      code: 'PWR-GEN-500',
      zoneName: 'Basement Power Bay B1',
      date: '2026-09-01T09:15:00.000Z',
      status: 'not_working'
    },
    {
      id: 'log_04',
      name: 'Primary Fire Hydrant Jockey Pump',
      code: 'FIRE-PMP-001',
      zoneName: 'Basement Power Bay B1',
      date: '2026-09-01T08:50:00.000Z',
      status: 'working'
    },
    {
      id: 'log_05',
      name: 'Central AHU Air Handling Unit 3B',
      code: 'HVAC-AHU-03B',
      zoneName: 'North Wing - Floor 1-4',
      date: '2026-09-01T08:30:00.000Z',
      status: 'working'
    },
    {
      id: 'log_06',
      name: 'Basement Sewage Sump Pump #2',
      code: 'PLUMB-SMP-02',
      zoneName: 'Basement Power Bay B1',
      date: '2026-09-01T08:10:00.000Z',
      status: 'not_working'
    },
    {
      id: 'log_07',
      name: 'Main Gate Access Boom Barrier & CCTV',
      code: 'SEC-CAM-014',
      zoneName: 'External Parking & Perimeter',
      date: '2026-09-01T07:45:00.000Z',
      status: 'working'
    },
    {
      id: 'log_08',
      name: 'Tower Cooling Water Circulation Pump A',
      code: 'HVAC-PMP-01A',
      zoneName: 'Roof Plant & Chiller Bay',
      date: '2026-09-01T07:20:00.000Z',
      status: 'working'
    },
    {
      id: 'log_09',
      name: 'Service Freight Elevator Shaft C',
      code: 'ELV-C-301',
      zoneName: 'South Wing & Logistics Bay',
      date: '2026-09-01T06:55:00.000Z',
      status: 'not_working'
    },
    {
      id: 'log_10',
      name: 'Solar Inverter Bank 100kW (Terrace)',
      code: 'SOL-INV-100',
      zoneName: 'Roof Plant & Chiller Bay',
      date: '2026-09-01T06:30:00.000Z',
      status: 'working'
    }
  ]);

  const zoneOptions = [
    'all',
    'North Wing - Floor 1-4',
    'Roof Plant & Chiller Bay',
    'Basement Power Bay B1',
    'South Wing & Logistics Bay',
    'External Parking & Perimeter'
  ];

  // Compute 3 primary stats: Total Products, Working, Not Working
  const totalProducts = logs.length;
  const workingProducts = logs.filter((l) => l.status === 'working').length;
  const notWorkingProducts = logs.filter((l) => l.status === 'not_working').length;

  // Filter logs based on search, status, and zone
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !searchQuery.trim() ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.zoneName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesZone = selectedZone === 'all' || l.zoneName === selectedZone;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [logs, searchQuery, statusFilter, selectedZone]);

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200">
      {/* Top Headline Banner */}
      <div className="flex flex-col gap-1 py-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daily Product Logs
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
          Daily operational health checks, zone allocations, and status submissions for all registered facility equipment.
        </p>
      </div>

      {/* 3 Stats Cards: Total Products, Working, Not Working */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Total Products</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Boxes size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">All monitored equipment</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Total Logged
            </span>
          </div>
        </div>

        {/* Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Working Products</span>
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {workingProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Operating normal & healthy</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Active / Healthy
            </span>
          </div>
        </div>

        {/* Not Working Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Not Working Products</span>
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {notWorkingProducts}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Breakdowns & fault flagged</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
              Attention Needed
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by product name, code, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters: Zone Selector & Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zone Selector Dropdown */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
            <MapPin size={14} className="text-indigo-600" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="all">All Zones</option>
              {zoneOptions.filter(z => z !== 'all').map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              All Logs ({totalProducts})
            </button>

            <button
              onClick={() => setStatusFilter('working')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'working'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              Working ({workingProducts})
            </button>

            <button
              onClick={() => setStatusFilter('not_working')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'not_working'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              Not Working ({notWorkingProducts})
            </button>
          </div>
        </div>
      </div>

      {/* Daily Logs Table: Name, Zone, Date, Status */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Zone</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isWorking = log.status === 'working';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* 1. Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border ${
                              isWorking
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}
                          >
                            <Boxes size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {log.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {log.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Zone */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-indigo-500 shrink-0" />
                          <span className="text-slate-800 font-semibold">{log.zoneName}</span>
                        </div>
                      </td>

                      {/* 3. Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {formatDate(log.date)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            {formatTime(log.date)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isWorking
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isWorking ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          ></span>
                          {isWorking ? 'Working' : 'Not Working'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
