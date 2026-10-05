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
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-[var(--ink)]">No Clients Found</h3>
          <p className="text-xs text-[var(--ink-3)] mt-0.5">
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
            <tr className="bg-[var(--bg-main)]/80 border-b border-[var(--border-color)] text-[11px] font-bold uppercase tracking-wider text-[var(--ink-3)]">
              <th className="py-3.5 px-6">Organization & Client</th>
              <th className="py-3.5 px-6">Client Administrator</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Created</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/60 text-xs font-medium text-[var(--ink-2)]">
            {clients.map((client) => {
              const hasAdmin = !!client.adminName;
              const isActive = client.status === 'active';
              const isNoAdmin = client.status === 'no_admin';

              return (
                <tr key={client.clientId} className="hover:bg-[var(--bg-main)]/50 transition-colors group">

                  {/* 1. Organization & Client */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
                        {client.imageUrl ? (
                          <img
                            src={client.imageUrl}
                            alt={client.facilityName || 'Facility'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--ink)] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {client.companyName}
                        </span>
                        <span className="text-[11px] text-[var(--ink-3)] font-medium">
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
                          <span className="font-bold text-[var(--ink)]">{client.adminName}</span>
                          <span className="text-[11px] text-[var(--ink-3)] font-mono flex items-center gap-1">
                            <Mail size={11} className="text-[var(--ink-3)]" />
                            {client.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[var(--ink-3)]">
                        <UserX size={15} />
                        <span className="text-xs font-semibold italic">No admin assigned</span>
                      </div>
                    )}
                  </td>

                  {/* 3. Location */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[var(--ink-2)]">
                        <MapPin size={13} className="text-[var(--ink-3)] shrink-0" />
                        <span className="truncate max-w-[160px]">{client.location || '—'}</span>
                      </div>
                      {client.latitude != null && client.longitude != null && (
                        <span className="text-[10px] text-slate-500 font-mono pl-4">
                          📍 {Number(client.latitude).toFixed(4)}, {Number(client.longitude).toFixed(4)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Status */}
                  <td className="py-4 px-6">
                    {isNoAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        No Admin
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {isActive ? 'Active' : 'Invited'}
                      </span>
                    )}
                  </td>

                  {/* 5. Created Date */}
                  <td className="py-4 px-6">
                    <span className="text-[var(--ink-3)] flex items-center gap-1.5">
                      <Calendar size={13} className="text-[var(--ink-3)]" />
                      {formatDate(client.createdAt)}
                    </span>
                  </td>

                  {/* 6. Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditClient && onEditClient(client)}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] transition-colors cursor-pointer text-[var(--ink-3)] hover:text-blue-700 dark:hover:text-blue-400 hover:bg-[var(--surface-3)]"
                        title="Edit client facility & admin"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteClient && onDeleteClient(client)}
                        className="p-1.5 rounded-lg text-[var(--ink-3)] hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-[var(--border-color)] transition-colors cursor-pointer"
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
