import React from 'react';
import { Building2, User, Mail, MapPin, Edit3, Trash2, Calendar } from 'lucide-react';

export default function ClientTable({ clients = [], onEditClient, onDeleteClient }) {
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

  const getInitials = (name) => {
    if (!name) return 'CA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-slate-800">No Client Accounts Found</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click "Add Client User" above to provision an organization and administrator account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Company & Facility</th>
              <th className="py-3.5 px-6">Client Administrator</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Account Status</th>
              <th className="py-3.5 px-6">Created Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {clients.map((client) => {
              const isActive = client.status === 'active';
              return (
                <tr key={client.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* 1. Company & Facility */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Building2 size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {client.companyName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {client.facilityName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Client Administrator */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs shrink-0">
                        {getInitials(client.adminName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{client.adminName}</span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail size={11} className="text-slate-400" />
                          {client.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Location */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{client.location || 'HQ Facility'}</span>
                    </div>
                  </td>

                  {/* 4. Account Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      ></span>
                      {isActive ? 'Active' : 'Invited'}
                    </span>
                  </td>

                  {/* 5. Created Date */}
                  <td className="py-4 px-6">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(client.createdAt)}
                    </span>
                  </td>

                  {/* 6. Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditClient && onEditClient(client)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Client Account"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteClient && onDeleteClient(client)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Remove Client"
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
