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
    return <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />;
  if (type === 'issue_updated')
    return <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />;
  if (type === 'log_submitted')
    return <ClipboardList size={16} className="text-emerald-500 shrink-0 mt-0.5" />;
  return <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />;
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
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={togglePanel}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[var(--bg-card)] border border-[var(--border-color)] transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-[wiggle_0.4s_ease-in-out]' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] w-[340px] sm:w-[380px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-blue-400" />
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-950/70 border border-rose-800 text-rose-300 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-slate-400 hover:text-blue-400 font-medium px-2 py-1 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Clear all"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-[var(--border-color)]/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#081023] border border-[var(--border-color)] flex items-center justify-center">
                  <Bell size={22} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">No notifications yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issue updates and logs will appear here
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    n.read ? 'bg-[var(--bg-card)]' : 'bg-[#0f1f3d]/50'
                  }`}
                >
                  <div className="mt-0.5">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{relativeTime(n.time)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
