import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ZoneSidebar from './ZoneSidebar';
import Header from '../common/Header';

/**
 * Layout shell for the Zone Officer area. Mirrors the client-admin layout but
 * uses the minimal ZoneSidebar and carries no client-admin affordances (no
 * "raise request" modal, no user management). Everything a zone officer sees is
 * scoped to their assigned zones by the backend.
 */
export default function ZoneLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative">
      <ZoneSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 w-full">
        <Header onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
