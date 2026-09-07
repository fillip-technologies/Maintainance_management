import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, Package,
  Loader2, MapPin, Search, X, SquareCheck, Square,
  ClipboardList, CheckCheck, Clock,
} from 'lucide-react';
import { getDevices } from '../api/devicesApi';
import { getDailyLogs, submitDailyLog } from '../api/dailyLogsApi';

// ── helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CFG = [
  {
    key:    'working',
    label:  'Working',
    icon:   CheckCircle2,
    active: 'bg-emerald-600 border-emerald-600 text-white',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50',
    badge:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot:    'bg-emerald-500',
  },
  {
    key:    'needs_attention',
    label:  'Needs Attention',
    icon:   AlertTriangle,
    active: 'bg-amber-500 border-amber-500 text-white',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50',
    badge:  'bg-amber-100 text-amber-800 border-amber-200',
    dot:    'bg-amber-500',
  },
  {
    key:    'not_working',
    label:  'Not Working',
    icon:   XCircle,
    active: 'bg-rose-600 border-rose-600 text-white',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50',
    badge:  'bg-rose-100 text-rose-800 border-rose-200',
    dot:    'bg-rose-500',
  },
];

const sCfg = (key) => STATUS_CFG.find((s) => s.key === key);

// ── Floating action bar ───────────────────────────────────────────────────────

