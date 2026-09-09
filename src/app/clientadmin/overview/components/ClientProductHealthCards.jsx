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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Icon + name + total */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center">
            <SvgVisual className="w-12 h-12" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={product.name}>
            {product.name}
          </span>
        </div>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none shrink-0">
          {total}
        </span>
      </div>

      {/* Status rows */}
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            {isLink ? 'Active' : 'Online'}
          </span>
          <span className="font-bold text-slate-900">{working}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            {isLink ? 'Down' : 'Offline'}
          </span>
          <span className="font-bold text-slate-900">{faulty}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            Maintenance
          </span>
          <span className="font-bold text-slate-900">{maintenance}</span>
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
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
            <SvgVisual className="w-8 h-8" />
          </div>
          <span className="font-bold text-slate-800 text-sm">{product.name}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{total}</td>
      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {working} {isLink ? 'Active' : 'Online'}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${faulty > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          <span className={`w-2 h-2 rounded-full ${faulty > 0 ? 'bg-rose-500' : 'bg-slate-400'}`} />
          {faulty} {isLink ? 'Down' : 'Offline'}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${maintenance > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          <span className={`w-2 h-2 rounded-full ${maintenance > 0 ? 'bg-amber-400' : 'bg-slate-400'}`} />
          {maintenance} Maint.
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${healthPercent >= 90 ? 'bg-emerald-500' : healthPercent >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 min-w-[32px]">{healthPercent}%</span>
        </div>
      </td>
    </tr>
  );
}

export default function ClientProductHealthCards({ products = [], loading = false, error = '' }) {
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Equipment Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status by product name across all categories
          </p>
        </div>

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

      {loading && (
        <div className="flex items-center gap-3 justify-center py-12 text-slate-400">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading equipment details…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
          <Package size={28} className="opacity-40" />
          <p className="text-sm font-medium">No equipment deployed yet</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.name ?? i} product={p} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Online / Active</th>
                    <th className="py-3 px-4">Offline / Down</th>
                    <th className="py-3 px-4">Maintenance</th>
                    <th className="py-3 px-4">Operational Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
