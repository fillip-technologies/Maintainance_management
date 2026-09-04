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

export async function createIssue(payload, files = []) {
  // When files are present, send as multipart/form-data so the backend can
  // receive both the JSON fields and the file buffers in one request.
  if (files && files.length > 0) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    files.forEach((f) => fd.append('attachments', f));
    const res = await apiClient.request('/issues', { method: 'POST', body: fd, _multipart: true });
    return res?.data ?? null;
  }
  const res = await apiClient.request('/issues', { method: 'POST', body: JSON.stringify(payload) });
  return res?.data ?? null;
}

export async function bulkUpdateStatus({ ids, status, notes = '' }) {
  // Apply the same status to multiple issues. Returns { updated: [], errors: [] }.
  const res = await apiClient.request('/issues/bulk-status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status, ...(notes ? { notes } : {}) }),
  });
  return res?.data ?? { updated: [], errors: [] };
}

export async function createIssues({ deviceIds, categoryId, priority, description }, files = []) {
  // Bulk-create: one issue per deviceId. When files are present, the first issue
  // gets the attachments (bulk endpoint doesn't support per-device files).
  if (files && files.length > 0) {
    const fd = new FormData();
    deviceIds.forEach((id) => fd.append('deviceIds', id));
    fd.append('categoryId', categoryId);
    fd.append('priority', priority ?? 'medium');
    fd.append('description', description);
    files.forEach((f) => fd.append('attachments', f));
    const res = await apiClient.request('/issues/bulk', { method: 'POST', body: fd, _multipart: true });
    return res?.data ?? [];
  }
  const res = await apiClient.request('/issues/bulk', {
    method: 'POST',
    body: JSON.stringify({ deviceIds, categoryId, priority, description }),
  });
  return res?.data ?? [];
}

export async function updateIssueStatus(id, status, notes = '', files = []) {
  if (files && files.length > 0) {
    const fd = new FormData();
    fd.append('status', status);
    if (notes) fd.append('notes', notes);
    files.forEach((f) => fd.append('attachments', f));
    const res = await apiClient.request(`/issues/${id}/status`, { method: 'PATCH', body: fd, _multipart: true });
    return res?.data ?? null;
  }
  const res = await apiClient.request(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
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
