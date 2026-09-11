import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Realistic SVG Illustrations for Equipment Details (matching dashboard design)
// ─────────────────────────────────────────────────────────────────────────────

/** Turret / Dome Camera (Camera) */
export function FixedCamerasSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Base ring mount */}
      <ellipse cx="32" cy="46" rx="22" ry="7" fill="#cbd5e1" />
      <ellipse cx="32" cy="44" rx="20" ry="6" fill="#f1f5f9" />
      {/* Eyeball / sphere housing angled */}
      <circle cx="32" cy="30" r="18" fill="url(#camGrad)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Front bezel ring */}
      <ellipse cx="28" cy="32" rx="11" ry="11" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      {/* Lens element */}
      <circle cx="28" cy="32" r="7" fill="#020617" />
      <circle cx="28" cy="32" r="4.5" fill="#1e3a8a" />
      {/* Sapphire lens flare / reflection */}
      <ellipse cx="26" cy="30" rx="2" ry="1.2" fill="#60a5fa" opacity="0.9" />
      <circle cx="31" cy="34" r="0.8" fill="#93c5fd" opacity="0.7" />
      {/* Status LED */}
      <circle cx="20" cy="24" r="1.2" fill="#ef4444" opacity="0.85" />
      <defs>
        <radialGradient id="camGrad" cx="30" cy="24" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** PTZ Speed Dome Camera (ptz) */
export function PtzCamerasSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top ceiling mount plate */}
      <rect x="22" y="6" width="20" height="4" rx="2" fill="#cbd5e1" />
      <path d="M27 10h10v5h-10z" fill="#94a3b8" />
      {/* PTZ upper casing */}
      <path d="M21 17c0-1.5 1.5-2.5 3-2.5h16c1.5 0 3 1 3 2.5v7H21v-7z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
      {/* Rotating sphere body */}
      <circle cx="32" cy="36" r="16" fill="url(#ptzSphereGrad)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Center optical lens dark circle */}
      <circle cx="32" cy="38" r="9" fill="#090d16" stroke="#334155" strokeWidth="1.2" />
      <circle cx="32" cy="38" r="5.5" fill="#1e3a8a" />
      <circle cx="32" cy="38" r="3" fill="#020617" />
      {/* Lens reflection */}
      <ellipse cx="30.5" cy="36" rx="1.5" ry="0.9" fill="#93c5fd" opacity="0.9" />
      {/* IR dots */}
      <circle cx="26" cy="32" r="1" fill="#ef4444" opacity="0.75" />
      <circle cx="38" cy="32" r="1" fill="#ef4444" opacity="0.75" />
      <defs>
        <radialGradient id="ptzSphereGrad" cx="28" cy="30" r="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Bullet Camera (LPR CAMERA / ANPR) */
export function BulletCamerasSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Wall mount on right */}
      <rect x="52" y="24" width="4" height="18" rx="2" fill="#94a3b8" />
      <path d="M52 33h-8v4h8z" fill="#cbd5e1" />
      <circle cx="44" cy="35" r="3" fill="#64748b" />
      {/* Bracket arm pointing to body */}
      <path d="M44 35l-10-5" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      {/* Top sunshield / visor extended over front */}
      <path d="M6 23l32-4c1.5-.2 2.8.8 3 2.2l.6 4.8L8 28z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
      {/* Main bullet camera cylindrical body */}
      <rect x="9" y="26" width="30" height="15" rx="3" fill="url(#bulletGrad)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Front dark lens glass facing left */}
      <ellipse cx="9" cy="33.5" rx="3" ry="7.5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
      <ellipse cx="9" cy="33.5" rx="1.5" ry="4" fill="#1e3a8a" />
      <ellipse cx="8.5" cy="32" rx="0.8" ry="1.5" fill="#93c5fd" opacity="0.9" />
      <defs>
        <linearGradient id="bulletGrad" x1="10" y1="26" x2="39" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** NVR / DVR */
export function NvrDvrSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="22" width="52" height="22" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <rect x="8" y="24" width="48" height="18" rx="2" fill="#1e293b" />
      <circle cx="16" cy="33" r="4.5" fill="#020617" stroke="#475569" strokeWidth="1" />
      <circle cx="16" cy="33" r="2.5" fill="#06b6d4" opacity="0.8" />
      <circle cx="26" cy="33" r="1.5" fill="#10b981" />
      <circle cx="31" cy="33" r="1.5" fill="#3b82f6" />
      <rect x="40" y="30" width="10" height="3" rx="0.5" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
      <rect x="40" y="35" width="10" height="1.5" rx="0.5" fill="#475569" />
    </svg>
  );
}

