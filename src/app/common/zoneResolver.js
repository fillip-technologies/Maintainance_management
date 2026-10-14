/**
 * Zone hierarchy resolver for Fixly frontend.
 * Resolves the authentic top-level Zone (e.g. "Hospital") and Sub-zone/Location (e.g. "Right Side Gallery")
 * based on live backend data and seed zone hierarchies.
 */

export const STATIC_SUBZONE_TO_PARENT = {
  // Hospital
  'outside main door': 'Hospital',
  'inside main door': 'Hospital',
  'right side gallery': 'Hospital',
  'left side gallery': 'Hospital',
  'laboratory room': 'Hospital',
  'pharmacy room': 'Hospital',
  'staff room': 'Hospital',
  "doctor's chamber-1": 'Hospital',
  "doctor's chamber-2": 'Hospital',
  'record room': 'Hospital',
  'equipment store room': 'Hospital',
  'nursery room': 'Hospital',
  'operation room': 'Hospital',
  'surgical room': 'Hospital',
  'x-ray room': 'Hospital',
  'observation room': 'Hospital',
  'ultrasound room': 'Hospital',
  'kraal no-4': 'Hospital',
  'kraal no-3': 'Hospital',
  'behind the hospital': 'Hospital',

  // Entrance Plaza
  'ticket counter': 'Entrance Plaza',
  'control room & ticket counter gallery': 'Entrance Plaza',
  'control room': 'Entrance Plaza',
  'interpecation room': 'Entrance Plaza',
  'vip room': 'Entrance Plaza',
  '180 theather': 'Entrance Plaza',
  'exibhition hall': 'Entrance Plaza',
  'entrance corridor': 'Entrance Plaza',
  'sapat stambh (web camera)': 'Entrance Plaza',
  'back side of ticket counter': 'Entrance Plaza',
  'nature safari bus shed (pick up)': 'Entrance Plaza',
  'bus shed': 'Entrance Plaza',

  // Safari Plaza
  'orientation room': 'Safari Plaza',
  'control room t/c': 'Safari Plaza',
  'administrative room': 'Safari Plaza',
  'corridor': 'Safari Plaza',
  'entry point': 'Safari Plaza',
  'pickup point': 'Safari Plaza',
  'drop point': 'Safari Plaza',

  // Bird Avivary
  'drain area': 'Bird Avivary',
  'pond area': 'Bird Avivary',
  'service corridor': 'Bird Avivary',
  'viewing deck upper corridor': 'Bird Avivary',
  'keeper room': 'Bird Avivary',
  'store room': 'Bird Avivary',
  "doctor's chamber": 'Bird Avivary',
  'equipment room': 'Bird Avivary',
  'children park': 'Bird Avivary',
  'near open theater': 'Bird Avivary',
  'near avivary sinageg bord': 'Bird Avivary',
  'near safari plaza road': 'Bird Avivary',

  // Carnivore Qurantine
  'main gate': 'Carnivore Qurantine',
  'gallery': 'Carnivore Qurantine',
  'kaaral no-02': 'Carnivore Qurantine',

  // Commissary
  'entrance vehicle': 'Commissary',
  'main entrance': 'Commissary',
  'office': 'Commissary',
  'kitchen room': 'Commissary',
  'gram soaking': 'Commissary',
  'fruits & veg room': 'Commissary',
  'husk store': 'Commissary',
  'mash preparation': 'Commissary',
  'mash item': 'Commissary',
  'beef': 'Commissary',
  'cold storage': 'Commissary',
  'cold storage gate': 'Commissary',

  // Herbivore Retiring Room
  'block-a': 'Herbivore Retiring Room',
  'block-b': 'Herbivore Retiring Room',
  'block-c': 'Herbivore Retiring Room',
  'kraal': 'Herbivore Retiring Room',
  'jarasandh gate': 'Herbivore Retiring Room',
  'mrigvihar gate': 'Herbivore Retiring Room',
  'dg-01': 'Herbivore Retiring Room',
  'dg-02': 'Herbivore Retiring Room',
  'fire station (mrigvihar gate)': 'Herbivore Retiring Room',

  // 04 No & 05 Parking / Stone Wall
  'main gate 04 no parking': '04 No & 05 Parking / Stone Wall',
  '04 no parking pole par (behind)': '04 No & 05 Parking / Stone Wall',
  'bathroom roof': '04 No & 05 Parking / Stone Wall',
  'road side n.h': '04 No & 05 Parking / Stone Wall',
  'road side n.h 4no & 5no (middle)': '04 No & 05 Parking / Stone Wall',
  '05 no (n.h) road': '04 No & 05 Parking / Stone Wall',
  '05 no parking stone wall': '04 No & 05 Parking / Stone Wall',
  'ticket counter cabin': '04 No & 05 Parking / Stone Wall',
  'gate no-3': '04 No & 05 Parking / Stone Wall',
  'gate no-1': '04 No & 05 Parking / Stone Wall',
  'gate no-2': '04 No & 05 Parking / Stone Wall',

  // Admin Block
  'director chamber': 'Admin Block',
  'deputy director chamber': 'Admin Block',
  'division office': 'Admin Block',
  'video conference hall': 'Admin Block',
  'library room': 'Admin Block',
  'main gate admin': 'Admin Block',
  'training area': 'Admin Block',
  'forester zone': 'Admin Block',
  'rof-1': 'Admin Block',
  'rof-2': 'Admin Block',
  'rof-3': 'Admin Block',
  'facility hall': 'Admin Block',
  'portico': 'Admin Block',

  // Big Cats
  'cell no.-01': 'Lion Retiring room',
  'cell no.-02': 'Lion Retiring room',
  'cell no.-03': 'Lion Retiring room',
  'behind of retiring room': 'Lion Retiring room',
  'dg keeper room': 'Lion Double Gate- 01',
  'gate 1st': 'Lion Double Gate- 01',
  'gate 2nd': 'Lion Double Gate- 01',
  'bus bay': 'Leopard Double Gate- 01',
  'in front of gate': 'Leopard Double Gate- 01',
  'behind of gate': 'Leopard Double Gate- 01',
};

