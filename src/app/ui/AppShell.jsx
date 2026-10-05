import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Header from '../common/Header';
import CommandPalette from './CommandPalette';

const COLLAPSE_KEY = 'fixly_rail_collapsed';

function readCollapsed() {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
}

/**
 * Shared frame for every signed-in area: rail, top bar, ⌘K palette, toast.
 * Layouts only add what is specific to them (e.g. the raise-problem modal).
 */
export default function AppShell({ children, onRaiseProblem, hideSidebar = false, overlay = null }) {
  const [isCollapsed, setIsCollapsedState] = useState(readCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const setIsCollapsed = (v) => {
    setIsCollapsedState(v);
    try { localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--paper)] text-[var(--ink)]">
      {!hideSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleMobileSidebar={() => setIsMobileOpen((o) => !o)} />
        <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
      <CommandPalette onRaiseProblem={onRaiseProblem} />
      {overlay}
    </div>
  );
}
