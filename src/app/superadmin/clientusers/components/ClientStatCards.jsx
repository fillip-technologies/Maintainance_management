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
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      badgeText: 'Organizations'
    },
    {
      title: 'Active Client Admins',
      value: activeClients,
      subtitle: `${activeClients} authenticated managers`,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      badgeText: 'Active Access'
    },
    {
      title: 'Operating Campuses',
      value: totalClients,
      subtitle: `Across ${uniqueLocations} regional hubs`,
      icon: MapPin,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      badgeText: 'Facilities'
    },
    {
      title: 'Verified Portals',
      value: activeClients,
      subtitle: 'Operational client access channels',
      icon: ShieldCheck,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      badgeBg: 'bg-sky-50 text-sky-700',
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
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon size={22} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">{card.subtitle}</span>
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
