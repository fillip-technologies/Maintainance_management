import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Check, Wrench } from 'lucide-react';

function CctvCameraIcon({ className = 'w-6 h-6 text-white' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M19 10L14 7V9H6C5.44772 9 5 9.44772 5 10V14C5 14.5523 5.44772 15 6 15H14V17L19 14V10Z"
        fill="currentColor"
      />
      <path d="M5 12H2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2.5 8.5V15.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ExclamationIcon({ className = 'w-6 h-6 text-white' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 7V13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function PlatformKpiCards({ tenancy, devices, loading, facilities }) {
  const total = devices?.total ?? 0;
  const working = devices?.working ?? 0;
  const faulty = devices?.faulty ?? 0;
  const underMaintenance = devices?.underMaintenance ?? 0;
  const organizations = tenancy?.companies ?? tenancy?.activeCompanies ?? 0;
  const clientLocations = (facilities && facilities.length > 0)
    ? facilities.length
    : (tenancy?.clients ?? 0);

  const fmt = (n) => (loading ? '—' : (n ?? 0).toLocaleString('en-IN'));

  const onlinePct = total > 0 ? ((working / total) * 100).toFixed(1) : '0';
  const offlinePct = total > 0 ? ((faulty / total) * 100).toFixed(1) : '0';
  const maintenancePct = total > 0 ? ((underMaintenance / total) * 100).toFixed(1) : '0';

  const cards = [
    {
      id: 'organizations',
      title: 'Total Organisation',
      value: fmt(organizations),
      iconType: 'building',
      iconBg: 'bg-indigo-600 shadow-md shadow-indigo-600/20',
      action: { type: 'link', href: '/superadmin/organizations', label: 'View All →' }
    },
    {
      id: 'locations',
      title: 'Locations',
      value: fmt(clientLocations),
      iconType: 'pin',
      iconBg: 'bg-blue-600 shadow-md shadow-blue-600/20',
      action: { type: 'link', href: '/superadmin/clients', label: 'View All →' }
    },
    {
      id: 'total-devices',
      title: 'Total Devices',
      value: fmt(total),
      iconType: 'cctv',
      iconBg: 'bg-[#122b4e] border border-[#1e4277]',
      action: { type: 'link', href: '/superadmin/products', label: 'View All →' }
    },
    {
      id: 'online',
      title: 'Online',
      value: fmt(working),
      iconType: 'check',
      iconBg: 'bg-emerald-500 shadow-md shadow-emerald-500/20',
      action: { type: 'percent', value: `${onlinePct}%`, color: 'text-emerald-400' }
    },
    {
      id: 'offline',
      title: 'Offline',
      value: fmt(faulty),
      iconType: 'alert',
      iconBg: 'bg-rose-500 shadow-md shadow-rose-500/20',
      action: { type: 'percent', value: `${offlinePct}%`, color: 'text-rose-500' }
    },
    {
      id: 'maintenance',
      title: 'Under Maintenance',
      value: fmt(underMaintenance),
      iconType: 'wrench',
      iconBg: 'bg-amber-500 shadow-md shadow-amber-500/20',
      action: { type: 'percent', value: `${maintenancePct}%`, color: 'text-amber-400' }
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-md transition-all duration-200 group"
          >
            {/* Left Solid Circular Icon */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
              {card.iconType === 'building' && <Building2 size={20} className="text-white" />}
              {card.iconType === 'pin' && <MapPin size={20} className="text-white fill-white" />}
              {card.iconType === 'cctv' && <CctvCameraIcon className="w-5 h-5 text-white" />}
              {card.iconType === 'check' && <Check size={22} strokeWidth={3.5} className="text-white" />}
              {card.iconType === 'alert' && <ExclamationIcon className="w-5 h-5 text-white" />}
              {card.iconType === 'wrench' && <Wrench size={19} className="text-white fill-white" />}
            </div>

            {/* Right Text Column */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                {card.value}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-1 truncate">
                {card.title}
              </span>
              <div className="mt-1">
                {card.action.type === 'link' ? (
                  <Link
                    to={card.action.href}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    {card.action.label}
                  </Link>
                ) : (
                  <span className={`text-xs font-bold ${card.action.color}`}>
                    {loading ? '—' : card.action.value}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
  );
}
