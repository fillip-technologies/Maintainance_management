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

// Valid transitions map (frontend hint — backend also enforces these)
// Mirrors issueStateMachine.js on the backend.
// Technicians pick up open issues directly (open → in_progress) — no assign step.
export const VALID_TRANSITIONS = {
  open:        ['in_progress', 'on_hold'],
  assigned:    ['in_progress', 'on_hold'],
  in_progress: ['resolved', 'on_hold'],
  on_hold:     ['in_progress'],
  resolved:    ['closed', 'reopened'],
  reopened:    ['in_progress', 'on_hold'],
  closed:      []
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

export async function updateIssueStatus(id, status, note = '') {
  // PATCH /issues/:id/status — enforces state machine
  const res = await apiClient.request(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(note ? { note } : {}) })
  });
  return res?.data ?? null;
}

export async function getIssueHistory(id) {
  // GET /issues/:id/history — full audit trail
  const res = await apiClient.request(`/issues/${id}/history`, { method: 'GET' });
  return res?.data ?? [];
}
