import React from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Wrench,
  Shield,
  UserCheck
} from 'lucide-react';

export function ClientProductCards({ stats }) {
  const totalCount      = stats?.totalProducts ?? 0;
  const workingCount    = stats?.workingProducts ?? 0;
  const notWorkingCount = stats?.notWorkingProducts ?? 0;
  const onHoldCount     = stats?.onHoldIssues ?? 0;

  const productCards = [
    {
      title: 'Total Products',
      value: totalCount,
      subtitle: 'All registered facility equipment',
      icon: Package,
      badgeText: 'All Equipment',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700'
    },
    {
      title: 'Working Products',
      value: workingCount,
      subtitle: 'Fully operational & healthy',
      icon: CheckCircle2,
      badgeText: 'Active & Online',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Not Working Products',
      value: notWorkingCount,
      subtitle: 'Reported faults / breakdown',
      icon: XCircle,
      badgeText: 'Attention Needed',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700'
    },
    {
      title: 'Services On Hold',
      value: onHoldCount,
      subtitle: 'Queries paused / awaiting action',
      icon: Wrench,
      badgeText: 'On Hold',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {productCards.map((card, idx) => {
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
                <Icon size={24} />
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

export function ClientTeamCards({ teamStats }) {
  const zoneOfficersCount = teamStats?.zoneOfficers ?? 0;
  const staffMembersCount = teamStats?.staffMembers ?? 0;
  const techniciansCount = teamStats?.technicians ?? 0;

  const teamCards = [
    {
      title: 'Total Zone Officers',
      value: zoneOfficersCount,
      subtitle: 'Zone Leads with operational authority',
      icon: Shield,
      badgeText: 'Officers',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Staff Members',
      value: staffMembersCount,
      subtitle: 'Floor staff for daily logs & telemetry',
      icon: UserCheck,
      badgeText: 'Floor Staff',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Technicians',
      value: techniciansCount,
      subtitle: 'Certified repair & service engineers',
      icon: Wrench,
      badgeText: 'Engineers',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operations & Zone Personnel
        </span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teamCards.map((card, idx) => {
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
                  <Icon size={24} />
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
