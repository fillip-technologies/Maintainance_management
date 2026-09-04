import React from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Wrench,
  Shield,
  UserCheck
} from 'lucide-react';

export function ClientProductCards({ stats, onCardClick }) {
  const totalCount      = stats?.totalProducts ?? 0;
  const workingCount    = stats?.workingProducts ?? 0;
  const notWorkingCount = stats?.notWorkingProducts ?? 0;
  const onHoldCount     = stats?.onHoldIssues ?? 0;

  const productCards = [
    {
      key: 'all_devices',
      title: 'Total Products',
      value: totalCount,
      subtitle: 'Click to view all registered equipment',
      icon: Package,
      badgeText: 'All Equipment',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      ring: 'hover:ring-2 hover:ring-indigo-200',
    },
    {
      key: 'working',
      title: 'Working Products',
      value: workingCount,
      subtitle: 'Click to view operational devices',
      icon: CheckCircle2,
      badgeText: 'Active & Online',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      ring: 'hover:ring-2 hover:ring-emerald-200',
    },
    {
      key: 'not_working',
      title: 'Not Working Products',
      value: notWorkingCount,
      subtitle: 'Click to view faulty & under-maintenance',
      icon: XCircle,
      badgeText: 'Attention Needed',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700',
      ring: 'hover:ring-2 hover:ring-rose-200',
    },
    {
      key: 'on_hold',
      title: 'Services On Hold',
      value: onHoldCount,
      subtitle: 'Click to view paused service queries',
      icon: Wrench,
      badgeText: 'On Hold',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
      ring: 'hover:ring-2 hover:ring-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {productCards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            onClick={() => onCardClick?.(card.key)}
            className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden text-left cursor-pointer ${card.ring}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon size={24} />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">{card.subtitle}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeBg}`}>
                {card.badgeText}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ClientTeamCards({ teamStats, onCardClick }) {
  const zoneOfficersCount = teamStats?.zoneOfficers ?? 0;
  const staffMembersCount = teamStats?.staffMembers ?? 0;
  const techniciansCount  = teamStats?.technicians  ?? 0;

  const teamCards = [
    {
      key: 'zone_officers',
      title: 'Total Zone Officers',
      value: zoneOfficersCount,
      subtitle: 'Click to view zone leads',
      icon: Shield,
      badgeText: 'Officers',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      ring: 'hover:ring-2 hover:ring-purple-200',
    },
    {
      key: 'staff',
      title: 'Staff Members',
      value: staffMembersCount,
      subtitle: 'Click to view floor staff',
      icon: UserCheck,
      badgeText: 'Floor Staff',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      ring: 'hover:ring-2 hover:ring-emerald-200',
    },
    {
      key: 'technicians',
      title: 'Technicians',
      value: techniciansCount,
      subtitle: 'Click to view service engineers',
      icon: Wrench,
      badgeText: 'Engineers',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
      ring: 'hover:ring-2 hover:ring-amber-200',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operations &amp; Zone Personnel
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teamCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => onCardClick?.(card.key)}
              className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden text-left cursor-pointer ${card.ring}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">{card.subtitle}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeBg}`}>
                  {card.badgeText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientStatCards({ stats, teamStats }) {
  return (
    <div className="flex flex-col gap-6">
      <ClientProductCards stats={stats} />
      <ClientTeamCards teamStats={teamStats} />
    </div>
  );
}
