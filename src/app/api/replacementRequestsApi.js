import apiClient from './apiClient';

// ─────────────────────────────────────────────
// REPLACEMENT REQUESTS API — /replacement-requests
// ─────────────────────────────────────────────
// Technician requests a replacement → client_admin / super_admin approve or
// reject → technician carries out the replacement (resolves the issue).
//
// GET   /replacement-requests              — scope-filtered list (?status=pending,approved)
// PATCH /replacement-requests/:id/approve  — client_admin | super_admin
// PATCH /replacement-requests/:id/reject   — client_admin | super_admin
// ─────────────────────────────────────────────

export const REPLACEMENT_STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

export async function getReplacementRequests({ status, issueId, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  if (issueId) params.set('issueId', issueId);
  const res = await apiClient.request(`/replacement-requests?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit, totalItems: 0, totalPages: 0 };
}

export async function approveReplacementRequest(id, reviewNote = '') {
  const res = await apiClient.request(`/replacement-requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(reviewNote ? { reviewNote } : {}),
  });
  return res?.data ?? null;
}

export async function rejectReplacementRequest(id, reviewNote = '') {
  const res = await apiClient.request(`/replacement-requests/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(reviewNote ? { reviewNote } : {}),
  });
  return res?.data ?? null;
}
