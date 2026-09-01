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

// Initial facility users fallback for offline testing
const INITIAL_FACILITY_USERS = [
  {
    id: 'usr_f01',
    name: 'David Miller',
    email: 'client@apexestates.com',
    role: 'client_admin',
    accountStatus: 'active',
    companyName: 'Apex Estates Corp',
    facilityName: 'Apex Tech Tower - Campus A',
    location: 'Bangalore Sector 4, Tech Corridor',
    clientId: 'client_apex_001',
    zoneName: 'Entire Facility',
    createdAt: '2026-07-15T09:00:00.000Z'
  },
  {
    id: 'usr_f02',
    name: 'Priya Sharma',
    email: 'priya.sharma@apexestates.com',
    role: 'zone_incharge',
    accountStatus: 'active',
    clientId: 'client_apex_001',
    facilityName: 'Apex Tech Tower',
    zoneId: 'zone_01',
    zoneName: 'North Wing - Floor 1-4',
    createdAt: '2026-08-01T10:30:00.000Z'
  },
  {
    id: 'usr_f03',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@apexestates.com',
    role: 'zone_staff',
    accountStatus: 'active',
    clientId: 'client_apex_001',
    facilityName: 'Apex Tech Tower',
    zoneId: 'zone_02',
    zoneName: 'South Wing & Basement Bay',
    createdAt: '2026-08-10T14:15:00.000Z'
  },
  {
    id: 'usr_f04',
    name: 'Sam Wilson',
    email: 'sam.tech@fixlyservice.com',
    role: 'technician',
    accountStatus: 'active',
    clientId: 'client_apex_001',
    facilityName: 'Apex Tech Tower',
    specialization: 'Electrical & Power Systems',
    zoneName: 'All Zones (Field Dispatch)',
    createdAt: '2026-08-12T11:00:00.000Z'
  },
  {
    id: 'usr_f05',
    name: 'Karan Patel',
    email: 'karan.hvac@fixlyservice.com',
    role: 'technician',
    accountStatus: 'active',
    clientId: 'client_apex_001',
    facilityName: 'Apex Tech Tower',
    specialization: 'HVAC & Chiller Plant',
    zoneName: 'Roof Plant & Chiller Bay',
    createdAt: '2026-08-18T16:20:00.000Z'
  },
  {
    id: 'usr_f06',
    name: 'Ananya Verma',
    email: 'ananya.v@apexestates.com',
    role: 'zone_staff',
    accountStatus: 'invited',
    clientId: 'client_apex_001',
    facilityName: 'Apex Tech Tower',
    zoneId: 'zone_01',
    zoneName: 'North Wing',
    createdAt: '2026-08-28T09:45:00.000Z'
  }
];

const LOCAL_USERS_KEY = 'fixly_facility_users_v3';

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
  saveLocalUsers(INITIAL_FACILITY_USERS);
  return INITIAL_FACILITY_USERS;
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

  try {
    const res = await apiClient.request(`/users?${params.toString()}`, { method: 'GET' });
    if (res?.success && res?.data?.items) {
      const activeItems = res.data.items.filter((u) => u.accountStatus !== 'removed');
      return { ...res.data, items: activeItems };
    }
  } catch (err) {
    // Fallback to local store
  }

  // Filter local store
  let users = getLocalUsers().filter((u) => u.accountStatus !== 'removed');

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

  const isClientAdmin = payload.role === 'client_admin';

  const localUserObj = {
    id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
    name: cleanName,
    email: cleanEmail,
    role: payload.role || 'zone_staff',
    accountStatus: payload.password && payload.password.trim() ? 'active' : 'invited',
    companyName: payload.companyName || (isClientAdmin ? 'Apex Estates Corp' : undefined),
    facilityName: payload.facilityName || (isClientAdmin ? `${cleanName} Facility Campus` : 'Apex Tech Tower'),
    location: payload.location || (isClientAdmin ? 'Primary Campus Hub' : undefined),
    clientId: payload.clientId || (isClientAdmin ? `client_${Math.floor(100 + Math.random() * 900)}` : 'client_apex_001'),
    zoneId: payload.zoneId || null,
    zoneName: payload.zoneName || (isClientAdmin ? 'Entire Facility' : 'North Wing - Floor 1-4'),
    specialization: payload.specialization || null,
    createdAt: new Date().toISOString()
  };

  // 1. Always write to local storage first
  const currentUsers = getLocalUsers();
  const existingIdx = currentUsers.findIndex((u) => u.email === cleanEmail);
  if (existingIdx !== -1) {
    currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...localUserObj, accountStatus: 'active' };
  } else {
    currentUsers.unshift(localUserObj);
  }
  saveLocalUsers(currentUsers);

  // 2. Try to sync to backend API if live
  try {
    const apiBody = {
      name: cleanName,
      email: cleanEmail,
      role: payload.role || 'zone_staff',
      accountStatus: localUserObj.accountStatus
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

    if (res?.data) {
      return { ...localUserObj, id: res.data.id || localUserObj.id };
    }
  } catch (e) {
    console.warn('[usersApi] Backend POST /users error (persisted locally):', e.message);
  }

  return localUserObj;
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
