import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socketClient } from '../api/socketClient';
import NotificationBell from './NotificationBell';
import { currentNavItem, openCommandPalette } from '../ui/nav';
import { useTheme } from '../ui/theme';

/**
 * Top bar: where am I, find anything (⌘K), is data live, theme, alerts.
 * Sign-out lives in the rail footer.
 */
export default function Header({ onToggleMobileSidebar }) {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const [isLive, setIsLive] = useState(socketClient.isConnected);

  useEffect(() => {
    const offC = socketClient.on('connect', () => setIsLive(true));
    const offD = socketClient.on('disconnect', () => setIsLive(false));
    setIsLive(socketClient.isConnected);
    return () => { offC(); offD(); };
  }, []);

  const item = currentNavItem(currentUser?.role, pathname);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');

  return (
    <header className="h-[60px] sticky top-0 z-30 flex items-center gap-3 px-3 sm:px-6 bg-[var(--paper)]/85 backdrop-blur-md border-b border-[var(--line)]">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="md:hidden w-9 h-9 grid place-items-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--color-interactive-hover)] cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      <div className="min-w-0 flex items-center gap-2 text-[13px]">
        {item?.group && <span className="hidden sm:inline text-[var(--ink-3)]">{item.group}</span>}
        {item?.group && <span className="hidden sm:inline text-[var(--ink-4)]">/</span>}
        <span className="font-[620] text-[var(--ink)] truncate">{item?.name ?? 'Fixly'}</span>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={openCommandPalette}
        className="hidden sm:flex items-center gap-2.5 h-9 w-[260px] lg:w-[320px] pl-3 pr-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[13px] text-[var(--ink-3)] hover:border-[var(--line-strong)] cursor-pointer transition-colors"
      >
        <Search size={15} />
        <span className="flex-1 text-left truncate">Search locations, equipment…</span>
        <span className="fx-kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
      </button>
      <button
        type="button"
        onClick={openCommandPalette}
        className="sm:hidden w-9 h-9 grid place-items-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--color-interactive-hover)] cursor-pointer"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      <div
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[10px] text-[12px] font-[560] text-[var(--ink-2)]"
        title={isLive ? 'Receiving live updates' : 'Live updates paused — data refreshes on load'}
      >
        <span
          className={`w-2 h-2 rounded-full ${isLive ? 'fx-live-dot' : ''}`}
          style={{ background: isLive ? 'var(--ok)' : 'var(--idle)', color: 'var(--ok)' }}
        />
        {isLive ? 'Live' : 'Offline'}
      </div>

      <button
        type="button"
        onClick={toggle}
        className="w-9 h-9 grid place-items-center rounded-[10px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer"
        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <NotificationBell />
    </header>
  );
}
