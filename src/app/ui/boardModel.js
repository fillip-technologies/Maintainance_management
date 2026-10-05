import { tallyHealth, healthOf, byUrgency } from './status';

/**
 * Pure helpers over a board payload ({ zones, categories, devices }).
 * Everything the overview/board screens show is derived here, so the numbers
 * on every screen agree with each other.
 */

export function indexZones(zones = []) {
  const byId = new Map(zones.map((z) => [z.id, z]));
  const children = new Map();
  for (const z of zones) {
    const key = z.parentZoneId && byId.has(z.parentZoneId) ? z.parentZoneId : '__root__';
    if (!children.has(key)) children.set(key, []);
    children.get(key).push(z);
  }
  for (const list of children.values()) list.sort((a, b) => a.name.localeCompare(b.name));
  return { byId, children, roots: children.get('__root__') ?? [] };
}

/** Walk up until the parent is `stopAt` (or the top) — the "bucket" a zone rolls into. */
export function bucketOf(zoneId, byId, stopAt = null) {
  let z = byId.get(zoneId);
  if (!z) return null;
  if (z.id === stopAt) return z;
  while (z.parentZoneId && byId.has(z.parentZoneId) && z.parentZoneId !== stopAt) {
    z = byId.get(z.parentZoneId);
  }
  return z;
}

/** Breadcrumb path from the root down to a zone. */
export function zonePath(zoneId, byId) {
  const out = [];
  let z = byId.get(zoneId);
  while (z) { out.unshift(z); z = z.parentZoneId ? byId.get(z.parentZoneId) : null; }
  return out;
}

export function subtreeIds(zoneId, children) {
  const out = [zoneId];
  for (let i = 0; i < out.length; i++) for (const c of children.get(out[i]) ?? []) out.push(c.id);
  return out;
}

/** Per-category tallies, worst-first then by size. */
export function categoryTallies(board) {
  const cats = new Map((board?.categories ?? []).map((c) => [c.id, { ...c, devices: [] }]));
  const none = { id: null, name: 'Other equipment', code: '', devices: [] };
  for (const d of board?.devices ?? []) {
    const c = d.categoryId && cats.get(d.categoryId);
    (c || none).devices.push(d);
  }
  const list = [...cats.values()];
  if (none.devices.length) list.push(none);
  return list
    .filter((c) => c.devices.length)
    .map((c) => ({ ...c, tally: tallyHealth(c.devices) }))
    .sort((a, b) => (b.tally.down + b.tally.fix) - (a.tally.down + a.tally.fix) || b.tally.total - a.tally.total);
}

/**
 * Roll devices up into "buckets" — top-level locations for a client view, or
 * direct areas of a zone for a location view. Returns buckets with a tally and
 * a per-category tally (for the little icon row on each location).
 */
export function locationRollup(board, { rootId = null } = {}) {
  const { byId, children } = indexZones(board?.zones);
  const buckets = new Map();
  const ensure = (z) => {
    if (!buckets.has(z.id)) buckets.set(z.id, { zone: z, devices: [], areas: (children.get(z.id) ?? []).length });
    return buckets.get(z.id);
  };
  if (rootId) for (const c of children.get(rootId) ?? []) ensure(c);
  else for (const r of indexZones(board?.zones).roots) ensure(r);

  for (const d of board?.devices ?? []) {
    const b = bucketOf(d.zoneId, byId, rootId);
    if (b) ensure(b).devices.push(d);
  }
  const catName = new Map((board?.categories ?? []).map((c) => [c.id, c]));
  return [...buckets.values()]
    .map((b) => {
      const perCat = new Map();
      for (const d of b.devices) {
        const k = d.categoryId ?? '__none__';
        if (!perCat.has(k)) perCat.set(k, []);
        perCat.get(k).push(d);
      }
      return {
        ...b,
        tally: tallyHealth(b.devices),
        categories: [...perCat.entries()]
          .map(([k, ds]) => ({ id: k, name: catName.get(k)?.name ?? 'Other', tally: tallyHealth(ds) }))
          .sort((x, y) => y.tally.total - x.tally.total),
        issues: b.devices.filter((d) => d.issue).map((d) => ({ ...d.issue, device: d })).sort(byUrgency),
      };
    })
    .sort((a, b) => (b.tally.down * 3 + b.tally.fix) - (a.tally.down * 3 + a.tally.fix) || b.tally.total - a.tally.total);
}

/** All open problems on the board, most urgent first. */
export function openProblems(board) {
  const { byId } = indexZones(board?.zones);
  return (board?.devices ?? [])
    .filter((d) => d.issue)
    .map((d) => ({ ...d.issue, device: d, zone: byId.get(d.zoneId) ?? null, health: healthOf(d.status) }))
    .sort(byUrgency);
}
