import apiClient from './apiClient';

// ─────────────────────────────────────────────
// PRODUCTS / UNITS API
// ─────────────────────────────────────────────
// A "Product" is the tracked hardware unit — backed by the unified /devices
// endpoints. Each unit has a system-generated unique code (e.g. CAM-000123), a
// mandatory global category, an owning organization, and an optional zone
// (no zone = "in stock"). Bulk add via Excel import.
//   super_admin  — any organization (must pass companyId)
//   client_admin — their own organization (companyId derived server-side)
// ─────────────────────────────────────────────

/** Map a backend device (unit) row to the shape the product UIs render. */
function toUnit(d) {
  return {
    id: d.id,
    code: d.code || '—',
    name: d.name,
    category: d.categoryName || '—',
    categoryId: d.categoryId || null,
    companyName: d.companyName || '—',
    companyId: d.companyId || null,
    zoneName: d.zoneName || null,
    inStock: d.inStock === true || d.zoneId == null,
    status: d.status,
    unitPrice: d.unitPrice != null ? Number(d.unitPrice) : null,
    purchaseDate: d.purchaseDate ? String(d.purchaseDate).slice(0, 10) : '',
    installationDate: d.installDate ? String(d.installDate).slice(0, 10) : '',
    imageUrl: d.imageUrl || null,
  };
}

export async function getProducts({ search, status, zoneId, page = 1, limit = 200 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (zoneId) params.set('zoneId', zoneId);
  const res = await apiClient.request(`/devices?${params.toString()}`, { method: 'GET' });
  const data = res?.data ?? {};
  return {
    items: (data.items || []).map(toUnit),
    page: data.page ?? 1,
    limit: data.limit ?? limit,
    totalItems: data.totalItems ?? (data.items?.length ?? 0),
    totalPages: data.totalPages ?? 1,
  };
}

// payload: { categoryId, companyId?, zoneId?, name, unitPrice?, purchaseDate?, location? }
export async function createProduct(payload) {
  const res = await apiClient.request('/devices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data ? toUnit({ ...res.data, categoryName: res.data.category?.name, companyName: res.data.company?.name, zoneName: res.data.zone?.name }) : null;
}

// Units are never hard-deleted — retire them (removes from active inventory).
export async function deleteProduct(id) {
  return apiClient.request(`/devices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'retired' }),
  });
}

// Deploy an in-stock unit into a zone.
export async function deployProduct(id, zoneId) {
  const res = await apiClient.request(`/devices/${id}/deploy`, {
    method: 'POST',
    body: JSON.stringify({ zoneId }),
  });
  return res?.data ?? null;
}

// ── Global categories (CEO-managed; everyone can read) ──
export async function getCategories() {
  const res = await apiClient.request('/product-categories', { method: 'GET' });
  return res?.data ?? [];
}

export async function createCategory({ name, code }) {
  const res = await apiClient.request('/product-categories', {
    method: 'POST',
    body: JSON.stringify({ name, code }),
  });
  return res?.data ?? null;
}

// ── Excel/CSV bulk import ──
// Download the .xlsx template (returns a Blob for the browser to save).
export async function getImportTemplate() {
  const token = apiClient.getAccessToken();
  const res = await fetch(`${apiClient.baseUrl}/devices/import/template`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to download template');
  return res.blob();
}

// Upload a file. dryRun=true → validation preview (no writes); else commit.
// Returns the backend result ({ summary, preview, errors } | { created, skipped, errors }).
export async function importProducts(file, { companyId, dryRun = false } = {}) {
  const form = new FormData();
  form.append('file', file);
  if (companyId) form.append('companyId', companyId);
  const token = apiClient.getAccessToken();
  const qs = dryRun ? '?dryRun=true' : '';
  const res = await fetch(`${apiClient.baseUrl}/devices/import${qs}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Import failed');
    err.code = json.code;
    throw err;
  }
  return json.data ?? json;
}
