import React from 'react';
import {
  Package,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench,
  Loader2,
} from 'lucide-react';
import { getEquipmentVisual } from './equipmentIcons';

function CategoryCard({ cat, onClick }) {
  const { Component: SvgVisual } = getEquipmentVisual(cat.name);
  const total       = cat.total       ?? 0;
  const working     = cat.working     ?? 0;
  const faulty      = cat.faulty      ?? 0;
  const maintenance = cat.underMaintenance ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer text-left group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full"
    >
      {/* Icon + name + total */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center">
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-11 h-11 object-contain" />
            ) : (
              <SvgVisual className="w-11 h-11" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={cat.name}>
            {cat.name}
          </span>
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none shrink-0">
          {total}
        </span>
      </div>

      {/* Status breakdown */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Working
          </span>
          <span className="font-bold text-slate-900">{working}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> Faulty
          </span>
          <span className="font-bold text-slate-900">{faulty}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Maintenance
          </span>
          <span className="font-bold text-slate-900">{maintenance}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">Click to view zones</span>
        <ArrowRight size={13} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

export function ClientProductCards({ categories, provisionedCount, loading, onCategoryClick }) {
  const inStock = provisionedCount ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Equipment by Category
          </span>
          <div className="h-px bg-slate-200 w-16" />
        </div>
        {inStock > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <Package size={12} />
            {inStock} in stock (undeployed)
          </span>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex items-center gap-3 justify-center py-10 text-slate-400">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span className="text-xs font-medium">Loading categories…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
          <Package size={24} className="opacity-40" />
          <p className="text-xs font-medium">No equipment deployed yet</p>
        </div>
      )}

      {/* Category cards grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