/** Network Switches */
export function NetworkSwitchSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="20" width="52" height="24" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
      <rect x="8" y="22" width="48" height="20" rx="3" fill="#1e1b4b" />
      {[12, 18, 24, 30, 36, 42, 48].map((x, i) => (
        <g key={`p1-${i}`}>
          <rect x={x} y="25" width="4" height="4" rx="0.8" fill="#818cf8" />
          <circle cx={x + 2} cy="24" r="0.8" fill={i % 2 === 0 ? '#34d399' : '#38bdf8'} />
        </g>
      ))}
      {[12, 18, 24, 30, 36, 42, 48].map((x, i) => (
        <g key={`p2-${i}`}>
          <rect x={x} y="33" width="4" height="4" rx="0.8" fill="#818cf8" />
          <circle cx={x + 2} cy="38" r="0.8" fill={i % 3 === 0 ? '#fbbf24' : '#34d399'} />
        </g>
      ))}
    </svg>
  );
}

/** Routers */
export function RouterSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Two Antennas */}
      <line x1="20" y1="32" x2="16" y2="14" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="32" x2="48" y2="14" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="14" r="1.5" fill="#334155" />
      <circle cx="48" cy="14" r="1.5" fill="#334155" />
      {/* Router chassis body */}
      <rect x="8" y="30" width="48" height="16" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Front dark strip with LED lights */}
      <rect x="12" y="34" width="40" height="8" rx="2" fill="#1e293b" />
      <circle cx="18" cy="38" r="1.2" fill="#10b981" />
      <circle cx="23" cy="38" r="1.2" fill="#10b981" />
      <circle cx="28" cy="38" r="1.2" fill="#10b981" />
      <circle cx="33" cy="38" r="1.2" fill="#10b981" />
      <circle cx="38" cy="38" r="1.2" fill="#06b6d4" />
      <circle cx="43" cy="38" r="1.2" fill="#3b82f6" />
    </svg>
  );
}

/** Fiber Links (Optical Fibre) */
export function FiberLinkSvg({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Connector sleeve on bottom left */}
      <path d="M12 48l9 9c1.5 1.5 4 1.5 5.5 0l4.5-4.5L16.5 38l-4.5 4.5c-1.5 1.5-1.5 4 0 5.5z" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
      <path d="M19 41l10 10" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="23" y="37" width="4" height="6" rx="1" transform="rotate(-45 23 37)" fill="#0ea5e9" />
      {/* Glowing fiber strands fanning up and to the right */}
      <path d="M26 40C32 38 41 27 45 15" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M25 38C32 33 38 22 40 11" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 36C28 29 32 17 33 9" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M28 42C37 42 46 34 52 21" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 44C41 45 49 39 55 29" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      {/* Glowing bright points at strand tips */}
      <circle cx="45" cy="15" r="2.2" fill="#7dd3fc" />
      <circle cx="45" cy="15" r="1.2" fill="#ffffff" />
      <circle cx="40" cy="11" r="2.2" fill="#7dd3fc" />
      <circle cx="40" cy="11" r="1.2" fill="#ffffff" />
      <circle cx="33" cy="9" r="2.2" fill="#7dd3fc" />
      <circle cx="33" cy="9" r="1.2" fill="#ffffff" />
      <circle cx="52" cy="21" r="2.2" fill="#7dd3fc" />
      <circle cx="52" cy="21" r="1.2" fill="#ffffff" />
      <circle cx="55" cy="29" r="2.2" fill="#7dd3fc" />
      <circle cx="55" cy="29" r="1.2" fill="#ffffff" />
    </svg>
  );
}

/** UPS / Power */
export function UpsPowerSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Red battery pack body */}
      <rect x="18" y="14" width="28" height="38" rx="4" fill="#dc2626" stroke="#ef4444" strokeWidth="1.5" />
      {/* Beveled display window */}
      <rect x="22" y="18" width="20" height="14" rx="2" fill="#991b1b" />
      {/* Battery / lightning bolt */}
      <path d="M33 21l-4 5h4l-2 5 6-6h-4z" fill="#fef08a" />
      {/* Bottom status vents & LED */}
      <line x1="23" y1="38" x2="41" y2="38" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23" y1="42" x2="41" y2="42" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="47" r="1.5" fill="#22c55e" />
    </svg>
  );
}

