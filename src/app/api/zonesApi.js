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

export async function getZones({ clientId, parentZoneId, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (clientId)     params.set('clientId', clientId);
  if (parentZoneId) params.set('parentZoneId', parentZoneId);
  if (search)       params.set('search', search);
  const res = await apiClient.request(`/zones?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
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

export async function assignUserToZone(zoneId, userId) {
  const res = await apiClient.request(`/zones/${zoneId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
  return res?.data ?? null;
}

export async function removeUserFromZone(zoneId, userId) {
  return apiClient.request(`/zones/${zoneId}/assignments/${userId}`, { method: 'DELETE' });
}
