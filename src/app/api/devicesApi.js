import apiClient from './apiClient';

// ─────────────────────────────────────────────
// DEVICES API — /devices
// ─────────────────────────────────────────────
// GET    /devices              — paginated list (zoneId, status, hardwareTypeId, search, page, limit)
// GET    /devices/:id          — single device
// POST   /devices              — create device
// PATCH  /devices/:id          — update device metadata
// PATCH  /devices/:id/status   — manual status transition
//
// Device status enum: provisioned | active | under_maintenance | faulty | retired
// ─────────────────────────────────────────────

export async function getDevices({ zoneId, status, hardwareTypeId, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (zoneId)         params.set('zoneId', zoneId);
  if (status)         params.set('status', status);
  if (hardwareTypeId) params.set('hardwareTypeId', hardwareTypeId);
  if (search)         params.set('search', search);

  const res = await apiClient.request(`/devices?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function getDeviceById(id) {
  const res = await apiClient.request(`/devices/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createDevice(payload) {
  // Required: zoneId, hardwareTypeId, serialNumber, name
  const res = await apiClient.request('/devices', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateDevice(id, payload) {
  const res = await apiClient.request(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

export async function updateDeviceStatus(id, status) {
  // Valid manual transitions only — backend enforces state machine
  const res = await apiClient.request(`/devices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return res?.data ?? null;
}
