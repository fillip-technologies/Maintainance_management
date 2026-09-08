import React from 'react';
import {
  Boxes,
  Cog,
  AlertTriangle,
  Package,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench
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
      icon: Boxes,
      badgeText: 'All Equipment',
      cardBg: 'bg-[#f0f6ff] border-blue-200/90 hover:border-blue-300 shadow-xs hover:shadow-md',
      iconBox: 'bg-blue-100 text-blue-600',
      btnBg: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    },
    {
      key: 'working',
      title: 'Working Products',
      value: workingCount,
      subtitle: 'Click to view operational equipment',
      icon: Cog,
      badgeText: 'Active & Online',
      cardBg: 'bg-[#f0fdf4] border-emerald-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md',
      iconBox: 'bg-emerald-100 text-emerald-600',
      btnBg: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
    },
    {
      key: 'not_working',
      title: 'Not Working Products',
      value: notWorkingCount,
      subtitle: 'Click to view faulty & under maintenance',
      icon: AlertTriangle,
      badgeText: 'Attention Needed',
      cardBg: 'bg-[#fef2f2] border-rose-200/90 hover:border-rose-300 shadow-xs hover:shadow-md',
      iconBox: 'bg-rose-100 text-rose-600',
      btnBg: 'bg-rose-100 hover:bg-rose-200 text-rose-700',
    },
    {
      key: 'provisioned',
      title: 'In Stock',
      value: provisionedCount,
      subtitle: 'Added but not yet deployed',
      icon: Package,
      badgeText: 'Undeployed',
      cardBg: 'bg-[#fffbeb] border-amber-200/90 hover:border-amber-300 shadow-xs hover:shadow-md',
      iconBox: 'bg-amber-100 text-amber-700',
      btnBg: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {productCards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onCardClick?.(card.key)}
            className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer group hover:-translate-y-0.5 ${card.cardBg}`}
          >
            {/* Top row: Icon on left, Title + Count on right */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBox}`}>
                <Icon size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-600 tracking-tight">
                  {card.title}
                </span>
                <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                  {card.value}
                </span>
              </div>
            </div>

            {/* Bottom row: Subtitle on left, Action pill button on right */}
            <div className="pt-4 mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {card.subtitle}
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 ${card.btnBg}`}>
                <span>{card.badgeText}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
      title: 'Zone Officers',
      value: zoneOfficersCount,
      subtitle: 'Click to view zone leads',
      icon: Shield,
      badgeText: 'Officers',
      cardBg: 'bg-purple-50/70 border-purple-200/80 hover:border-purple-300',
      iconBox: 'bg-purple-100 text-purple-600',
      btnBg: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    },
    {
      key: 'staff',
      title: 'Staff Members',
      value: staffMembersCount,
      subtitle: 'Click to view floor staff',
      icon: UserCheck,
      badgeText: 'Floor Staff',
      cardBg: 'bg-teal-50/70 border-teal-200/80 hover:border-teal-300',
      iconBox: 'bg-teal-100 text-teal-600',
      btnBg: 'bg-teal-100 hover:bg-teal-200 text-teal-700',
    },
    {
      key: 'technicians',
      title: 'Technicians',
      value: techniciansCount,
      subtitle: 'Click to view service engineers',
      icon: Wrench,
      badgeText: 'Engineers',
      cardBg: 'bg-amber-50/70 border-amber-200/80 hover:border-amber-300',
      iconBox: 'bg-amber-100 text-amber-600',
      btnBg: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
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
              type="button"
              onClick={() => onCardClick?.(card.key)}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer group hover:-translate-y-0.5 shadow-xs hover:shadow-md ${card.cardBg}`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBox}`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 tracking-tight">
                    {card.title}
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                    {card.value}
                  </span>
                </div>
              </div>
              <div className="pt-3.5 mt-3 flex items-center justify-between gap-2 border-t border-slate-200/40">
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {card.subtitle}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0 ${card.btnBg}`}>
                  <span>{card.badgeText}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
