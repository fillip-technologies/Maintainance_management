// ─────────────────────────────────────────────
//  Static mock data for the Zones section
//  Replace with real API calls when backend is ready
// ─────────────────────────────────────────────

import { ZONE_GRADIENTS } from '../../../../tokens';

export const ZONE_COLORS = ZONE_GRADIENTS.map((g) => ({
  gradient: g.gradient.replace('/80', '').replace('/60', ''),
  light: g.badge,
  text: g.text,
  border: g.border.replace('border-', ''),
  badge: `${g.badge} ${g.text}`,
  dot: g.dot,
}));

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
