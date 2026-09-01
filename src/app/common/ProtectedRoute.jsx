import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Enforces Authentication and Strict Role-Based Access Control (RBAC)
 * 
 * - Checks if user is authenticated (valid token & user object in state)
 * - super_admin is strictly confined to /superadmin/*
 * - client_admin, zone_incharge, etc. are strictly confined to /clientadmin/*
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, currentUser } = useAuth();

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role;

  // 2. Check if current role is in allowedRoles
  if (allowedRoles.length > 0) {
    if (allowedRoles.includes(role)) {
      return <Outlet />;
    }

    // Role is NOT permitted for this route section:
    // If super_admin tried to access clientadmin route, redirect to superadmin
    if (role === 'super_admin') {
      return <Navigate to="/superadmin/overview" replace />;
    }

    // If client_admin or other facility role tried to access superadmin route, redirect to clientadmin
    return <Navigate to="/clientadmin/overview" replace />;
  }

  return <Outlet />;
}
