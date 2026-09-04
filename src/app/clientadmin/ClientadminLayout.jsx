import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Header from '../common/Header';
import RaiseQueryModal from '../common/RaiseQueryModal';

export default function ClientadminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRequestCreated = (issues) => {
    const count = Array.isArray(issues) ? issues.length : 1;
    const unit = (Array.isArray(issues) ? issues[0] : issues)?.device?.name || 'unit';
    const msg = count > 1
      ? `${count} defects raised — units are now under maintenance.`
      : `Defect raised on ${unit} — the unit is now under maintenance.`;
    showToast(msg);
    // Let any open list (e.g. the Requests page) refresh without a socket round-trip.
    window.dispatchEvent(new CustomEvent('fixly:issue_created'));
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative">
      {/* Client-tailored Sidebar (Desktop + Mobile Slide-in Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 w-full">
        <Header
          onOpenNewWorkOrder={() => setIsRequestModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet
            context={{
              onOpenRequestModal: () => setIsRequestModalOpen(true),
              showToast
            }}
          />
        </main>
      </div>

      {/* Global Raise Request Modal for Client Admin */}
      <RaiseQueryModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onCreated={handleRequestCreated}
      />
    </div>
  );
}
