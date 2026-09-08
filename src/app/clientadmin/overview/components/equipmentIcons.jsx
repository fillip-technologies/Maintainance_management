import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Realistic SVG Illustrations for Equipment Details (matching dashboard design)
// ─────────────────────────────────────────────────────────────────────────────

/** Dome Camera (Fixed Cameras) */
export function FixedCamerasSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer base mount */}
      <ellipse cx="32" cy="18" rx="26" ry="6" fill="#1e293b" />
      <ellipse cx="32" cy="16" rx="26" ry="6" fill="#cbd5e1" />
      <path d="M6 16v4c0 3.3 11.6 6 26 6s26-2.7 26-6v-4C58 19.3 46.4 22 32 22S6 19.3 6 16z" fill="#94a3b8" />
      {/* Inner dark bubble / dome */}
      <path d="M12 20C12 33 21 44 32 44s20-11 20-24c0-1.5-.5-3-1.5-4.2C44.5 20 38.5 21 32 21s-12.5-1-18.5-5.2C12.5 17 12 18.5 12 20z" fill="url(#domeGrad)" />
      {/* Camera gimbal / lens module */}
      <circle cx="32" cy="31" r="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <circle cx="32" cy="31" r="6" fill="#020617" />
      <circle cx="32" cy="31" r="3.5" fill="#1e3a8a" />
      {/* Lens reflection / glare */}
      <ellipse cx="30" cy="29" rx="1.5" ry="1" fill="#93c5fd" opacity="0.85" />
      <path d="M16 23c2 8 8 15 16 15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <defs>
        <radialGradient id="domeGrad" cx="32" cy="22" r="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#475569" />
          <stop offset="0.6" stopColor="#1e293b" />
          <stop offset="1" stopColor="#090d16" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** PTZ Camera */
export function PtzCamerasSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top mounting plate */}
      <rect x="22" y="6" width="20" height="4" rx="2" fill="#cbd5e1" />
      <path d="M28 10h8v4h-8z" fill="#94a3b8" />
      {/* PTZ Neck / yoke */}
      <path d="M26 14h12c3 0 5 2 5 5v3H21v-3c0-3 2-5 5-5z" fill="#e2e8f0" />
      {/* Rotating sphere */}
      <circle cx="32" cy="34" r="16" fill="url(#ptzGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Lower optical lens area */}
      <ellipse cx="32" cy="36" rx="8" ry="8" fill="#020617" stroke="#334155" strokeWidth="1" />
      <circle cx="32" cy="36" r="4.5" fill="#1e3a8a" />
      <circle cx="32" cy="36" r="2.5" fill="#0f172a" />
      <circle cx="30.5" cy="34.5" r="1" fill="#60a5fa" />
      {/* PTZ IR LEDs */}
      <circle cx="27" cy="29" r="1" fill="#ef4444" opacity="0.8" />
      <circle cx="37" cy="29" r="1" fill="#ef4444" opacity="0.8" />
      <defs>
        <radialGradient id="ptzGrad" cx="28" cy="28" r="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Bullet Camera (ANPR / Thermal / LPR) */
export function BulletCamerasSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Wall / pole mount bracket on right */}
      <rect x="52" y="24" width="4" height="18" rx="2" fill="#94a3b8" />
      <path d="M52 33h-8v4h8z" fill="#cbd5e1" />
      <circle cx="44" cy="35" r="3" fill="#64748b" />
      {/* Connecting arm */}
      <path d="M44 35l-10-6" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      {/* Sunshield / top hood */}
      <path d="M8 22l30-4c1.5-.2 3 .8 3.2 2.3l.5 3.7L10 27z" fill="#e2e8f0" />
      {/* Main bullet camera body */}
      <path d="M11 25h28c2.2 0 4 1.8 4 4v9c0 2.2-1.8 4-4 4H11c-2.2 0-4-1.8-4-4v-9c0-2.2 1.8-4 4-4z" fill="url(#bulletGrad)" stroke="#cbd5e1" strokeWidth="1" />
      {/* Front lens ring & glass */}
      <ellipse cx="11" cy="31.5" rx="3" ry="8.5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
      <ellipse cx="11" cy="31.5" rx="1.5" ry="4.5" fill="#1e3a8a" />
      <ellipse cx="10" cy="30" rx="0.7" ry="1.5" fill="#93c5fd" opacity="0.9" />
      <defs>
        <linearGradient id="bulletGrad" x1="10" y1="25" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** NVR / DVR */
