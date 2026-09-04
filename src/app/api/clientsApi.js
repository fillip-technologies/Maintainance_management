import apiClient from './apiClient';

// ─────────────────────────────────────────────
// CLIENTS API — /clients
// ─────────────────────────────────────────────
// GET    /clients        — paginated (super_admin, company_admin)
// GET    /clients/:id    — single
// POST   /clients        — create
// PATCH  /clients/:id    — update
// DELETE /clients/:id    — delete (no zones/devices attached)
// ─────────────────────────────────────────────

export async function getClients({ companyId, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (companyId) params.set('companyId', companyId);
  if (search)    params.set('search', search);
  const res = await apiClient.request(`/clients?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getClientById(id) {
  const res = await apiClient.request(`/clients/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createClient(payload) {
  const res = await apiClient.request('/clients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateClient(id, payload) {
  const res = await apiClient.request(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteClient(id) {
  return apiClient.request(`/clients/${id}`, { method: 'DELETE' });
}

export async function getClientDependents(id) {
  const res = await apiClient.request(`/clients/${id}/dependents`, { method: 'GET' });
  return res?.data ?? null;
}

export async function downloadClientExport(id, clientName) {
  const token = apiClient.getAccessToken();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const res = await fetch(`${BASE_URL}/clients/${id}/export`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `client-${(clientName || id).replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