/** Access Control (Security Door) */
export function AccessControlSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Door frame */}
      <rect x="14" y="10" width="36" height="46" rx="2" fill="none" stroke="#f8fafc" strokeWidth="2.5" />
      {/* Open door swinging inward */}
      <path d="M28 12l18 4v34l-18 4V12z" fill="#f8fafc" opacity="0.9" />
      {/* Door handle / lock */}
      <circle cx="32" cy="34" r="1.5" fill="#0f172a" />
      {/* Floor access threshold */}
      <line x1="10" y1="56" x2="54" y2="56" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** LED TV / Monitor Display */
export function LedTvSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Screen Frame */}
      <rect x="8" y="14" width="48" height="32" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
      {/* Inner Screen Display (Blue Glow) */}
      <rect x="11" y="17" width="42" height="26" rx="2" fill="#0f172a" />
      <circle cx="32" cy="30" r="7" fill="#0284c7" opacity="0.3" />
      <circle cx="32" cy="30" r="5" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="20 10" />
      <circle cx="32" cy="30" r="2" fill="#38bdf8" />
      {/* TV Stand / Base */}
      <path d="M28 46h8v4h-8z" fill="#64748b" />
      <rect x="22" y="50" width="20" height="3" rx="1.5" fill="#475569" />
    </svg>
  );
}

/** Default Hardware */
export function DefaultHardwareSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="14" width="40" height="36" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="3" fill="#60a5fa" />
      <circle cx="22" cy="42" r="1.5" fill="#10b981" />
      <circle cx="28" cy="42" r="1.5" fill="#3b82f6" />
      <rect x="36" y="41" width="8" height="2" rx="1" fill="#64748b" />
    </svg>
  );
}

/**
 * Intelligent helper to pick the right visual component and link flag based on category name
 */
export function getEquipmentVisual(name = '') {
  const n = (name || '').toLowerCase();
  if (n.includes('ptz')) {
    return { Component: PtzCamerasSvg, label: 'PTZ Cameras', isLink: false };
  }
  if (n.includes('anpr')) {
    return { Component: BulletCamerasSvg, label: 'ANPR Cameras', isLink: false };
  }
  if (n.includes('lpr')) {
    return { Component: BulletCamerasSvg, label: 'LPR Cameras', isLink: false };
  }
  if (n.includes('thermal')) {
    return { Component: BulletCamerasSvg, label: 'Thermal Cameras', isLink: false };
  }
  if (n.includes('bullet')) {
    return { Component: BulletCamerasSvg, label: 'Bullet Cameras', isLink: false };
  }
  if (n.includes('fixed') || n.includes('dome') || n.includes('cctv') || n.includes('camera')) {
    return { Component: FixedCamerasSvg, label: 'Fixed Cameras', isLink: false };
  }
  if (n.includes('nvr') || n.includes('dvr') || n.includes('recorder')) {
    return { Component: NvrDvrSvg, label: 'NVR / DVR', isLink: false };
  }
  if (n.includes('switch') || n.includes('network')) {
    return { Component: NetworkSwitchSvg, label: 'Network Switches', isLink: false };
  }
  if (n.includes('router') || n.includes('gateway') || n.includes('wifi')) {
    return { Component: RouterSvg, label: 'Routers', isLink: false };
  }
  if (n.includes('fiber') || n.includes('optical') || n.includes('link') || n.includes('cable')) {
    return { Component: FiberLinkSvg, label: 'Fiber Links', isLink: true };
  }
  if (n.includes('tv') || n.includes('led') || n.includes('display') || n.includes('monitor') || n.includes('screen')) {
    return { Component: LedTvSvg, label: 'LED TV', isLink: false };
  }
  if (n.includes('ups') || n.includes('power') || n.includes('battery')) {
    return { Component: UpsPowerSvg, label: 'UPS / Power', isLink: false };
  }
  if (n.includes('access') || n.includes('door') || n.includes('gate') || n.includes('biometric') || n.includes('entry')) {
    return { Component: AccessControlSvg, label: 'Access Control', isLink: false };
  }
  return { Component: DefaultHardwareSvg, label: name || 'Equipment', isLink: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Badge Icons (Crisp white vector icons for circular summary cards)
// ─────────────────────────────────────────────────────────────────────────────

export function CameraBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 13.5V10c0-1.1.9-2 2-2h9l5-3v14l-5-3H4c-1.1 0-2-.9-2-2v-2.5z" fill="currentColor" fillOpacity="0.18" />
      <circle cx="8" cy="12" r="2.5" strokeWidth="2" />
      <path d="M7 17l-3 3" />
      <path d="M2 20h6" />
    </svg>
  );
}

