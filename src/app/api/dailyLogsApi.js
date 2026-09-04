import apiClient from './apiClient';

// ─────────────────────────────────────────────
// DAILY LOGS API — /daily-logs
// ─────────────────────────────────────────────
// GET  /daily-logs  — paginated (deviceId, zoneId, date, status, page, limit)
// POST /daily-logs  — submit a log for a device (1 per device per day)
//
// Log status enum: working | not_working | under_maintenance
// 3 consecutive not_working logs → device auto-transitions to faulty
// overwrite: boolean — replace existing log for that device/day
// ─────────────────────────────────────────────

// Must match the DailyStatus enum in the DB schema.
export const LOG_STATUSES = ['working', 'not_working', 'needs_attention'];

export async function getDailyLogs({ deviceId, zoneId, date, status, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (deviceId) params.set('deviceId', deviceId);
  if (zoneId)   params.set('zoneId', zoneId);
  if (date)     params.set('date', date);       // ISO date string: 'YYYY-MM-DD'
  if (status)   params.set('status', status);

  const res = await apiClient.request(`/daily-logs?${params.toString()}`, { method: 'GET' });
  return res?.data ?? { items: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
}

export async function submitDailyLog({ deviceId, status, notes = '', overwrite = false }) {
  // Required: deviceId, status
  // If a log already exists for today → 409 ALREADY_LOGGED_TODAY unless overwrite: true
  const res = await apiClient.request('/daily-logs', {
    method: 'POST',
    body: JSON.stringify({ deviceId, status, notes, overwrite })
  });
  return res?.data ?? null;
}
