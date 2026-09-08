import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getProductBreakdown } from '../../../api/dashboardApi';
import {
  LayoutGrid,
  List,
  Loader2,
  AlertTriangle,
  Package,
  ChevronRight,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { getEquipmentVisual } from './equipmentIcons';

/**
 * Single Equipment Card (Card View)
 * Pixel-matching the dark high-tech equipment card design
 */
function EquipmentCard({ cat, onClick }) {
  const { Component: SvgVisual, isLink } = getEquipmentVisual(cat.name);
  const total = cat.total ?? 0;
  const working = cat.working ?? 0;
  const faulty = cat.faulty ?? 0;
  const maintenance = cat.underMaintenance ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className="bg-[#0c162b] hover:bg-[#101c38] border border-[#1a2847] hover:border-blue-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer text-left group shadow-md hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    >
      {/* Top section: Icon on left, Big number and Name on right */}
      <div className="flex items-start justify-between gap-3">
        <div className="shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#081022]/60 border border-[#192648]/40">
          {cat.imageUrl ? (
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-13 h-13 sm:w-14 sm:h-14 object-contain rounded-lg"
            />
          ) : (
            <SvgVisual className="w-13 h-13 sm:w-14 sm:h-14" />
          )}
        </div>

        <div className="text-right flex-1 min-w-0">
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
            {total}
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 truncate" title={cat.name}>
            {cat.name}
          </p>
        </div>
      </div>

      {/* Bottom section: Online / Offline / Maintenance Status Rows */}
      <div className="mt-4 pt-3 border-t border-[#182440]/60 flex flex-col gap-1.5">
        {/* Online / Active */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="text-sm font-bold text-white min-w-[24px]">
              {working}
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            {isLink ? 'Active' : 'Online'}
          </span>
        </div>

        {/* Offline / Down */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            <span className="text-sm font-bold text-white min-w-[24px]">
              {faulty}
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            {isLink ? 'Down' : 'Offline'}
          </span>
        </div>

        {/* Maintenance */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <span className="text-sm font-bold text-white min-w-[24px]">
              {maintenance}
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            Maintenance
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * List View Table Row
 */
function EquipmentListRow({ cat, onClick }) {
  const { Component: SvgVisual, isLink } = getEquipmentVisual(cat.name);
  const total = cat.total ?? 0;
  const working = cat.working ?? 0;
  const faulty = cat.faulty ?? 0;
  const maintenance = cat.underMaintenance ?? 0;
  const healthPercent = total > 0 ? Math.round((working / total) * 100) : 0;

  return (
    <tr
      onClick={onClick}
      className="border-b border-[#182647] hover:bg-[#101b35] transition-colors cursor-pointer group"
    >
      {/* Equipment Icon & Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#081022] border border-[#192648] flex items-center justify-center p-1">
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 object-contain rounded" />
            ) : (
              <SvgVisual className="w-8 h-8" />
            )}
          </div>
          <span className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
            {cat.name}
          </span>
        </div>
      </td>

      {/* Total */}
      <td className="py-3 px-4 font-bold text-white text-sm">
        {total}
      </td>

      {/* Online / Active */}
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {working} {isLink ? 'Active' : 'Online'}
        </span>
      </td>

      {/* Offline / Down */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          faulty > 0
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            : 'bg-slate-800/40 text-slate-400 border-slate-700/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${faulty > 0 ? 'bg-rose-500' : 'bg-slate-500'}`} />
          {faulty} {isLink ? 'Down' : 'Offline'}
        </span>
      </td>

      {/* Maintenance */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          maintenance > 0
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-slate-800/40 text-slate-400 border-slate-700/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${maintenance > 0 ? 'bg-amber-400' : 'bg-slate-500'}`} />
          {maintenance} Maint.
        </span>
      </td>

      {/* Health Bar */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                healthPercent >= 90
                  ? 'bg-emerald-500'
                  : healthPercent >= 70
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-300 min-w-[32px]">{healthPercent}%</span>
        </div>
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
          View in Zones <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </td>
    </tr>
  );
}

/**
 * Main Equipment Details Component
 */
export default function ClientProductHealthCards({ refreshTick, onCategoryClick }) {
  const { currentUser, isSuperAdmin } = useAuth();
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const scopeParams = isSuperAdmin
      ? { scope: 'platform' }
      : currentUser?.clientId
      ? { scope: 'client', id: currentUser.clientId }
      : currentUser?.zoneId
      ? { scope: 'zone', id: currentUser.zoneId }
      : { scope: 'platform' };

    setLoading(true);
    setError('');
    try {
      const cats = await getProductBreakdown(scopeParams);
      setCategories(cats || []);
    } catch (ex) {
      setError(ex.message || 'Failed to load equipment breakdown.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.clientId, currentUser?.zoneId, isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  // Dynamic details: Displays the client's equipment categories returned dynamically from API
  const displayedCategories = categories;

  return (
    <div className="bg-[#080e1e] rounded-3xl p-5 sm:p-6 border border-[#16223e] shadow-xl flex flex-col gap-5 text-white">
      {/* Top Header: Title on Left, Card View / List View Toggles on Right */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Equipment Details
        </h2>

        {/* View Switcher Toggle */}
        <div className="flex items-center bg-[#070d1a] p-1 rounded-xl border border-[#182647] gap-1">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b35]'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Card View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b35]'
            }`}
          >
            <List size={15} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-3 justify-center py-12 text-slate-400">
          <Loader2 size={20} className="animate-spin text-blue-400" />
          <span className="text-sm font-medium">Loading equipment details…</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs font-semibold">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayedCategories.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
          <Package size={28} className="opacity-40" />
          <p className="text-sm font-medium">No equipment deployed yet</p>
        </div>
      )}

      {/* Content: Card View or List View */}
      {!loading && !error && displayedCategories.length > 0 && (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {displayedCategories.map((cat, i) => (
                <EquipmentCard
                  key={cat.categoryId ?? i}
                  cat={cat}
                  onClick={() => onCategoryClick?.(cat)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#182647] bg-[#0c162b]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#091124] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-[#182647]">
                  <tr>
                    <th className="py-3 px-4">Equipment</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Online / Active</th>
                    <th className="py-3 px-4">Offline / Down</th>
                    <th className="py-3 px-4">Maintenance</th>
                    <th className="py-3 px-4">Operational Rate</th>
                    <th className="py-3 px-4 text-right">Zone Filter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14203d]">
                  {displayedCategories.map((cat, i) => (
                    <EquipmentListRow
                      key={cat.categoryId ?? i}
                      cat={cat}
                      onClick={() => onCategoryClick?.(cat)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
