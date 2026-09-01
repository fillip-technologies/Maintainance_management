import apiClient from './apiClient';

// ─────────────────────────────────────────────
// HARDWARE TYPES & ISSUE CATEGORIES API
// ─────────────────────────────────────────────
// GET    /hardware-types                          — paginated
// GET    /hardware-types/:id                      — single
// POST   /hardware-types                          — create
// PATCH  /hardware-types/:id                      — update
// DELETE /hardware-types/:id                      — hard delete (no issues linked)
// GET    /hardware-types/:id/categories           — issue categories for a hw type
// POST   /hardware-types/:id/categories           — add category
// PATCH  /hardware-types/:id/categories/:catId    — rename category
// DELETE /hardware-types/:id/categories/:catId    — delete category
// GET    /issue-categories                        — flat list of ALL issue categories (no pagination)
// ─────────────────────────────────────────────

export async function getHardwareTypes({ search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const res = await apiClient.request(`/hardware-types?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getHardwareTypeById(id) {
  const res = await apiClient.request(`/hardware-types/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createHardwareType(payload) {
  const res = await apiClient.request('/hardware-types', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateHardwareType(id, payload) {
  const res = await apiClient.request(`/hardware-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteHardwareType(id) {
  return apiClient.request(`/hardware-types/${id}`, { method: 'DELETE' });
}

// Issue categories under a hardware type
export async function getHardwareTypeCategories(hwTypeId) {
  const res = await apiClient.request(`/hardware-types/${hwTypeId}/categories`, { method: 'GET' });
  return res?.data ?? [];
}

export async function addHardwareTypeCategory(hwTypeId, payload) {
  const res = await apiClient.request(`/hardware-types/${hwTypeId}/categories`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateHardwareTypeCategory(hwTypeId, catId, payload) {
  const res = await apiClient.request(`/hardware-types/${hwTypeId}/categories/${catId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteHardwareTypeCategory(hwTypeId, catId) {
  return apiClient.request(`/hardware-types/${hwTypeId}/categories/${catId}`, { method: 'DELETE' });
}

// All issue categories flat list — backend returns full set (no pagination)
export async function getAllIssueCategories() {
  const res = await apiClient.request('/issue-categories', { method: 'GET' });
  return res?.data?.items ?? [];
}