export function NvrDvrSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Chassis Body */}
      <rect x="6" y="22" width="52" height="22" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      {/* Front bezel edge */}
      <rect x="8" y="24" width="48" height="18" rx="2" fill="#1e293b" />
      {/* Left indicator ring / display */}
      <circle cx="16" cy="33" r="4.5" fill="#020617" stroke="#475569" strokeWidth="1" />
      <circle cx="16" cy="33" r="2.5" fill="#06b6d4" opacity="0.8" />
      <circle cx="26" cy="33" r="1.5" fill="#10b981" />
      <circle cx="31" cy="33" r="1.5" fill="#3b82f6" />
      {/* Right side USB ports & drive bays */}
      <rect x="40" y="30" width="10" height="3" rx="0.5" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
      <rect x="40" y="35" width="10" height="1.5" rx="0.5" fill="#475569" />
    </svg>
  );
}

/** Network Switches */
export function NetworkSwitchSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Switch body */}
      <rect x="6" y="20" width="52" height="24" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
      <rect x="8" y="22" width="48" height="20" rx="3" fill="#1e1b4b" />
      {/* Port row 1 */}
      {[12, 18, 24, 30, 36, 42, 48].map((x, i) => (
        <g key={`p1-${i}`}>
          <rect x={x} y="25" width="4" height="4" rx="0.8" fill="#818cf8" />
          <circle cx={x + 2} cy="24" r="0.8" fill={i % 2 === 0 ? '#34d399' : '#38bdf8'} />
        </g>
      ))}
      {/* Port row 2 */}
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
export function RouterSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Two Antennas */}
      <line x1="18" y1="32" x2="14" y2="12" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="32" x2="50" y2="12" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      {/* Router chassis */}
      <rect x="10" y="30" width="44" height="14" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="12" y="32" width="40" height="10" rx="2" fill="#e2e8f0" />
      {/* LED indicators */}
      <circle cx="18" cy="37" r="1.5" fill="#10b981" />
      <circle cx="24" cy="37" r="1.5" fill="#10b981" />
      <circle cx="30" cy="37" r="1.5" fill="#10b981" />
      <circle cx="36" cy="37" r="1.5" fill="#3b82f6" />
      <circle cx="42" cy="37" r="1.5" fill="#10b981" />
    </svg>
  );
}

/** Fiber Links */
export function FiberLinkSvg({ className = 'w-14 h-14' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Ferrule / jacket base angled */}
      <path d="M14 46l8 8c1.5 1.5 4 1.5 5.5 0l4-4-13.5-13.5-4 4c-1.5 1.5-1.5 4 0 5.5z" fill="#334155" stroke="#475569" strokeWidth="1.2" />
      <path d="M22 36l10 10" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
      {/* Glowing fiber strands fanning out */}
      <path d="M28 40C34 38 42 28 46 16" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 38C33 34 39 23 41 12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M25 36C30 30 34 18 34 10" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 42C38 42 46 34 52 22" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 44C42 46 50 40 56 30" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      {/* Bright glowing dots at fiber tips */}
      <circle cx="46" cy="16" r="2" fill="#ffffff" />
      <circle cx="41" cy="12" r="2" fill="#ffffff" />
      <circle cx="34" cy="10" r="2" fill="#ffffff" />
      <circle cx="52" cy="22" r="2" fill="#ffffff" />
      <circle cx="56" cy="30" r="2" fill="#ffffff" />
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
  if (n.includes('ups') || n.includes('power') || n.includes('battery')) {
    return { Component: UpsPowerSvg, label: 'UPS / Power', isLink: false };
  }
  if (n.includes('access') || n.includes('door') || n.includes('gate') || n.includes('biometric') || n.includes('entry')) {
    return { Component: AccessControlSvg, label: 'Access Control', isLink: false };
  }
  return { Component: DefaultHardwareSvg, label: name || 'Equipment', isLink: false };
}
