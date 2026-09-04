import apiClient from './apiClient';

// ─────────────────────────────────────────────
// ISSUE (DEFECT) CATEGORIES API — /issue-categories
// ─────────────────────────────────────────────
// GET /issue-categories                    — all global defect categories
// GET /issue-categories?deviceId=<uuid>    — global + the unit's product-category ones
// GET /issue-categories?categoryId=<uuid>  — global + that product category's ones
//
// Used to populate the category dropdown in the "raise a defect" modal. The CEO
// curates the list (POST is super_admin only), so the web app only reads it.
// ─────────────────────────────────────────────

export async function getIssueCategories({ deviceId, categoryId } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (deviceId)   params.set('deviceId', deviceId);

  const qs = params.toString();
  const res = await apiClient.request(`/issue-categories${qs ? `?${qs}` : ''}`, { method: 'GET' });
  return res?.data?.items ?? [];
}

export async function createIssueCategory({ name, categoryId }) {
  const res = await apiClient.request('/issue-categories', {
    method: 'POST',
    body: JSON.stringify({ name, categoryId: categoryId ?? null }),
  });
  return res?.data ?? null;
}

export async function deleteIssueCategory(id) {
  return apiClient.request(`/issue-categories/${id}`, { method: 'DELETE' });
}
