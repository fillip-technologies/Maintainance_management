import React from 'react';
import { Shield, UserCheck, Wrench, Building, Edit, CheckCircle2, Clock, Ban, AlertTriangle } from 'lucide-react';

export default function UserTable({ users = [], onEditUser }) {
  // Exclude removed accounts from active table view
  const visibleUsers = users.filter((u) => u.accountStatus !== 'removed');

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'client_admin':
        return {
          label: 'Client Admin',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Building
        };
      case 'zone_incharge':
        return {
          label: 'Zone In-Charge',
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Shield
        };
      case 'technician':
        return {
          label: 'Technician',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Wrench
        };
      default:
        return {
          label: 'Zone Staff',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2
        };
      case 'invited':
        return {
          label: 'Invited',
          classes: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Clock
        };
      case 'suspended':
        return {
          label: 'Suspended',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: Ban
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: CheckCircle2
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">User / Name</th>
              <th className="py-3.5 px-4">Role & Permissions</th>
              <th className="py-3.5 px-4">Assigned Zone</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No active users found matching your criteria.
                </td>
              </tr>
            ) : (
              visibleUsers.map((u) => {
                const roleInfo = getRoleBadge(u.role);
                const statusInfo = getStatusBadge(u.accountStatus);
                const RoleIcon = roleInfo.icon;
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* User Avatar + Name + Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {getInitials(u.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.classes}`}>
                          <RoleIcon size={12} />
                          {roleInfo.label}
                        </span>
                        {u.specialization && (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            {u.specialization}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Zone */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-semibold">
                        {u.zoneAssignments?.[0]?.zone?.name || 'Entire Facility'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.classes}`}>
                        <StatusIcon size={11} />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onEditUser(u)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Edit User Role & Status"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
