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
} from 'lucide-react';
import { getEquipmentVisual } from './equipmentIcons';

/**
 * Single Equipment Card (Card View)
 * Pixel-matching the white clean enterprise equipment card design
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
      className="bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer text-left group shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      {/* Top section: Icon on left, Name directly adjacent, Big number on far right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center">
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <SvgVisual className="w-12 h-12" />
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

      {/* Bottom section: Online / Offline / Maintenance Status Rows (clean spacing, no divider) */}
      <div className="mt-5 flex flex-col gap-2">
        {/* Active / Online */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 font-medium">
              {isLink ? 'Active' : 'Online'}
            </span>
          </div>
          <span className="font-bold text-slate-900">
            {working}
          </span>
        </div>

        {/* Down / Offline */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 font-medium">
              {isLink ? 'Down' : 'Offline'}
            </span>
          </div>
          <span className="font-bold text-slate-900">
            {faulty}
          </span>
        </div>

        {/* Maintenance */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-600 font-medium">
              Maintenance
            </span>
          </div>
          <span className="font-bold text-slate-900">
            {maintenance}
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
      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer group"
    >
      {/* Equipment Icon & Name */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 object-contain rounded" />
            ) : (
              <SvgVisual className="w-8 h-8" />
            )}
          </div>
          <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
            {cat.name}
          </span>
        </div>
      </td>

      {/* Total */}
      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
        {total}
      </td>

      {/* Online / Active */}
      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {working} {isLink ? 'Active' : 'Online'}
        </span>
      </td>

      {/* Offline / Down */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          faulty > 0
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-slate-50 text-slate-400 border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${faulty > 0 ? 'bg-rose-500' : 'bg-slate-400'}`} />
          {faulty} {isLink ? 'Down' : 'Offline'}
        </span>
      </td>

      {/* Maintenance */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          maintenance > 0
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-50 text-slate-400 border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${maintenance > 0 ? 'bg-amber-400' : 'bg-slate-400'}`} />
          {maintenance} Maint.
        </span>
      </td>

      {/* Health Bar */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
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
          <span className="text-xs font-bold text-slate-600 min-w-[32px]">{healthPercent}%</span>
        </div>
      </td>

      {/* Action */}
      <td className="py-3.5 px-4 text-right">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
          View Zones <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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

  const displayedCategories = categories;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-6">
      {/* Top Header: Title & Subtitle on Left, Card View / List View Toggles on Right */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Equipment Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of all equipment categories
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Card View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
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
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading equipment details…</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedCategories.map((cat, i) => (
                <EquipmentCard
                  key={cat.categoryId ?? i}
                  cat={cat}
                  onClick={() => onCategoryClick?.(cat)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100">
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
