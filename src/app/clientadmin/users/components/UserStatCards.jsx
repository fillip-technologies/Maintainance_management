import React from 'react';
import { Users, Shield, UserCheck, Wrench } from 'lucide-react';

export default function UserStatCards({ users = [] }) {
  const activeUsers = users.filter((u) => u.accountStatus !== 'removed');
  const totalCount = activeUsers.length;
  const inchargeCount = activeUsers.filter((u) => u.role === 'zone_incharge').length;
  const staffCount = activeUsers.filter((u) => u.role === 'zone_staff').length;
  const techCount = activeUsers.filter((u) => u.role === 'technician').length;

  const cards = [
    {
      title: 'Total Facility Users',
      value: totalCount,
      subtitle: `${activeUsers.filter((u) => u.accountStatus === 'active').length} active accounts`,
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      badgeText: 'Team Size'
    },
    {
      title: 'Zone In-Charges',
      value: inchargeCount,
      subtitle: 'Zone Leads with asset control',
      icon: Shield,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      badgeText: 'Supervisors'
    },
    {
      title: 'Zone Floor Staff',
      value: staffCount,
      subtitle: 'Daily log & fault reporters',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      badgeText: 'Operators'
    },
    {
      title: 'Field Technicians',
      value: techCount,
      subtitle: 'Certified repair specialists',
      icon: Wrench,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
      badgeText: 'Engineers'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
