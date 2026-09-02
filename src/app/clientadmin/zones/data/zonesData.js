// ─────────────────────────────────────────────
//  Static mock data for the Zones section
//  Replace with real API calls when backend is ready
// ─────────────────────────────────────────────

export const ZONE_COLORS = [
  { gradient: "from-indigo-500 to-violet-600",   light: "bg-indigo-50",   text: "text-indigo-700",   border: "border-indigo-200",   badge: "bg-indigo-100 text-indigo-800",   dot: "bg-indigo-500"   },
  { gradient: "from-emerald-500 to-teal-600",    light: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  badge: "bg-emerald-100 text-emerald-800",  dot: "bg-emerald-500"  },
  { gradient: "from-amber-500 to-orange-600",    light: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",    badge: "bg-amber-100 text-amber-800",    dot: "bg-amber-500"    },
  { gradient: "from-sky-500 to-cyan-600",        light: "bg-sky-50",      text: "text-sky-700",      border: "border-sky-200",      badge: "bg-sky-100 text-sky-800",      dot: "bg-sky-500"      },
  { gradient: "from-rose-500 to-pink-600",       light: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-200",     badge: "bg-rose-100 text-rose-800",     dot: "bg-rose-500"     },
  { gradient: "from-purple-500 to-fuchsia-600",  light: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200",   badge: "bg-purple-100 text-purple-800",   dot: "bg-purple-500"   },
  { gradient: "from-lime-500 to-green-600",      light: "bg-lime-50",     text: "text-lime-700",     border: "border-lime-200",     badge: "bg-lime-100 text-lime-800",     dot: "bg-lime-500"     },
  { gradient: "from-orange-500 to-red-600",      light: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200",   badge: "bg-orange-100 text-orange-800",   dot: "bg-orange-500"   },
  { gradient: "from-teal-500 to-emerald-600",    light: "bg-teal-50",     text: "text-teal-700",     border: "border-teal-200",     badge: "bg-teal-100 text-teal-800",     dot: "bg-teal-500"     },
  { gradient: "from-blue-500 to-indigo-600",     light: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",     badge: "bg-blue-100 text-blue-800",     dot: "bg-blue-500"     },
];

const WING_NAMES = [
  "North Wing", "South Wing", "East Block", "West Block",
  "Central Hub", "Annex A",   "Annex B",   "Rooftop Level",
  "Basement",   "Ground Floor",
];

// Product counts per subzone index (working / notWorking / maintenance)
const SZ_WORKING     = [8, 6, 12, 5, 9, 7, 0, 11, 5, 8];
const SZ_NOT_WORKING = [2, 1,  2, 1, 1, 1, 0,  2, 1, 1];
const SZ_MAINTENANCE = [2, 1,  1, 1, 1, 1, 4,  1, 0, 1];

const SZ_STATUSES  = ["active","active","active","active","active","active","maintenance","active","active","standby"];
const SZ_FLOORS    = ["Floor 1","Floor 2","Floor 3","Floor 4","Floor 1","Floor 2","Floor 3","Floor 4","Floor 1","Floor 2"];
const SZ_INCHARGE  = ["Alice","Bob","Carol","David","Eve","Frank","Grace","Henry","Iris","James"];

export function buildZones() {
  return Array.from({ length: 10 }, (_, zi) => {
    const zNum  = zi + 1;
    const color = ZONE_COLORS[zi];

    const subzones = Array.from({ length: 10 }, (_, si) => ({
      id:          `Z${zNum}-SZ${si + 1}`,
      name:        `Sub-Zone ${zNum}.${si + 1}`,
      floor:       SZ_FLOORS[si],
      incharge:    SZ_INCHARGE[si],
      status:      SZ_STATUSES[si],      // 'active' | 'maintenance' | 'standby'
      working:     SZ_WORKING[si],
      notWorking:  SZ_NOT_WORKING[si],
      maintenance: SZ_MAINTENANCE[si],
      total:       SZ_WORKING[si] + SZ_NOT_WORKING[si] + SZ_MAINTENANCE[si],
    }));

    return {
      id:          `ZONE-${zNum}`,
      zoneNumber:  zNum,
      name:        `Zone ${zNum}`,
      wing:        WING_NAMES[zi],
      label:       `Zone ${zNum} — ${WING_NAMES[zi]}`,
      color,
      subzones,
      totalWorking:     subzones.reduce((s, z) => s + z.working, 0),
      totalNotWorking:  subzones.reduce((s, z) => s + z.notWorking, 0),
      totalMaintenance: subzones.reduce((s, z) => s + z.maintenance, 0),
      activeCount: subzones.filter(z => z.status === "active").length,
      coverage:    `${zNum * 800 + 200} sq ft`,
      status:      zNum === 7 ? "maintenance" : "operational",
    };
  });
}

export const ALL_ZONES = buildZones();
