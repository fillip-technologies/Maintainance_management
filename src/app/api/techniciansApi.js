import apiClient from './apiClient';

// ─────────────────────────────────────────────
// TECHNICIANS API — /technicians
// ─────────────────────────────────────────────
// GET    /technicians                      — paginated list
// GET    /technicians/:id                  — single technician
// POST   /technicians                      — create technician
// PATCH  /technicians/:id                  — update
// DELETE /technicians/:id                  — soft-delete
// GET    /technicians/:id/assignments      — zone assignments for technician
// ─────────────────────────────────────────────

export async function getTechnicians({ search, zoneId, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  if (zoneId) params.set('zoneId', zoneId);

  const res = await apiClient.request(`/technicians?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getTechnicianById(id) {
  const res = await apiClient.request(`/technicians/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createTechnician(payload) {
  const res = await apiClient.request('/technicians', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

// Provision a brand-new technician end-to-end: creates the login user
// (role=technician) + profile atomically on the backend and emails credentials.
// payload: { name, email, password, specialization? }
export async function provisionTechnician(payload) {
  const res = await apiClient.request('/technicians/provision', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateTechnician(id, payload) {
  const res = await apiClient.request(`/technicians/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function deleteTechnician(id) {
  return apiClient.request(`/technicians/${id}`, { method: 'DELETE' });
}

export async function getTechnicianAssignments(id) {
  const res = await apiClient.request(`/technicians/${id}/assignments`, { method: 'GET' });
  return res?.data ?? [];
}

// POST /technicians/:id/assignments — add zone or org coverage for a technician.
// payload: { clientId? } for org-level, { zoneId? } for zone-level.
export async function addTechnicianAssignment(technicianId, payload) {
  const res = await apiClient.request(`/technicians/${technicianId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

// DELETE /technicians/:id/assignments/:assignmentId
export async function removeTechnicianAssignment(technicianId, assignmentId) {
  return apiClient.request(`/technicians/${technicianId}/assignments/${assignmentId}`, { method: 'DELETE' });
}