function ActionBar({ count, status, setStatus, notes, setNotes, onSubmit, onClear, submitting }) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 min-w-[520px]">

        {/* Selected count */}
        <div className="flex items-center gap-2 shrink-0">
          <CheckCheck size={15} className="text-indigo-400" />
          <span className="text-xs font-bold">{count} selected</span>
          <button
            onClick={onClear}
            className="ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-700 hidden sm:block shrink-0" />

        {/* Status buttons */}
        <div className="flex items-center gap-1.5">
          {STATUS_CFG.map((s) => {
            const Icon = s.icon;
            const active = status === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatus(active ? '' : s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer
                  ${active ? s.active : 'border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'}`}
              >
                <Icon size={12} />{s.label}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-slate-700 hidden sm:block shrink-0" />

        {/* Notes */}
        <input
          type="text"
          placeholder="Note (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-600 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />

        {/* Submit */}
        <button
          type="button"
          disabled={!status || submitting}
          onClick={onSubmit}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting
            ? <Loader2 size={13} className="animate-spin" />
            : <ClipboardList size={13} />}
          {submitting ? 'Saving…' : `Log ${count}`}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ZoneDailyLogPage() {
  const today = todayISO();

  const [devices, setDevices]   = useState([]);
  const [todayMap, setTodayMap] = useState(new Map());
  const [loading, setLoading]   = useState(true);

  const [filter, setFilter]     = useState('all');   // 'all' | 'pending' | 'logged'
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(new Set());

  const [status, setStatus]     = useState('');
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [devRes, logRes] = await Promise.all([
        getDevices({ limit: 100 }),
        getDailyLogs({ date: today, limit: 100 }),
      ]);
      const items = (devRes?.items ?? []).filter(
        (d) => d.status !== 'retired' && d.status !== 'provisioned' && d.zoneId,
      );
      const tMap = new Map(
        (logRes?.items ?? []).map((l) => [l.device?.id ?? l.deviceId, l]),
      );
      setDevices(items);
      setTodayMap(tMap);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  // ── derived ──────────────────────────────────────────────────────────────

  const totalLogged  = [...todayMap.values()].length;
  const totalPending = devices.length - totalLogged;

  const filtered = useMemo(() => {
    let list = devices;
    if (filter === 'pending') list = list.filter((d) => !todayMap.has(d.id));
    if (filter === 'logged')  list = list.filter((d) =>  todayMap.has(d.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.zone?.name?.toLowerCase().includes(q) ||
          d.hardwareType?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [devices, todayMap, filter, search]);

  // ── selection helpers ────────────────────────────────────────────────────

  const visibleIds   = filtered.map((d) => d.id);
  const allVisible   = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  // Only un-logged devices can be selected.
  const toggleDevice = (id) => {
    if (todayMap.has(id)) return;           // already logged — locked
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // "Select all visible" only picks un-logged ones.
  const pendingVisible = visibleIds.filter((id) => !todayMap.has(id));
  const allVisible     = pendingVisible.length > 0 && pendingVisible.every((id) => selected.has(id));

  const toggleAllVisible = () =>
    setSelected(allVisible
      ? new Set([...selected].filter((id) => !pendingVisible.includes(id)))
      : new Set([...selected, ...pendingVisible]));

  const clearSelection = () => { setSelected(new Set()); setStatus(''); setNotes(''); };

  const selectPending = () =>
    setSelected(new Set(devices.filter((d) => !todayMap.has(d.id)).map((d) => d.id)));

  // ── submit ───────────────────────────────────────────────────────────────

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!status || selected.size === 0 || submitting) return;
    setSubmitting(true);
    const ids = [...selected];
    // overwrite is intentionally omitted — once logged, a device cannot be re-logged the same day.
    const results = await Promise.allSettled(
      ids.map((deviceId) =>
        submitDailyLog({ deviceId, status, notes: notes.trim() }),
      ),
    );
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    setSubmitting(false);
    showToast(ok === ids.length ? 'ok' : 'err',
      ok === ids.length
        ? `${ok} device${ok !== 1 ? 's' : ''} logged as "${status.replace(/_/g, ' ')}".`
        : `${ok} of ${ids.length} logged. ${ids.length - ok} failed.`,
    );
    if (ok > 0) {
      setTodayMap((prev) => {
        const next = new Map(prev);
        ids.forEach((id) => next.set(id, { status, notes }));
        return next;
      });
      clearSelection();
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  const FILTER_TABS = [
    { key: 'all',     label: 'All',     count: devices.length },
    { key: 'pending', label: 'Pending', count: totalPending },
    { key: 'logged',  label: 'Logged',  count: totalLogged },
  ];

  return (
    <div className="flex flex-col gap-6 pb-28 animate-in fade-in duration-200">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Log Entry
          </h1>
          <p className="text-xs md:text-sm text-slate-500">{fmtDate(today)}</p>
        </div>

        {/* Summary chips */}
        {!loading && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
              <Package size={13} className="text-slate-400" />
              {devices.length} devices
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={13} /> {totalLogged} logged
            </span>
            {totalPending > 0 && (
              <button
                onClick={selectPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <Clock size={13} /> {totalPending} pending — select all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-semibold
          ${toast.type === 'ok'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={14} className="shrink-0" />
            : <AlertTriangle size={14} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Filters + search ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${filter === t.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full
                ${filter === t.key
                  ? t.key === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  : 'text-slate-400'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by device name, zone, or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Device table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {/* Table head */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/70">
          {/* Select all visible */}
          <button
            type="button"
            onClick={toggleAllVisible}
            disabled={filtered.length === 0}
            className={`shrink-0 transition-colors cursor-pointer disabled:opacity-30
              ${allVisible ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
          >
            {allVisible ? <SquareCheck size={17} /> : <Square size={17} />}
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex-1">
            Device / Zone
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-36 hidden sm:block">
            Today's Status
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-16 text-center hidden md:block">
            Quick Log
          </span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm">
            <Loader2 size={18} className="animate-spin text-amber-500" /> Loading devices…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
            <Package size={28} className="opacity-30" />
            <p className="text-sm font-medium">
              {devices.length === 0 ? 'No active devices in your zone' : 'No devices match your filter'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((device) => {
              const isLogged   = todayMap.has(device.id);
              const isSelected = !isLogged && selected.has(device.id);
              const existing   = todayMap.get(device.id);
              const cfg        = existing ? sCfg(existing.status) : null;

              return (
                <div
                  key={device.id}
                  onClick={() => !isLogged && toggleDevice(device.id)}
                  className={`flex items-center gap-4 px-5 py-4 transition-all group
                    ${isLogged
                      ? 'opacity-60 cursor-default'
                      : isSelected
                      ? 'bg-indigo-50/60 cursor-pointer'
                      : 'hover:bg-slate-50/70 cursor-pointer'}`}
                >
                  {/* Checkbox — hidden for already-logged rows */}
                  <div className={`shrink-0 transition-colors ${isLogged ? 'invisible' : isSelected ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                    {isSelected ? <SquareCheck size={17} /> : <Square size={17} />}
                  </div>

                  {/* Device info */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border
                      ${isSelected ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      <Package size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {device.name}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={9} className="shrink-0" />
                        {device.zone?.name ?? '—'}
                        {device.hardwareType?.name && (
                          <span className="text-slate-300 mx-1">·</span>
                        )}
                        {device.hardwareType?.name}
                      </p>
                    </div>
                  </div>

                  {/* Today's status */}
                  <div className="w-36 shrink-0 hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {cfg ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        {existing?.createdAt && (
                          <span className="text-[10px] text-slate-400 pl-1 flex items-center gap-1">
                            <Clock size={8} /> {fmtTime(existing.createdAt)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 border-amber-200 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Quick log — only for un-logged devices */}
                  <div className="w-16 shrink-0 hidden md:flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {!isLogged && STATUS_CFG.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          title={s.label}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await submitDailyLog({ deviceId: device.id, status: s.key, notes: '' });
                              setTodayMap((prev) => { const n = new Map(prev); n.set(device.id, { status: s.key }); return n; });
                              showToast('ok', `${device.name} → ${s.label}`);
                            } catch (err) {
                              showToast('err', err.message || 'Failed');
                            }
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all cursor-pointer"
                        >
                          <Icon size={11} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating action bar ───────────────────────────────────────────── */}
      <ActionBar
        count={selected.size}
        status={status}
        setStatus={setStatus}
        notes={notes}
        setNotes={setNotes}
        onSubmit={handleSubmit}
        onClear={clearSelection}
        submitting={submitting}
      />
    </div>
  );
}
