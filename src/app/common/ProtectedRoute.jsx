import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingFor } from './roleRouting';

/**
 * ProtectedRoute: Enforces Authentication and Strict Role-Based Access Control (RBAC)
 *
 * - Checks if user is authenticated (valid token & user object in state)
 * - super_admin       → /superadmin/*
 * - client_admin/tech → /clientadmin/*
 * - zone_incharge/staff → /zone/*
 *
 * When a role hits an area it isn't allowed on, it's redirected to ITS OWN
 * landing (via landingFor), never a hard-coded /clientadmin — otherwise a zone
 * officer bounced onto /clientadmin would loop forever.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, currentUser } = useAuth();

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role;

  // 2. Check if current role is in allowedRoles
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Not permitted here → send to this role's own home, not a fixed area.
    return <Navigate to={landingFor(role)} replace />;
  }

  return <Outlet />;
}
