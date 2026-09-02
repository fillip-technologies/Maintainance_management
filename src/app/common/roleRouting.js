/**
 * Single source of truth for "where does this role land after auth".
 *
 * Every redirect site — LoginPage (post-login + already-authed), RootRedirect,
 * and ProtectedRoute's not-allowed fallback — MUST route through this helper.
 * The original bug (a zone officer landing on the client_admin dashboard) came
 * from three separate `isSuperAdmin ? ... : '/clientadmin/overview'` checks that
 * lumped every non-super-admin together. Centralizing kills that class of bug
 * and guarantees a role can never be bounced into an area it isn't allowed on
 * (which would otherwise cause an infinite redirect loop).
 */

const LANDING_BY_ROLE = {
  super_admin: '/superadmin/overview',
  client_admin: '/clientadmin/overview',
  technician: '/clientadmin/overview', // still bucketed in /clientadmin for now
  zone_incharge: '/zone/overview',
  zone_staff: '/zone/overview',
};

// Fallback keeps an unknown/missing role out of privileged areas.
export function landingFor(role) {
  return LANDING_BY_ROLE[role] ?? '/login';
}
