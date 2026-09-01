import React from 'react';
import { Package, Calendar } from 'lucide-react';

export default function ProductPreviewCard({ formData, image }) {
  const formattedPrice = formData.price
    ? parseFloat(formData.price).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })
    : '0.00';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 sticky top-24">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Live Product Preview
        </span>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Active in Catalog
        </span>
      </div>

      {/* Product Image Box */}
      <div className="w-full h-48 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative">
        {image ? (
          <img
            src={image}
            alt={formData.name || 'Product Preview'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <Package size={40} />
            <span className="text-[11px] text-slate-400 font-medium">No Image Uploaded</span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          {formData.category || 'Security & CCTV Cameras'}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-indigo-600">
            {formData.serialNumber || 'SN-CAM-00000000'}
          </span>
          <span className="text-lg font-extrabold text-slate-900">
            ₹{formattedPrice}
          </span>
        </div>

        <h4 className="text-base font-extrabold text-slate-900 leading-snug">
          {formData.name || 'Product / Equipment Title'}
        </h4>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={12} />
            <span>Purchase Date</span>
          </span>
          <span className="text-xs font-bold text-slate-800">
            {formData.purchaseDate || '2026-08-01'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={12} className="text-indigo-600" />
            <span>Installation Date</span>
          </span>
          <span className="text-xs font-bold text-indigo-700">
            {formData.installationDate || '2026-08-15'}
          </span>
        </div>
      </div>
    </div>
  );
}
