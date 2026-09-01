import React, { useState } from 'react';
import {
  Search,
  Package,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  MapPin
} from 'lucide-react';

export default function RecentProductsTable({ products, onNotify, onDeleteProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter((prd) => {
    const matchesSearch =
      prd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || prd.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Registered Products & Equipment Inventory</h3>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Catalog of machinery parts, maintenance consumables, and equipment components
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-2 text-xs">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-slate-900 outline-hidden w-36 sm:w-48 text-xs placeholder:text-slate-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="HVAC & Climate">HVAC & Climate</option>
            <option value="Power & Electrical">Power & Electrical</option>
            <option value="Hydraulics & Pumps">Hydraulics & Pumps</option>
            <option value="Elevators & Escalators">Elevators & Escalators</option>
            <option value="Fire & Safety Hardware">Fire & Safety</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Product / Equipment</th>
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Unit Price</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4">Storage Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredProducts.map((prd) => (
              <tr key={prd.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {prd.image ? (
                        <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {prd.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{prd.brand || 'Fixly OEM'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                  {prd.sku}
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    {prd.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  ${parseFloat(prd.unitPrice || 0).toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                      parseInt(prd.stockQuantity || 0) <= parseInt(prd.minReorderLevel || 10)
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {prd.stockQuantity} in stock
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{prd.warehouseLocation || 'Warehouse 1'}</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onNotify?.(`Editing product ${prd.name}`)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct?.(prd.id, prd.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
