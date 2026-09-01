import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = 'primary'
}) {
  const getIconColorClass = () => {
    switch (iconBg) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cyan':
        return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${getIconColorClass()}`}>
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
}
