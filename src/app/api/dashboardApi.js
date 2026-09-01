import apiClient from './apiClient';

// ─────────────────────────────────────────────
// DASHBOARD API — GET /dashboard/summary
// ─────────────────────────────────────────────
// Query params:
//   scope       : 'platform' | 'company' | 'client' | 'zone'
//   id          : UUID of company/client/zone when scope ≠ 'platform'
//   includeSubzones : boolean (default false)
//
// Response data shape:
// {
//   totalDevices    : number,
//   openIssues      : number,
//   faultyDevices   : number,
//   missingLogs     : number,     // devices with no log today
//   underMaintenance: number      // devices in under_maintenance status
// }
// ─────────────────────────────────────────────

const FALLBACK = {
  totalDevices: 24,
  openIssues: 8,
  faultyDevices: 2,
  underMaintenance: 4,
  missingLogs: 3,
  workingDevices: 18
};

export async function getDashboardSummary({ scope = 'platform', id, includeSubzones = false } = {}) {
  const params = new URLSearchParams({ scope, includeSubzones });
  if (id) params.set('id', id);

  try {
    const res = await apiClient.request(`/dashboard/summary?${params.toString()}`, { method: 'GET' });
    if (res?.success && res?.data) {
      const d = res.data;
      // Derive workingDevices if backend doesn't return it
      const workingDevices =
        d.workingDevices ??
        Math.max(0, (d.totalDevices ?? 0) - (d.faultyDevices ?? 0) - (d.underMaintenance ?? 0));
      return { ...d, workingDevices };
    }
  } catch (err) {
    console.warn('[dashboardApi] /dashboard/summary failed, using fallback:', err.message);
  }
  return FALLBACK;
}
