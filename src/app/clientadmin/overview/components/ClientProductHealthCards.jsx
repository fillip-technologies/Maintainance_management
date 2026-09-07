import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getProductBreakdown } from '../../../api/dashboardApi';
import {
  Package, Loader2, AlertTriangle, ChevronRight,
  Camera, Monitor, Network, Router, Flame, Wind, Zap, Speaker, ShieldCheck, Cpu,
} from 'lucide-react';

const PALETTES = [
  { grad: 'from-indigo-500 to-sky-400'    },
  { grad: 'from-violet-500 to-purple-400' },
  { grad: 'from-emerald-500 to-teal-400'  },
  { grad: 'from-rose-500 to-pink-400'     },
  { grad: 'from-amber-500 to-orange-400'  },
  { grad: 'from-cyan-500 to-blue-400'     },
];

function categoryIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('camera') || n.includes('cctv'))                   return Camera;
  if (n.includes('nvr') || n.includes('dvr') || n.includes('recorder')) return Monitor;
  if (n.includes('switch') || n.includes('network'))                return Network;
  if (n.includes('router'))                                          return Router;
  if (n.includes('fire') || n.includes('alarm'))                    return Flame;
  if (n.includes('hvac') || n.includes('air') || n.includes('ac')) return Wind;
  if (n.includes('ups') || n.includes('power'))                     return Zap;
  if (n.includes('speaker') || n.includes('pa ') || n.includes('audio')) return Speaker;
  if (n.includes('access') || n.includes('door'))                   return ShieldCheck;
  if (n.includes('sensor'))                                          return Cpu;
  return Package;
}

function ProductCard({ cat, index, onClick }) {
  const p = PALETTES[index % PALETTES.length];
  const Icon = categoryIcon(cat.name);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left w-full group focus:outline-none"
    >
      {/* Coloured circle — logo if available, otherwise icon */}
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0 shadow-md overflow-hidden`}>
        {cat.imageUrl
          ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-full" />
          : <Icon size={26} className="text-white" />}
      </div>

      {/* Count + name */}
      <div className="flex-1 min-w-0">
        <p className="text-3xl font-black text-slate-900 leading-none">{cat.total}</p>
        <p className="text-sm font-semibold text-slate-500 mt-1 truncate">{cat.name}</p>
      </div>

      {/* Status dot rows */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block" />
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </span>
          <span className="text-sm font-black text-emerald-700 w-6 leading-none">{cat.working}</span>
          <span className="text-xs font-semibold text-slate-500">Online</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.faulty > 0 ? 'bg-rose-500' : 'bg-rose-200'}`} />
          <span className={`text-sm font-black w-6 leading-none ${cat.faulty > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{cat.faulty}</span>
          <span className="text-xs font-semibold text-slate-500">Offline</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.underMaintenance > 0 ? 'bg-amber-400' : 'bg-amber-200'}`} />
          <span className={`text-sm font-black w-6 leading-none ${cat.underMaintenance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{cat.underMaintenance}</span>
          <span className="text-xs font-semibold text-slate-500">Maintenance</span>
        </div>
      </div>

      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

export default function ClientProductHealthCards({ refreshTick, onCategoryClick }) {
  const { currentUser } = useAuth();
  const clientId = currentUser?.clientId;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true); setError('');
    try {
      const cats = await getProductBreakdown({ scope: 'client', id: clientId });
      setCategories(cats);
    } catch (ex) {
      setError(ex.message || 'Failed to load product breakdown.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load, refreshTick]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Products Status by Type
        </h2>
        <p className="text-xs text-slate-500">
          Online, offline and maintenance count per product category
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 justify-center py-10 text-slate-400">
          <Loader2 size={18} className="animate-spin text-indigo-400" />
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
          <Package size={24} className="opacity-40" />
          <p className="text-sm font-medium">No products deployed yet</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <ProductCard
              key={cat.categoryId ?? i}
              cat={cat}
              index={i}
              onClick={() => onCategoryClick?.(cat)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
