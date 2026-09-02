import apiClient from './apiClient';

// ─────────────────────────────────────────────
// PRODUCTS / INVENTORY API — /products
// ─────────────────────────────────────────────
// Backend-backed inventory, scoped to a Company.
//   super_admin  — any company (must pass companyId on create)
//   client_admin — their own company only (companyId derived server-side)
// Every create/delete is recorded in an audit trail (GET /products/audit,
// super_admin only).
// ─────────────────────────────────────────────

export async function getProducts({ companyId, search, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (companyId) params.set('companyId', companyId);
  if (search) params.set('search', search);
  const res = await apiClient.request(`/products?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit, totalItems: 0, totalPages: 0 };
}

// payload: { companyId?, name, category?, serialNumber?, quantity, unitPrice?,
//            purchaseDate?, installationDate?, imageUrl? }
export async function createProduct(payload) {
  const res = await apiClient.request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data ?? null;
}

export async function deleteProduct(id) {
  return apiClient.request(`/products/${id}`, { method: 'DELETE' });
}

// Super-admin inventory audit trail (created / deleted, who + when).
export async function getProductAudit({ companyId, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (companyId) params.set('companyId', companyId);
  const res = await apiClient.request(`/products/audit?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit, totalItems: 0, totalPages: 0 };
}
