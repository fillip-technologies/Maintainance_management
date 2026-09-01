import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import ProtectedRoute from './app/common/ProtectedRoute';

// Auth Login View
import LoginPage from './app/login/LoginPage';

// Superadmin Layout & Views
import SuperadminLayout from './app/superadmin/SuperadminLayout';
import Overview from './app/superadmin/overview/Overview';
import SuperadminClientsPage from './app/superadmin/clientusers/SuperadminClientsPage';
import ProductsList from './app/superadmin/addproducts/ProductsList';
import AddProducts from './app/superadmin/addproducts/AddProducts';

// Clientadmin Layout & Views
import ClientadminLayout from './app/clientadmin/ClientadminLayout';
import ClientOverview from './app/clientadmin/overview/ClientOverview';
import DailyLogsPage from './app/clientadmin/dailylogs/DailyLogsPage';
import ZoneOfficerPage from './app/clientadmin/zoneofficer/ZoneOfficerPage';
import ClientUsersPage from './app/clientadmin/users/ClientUsersPage';
import ClientRequestsPage from './app/clientadmin/requests/ClientRequestsPage';
import ClientAssetsPage from './app/clientadmin/assets/ClientAssetsPage';
import ClientInvoicesPage from './app/clientadmin/invoices/ClientInvoicesPage';

function RootRedirect() {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isSuperAdmin ? '/superadmin/overview' : '/clientadmin/overview'} replace />;
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
            <Route path="products" element={<ProductsList />} />
            <Route path="add-products" element={<AddProducts />} />
          </Route>
        </Route>

        {/* Clientadmin Routes - Protected strictly for client_admin & facility operational roles */}
        <Route element={<ProtectedRoute allowedRoles={['client_admin', 'zone_incharge', 'zone_staff', 'technician']} />}>
          <Route path="/clientadmin" element={<ClientadminLayout />}>
            <Route index element={<Navigate to="/clientadmin/overview" replace />} />
            <Route path="overview" element={<ClientOverview />} />
            <Route path="daily-logs" element={<DailyLogsPage />} />
            <Route path="zone-officer" element={<ZoneOfficerPage />} />
            <Route path="users" element={<ClientUsersPage />} />
            <Route path="requests" element={<ClientRequestsPage />} />
            <Route path="assets" element={<ClientAssetsPage />} />
            <Route path="invoices" element={<ClientInvoicesPage />} />
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
