import React from 'react';
import { Building2, Users, MapPin, ShieldCheck } from 'lucide-react';

export default function ClientStatCards({ clients = [] }) {
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const uniqueLocations = new Set(clients.map((c) => c.location).filter(Boolean)).size || 1;

  const cards = [
    {
      title: 'Total Client Accounts',
      value: totalClients,
      subtitle: 'Registered enterprise organizations',
      icon: Building2,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      badgeBg: 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60',
      badgeText: 'Organizations'
    },
    {
      title: 'Active Client Admins',
      value: activeClients,
      subtitle: `${activeClients} authenticated managers`,
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badgeBg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
      badgeText: 'Active Access'
    },
    {
      title: 'Operating Campuses',
      value: totalClients,
      subtitle: `Across ${uniqueLocations} regional hubs`,
      icon: MapPin,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badgeBg: 'bg-purple-950/60 text-purple-300 border border-purple-800/60',
      badgeText: 'Facilities'
    },
    {
      title: 'Verified Portals',
      value: activeClients,
      subtitle: 'Operational client access channels',
      icon: ShieldCheck,
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      badgeBg: 'bg-sky-950/60 text-sky-300 border border-sky-800/60',
      badgeText: 'Verified'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)] hover:border-[var(--border-hover)] shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon size={22} />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-color)] mt-4 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">{card.subtitle}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeBg}`}>
                {card.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
