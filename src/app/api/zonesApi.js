import apiClient from './apiClient';

// ─────────────────────────────────────────────
// ZONES API — /zones
// ─────────────────────────────────────────────
// GET    /zones                           — paginated (clientId, parentZoneId, search)
// GET    /zones/:id                       — single zone
// POST   /zones                           — create zone
// PATCH  /zones/:id                       — update zone
// DELETE /zones/:id                       — delete zone (no children / devices)
// GET    /zones/:id/descendants           — full subtree (depth-first)
// GET    /zones/:id/assignments           — users assigned as zone_incharge / zone_staff
// POST   /zones/:id/assignments           — assign user to zone
// DELETE /zones/:id/assignments/:userId   — remove assignment
// ─────────────────────────────────────────────

export async function getZones({ clientId, parentZoneId, topLevel, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (clientId)     params.set('clientId', clientId);
  if (parentZoneId) params.set('parentZoneId', parentZoneId);
  if (topLevel)     params.set('topLevel', topLevel);
  if (search)       params.set('search', search);

  const res = await apiClient.request(`/zones?${params.toString()}`, { method: 'GET' });

  // Extract raw zone items from any possible backend response structure:
  let rawList = [];
  if (Array.isArray(res)) {
    rawList = res;
  } else if (Array.isArray(res?.data)) {
    rawList = res.data;
  } else if (Array.isArray(res?.data?.items)) {
    rawList = res.data.items;
  } else if (Array.isArray(res?.data?.zones)) {
    rawList = res.data.zones;
  } else if (Array.isArray(res?.data?.rows)) {
    rawList = res.data.rows;
  } else if (Array.isArray(res?.items)) {
    rawList = res.items;
  } else if (Array.isArray(res?.zones)) {
    rawList = res.zones;
  } else if (Array.isArray(res?.rows)) {
    rawList = res.rows;
  } else if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    const vals = Object.values(res.data);
    if (vals.length > 0 && typeof vals[0] === 'object' && (vals[0].name || vals[0].id || vals[0]._id)) {
      rawList = vals;
    }
  }

  // Normalize each zone entry to ensure id and name are always available
  const normalized = rawList.map((z, idx) => {
    if (!z || typeof z !== 'object') {
      return { id: String(idx), name: String(z) };
    }
    return {
      ...z,
      id: z.id || z._id || z.zoneId || `zone-${idx}`,
      name: z.name || z.zoneName || z.title || `Zone ${idx + 1}`,
      description: z.description || z.desc || ''
    };
  });

  const totalItems = res?.data?.totalItems ?? res?.totalItems ?? normalized.length;
  const totalPages = res?.data?.totalPages ?? res?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = res?.data?.page ?? res?.page ?? page;

  // Build dual-mode return: works both as an Array and as { items: [...], totalItems: ... }
  const result = [...normalized];
  result.items = normalized;
  result.data = normalized;
  result.zones = normalized;
  result.totalItems = totalItems;
  result.totalPages = totalPages;
  result.page = currentPage;
  result.limit = limit;

  return result;
}

/**
 * Fetch all zones across pagination pages (e.g. all 223 parent and subzones).
 */
export async function getAllZones({ clientId, parentZoneId, topLevel, maxPages = 10 } = {}) {
  let page = 1;
  const allItems = [];
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    const res = await getZones({ clientId, parentZoneId, topLevel, page, limit: 100 });
    const items = res?.items ?? res ?? [];
    allItems.push(...items);
    totalPages = res?.totalPages ?? 1;
    if (items.length === 0 || page >= totalPages) break;
    page++;
  }

  return allItems;
}

export async function getZoneById(id) {
  const res = await apiClient.request(`/zones/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createZone(payload) {
  const res = await apiClient.request('/zones', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateZone(id, payload) {
  const res = await apiClient.request(`/zones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteZone(id) {
  return apiClient.request(`/zones/${id}`, { method: 'DELETE' });
}

// Full subtree — array of zone nodes with { id, name, parentZoneId, depth }
export async function getZoneDescendants(id) {
  const res = await apiClient.request(`/zones/${id}/descendants`, { method: 'GET' });
  return res?.data ?? [];
}

// Zone staff assignments
export async function getZoneAssignments(id) {
  const res = await apiClient.request(`/zones/${id}/assignments`, { method: 'GET' });
  return res?.data ?? [];
}

export async function assignUserToZone(zoneId, userId, role = 'staff') {
  const res = await apiClient.request(`/zones/${zoneId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ userId, role })
  });
  return res?.data ?? null;
}

export async function removeUserFromZone(zoneId, assignmentId) {
  return apiClient.request(`/zones/${zoneId}/assignments/${assignmentId}`, { method: 'DELETE' });
}

export async function setZoneStatus(id, status) {
  return apiClient.request(`/zones/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function uploadZoneLogo(id, file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await apiClient.request(`/zones/${id}/logo`, { method: 'POST', body: fd, _multipart: true });
  return res?.data ?? null;
}

export async function getZoneActivity(zoneId, { page = 1, limit = 30, from, to } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (from) params.set('from', from);
  if (to)   params.set('to', to);
  const res = await apiClient.request(`/zones/${zoneId}/activity?${params}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 30, totalItems: 0, totalPages: 0 };
}
