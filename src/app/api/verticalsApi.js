import apiClient from './apiClient';

// ─────────────────────────────────────────────
// VERTICALS & CLIENT-VERTICALS API
// ─────────────────────────────────────────────
// GET    /verticals           — flat list of ALL feature verticals (no pagination)
// POST   /verticals           — create vertical (super_admin)
//
// GET    /client-verticals    — list client–vertical toggles (companyId / clientId filter)
// PATCH  /client-verticals    — enable / disable a vertical for a client
// ─────────────────────────────────────────────

// All verticals — backend returns the full set without pagination
export async function getVerticals() {
  const res = await apiClient.request('/verticals', { method: 'GET' });
  return res?.data?.items ?? [];
}

export async function createVertical(payload) {
  const res = await apiClient.request('/verticals', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data ?? null;
}

// Client-vertical toggles
export async function getClientVerticals({ companyId, clientId } = {}) {
  const params = new URLSearchParams();
  if (companyId) params.set('companyId', companyId);
  if (clientId)  params.set('clientId', clientId);
  const qs = params.toString();
  const res = await apiClient.request(`/client-verticals${qs ? `?${qs}` : ''}`, { method: 'GET' });
  return res?.data ?? [];
}

export async function patchClientVertical({ clientId, verticalId, enabled }) {
  // PATCH /client-verticals — toggle a vertical on or off for a client
  const res = await apiClient.request('/client-verticals', {
    method: 'PATCH',
    body: JSON.stringify({ clientId, verticalId, enabled })
  });
  return res?.data ?? null;
}
