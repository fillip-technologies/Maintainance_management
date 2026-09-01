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

const LOCAL_USERS_KEY = 'fixly_facility_users_v4';

// One-time cleanup: purge stale caches from earlier versions that were seeded
// with mock/demo users (e.g. "David Miller"). Those users were never in the DB.
try {
  ['fixly_facility_users', 'fixly_facility_users_v2', 'fixly_facility_users_v3'].forEach((k) =>
    localStorage.removeItem(k)
  );
} catch {
  // ignore
}

// The local cache holds ONLY users provisioned from this client while the
// backend was unreachable — it is seeded EMPTY so no mock/demo users ever
// appear. The backend /users API is the source of truth.
export function getLocalUsers() {
  try {
    const saved = localStorage.getItem(LOCAL_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fixly:users_changed', { detail: users }));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function getUsers({ role, companyId, clientId, search, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (role && role !== 'all') params.set('role', role);
  if (companyId) params.set('companyId', companyId);
  if (clientId)  params.set('clientId', clientId);
  if (search)    params.set('search', search);

  // 1. Try live backend API first
  try {
    const res = await apiClient.request(`/users?${params.toString()}`, { method: 'GET' });
    if (res?.success && res?.data?.items && Array.isArray(res.data.items)) {
      const backendItems = res.data.items.filter((u) => u.accountStatus !== 'removed');
      
      // Merge with any locally provisioned user additions
      const localUsers = getLocalUsers().filter((u) => u.accountStatus !== 'removed');
      const backendEmails = new Set(backendItems.map((u) => u.email?.toLowerCase()));
      const localOnly = localUsers.filter((u) => !backendEmails.has(u.email?.toLowerCase()));
      
      let allMerged = [...backendItems, ...localOnly];
      if (role && role !== 'all') {
        allMerged = allMerged.filter((u) => u.role === role);
      }
      // A super admin is a platform operator, not a managed "user" — never
      // list or count them in the user views.
      allMerged = allMerged.filter((u) => u.role !== 'super_admin');

      return {
        items: allMerged,
        page: res.data.page || 1,
        limit: res.data.limit || 50,
        totalItems: allMerged.length,
        totalPages: Math.ceil(allMerged.length / limit) || 1
      };
    }
  } catch (err) {
    // Fallback to local store
  }

  // 2. Filter local store fallback
  let users = getLocalUsers().filter((u) => u.accountStatus !== 'removed');
  // Super admin is a platform operator, not a managed "user".
  users = users.filter((u) => u.role !== 'super_admin');

  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.companyName && u.companyName.toLowerCase().includes(q)) ||
        (u.facilityName && u.facilityName.toLowerCase().includes(q)) ||
        (u.location && u.location.toLowerCase().includes(q)) ||
        (u.zoneName && u.zoneName.toLowerCase().includes(q)) ||
        (u.specialization && u.specialization.toLowerCase().includes(q))
    );
  }

  return {
    items: users,
    page: 1,
    limit: 50,
    totalItems: users.length,
    totalPages: Math.ceil(users.length / limit) || 1
  };
}

export async function getUserById(id) {
  try {
    const res = await apiClient.request(`/users/${id}`, { method: 'GET' });
    if (res?.data) return res.data;
  } catch (e) {}

  const users = getLocalUsers();
  return users.find((u) => u.id === id && u.accountStatus !== 'removed') || null;
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
  // Link to the tenant. Callers that provision a client provide the clientId of
  // the client they just created (see clientsApi.createClient).
  if (payload.clientId) {
    apiBody.clientId = payload.clientId;
  }

  // The backend is the source of truth — let failures propagate to the caller
  // so the UI can surface them, instead of faking success on a rejected request.
  const res = await apiClient.request('/users', {
    method: 'POST',
    body: JSON.stringify(apiBody)
  });
  const dbUser = res?.data || res?.user;
  if (!dbUser) {
    throw new Error('User creation failed: unexpected server response.');
  }

  // Cache locally so lists that merge local additions reflect it immediately,
  // keeping any display-only fields the caller passed for optimistic rendering.
  const record = {
    ...dbUser,
    zoneName: payload.zoneName ?? dbUser.zoneName ?? null,
    specialization: payload.specialization ?? dbUser.specialization ?? null,
    createdAt: dbUser.createdAt || new Date().toISOString()
  };
  const currentUsers = getLocalUsers();
  const existingIdx = currentUsers.findIndex((u) => u.email === cleanEmail);
  if (existingIdx !== -1) {
    currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...record };
  } else {
    currentUsers.unshift(record);
  }
  saveLocalUsers(currentUsers);

  return record;
}

export async function updateUser(id, payload) {
  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.id === id);
  let updatedObj = null;

  if (idx !== -1) {
    users[idx] = { ...users[idx], ...payload, updatedAt: new Date().toISOString() };
    saveLocalUsers(users);
    updatedObj = users[idx];
  }

  try {
    const apiBody = {};
    if (payload.name) apiBody.name = payload.name.trim();
    if (payload.role) apiBody.role = payload.role;
    if (payload.accountStatus) apiBody.accountStatus = payload.accountStatus;

    const res = await apiClient.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(apiBody)
    });
    if (res?.data) {
      return { ...(updatedObj || {}), ...res.data };
    }
  } catch (e) {
    console.warn('[usersApi] Backend PATCH /users/:id error:', e.message);
  }

  return updatedObj;
}

export async function deleteUser(id) {
  const users = getLocalUsers();
  const updated = users.map((u) => (u.id === id ? { ...u, accountStatus: 'removed' } : u));
  saveLocalUsers(updated);

  try {
    return await apiClient.request(`/users/${id}`, { method: 'DELETE' });
  } catch (e) {
    return { success: true, message: 'User removed from local storage' };
  }
}
