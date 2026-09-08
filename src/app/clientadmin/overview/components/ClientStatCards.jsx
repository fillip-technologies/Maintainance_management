import React from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Archive,
  Wrench,
  Shield,
  UserCheck
} from 'lucide-react';

export function ClientProductCards({ stats, onCardClick }) {
  const totalCount       = stats?.totalProducts       ?? 0;
  const workingCount     = stats?.workingProducts     ?? 0;
  const notWorkingCount  = stats?.notWorkingProducts  ?? 0;
  const provisionedCount = stats?.provisionedProducts ?? 0;

  const productCards = [
    {
      key: 'all_devices',
      title: 'Total Products',
      value: totalCount,
      subtitle: 'Click to view all registered equipment',
      icon: Package,
      badgeText: 'All Equipment',
      accentLine: 'from-indigo-500 via-indigo-400 to-transparent',
      hoverBorder: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
      glowBg: 'group-hover:bg-indigo-500/[0.03]',
    },
    {
      key: 'working',
      title: 'Working Products',
      value: workingCount,
      subtitle: 'Click to view operational devices',
      icon: CheckCircle2,
      badgeText: 'Active & Online',
      accentLine: 'from-emerald-500 via-emerald-400 to-transparent',
      hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      glowBg: 'group-hover:bg-emerald-500/[0.03]',
    },
    {
      key: 'not_working',
      title: 'Not Working Products',
      value: notWorkingCount,
      subtitle: 'Click to view faulty & under-maintenance',
      icon: XCircle,
      badgeText: 'Attention Needed',
      accentLine: 'from-rose-500 via-rose-400 to-transparent',
      hoverBorder: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      badgeBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      glowBg: 'group-hover:bg-rose-500/[0.03]',
    },
    {
      key: 'provisioned',
      title: 'In Stock',
      value: provisionedCount,
      subtitle: 'Added but not yet deployed to a zone',
      icon: Archive,
      badgeText: 'Undeployed',
      accentLine: 'from-sky-500 via-sky-400 to-transparent',
      hoverBorder: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
      iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
      badgeBg: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
      glowBg: 'group-hover:bg-sky-500/[0.03]',
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
            className={`bg-[#0c162b] hover:bg-[#101c38] rounded-2xl p-5 border border-[#1a2847] shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden text-left cursor-pointer hover:-translate-y-0.5 ${card.hoverBorder}`}
          >
            {/* Elegant top accent gradient line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accentLine}`} />
            
            {/* Subtle card hover tint */}
            <div className={`absolute inset-0 transition-colors pointer-events-none ${card.glowBg}`} />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-300">{card.title}</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mt-1">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                <Icon size={22} />
              </div>
            </div>

            <div className="pt-3 border-t border-[#182440] mt-4 flex items-center justify-between gap-2 relative z-10">
              <span className="text-[11px] font-medium text-slate-400 truncate">{card.subtitle}</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${card.badgeBg}`}>
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
      accentLine: 'from-purple-500 via-purple-400 to-transparent',
      hoverBorder: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      badgeBg: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    },
    {
      key: 'staff',
      title: 'Staff Members',
      value: staffMembersCount,
      subtitle: 'Click to view floor staff',
      icon: UserCheck,
      badgeText: 'Floor Staff',
      accentLine: 'from-emerald-500 via-emerald-400 to-transparent',
      hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    },
    {
      key: 'technicians',
      title: 'Technicians',
      value: techniciansCount,
      subtitle: 'Click to view service engineers',
      icon: Wrench,
      badgeText: 'Engineers',
      accentLine: 'from-amber-500 via-amber-400 to-transparent',
      hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operations &amp; Zone Personnel
        </span>
        <div className="h-px bg-[#182440] flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teamCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => onCardClick?.(card.key)}
              className={`bg-[#0c162b] hover:bg-[#101c38] rounded-2xl p-5 border border-[#1a2847] shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden text-left cursor-pointer hover:-translate-y-0.5 ${card.hoverBorder}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accentLine}`} />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-300">{card.title}</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight leading-none mt-1">
                    {card.value}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="pt-3 border-t border-[#182440] mt-4 flex items-center justify-between gap-2 relative z-10">
                <span className="text-[11px] font-medium text-slate-400 truncate">{card.subtitle}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${card.badgeBg}`}>
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
