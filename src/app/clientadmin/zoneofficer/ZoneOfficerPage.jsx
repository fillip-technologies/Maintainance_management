import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser } from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import ZoneMemberModal from './components/ZoneMemberModal';
import {
  Shield,
  UserCheck,
  Wrench,
  UserPlus,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  Cpu,
  ClipboardList,
  MapPin,
  Building2,
  Trash2,
  Clock,
  Ban
} from 'lucide-react';

export default function ZoneOfficerPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'zone_staff' | 'technician'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const zoneName = currentUser?.zoneName || 'North Wing - Floor 1-4';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchZoneMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        role: selectedRole === 'all' ? undefined : selectedRole,
        search: searchQuery
      });
      // Filter strictly for Staff & Technicians belonging to zone
      const filtered = (data?.items || []).filter(
        (u) =>
          u.accountStatus !== 'removed' &&
          (u.role === 'zone_staff' || u.role === 'technician' || u.role === 'zone_incharge')
      );
      setUsers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, searchQuery]);

  useEffect(() => {
    fetchZoneMembers();
  }, [fetchZoneMembers]);

  const handleMemberCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    if (selectedRole !== 'all' && selectedRole !== newUser.role) {
      setSelectedRole('all');
    }
    showToast(`${newUser.role === 'technician' ? 'Technician' : 'Staff'} "${newUser.name}" created successfully!`);
    setTimeout(() => fetchZoneMembers(), 100);
  };

  const handleDeleteMember = async (user) => {
    if (confirm(`Remove ${user.name} (${user.role.replace('_', ' ')}) from this zone?`)) {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`Member "${user.name}" removed from zone.`);
      fetchZoneMembers();
    }
  };

  const staffCount = users.filter((u) => u.role === 'zone_staff').length;
  const techCount = users.filter((u) => u.role === 'technician').length;

  const roleFilterTabs = [
    { id: 'all', label: 'All Zone Members' },
    { id: 'zone_staff', label: 'Floor Staff Only' },
    { id: 'technician', label: 'Technicians Only' }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Zone Officer Command Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Shield size={13} className="text-indigo-400" />
                Zone Officer Authority
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Zone Operational & Active
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <MapPin className="text-indigo-400 shrink-0" size={26} />
              <span>Zone Command: {zoneName}</span>
            </h1>

            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Zone Officer Command Portal. As Zone Officer, you have exclusive authority to create and manage <strong className="text-white">Staff IDs</strong> (for daily logs & inspections) within your zone.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-slate-300 border-t border-slate-700/60 mt-1">
              <span>Facility: <strong className="text-white">Apex Tech Tower - Campus A</strong></span>
              <span>Officer: <strong className="text-indigo-300">{currentUser?.name || 'Priya Sharma'} (Zone In-Charge)</strong></span>
            </div>
          </div>

          {/* Quick Action to Add Staff / Tech */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-indigo-950/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <UserPlus size={18} />
            <span>+ Create Staff ID</span>
          </button>
        </div>
      </div>

      {/* Zone Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Floor Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Zone Floor Staff</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{staffCount}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Daily device log submitters</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Staff IDs</span>
          </div>
        </div>

        {/* Card 2: Field Technicians */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Zone Technicians</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{techCount}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Wrench size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Certified field repair engineers</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">Tech IDs</span>
          </div>
        </div>

        {/* Card 3: Zone Devices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Monitored Assets in Zone</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">14</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Cpu size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">HVAC, CCTV, Fire Pumps</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Online</span>
          </div>
        </div>

        {/* Card 4: Zone Active Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Active Work Orders</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">3</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Under technician dispatch</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">In Progress</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-md focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search zone staff or technicians by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-900 w-full outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {roleFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchZoneMembers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-1 cursor-pointer"
            title="Refresh Zone Members"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Zone Member</th>
                <th className="py-3.5 px-4">ID Type & Specialization</th>
                <th className="py-3.5 px-4">Assigned Zone</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No Staff members found in this zone. Click "+ Create Staff ID" to add.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isTech = u.role === 'technician';
                  const isIncharge = u.role === 'zone_incharge';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs ${
                            isTech
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                              : isIncharge
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          }`}>
                            {getInitials(u.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Specialization */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isTech
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : isIncharge
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isTech ? <Wrench size={12} /> : isIncharge ? <Shield size={12} /> : <UserCheck size={12} />}
                            {isTech ? 'Technician' : isIncharge ? 'Zone In-Charge' : 'Floor Staff'}
                          </span>
                          {u.specialization && (
                            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                              {u.specialization}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold">{u.zoneName || zoneName}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {u.accountStatus === 'active' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {u.accountStatus === 'active' ? 'Active' : 'Invited'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isIncharge && (
                          <button
                            onClick={() => handleDeleteMember(u)}
                            className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Member Modal (Staff & Technician creation only) */}
      <ZoneMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleMemberCreated}
        defaultZone={zoneName}
      />
    </div>
  );
}
