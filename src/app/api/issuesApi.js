import apiClient from './apiClient';

// ─────────────────────────────────────────────
// ISSUES API — /issues
// ─────────────────────────────────────────────
// GET    /issues                   — paginated (deviceId, status, priority, zoneId, assignedTo, page, limit)
// GET    /issues/:id               — single issue
// POST   /issues                   — raise new issue
// PATCH  /issues/:id/status        — state machine transition
// PATCH  /issues/:id/assign        — assign technician
// GET    /issues/:id/history       — full audit trail
//
// Issue status state machine:
//   open → assigned → in_progress ↔ on_hold → resolved → closed (terminal)
//                                              ↓
//                                           reopened → assigned
// ─────────────────────────────────────────────

export const ISSUE_STATUSES = ['open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened'];

// Valid transitions map (frontend hint — backend also enforces these)
export const VALID_TRANSITIONS = {
  open:        ['assigned'],
  assigned:    ['in_progress', 'on_hold'],
  in_progress: ['resolved', 'on_hold'],
  on_hold:     ['in_progress'],
  resolved:    ['closed', 'reopened'],
  reopened:    ['assigned'],
  closed:      [] // terminal
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
  // Required: deviceId, issueCategoryId, title, priority ('low' | 'medium' | 'high' | 'critical')
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

export async function assignIssueTechnician(id, technicianId, note = '') {
  // PATCH /issues/:id/assign
  const res = await apiClient.request(`/issues/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ technicianId, ...(note ? { note } : {}) })
  });
  return res?.data ?? null;
}

export async function getIssueHistory(id) {
  // GET /issues/:id/history — full audit trail
  const res = await apiClient.request(`/issues/${id}/history`, { method: 'GET' });
  return res?.data ?? [];
}
