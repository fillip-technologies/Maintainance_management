import React from 'react';
import {
  Package,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench,
  Loader2,
} from 'lucide-react';
import { getCategoryBadgeConfig } from './equipmentIcons';

function CategoryCard({ cat, onClick }) {
  const badgeConfig = getCategoryBadgeConfig(cat.name);
  const total       = cat.total       ?? 0;
  const working     = cat.working     ?? 0;
  const faulty      = cat.faulty      ?? 0;
  const maintenance = cat.underMaintenance ?? 0;
  const isLink      = badgeConfig.isLink;

  const BadgeIcon = badgeConfig.Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer text-left group shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between gap-3 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full overflow-hidden"
    >
      {/* Left: Uploaded logo OR colored badge icon */}
      <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full shrink-0 shadow-lg overflow-hidden flex items-center justify-center ${cat.imageUrl ? '' : `${badgeConfig.bgClass} text-white`}`}>
        {cat.imageUrl
          ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover object-center block" style={{ borderRadius: '50%' }} />
          : <BadgeIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-white" />
        }
      </div>

      {/* Middle: Big count + Category title */}
      <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
          {total}
        </span>
        <span className="text-xs sm:text-sm font-medium text-slate-400 truncate mt-1.5" title={cat.name}>
          {cat.name}
        </span>
      </div>

      {/* Right: 3 status rows with colored dots */}
      <div className="flex flex-col gap-1.5 shrink min-w-0 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-bold text-white min-w-[20px] text-right shrink-0">{working}</span>
          <span className="text-slate-400 text-xs truncate" title={isLink ? 'Active' : 'Online'}>{isLink ? 'Active' : 'Online'}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="font-bold text-white min-w-[20px] text-right shrink-0">{faulty}</span>
          <span className="text-slate-400 text-xs truncate" title={isLink ? 'Down' : 'Offline'}>{isLink ? 'Down' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="font-bold text-white min-w-[20px] text-right shrink-0">{maintenance}</span>
          <span className="text-slate-400 text-xs truncate" title="Maintenance">Maintenance</span>
        </div>
      </div>
    </button>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 animate-pulse overflow-hidden">
      {/* Left: Round circle skeleton */}
      <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[var(--border-color)]/60 shrink-0" />

      {/* Middle: Count + text skeleton */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <div className="h-6 w-12 bg-[var(--border-color)]/80 rounded-md" />
        <div className="h-3.5 w-24 bg-[var(--border-color)]/50 rounded-md" />
      </div>

      {/* Right: 3 status rows skeleton */}
      <div className="flex flex-col gap-2 shrink min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500/30 shrink-0" />
          <div className="h-3 w-14 bg-[var(--border-color)]/50 rounded" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-rose-500/30 shrink-0" />
          <div className="h-3 w-14 bg-[var(--border-color)]/50 rounded" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-500/30 shrink-0" />
          <div className="h-3 w-14 bg-[var(--border-color)]/50 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ClientProductCards({ categories = [], loading, onCategoryClick }) {

  return (
    <div className="flex flex-col gap-3">

      {/* Loading Skeleton Cards */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state — no demo data */}
      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
          <Package size={24} className="opacity-40" />
          <p className="text-xs font-medium">No equipment categories deployed yet</p>
        </div>
      )}

      {/* Real Category cards 3-column grid directly from API */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.categoryId ?? i}
              cat={cat}
              onClick={() => onCategoryClick?.(cat)}
            />
          ))}
        </div>
      )}
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
      cardBg: 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-purple-500/50',
      iconBox: 'bg-purple-950/70 border border-purple-800/60 text-purple-400',
      btnBg: 'bg-purple-900/50 hover:bg-purple-800/60 text-purple-300',
    },
    {
      key: 'staff',
      title: 'Staff Members',
      value: staffMembersCount,
      subtitle: 'Click to view floor staff',
      icon: UserCheck,
      badgeText: 'Floor Staff',
      cardBg: 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-teal-500/50',
      iconBox: 'bg-teal-950/70 border border-teal-800/60 text-teal-400',
      btnBg: 'bg-teal-900/50 hover:bg-teal-800/60 text-teal-300',
    },
    {
      key: 'technicians',
      title: 'Technicians',
      value: techniciansCount,
      subtitle: 'Click to view service engineers',
      icon: Wrench,
      badgeText: 'Engineers',
      cardBg: 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-amber-500/50',
      iconBox: 'bg-amber-950/70 border border-amber-800/60 text-amber-400',
      btnBg: 'bg-amber-900/50 hover:bg-amber-800/60 text-amber-300',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operations &amp; Zone Personnel
        </span>
        <div className="h-px bg-[var(--border-color)] flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teamCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onCardClick?.(card.key)}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer group hover:-translate-y-0.5 shadow-md hover:shadow-lg ${card.cardBg}`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBox}`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 tracking-tight">
                    {card.title}
                  </span>
                  <span className="text-3xl font-extrabold text-white leading-none mt-1">
                    {card.value}
                  </span>
                </div>
              </div>
              <div className="pt-3.5 mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-color)]">
                <span className="text-[11px] text-slate-400 font-medium truncate">
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
