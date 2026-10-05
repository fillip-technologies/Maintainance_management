import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, AlertTriangle, CheckCircle2, ClipboardList, Info } from 'lucide-react';
import { socketClient } from '../api/socketClient';

// ─── helpers ────────────────────────────────────────────────────────────────

let _idCounter = 0;
const uid = () => `notif-${Date.now()}-${++_idCounter}`;

function relativeTime(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildNotification(event, payload) {
  const base = { id: uid(), time: new Date(), read: false };

  if (event === 'issue:created') {
    return {
      ...base,
      type: 'issue_created',
      title: 'New issue reported',
      body: payload?.description
        ? `${payload.description}${payload.priority ? ` · ${payload.priority}` : ''}`
        : 'A new issue has been raised',
    };
  }
  if (event === 'issue:updated') {
    const from = payload?.fromStatus ?? payload?.status;
    const to   = payload?.toStatus ?? payload?.status;
    const label = from && to && from !== to ? `${from} → ${to}` : (to ?? '');
    return {
      ...base,
      type: 'issue_updated',
      title: 'Issue updated',
      body: payload?.description
        ? `${payload.description}${label ? ` · ${label}` : ''}`
        : `Status changed${label ? `: ${label}` : ''}`,
    };
  }
  if (event === 'log:submitted') {
    return {
      ...base,
      type: 'log_submitted',
      title: 'Daily log submitted',
      body: payload?.deviceName
        ? `Log submitted for ${payload.deviceName}`
        : 'A daily status log has been submitted',
    };
  }
  return { ...base, type: 'info', title: 'Notification', body: JSON.stringify(payload) };
}

// ─── icon per type ───────────────────────────────────────────────────────────

function NotifIcon({ type }) {
  if (type === 'issue_created')
    return <AlertTriangle size={16} className="text-[var(--down)] shrink-0 mt-0.5" />;
  if (type === 'issue_updated')
    return <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />;
  if (type === 'log_submitted')
    return <ClipboardList size={16} className="text-[var(--ok)] shrink-0 mt-0.5" />;
  return <Info size={16} className="text-[var(--ink-3)] shrink-0 mt-0.5" />;
}

// ─── main component ──────────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 50;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef  = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── socket listeners ──
  const addNotification = useCallback((event) => (payload) => {
    setNotifications((prev) => {
      const notif = buildNotification(event, payload);
      return [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  useEffect(() => {
    const unsubs = [
      socketClient.on('issue:created', addNotification('issue:created')),
      socketClient.on('issue:updated', addNotification('issue:updated')),
      socketClient.on('log:submitted', addNotification('log:submitted')),
    ];
    return () => unsubs.forEach((u) => u());
  }, [addNotification]);

  // ── click-outside to close ──
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── mark all read when panel opens ──
  const togglePanel = () => {
    setOpen((prev) => {
      if (!prev) {
        setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      }
      return !prev;
    });
  };

  const markAllRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  // ── render ──
  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={togglePanel}
        className="relative w-9 h-9 grid place-items-center rounded-[10px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] grid place-items-center rounded-full bg-[var(--down)] text-white text-[9.5px] font-[700] px-1 leading-none ring-2 ring-[var(--paper)] num">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+10px)] w-[340px] sm:w-[380px] bg-[var(--surface)] border border-[var(--line)] rounded-[14px] shadow-[var(--shadow-pop)] z-50 overflow-hidden text-[var(--ink)]"
          style={{ animation: 'fx-pop 160ms ease-out both' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-[650]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10.5px] font-[650] px-1.5 py-0.5 rounded-full bg-[var(--down-soft)] text-[var(--down-ink)] num">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  className="text-[11.5px] text-[var(--ink-3)] hover:text-[var(--ink)] font-[550] px-2 py-1 rounded-md hover:bg-[var(--color-interactive-hover)] cursor-pointer"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="w-7 h-7 grid place-items-center text-[var(--ink-3)] hover:text-[var(--down)] rounded-md hover:bg-[var(--color-interactive-hover)] cursor-pointer"
                  title="Clear all"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto fx-scroll">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                <span className="w-11 h-11 rounded-2xl grid place-items-center bg-[var(--surface-3)] text-[var(--ink-3)]">
                  <Bell size={20} />
                </span>
                <div>
                  <p className="text-[13px] font-[620]">All quiet</p>
                  <p className="text-[12px] text-[var(--ink-3)] mt-0.5">New faults, repairs and daily checks show up here live.</p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--line)] last:border-b-0 ${n.read ? '' : 'bg-[var(--accent-soft)]'}`}
                >
                  <div className="mt-0.5">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] font-[620] truncate ${n.read ? 'text-[var(--ink-2)]' : 'text-[var(--ink)]'}`}>{n.title}</p>
                    <p className="text-[11.5px] text-[var(--ink-3)] mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                    <p className="text-[10.5px] text-[var(--ink-4)] mt-1 font-mono">{relativeTime(n.time)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