/**
 * Resolves the top-level parent zone and optional sub-zone/location for any entity.
 *
 * @param {Object} entity - The replacement request, issue, or device
 * @param {Map<string, Object>|Array<Object>} [zones] - Live zones from backend API
 * @returns {{ zoneName: string, subZoneName: string|null, fullLabel: string }}
 */
export function resolveZoneHierarchy(entity, zones) {
  if (!entity) {
    return { zoneName: '', subZoneName: null, fullLabel: '' };
  }

  // Create lookup map if array passed
  let zoneMap = null;
  if (zones instanceof Map) {
    zoneMap = zones;
  } else if (Array.isArray(zones)) {
    zoneMap = new Map(zones.map((z) => [z.id || z._id || z.zoneId, z]));
  }

  const device = entity.issue?.device ?? entity.device ?? {};
  const zoneId =
    device.zoneId ??
    device.zone?.id ??
    entity.issue?.zoneId ??
    entity.issue?.zone?.id ??
    entity.zoneId ??
    entity.zone?.id ??
    null;

  const rawZoneName =
    device.zone?.name ??
    entity.issue?.device?.zone?.name ??
    entity.issue?.zone?.name ??
    device.subzone?.name ??
    device.location ??
    entity.zone?.name ??
    '';

  // 1. Resolve via live zoneMap hierarchy
  if (zoneId && zoneMap && zoneMap.has(zoneId)) {
    const curr = zoneMap.get(zoneId);
    if (curr) {
      if (curr.parentZoneId) {
        // Walk up to find root parent
        let root = curr;
        const visited = new Set();
        while (root.parentZoneId && !visited.has(root.id)) {
          visited.add(root.id);
          const parent = zoneMap.get(root.parentZoneId);
          if (!parent) break;
          root = parent;
        }

        const parentName = root.name || 'General Facility';
        const subName = curr.name !== root.name ? curr.name : null;
        return {
          zoneName: parentName,
          subZoneName: subName,
          fullLabel: subName ? `${parentName} · ${subName}` : parentName,
        };
      } else {
        // Already top-level zone
        const name = curr.name || 'General Facility';
        return {
          zoneName: name,
          subZoneName: null,
          fullLabel: name,
        };
      }
    }
  }

  // 2. Resolve via static sub-zone dictionary if raw name matches
  const normalizedRaw = (rawZoneName || '').trim().toLowerCase();
  if (normalizedRaw && STATIC_SUBZONE_TO_PARENT[normalizedRaw]) {
    const parentName = STATIC_SUBZONE_TO_PARENT[normalizedRaw];
    const subName = rawZoneName.trim();
    return {
      zoneName: parentName,
      subZoneName: subName,
      fullLabel: `${parentName} · ${subName}`,
    };
  }

  // 3. Inspect issue description for known "in <Parent> <Subzone>" pattern
  const desc = (entity.issue?.description || entity.description || '').toLowerCase();
  for (const [sub, parent] of Object.entries(STATIC_SUBZONE_TO_PARENT)) {
    if (desc.includes(sub)) {
      const formattedSub = sub.replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        zoneName: parent,
        subZoneName: formattedSub,
        fullLabel: `${parent} · ${formattedSub}`,
      };
    }
  }

  // 4. Fallback: use rawZoneName or General Facility
  const fallback = rawZoneName.trim() || 'General Facility';
  return {
    zoneName: fallback,
    subZoneName: null,
    fullLabel: fallback,
  };
}
