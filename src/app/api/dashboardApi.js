import apiClient from './apiClient';

// ─────────────────────────────────────────────
// DASHBOARD API — GET /dashboard/summary
// ─────────────────────────────────────────────
// Query params:
//   scope       : 'platform' | 'client' | 'zone'
//   id          : UUID of client/zone when scope ≠ 'platform'
//   includeSubzones : boolean (default false)
//
// Response data shape (backend contract):
// {
//   totalDevices        : number,
//   openIssues          : number,
//   faultyDevices       : number,
//   devicesMissingTodayLog : number   // devices with no log today
// }
// ─────────────────────────────────────────────

export async function getDashboardSummary({ scope = 'platform', id, includeSubzones = false } = {}) {
  const params = new URLSearchParams({ scope, includeSubzones });
  if (id) params.set('id', id);

  const res = await apiClient.request(`/dashboard/summary?${params.toString()}`, { method: 'GET' });
  const d = res?.data;
  if (!d) return null;
  // `workingDevices` is derived from real counts (summary doesn't send it directly).
  return {
    ...d,
    missingLogs: d.devicesMissingTodayLog ?? d.missingLogs ?? 0,
    workingDevices:
      d.workingDevices ??
      Math.max(0, (d.totalDevices ?? 0) - (d.faultyDevices ?? 0) - (d.underMaintenance ?? 0)),
  };
}

// ─────────────────────────────────────────────
// PLATFORM OVERVIEW — GET /dashboard/overview  (super_admin only)
// ─────────────────────────────────────────────
// One aggregated call backing the whole super_admin overview page. Response:
// {
//   tenancy:  { companies, activeCompanies, clients, zones, activeZones, users, technicians },
//   devices:  { total, working, underMaintenance, faulty, provisioned, retired, missingTodayLog },
//   byHardwareType: [{ hardwareTypeId, name, total, working, underMaintenance, faulty }],
//   issues:   { total, open, byStatus:{...7 states}, byPriority:{low,medium,high,critical},
//               createdToday, resolvedToday, closedToday },
//   criticalAlerts: [{ id, title, priority, status, deviceName, zoneName, clientName, assignedTo, createdAt }],
//   technicians: { total, busy, idle, top:[{ id, name, specialization, openAssigned }] },
//   facilities:  [{ clientId, name, companyName, zones, devices, faultyDevices, openIssues }],
//   recentActivity: [{ id, issueId, fromStatus, toStatus, priority, title, deviceName, zoneName, clientName, changedBy, changedAt }]
// }
// ─────────────────────────────────────────────

export async function getPlatformOverview() {
  const res = await apiClient.request('/dashboard/overview', { method: 'GET' });
  return res?.data ?? null;
}
