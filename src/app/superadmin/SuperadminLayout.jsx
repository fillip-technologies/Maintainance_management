import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppShell from '../ui/AppShell';

const NO_SIDEBAR_ROUTES = ['/superadmin/inventory-logs'];

export default function SuperadminLayout() {
  const { pathname } = useLocation();

  return (
    <AppShell hideSidebar={NO_SIDEBAR_ROUTES.includes(pathname)}>
      <Outlet />
    </AppShell>
  );
}
