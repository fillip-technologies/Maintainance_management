import apiClient from './apiClient';
import { getAllZones, getZoneById, getZoneDescendants } from './zonesApi';
import { getAllDevices } from './devicesApi';
import { getAllIssues } from './issuesApi';
import { getDailyLogs } from './dailyLogsApi';

// ─────────────────────────────────────────────
// EQUIPMENT BOARD — GET /dashboard/board
// ─────────────────────────────────────────────
// Query: scope ('zone' | 'client' | 'platform'), id, categoryId?
// Response:
// {
//   generatedAt, today,
//   zones:      [{ id, name, parentZoneId, logoUrl, status, clientId }],
//   categories: [{ id, name, code, imageUrl }],
//   devices:    [{ id, code, name, location, status, imageUrl, zoneId, categoryId, productType,
//                  todayLog: { status, notes } | null, lastLogDate, openIssues,
//                  issue: { id, priority, status, description, category, technician, createdAt, updatedAt } | null }]
// }
//
// If the backend predates /dashboard/board (404), the same shape is composed
// from the existing list endpoints so the UI keeps working during rollout.
// ─────────────────────────────────────────────

const OPEN = ['open', 'assigned', 'in_progress', 'on_hold', 'reopened'];
const RANK = { critical: 4, high: 3, medium: 2, low: 1 };

export async function getBoard({ scope = 'client', id, categoryId } = {}) {
  const params = new URLSearchParams({ scope });
  if (id) params.set('id', id);
  if (categoryId) params.set('categoryId', categoryId);
  try {
    const res = await apiClient.request(`/dashboard/board?${params}`, { method: 'GET' });
    if (res?.data?.devices) return res.data;
    return composeBoard({ scope, id, categoryId });
  } catch (err) {
    if (err?.status === 404 || err?.code === 'NOT_FOUND') return composeBoard({ scope, id, categoryId });
    throw err;
  }
}

async function getTodayLogs() {
  const date = new Date().toISOString().slice(0, 10);
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const res = await getDailyLogs({ date, page, limit: 100 });
    all.push(...(res?.items ?? []));
    if (!res?.totalPages || page >= res.totalPages) break;
  }
  return all;
}

async function composeBoard({ scope, id, categoryId }) {
  let zones;
  if (scope === 'zone' && id) {
    const [root, desc] = await Promise.all([getZoneById(id), getZoneDescendants(id)]);
    zones = [root, ...(Array.isArray(desc) ? desc : desc?.items ?? [])].filter(Boolean);
  } else {
    zones = await getAllZones(scope === 'client' && id ? { clientId: id } : {});
  }
  const zoneIds = new Set(zones.map((z) => z.id));

  const [devices, issues, logs] = await Promise.all([
    getAllDevices(),
    getAllIssues({ status: OPEN.join(',') }).catch(() => []),
    getTodayLogs().catch(() => []),
  ]);

  const scoped = devices.filter(
    (d) => d.zoneId && d.status !== 'retired' && (scope === 'platform' || zoneIds.has(d.zoneId))
      && (!categoryId || d.categoryId === categoryId),
  );
  const logByDevice = new Map(logs.map((l) => [l.deviceId ?? l.device?.id, l]));
  const issuesByDevice = new Map();
  for (const i of issues) {
    if (!OPEN.includes(i.status)) continue;
    const key = i.deviceId ?? i.device?.id;
    if (!issuesByDevice.has(key)) issuesByDevice.set(key, []);
    issuesByDevice.get(key).push(i);
  }

  const categories = new Map();
  const rows = scoped.map((d) => {
    if (d.category && d.categoryId) categories.set(d.categoryId, { id: d.categoryId, name: d.category.name, code: d.category.code, imageUrl: d.category.imageUrl ?? null });
    const list = (issuesByDevice.get(d.id) ?? []).sort(
      (a, b) => (RANK[b.priority] ?? 0) - (RANK[a.priority] ?? 0) || new Date(a.createdAt) - new Date(b.createdAt),
    );
    const top = list[0];
    const log = logByDevice.get(d.id);
    return {
      id: d.id, code: d.code, name: d.name, location: d.location, status: d.status, imageUrl: d.imageUrl ?? null,
      zoneId: d.zoneId, categoryId: d.categoryId, productType: d.productType?.name ?? null,
      todayLog: log ? { status: log.status, notes: log.notes ?? null } : null,
      lastLogDate: log?.logDate ?? null,
      openIssues: list.length,
      issue: top ? {
        id: top.id, priority: top.priority, status: top.status, description: top.description,
        category: top.category?.name ?? null, technician: top.assignedTechnician?.user?.name ?? null,
        createdAt: top.createdAt, updatedAt: top.updatedAt,
      } : null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    today: new Date().toISOString().slice(0, 10),
    zones: zones.map(({ id: zid, name, parentZoneId, logoUrl, status, clientId }) => ({ id: zid, name, parentZoneId, logoUrl, status, clientId })),
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    devices: rows,
  };
}
