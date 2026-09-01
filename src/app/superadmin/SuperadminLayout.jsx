import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Header from '../common/Header';

export default function SuperadminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative">
      {/* Superadmin Sidebar (Desktop + Mobile Slide-in Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 w-full">
        <Header
          selectedFacility={selectedFacility}
          setSelectedFacility={setSelectedFacility}
          onOpenNewWorkOrder={() => navigate('/superadmin/add-products')}
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ selectedFacility }} />
        </main>
      </div>
    </div>
  );
}
