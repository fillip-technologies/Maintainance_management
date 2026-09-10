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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cyan':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] rounded-2xl p-5 flex items-center justify-between shadow-md hover:shadow-lg transition-all duration-200 group">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105 ${getIconColorClass()}`}>
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
}
