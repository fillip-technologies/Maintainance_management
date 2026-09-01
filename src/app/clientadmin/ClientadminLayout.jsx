import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Header from '../common/Header';
import ClientRaiseRequestModal from './overview/components/ClientRaiseRequestModal';

export default function ClientadminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRequestCreated = (newTicket) => {
    showToast(`Request "${newTicket.title}" created successfully (ID: ${newTicket.id})!`);
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
      <ClientRaiseRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onCreated={handleRequestCreated}
      />
    </div>
  );
}
