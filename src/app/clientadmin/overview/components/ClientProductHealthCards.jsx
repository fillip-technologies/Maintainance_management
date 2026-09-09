import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Loader2,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { getEquipmentVisual } from './equipmentIcons';


function ProductCard({ product }) {
  const { Component: SvgVisual, isLink } = getEquipmentVisual(product.name);
  const total       = product.total       ?? 0;
  const working     = product.working     ?? 0;
  const faulty      = product.faulty      ?? 0;
  const maintenance = product.underMaintenance ?? 0;

  return (
    <div className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      {/* Top: Realistic SVG Illustration on left, Total count + Name on right */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center justify-center">
          <SvgVisual className="w-11 h-11 sm:w-12 sm:h-12" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
            {total}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate mt-1.5" title={product.name}>
            {product.name}
          </span>
        </div>
      </div>

      {/* Status rows with colored indicator dots */}
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-sm" />
          <span className="font-bold text-white min-w-[22px] text-left">{working}</span>
          <span className="text-slate-400 text-xs">{isLink ? 'Active' : 'Online'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-sm" />
          <span className="font-bold text-white min-w-[22px] text-left">{faulty}</span>
          <span className="text-slate-400 text-xs">{isLink ? 'Down' : 'Offline'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-sm" />
          <span className="font-bold text-white min-w-[22px] text-left">{maintenance}</span>
          <span className="text-slate-400 text-xs">Maintenance</span>
        </div>
      </div>
    </div>
  );
}

function ProductListRow({ product }) {
  const { Component: SvgVisual, isLink } = getEquipmentVisual(product.name);
  const total       = product.total       ?? 0;
  const working     = product.working     ?? 0;
  const faulty      = product.faulty      ?? 0;
  const maintenance = product.underMaintenance ?? 0;
  const healthPercent = total > 0 ? Math.round((working / total) * 100) : 0;

  return (
    <tr className="border-b border-[var(--border-color)]/60 hover:bg-[var(--bg-card-hover)]/50 text-slate-200 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-center p-1 shadow-inner">
            <SvgVisual className="w-8 h-8" />
          </div>
          <span className="font-bold text-white text-sm">{product.name}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 font-extrabold text-white text-sm">{total}</td>
      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {working} {isLink ? 'Active' : 'Online'}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${faulty > 0 ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' : 'bg-[var(--bg-sidebar)] text-slate-500 border-[var(--border-color)]'}`}>
          <span className={`w-2 h-2 rounded-full ${faulty > 0 ? 'bg-rose-500' : 'bg-slate-600'}`} />
          {faulty} {isLink ? 'Down' : 'Offline'}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${maintenance > 0 ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-[var(--bg-sidebar)] text-slate-500 border-[var(--border-color)]'}`}>
          <span className={`w-2 h-2 rounded-full ${maintenance > 0 ? 'bg-amber-400' : 'bg-slate-600'}`} />
          {maintenance} Maint.
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 bg-[var(--border-color)] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${healthPercent >= 90 ? 'bg-emerald-500' : healthPercent >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-300 min-w-[32px]">{healthPercent}%</span>
        </div>
      </td>
    </tr>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 flex flex-col justify-between animate-pulse">
      {/* Top: Icon + Title skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--border-color)]/60 shrink-0" />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="h-6 w-12 bg-[var(--border-color)]/80 rounded-md" />
          <div className="h-3.5 w-24 bg-[var(--border-color)]/50 rounded-md" />
        </div>
      </div>

      {/* Status rows skeleton */}
      <div className="mt-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500/30 shrink-0" />
          <div className="h-3 w-16 bg-[var(--border-color)]/50 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500/30 shrink-0" />
          <div className="h-3 w-16 bg-[var(--border-color)]/50 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500/30 shrink-0" />
          <div className="h-3 w-16 bg-[var(--border-color)]/50 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ClientProductHealthCards({ products = [], loading = false, error = '' }) {
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'


  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Equipment Details
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status by product name across all categories
          </p>
        </div>

        {/* View toggles matching reference screenshot */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-slate-400 hover:text-white hover:border-[var(--border-hover)]'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Card View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-slate-400 hover:text-white hover:border-[var(--border-hover)]'
            }`}
          >
            <List size={15} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs font-semibold">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-center text-slate-500 shadow-inner">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">No equipment added yet</p>
            <p className="text-xs text-slate-500 mt-1">Equipment will appear here as you add them one by one</p>
          </div>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.name ?? i} product={p} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[var(--bg-sidebar)] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Online / Active</th>
                    <th className="py-3.5 px-4">Offline / Down</th>
                    <th className="py-3.5 px-4">Maintenance</th>
                    <th className="py-3.5 px-4">Operational Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/60">
                  {products.map((p, i) => (
                    <ProductListRow key={p.name ?? i} product={p} />
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
