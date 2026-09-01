import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Wrench,
  XCircle
} from 'lucide-react';

export default function EquipmentStatusStats() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryData = {
    all: {
      total: '1,480',
      working: '1,412',
      maintenance: '48',
      notWorking: '20'
    },
    cameras: {
      total: '620',
      working: '608',
      maintenance: '8',
      notWorking: '4'
    },
    displays: {
      total: '340',
      working: '328',
      maintenance: '9',
      notWorking: '3'
    },
    fiber: {
      total: '290',
      working: '286',
      maintenance: '3',
      notWorking: '1'
    },
    videowalls: {
      total: '230',
      working: '210',
      maintenance: '12',
      notWorking: '8'
    }
  };

  const current = categoryData[selectedCategory];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-bold text-slate-900">Equipment & Hardware Status</h3>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hardware
          </button>
          <button
            onClick={() => setSelectedCategory('cameras')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCategory === 'cameras'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CCTV & Cameras
          </button>
          <button
            onClick={() => setSelectedCategory('displays')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCategory === 'displays'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TVs & Displays
          </button>
          <button
            onClick={() => setSelectedCategory('fiber')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCategory === 'fiber'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fiber Optics
          </button>
          <button
            onClick={() => setSelectedCategory('videowalls')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCategory === 'videowalls'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LED Video Walls
          </button>
        </div>
      </div>

      {/* 4 Clean Cards Grid - Only Title, Value, and Icon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Equipments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Hardware
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {current.total}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs">
            <Cpu size={22} />
          </div>
        </div>

        {/* Card 2: Working & Active */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Working & Online
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {current.working}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: In Service / PM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              In Service / PM
            </span>
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {current.maintenance}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 shadow-xs">
            <Wrench size={22} />
          </div>
        </div>

        {/* Card 4: Not Working / Down */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Not Working / Down
            </span>
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {current.notWorking}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 shadow-xs">
            <XCircle size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
