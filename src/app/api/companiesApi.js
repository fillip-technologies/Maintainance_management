import apiClient from './apiClient';

// ─────────────────────────────────────────────
// COMPANIES API — /companies  (super_admin only)
// ─────────────────────────────────────────────
// GET    /companies        — paginated
// GET    /companies/:id    — single
// POST   /companies        — create
// PATCH  /companies/:id    — update
// DELETE /companies/:id    — delete (no clients attached)
// ─────────────────────────────────────────────

export async function getCompanies({ search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const res = await apiClient.request(`/companies?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getCompanyById(id) {
  const res = await apiClient.request(`/companies/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createCompany(payload) {
  const res = await apiClient.request('/companies', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateCompany(id, payload) {
  const res = await apiClient.request(`/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteCompany(id) {
  return apiClient.request(`/companies/${id}`, { method: 'DELETE' });
}