export function NvrBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="7" rx="2" fill="currentColor" fillOpacity="0.18" />
      <rect x="2" y="13" width="20" height="7" rx="2" fill="currentColor" fillOpacity="0.18" />
      <circle cx="6" cy="7.5" r="1" fill="currentColor" />
      <circle cx="6" cy="16.5" r="1" fill="currentColor" />
      <line x1="10" y1="7.5" x2="18" y2="7.5" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="16.5" x2="18" y2="16.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SwitchBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2.5" fill="currentColor" fillOpacity="0.18" />
      <circle cx="6" cy="12" r="1.2" fill="currentColor" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function RouterBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="7" y1="13" x2="7" y2="4" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="13" x2="17" y2="4" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="12" width="18" height="8" rx="2.5" fill="currentColor" fillOpacity="0.18" />
      <circle cx="7.5" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="16.5" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function FiberBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20l5-5" strokeWidth="3" />
      <path d="M8 16c4-1 8-6 10-12" strokeWidth="2" />
      <path d="M9 15c4 0 7-3 11-7" strokeWidth="2" />
      <path d="M10 14c5 1 8 0 11-2" strokeWidth="2" />
      <circle cx="18" cy="4" r="1.2" fill="currentColor" />
      <circle cx="20" cy="8" r="1.2" fill="currentColor" />
      <circle cx="21" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function UpsBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="4" width="14" height="16" rx="2.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M13 8l-3 4h3l-2 4 5-5h-3l2-3z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

export function AccessBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17" />
      <path d="M9 5l7 2v12l-7 2V5z" fill="currentColor" fillOpacity="0.25" />
      <circle cx="11.5" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

export function DefaultBadgeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

/**
 * Maps category name to colored round badge styles & icons
 */
import { CATEGORY_COLORS } from '../../../../tokens';

const CATEGORY_BG_MAP = {
  cameras:       'bg-emerald-500',
  nvr:           'bg-blue-600',
  switches:      'bg-purple-600',
  routers:       'bg-teal-500',
  fiber:         'bg-amber-500',
  ups:           'bg-rose-500',
  accessControl: 'bg-indigo-600',
  default:       'bg-blue-600',
};

const CATEGORY_ICON_MAP = {
  cameras:       CameraBadgeIcon,
  nvr:           NvrBadgeIcon,
  switches:      SwitchBadgeIcon,
  routers:       RouterBadgeIcon,
  fiber:         FiberBadgeIcon,
  ups:           UpsBadgeIcon,
  accessControl: AccessBadgeIcon,
  default:       DefaultBadgeIcon,
};

const CATEGORY_LABEL_MAP = {
  cameras:       'Total Cameras',
  nvr:           'NVR / DVR',
  switches:      'Network Switches',
  routers:       'Routers',
  fiber:         'Fiber Links',
  ups:           'UPS / Power',
  accessControl: 'Access Control',
};

export function getCategoryBadgeConfig(name = '') {
  const n = (name || '').toLowerCase();
  let key = 'default';
  if (n.includes('camera') || n.includes('cctv'))          key = 'cameras';
  else if (n.includes('nvr') || n.includes('dvr') || n.includes('recorder') || n.includes('storage')) key = 'nvr';
  else if (n.includes('switch') || n.includes('lan'))       key = 'switches';
  else if (n.includes('router') || n.includes('wifi') || n.includes('gateway')) key = 'routers';
  else if (n.includes('fiber') || n.includes('optical') || n.includes('link') || n.includes('cable')) key = 'fiber';
  else if (n.includes('ups') || n.includes('power') || n.includes('battery'))  key = 'ups';
  else if (n.includes('access') || n.includes('door') || n.includes('entry') || n.includes('gate')) key = 'accessControl';

  return {
    bgClass: CATEGORY_BG_MAP[key],
    color: CATEGORY_COLORS[key].bg,
    Icon: CATEGORY_ICON_MAP[key],
    defaultLabel: CATEGORY_LABEL_MAP[key] || name || 'Equipment',
    isLink: key === 'fiber',
  };
}
