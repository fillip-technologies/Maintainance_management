import apiClient from './apiClient';

// ─────────────────────────────────────────────
// USERS API — /users
// ─────────────────────────────────────────────

export const USER_ROLES = [
  'super_admin',
  'company_admin',
  'client_admin',
  'zone_incharge',
  'zone_staff',
  'technician'
];

export const ACCOUNT_STATUSES = ['invited', 'active', 'suspended', 'removed'];

// Notify any open pages to refresh their user lists (cross-page live sync).
// This is a transient DOM event — no data is persisted anywhere.
function notifyUsersChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fixly:users_changed'));
  }
}

// The backend /users API is the single source of truth — no local cache, no
// merged/offline fallback, no fabricated data.
export async function getUsers({ role, companyId, clientId, search, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (role && role !== 'all') params.set('role', role);
  if (companyId) params.set('companyId', companyId);
  if (clientId)  params.set('clientId', clientId);
  if (search)    params.set('search', search);

  const res = await apiClient.request(`/users?${params.toString()}`, { method: 'GET' });
  const data = res?.data ?? {};
  // A super admin is a platform operator, not a managed "user" — never list them.
  const items = (data.items || []).filter(
    (u) => u.accountStatus !== 'removed' && u.role !== 'super_admin'
  );
  return {
    items,
    page: data.page || 1,
    limit: data.limit || limit,
    totalItems: data.totalItems ?? items.length,
    totalPages: data.totalPages ?? (Math.ceil(items.length / limit) || 1)
  };
}

export async function getUserById(id) {
  const res = await apiClient.request(`/users/${id}`, { method: 'GET' });
  return res?.data ?? null;
}

export async function createUser(payload) {
  const cleanEmail = payload.email.toLowerCase().trim();
  const cleanName = payload.name.trim();

  const apiBody = {
    name: cleanName,
    email: cleanEmail,
    role: payload.role || 'zone_staff',
    accountStatus: payload.password && payload.password.trim() ? 'active' : 'invited'
  };
  if (payload.password && payload.password.trim().length >= 8) {
    apiBody.password = payload.password.trim();
  }
  if (payload.clientId) {
    apiBody.clientId = payload.clientId;
  }

  const res = await apiClient.request('/users', {
    method: 'POST',
    body: JSON.stringify(apiBody)
  });
  const dbUser = res?.data || res?.user;
  if (!dbUser) {
    throw new Error('User creation failed: unexpected server response.');
  }
  notifyUsersChanged();
  return dbUser;
}

export async function updateUser(id, payload) {
  const apiBody = {};
  if (payload.name) apiBody.name = payload.name.trim();
  if (payload.role) apiBody.role = payload.role;
  if (payload.accountStatus) apiBody.accountStatus = payload.accountStatus;

  const res = await apiClient.request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(apiBody)
  });
  notifyUsersChanged();
  return res?.data ?? null;
}

export async function deleteUser(id) {
  const res = await apiClient.request(`/users/${id}`, { method: 'DELETE' });
  notifyUsersChanged();
  return res;
}
