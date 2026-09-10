import React from 'react';
import { Building2, Mail, MapPin, Edit3, Trash2, Calendar, UserX } from 'lucide-react';

export default function ClientTable({ clients = [], onEditClient, onDeleteClient }) {
  const formatDate = (isoStr) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-md flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-white">No Clients Found</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click "Add Client" above to provision a client under an organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-main)]/80 border-b border-[var(--border-color)] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">Organization & Client</th>
              <th className="py-3.5 px-6">Client Administrator</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Created</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/60 text-xs font-medium text-slate-300">
            {clients.map((client) => {
              const hasAdmin = !!client.adminName;
              const isActive = client.status === 'active';
              const isNoAdmin = client.status === 'no_admin';

              return (
                <tr key={client.clientId} className="hover:bg-[var(--bg-main)]/50 transition-colors group">

                  {/* 1. Organization & Client */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Building2 size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {client.companyName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {client.facilityName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Client Administrator */}
                  <td className="py-4 px-6">
                    {hasAdmin ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs shrink-0">
                          {getInitials(client.adminName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{client.adminName}</span>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Mail size={11} className="text-slate-400" />
                            {client.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <UserX size={15} />
                        <span className="text-xs font-semibold italic">No admin assigned</span>
                      </div>
                    )}
                  </td>

                  {/* 3. Location */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{client.location || '—'}</span>
                    </div>
                  </td>

                  {/* 4. Status */}
                  <td className="py-4 px-6">
                    {isNoAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-rose-950/60 text-rose-300 border-rose-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        No Admin
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isActive
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {isActive ? 'Active' : 'Invited'}
                      </span>
                    )}
                  </td>

                  {/* 5. Created Date */}
                  <td className="py-4 px-6">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(client.createdAt)}
                    </span>
                  </td>

                  {/* 6. Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => hasAdmin && onEditClient && onEditClient(client)}
                        disabled={!hasAdmin}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] transition-colors cursor-pointer text-slate-400 hover:text-blue-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={hasAdmin ? 'Edit client admin' : 'No admin to edit'}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteClient && onDeleteClient(client)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-[var(--border-color)] transition-colors cursor-pointer"
                        title="Remove client"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
