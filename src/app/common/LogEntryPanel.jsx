import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, CheckCircle2, AlertTriangle, XCircle,
  Loader2, Package, MapPin, CheckSquare, Square, SquareCheck,
} from 'lucide-react';
import { getDevices } from '../api/devicesApi';
import { getDailyLogs, submitDailyLog } from '../api/dailyLogsApi';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'short',
  });
}

const STATUS_CFG = [
  {
    key:    'working',
    label:  'Working',
    icon:   CheckCircle2,
    active: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/60',
    dot:    'bg-emerald-500',
    badge:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    key:    'needs_attention',
    label:  'Needs Attention',
    icon:   AlertTriangle,
    active: 'bg-amber-500 border-amber-500 text-white shadow-amber-100',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/60',
    dot:    'bg-amber-500',
    badge:  'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    key:    'not_working',
    label:  'Not Working',
    icon:   XCircle,
    active: 'bg-rose-600 border-rose-600 text-white shadow-rose-100',
    idle:   'bg-white border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-700 hover:bg-rose-50/60',
    dot:    'bg-rose-500',
    badge:  'bg-rose-100 text-rose-700 border-rose-200',
  },
];

const statusCfg = (key) => STATUS_CFG.find((s) => s.key === key);

export default function LogEntryPanel({ onSubmitted }) {
  const today = todayISO();

  const [devices, setDevices]       = useState([]);
  const [todayMap, setTodayMap]     = useState(new Map());
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(new Set()); // deviceIds
  const [status, setStatus]         = useState('');
  const [notes, setNotes]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

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
      // Un-logged first
      items.sort((a, b) => (tMap.has(a.id) ? 1 : 0) - (tMap.has(b.id) ? 1 : 0));
      setDevices(items);
      setTodayMap(tMap);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const unlogged = devices.filter((d) => !todayMap.has(d.id));

  // Only un-logged devices can be selected.
  const toggleDevice = (id) => {
    if (todayMap.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectUnlogged = () =>
    setSelected(new Set(unlogged.map((d) => d.id)));

  const clearSelection = () => setSelected(new Set());

  // "Select all" only selects un-logged devices.
  const allSelected =
    unlogged.length > 0 && unlogged.every((d) => selected.has(d.id));

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(unlogged.map((d) => d.id)));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!status || selected.size === 0 || submitting) return;
    setSubmitting(true);
    const ids = [...selected];
    const results = await Promise.allSettled(
      ids.map((deviceId) =>
        submitDailyLog({
          deviceId,
          status,
          notes: notes.trim(),
          overwrite: todayMap.has(deviceId),
        }),
      ),
    );
    const ok     = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    setSubmitting(false);

    if (failed === 0) {
      showToast('ok', `${ok} device${ok !== 1 ? 's' : ''} logged as "${status.replace(/_/g, ' ')}".`);
      // Update local map so rows reflect new status immediately
      setTodayMap((prev) => {
        const next = new Map(prev);
        ids.forEach((id) => next.set(id, { status, notes }));
        return next;
      });
      setSelected(new Set());
      setStatus('');
      setNotes('');
      onSubmitted?.();
    } else {
      showToast('err', `${failed} failed, ${ok} succeeded.`);
    }
  };

  const canSubmit = selected.size > 0 && status && !submitting;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ClipboardList size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Log Entry</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(today)}</p>
          </div>
        </div>
        {!loading && unlogged.length > 0 && (
          <span className="text-[10px] font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full">
            {unlogged.length} pending
          </span>
        )}
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`mx-4 mt-4 p-3 rounded-xl text-[11px] font-semibold flex items-center gap-2
          ${toast.type === 'ok'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
          {toast.type === 'ok'
            ? <CheckCircle2 size={13} className="shrink-0" />
            : <AlertTriangle size={13} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Device list ─────────────────────────────────────────────────── */}
      <div className="flex flex-col">

        {/* List toolbar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Devices
          </p>
          {!loading && devices.length > 0 && (
            <div className="flex items-center gap-2">
              {unlogged.length > 0 && (
                <button
                  type="button"
                  onClick={selectUnlogged}
                  className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer transition-colors"
                >
                  Select pending ({unlogged.length})
                </button>
              )}
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          )}
        </div>

        {/* Device rows */}
        <div className="px-4 pb-4 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 justify-center py-8 text-slate-400 text-xs">
              <Loader2 size={15} className="animate-spin" /> Loading devices…
            </div>
          ) : devices.length === 0 ? (
            <div className="flex items-center gap-2 justify-center py-8 text-slate-400 text-xs">
              <Package size={15} /> No active devices in scope
            </div>
          ) : devices.map((device) => {
            const isSelected  = selected.has(device.id);
            const existing    = todayMap.get(device.id);
            const existingCfg = existing ? statusCfg(existing.status) : null;

            return (
              <button
                key={device.id}
                type="button"
                onClick={() => toggleDevice(device.id)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left w-full transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? 'bg-indigo-50 border-indigo-400 shadow-sm shadow-indigo-100'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
              >
                {/* Checkbox */}
                <div className={`shrink-0 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {isSelected
                    ? <SquareCheck size={17} />
                    : <Square size={17} />}
                </div>

                {/* Device info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {device.name}
                  </p>
                  {device.zone?.name && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={9} />{device.zone.name}
                    </p>
                  )}
                </div>

                {/* Today's log status */}
                {existingCfg ? (
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${existingCfg.badge}`}>
                    {existingCfg.label}
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700">
                    Pending
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status + Notes + Submit ──────────────────────────────────────── */}
      <div className="border-t border-slate-100 px-5 py-4 flex flex-col gap-4 bg-slate-50/50">

        {/* Selected count */}
        <p className={`text-[11px] font-bold transition-colors ${selected.size > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
          {selected.size > 0
            ? `${selected.size} device${selected.size !== 1 ? 's' : ''} selected — set status below`
            : 'Select devices above to log their status'}
        </p>

        {/* Status buttons */}
        <div className="grid grid-cols-3 gap-2">
          {STATUS_CFG.map((s) => {
            const Icon   = s.icon;
            const active = status === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatus(active ? '' : s.key)}
                disabled={selected.size === 0}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                  ${active ? `${s.active} shadow-sm` : s.idle}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="text-[10px] font-bold leading-tight">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Notes <span className="font-normal text-slate-400 normal-case">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Any observation or remark…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={selected.size === 0}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder:text-slate-300 disabled:opacity-40"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold shadow-sm shadow-amber-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting
            ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            : selected.size > 0 && status
            ? `Submit ${selected.size} Device${selected.size !== 1 ? 's' : ''}`
            : 'Submit Log Entry'}
        </button>
      </div>
    </div>
  );
}
