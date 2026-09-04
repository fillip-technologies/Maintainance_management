import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Header from '../common/Header';

const NO_SIDEBAR_ROUTES = ['/superadmin/inventory-logs'];

export default function SuperadminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const hideSidebar = NO_SIDEBAR_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative">
      {!hideSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 w-full">
        <Header
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
