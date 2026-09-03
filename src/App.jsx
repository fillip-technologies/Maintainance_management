import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import ProtectedRoute from './app/common/ProtectedRoute';
import { landingFor } from './app/common/roleRouting';

// Auth Login View
import LoginPage from './app/login/LoginPage';

// Zone Officer Layout & Views
import ZoneLayout from './app/zone/ZoneLayout';
import ZoneOverview from './app/zone/ZoneOverview';

// Shared "Raise Query" panel (client_admin + zone officers)
import RaiseQueryPage from './app/common/RaiseQueryPage';

// Superadmin Layout & Views
import SuperadminLayout from './app/superadmin/SuperadminLayout';
import Overview from './app/superadmin/overview/Overview';
import SuperadminClientsPage from './app/superadmin/clientusers/SuperadminClientsPage';
import ProductsList from './app/superadmin/addproducts/ProductsList';
import CategoriesPage from './app/superadmin/categories/CategoriesPage';
import TechniciansPage from './app/superadmin/technicians/TechniciansPage';
import IssuesPage from './app/superadmin/issues/IssuesPage';

// Clientadmin Layout & Views
import ClientadminLayout from './app/clientadmin/ClientadminLayout';
import ClientOverview from './app/clientadmin/overview/ClientOverview';
import DailyLogsPage from './app/clientadmin/dailylogs/DailyLogsPage';
import ZoneOfficerPage from './app/clientadmin/zoneofficer/ZoneOfficerPage';
import ClientUsersPage from './app/clientadmin/users/ClientUsersPage';
import ClientAssetsPage from './app/clientadmin/assets/ClientAssetsPage';
import ClientInvoicesPage from './app/clientadmin/invoices/ClientInvoicesPage';
import ZonesPage from './app/clientadmin/zones/ZonesPage';
import ZoneDetailPage from './app/clientadmin/zones/ZoneDetailPage';

function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Single source of truth for per-role landing — never bucket non-super-admins
  // together (that was the bug that sent zone officers to the client dashboard).
  return <Navigate to={landingFor(currentUser?.role)} replace />;
}

function AppRoutes() {
  const { bootstrapping } = useAuth();

  // Don't render any route until a stored token has been validated — otherwise
  // an unverified session briefly flashes the dashboard before redirecting.
  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Superadmin Routes - Protected strictly for super_admin */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/superadmin" element={<SuperadminLayout />}>
            <Route index element={<Navigate to="/superadmin/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="clients" element={<SuperadminClientsPage />} />
            <Route path="technicians" element={<TechniciansPage />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="issues" element={<IssuesPage />} />
          </Route>
        </Route>

        {/* Zone Officer Routes - Protected strictly for zone_incharge & zone_staff.
            Their own scope-limited area; the backend further restricts every read
            to their assigned zone subtree. */}
        <Route element={<ProtectedRoute allowedRoles={['zone_incharge', 'zone_staff']} />}>
          <Route path="/zone" element={<ZoneLayout />}>
            <Route index element={<Navigate to="/zone/overview" replace />} />
            <Route path="overview" element={<ZoneOverview />} />
            <Route path="requests" element={<RaiseQueryPage />} />
          </Route>
        </Route>

        {/* Clientadmin Routes - client_admin and (for now) technician. Zone
            officers are intentionally NOT here — they have their own /zone area. */}
        <Route element={<ProtectedRoute allowedRoles={['client_admin', 'technician']} />}>
          <Route path="/clientadmin" element={<ClientadminLayout />}>
            <Route index element={<Navigate to="/clientadmin/overview" replace />} />
            <Route path="overview" element={<ClientOverview />} />
            <Route path="daily-logs" element={<DailyLogsPage />} />
            <Route path="zone-officer" element={<ZoneOfficerPage />} />
            <Route path="users" element={<ClientUsersPage />} />
<Route path="requests" element={<RaiseQueryPage />} />
            <Route path="assets" element={<ClientAssetsPage />} />
            <Route path="invoices" element={<ClientInvoicesPage />} />
            <Route path="zones" element={<ZonesPage />} />
            <Route path="zones/:zoneId" element={<ZoneDetailPage />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
