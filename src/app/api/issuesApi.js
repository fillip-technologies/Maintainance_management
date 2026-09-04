import apiClient from './apiClient';

// ─────────────────────────────────────────────
// ISSUES API — /issues
// ─────────────────────────────────────────────
// GET    /issues              — paginated list (scope-filtered)
// POST   /issues              — raise a defect (stays open; all org/zone members + technicians see it)
// PATCH  /issues/:id/status   — state machine transition (technician picks up: open → in_progress)
// GET    /issues/:id/history  — full audit trail
//
// State machine: open → in_progress ↔ on_hold → resolved → closed
// ─────────────────────────────────────────────

export const ISSUE_STATUSES = ['open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened'];

// Any non-closed issue can move to any other status (mirrors backend issueStateMachine.js).
// closed is terminal — nothing can transition out of it.
const ANY = ['open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'reopened', 'closed'];
export const VALID_TRANSITIONS = {
  open:        ANY,
  assigned:    ANY,
  in_progress: ANY,
  on_hold:     ANY,
  resolved:    ANY,
  reopened:    ANY,
  closed:      [],
};

export async function getIssues({ deviceId, status, priority, zoneId, assignedTo, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (deviceId)   params.set('deviceId', deviceId);
  if (status)     params.set('status', status);
  if (priority)   params.set('priority', priority);
  if (zoneId)     params.set('zoneId', zoneId);
  if (assignedTo) params.set('assignedTo', assignedTo);

  const res = await apiClient.request(`/issues?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getIssueById(id) {
  const res = await apiClient.request(`/issues/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createIssue(payload) {
  // Required: deviceId, categoryId (issue/defect category), description.
  // Optional: priority ('low' | 'medium' | 'high' | 'critical', default 'medium').
  const res = await apiClient.request('/issues', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function createIssues({ deviceIds, categoryId, priority, description }) {
  // Bulk-create: one issue per deviceId, all in a single server-side transaction.
  // Returns an array of created issue objects.
  const res = await apiClient.request('/issues/bulk', {
    method: 'POST',
    body: JSON.stringify({ deviceIds, categoryId, priority, description }),
  });
  return res?.data ?? [];
}

export async function updateIssueStatus(id, status, notes = '') {
  // PATCH /issues/:id/status — enforces state machine
  const res = await apiClient.request(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(notes ? { notes } : {}) })
  });
  return res?.data ?? null;
}

export async function getIssueHistory(id) {
  // GET /issues/:id/history — full audit trail
  const res = await apiClient.request(`/issues/${id}/history`, { method: 'GET' });
  return res?.data ?? [];
}

export async function deleteIssue(id) {
  return apiClient.request(`/issues/${id}`, { method: 'DELETE' });
}
