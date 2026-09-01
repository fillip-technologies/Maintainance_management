// ─────────────────────────────────────────────
// API Barrel — single import point for all service modules
// ─────────────────────────────────────────────
// Usage:
//   import { getDashboardSummary, getIssues } from '../api';
//   import { socketClient } from '../api';
// ─────────────────────────────────────────────

export { default as apiClient } from './apiClient';
export { default as socketClient } from './socketClient';

// Auth (methods live on apiClient directly)
// apiClient.login(), .logout(), .getMe()

export * from './dashboardApi';
export * from './devicesApi';
export * from './issuesApi';
export * from './dailyLogsApi';
export * from './techniciansApi';
export * from './hardwareTypesApi';
export * from './zonesApi';
export * from './companiesApi';
export * from './clientsApi';
export * from './usersApi';
export * from './verticalsApi';
