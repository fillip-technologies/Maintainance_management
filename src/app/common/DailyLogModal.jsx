import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ClipboardList, CheckCircle2, AlertTriangle, XCircle,
  Loader2, Package, ChevronDown, ChevronUp, MapPin,
} from 'lucide-react';
import { getDevices } from '../api/devicesApi';
import { getDailyLogs, submitDailyLog } from '../api/dailyLogsApi';

// Today as 'YYYY-MM-DD' in local time (matches the backend log-date key).
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const STATUS_CFG = {
  working:         { label: 'Working',     icon: CheckCircle2, active: 'bg-emerald-600 text-white border-emerald-600', ghost: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
  needs_attention: { label: 'Attention',   icon: AlertTriangle, active: 'bg-amber-500 text-white border-amber-500',   ghost: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
  not_working:     { label: 'Not Working', icon: XCircle,       active: 'bg-rose-600 text-white border-rose-600',     ghost: 'border-rose-300 text-rose-700 hover:bg-rose-50' },
};

// A single device row with three status pill buttons + collapsible notes.
function DeviceRow({ device, entry, onChange, existingLog }) {
  const [showNotes, setShowNotes] = useState(!!entry.notes);

  const setStatus = (status) => onChange(device.id, { ...entry, status });
  const setNotes  = (notes)  => onChange(device.id, { ...entry, notes });

  return (
    <div className={`flex flex-col gap-2 py-3.5 px-4 rounded-xl border
      ${!existingLog ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white'}`}>

      {/* Row header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Device info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border
            ${!existingLog ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            <Package size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{device.name}</p>
            {device.zone?.name && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={9} />{device.zone.name}
              </p>
            )}
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {Object.entries(STATUS_CFG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = entry.status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(active ? null : key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer
                  ${active ? cfg.active : `bg-white ${cfg.ghost}`}`}
              >
                <Icon size={11} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes toggle + input */}
      {showNotes ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a note (optional)…"
            value={entry.notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button
            type="button"
            onClick={() => { setNotes(''); setShowNotes(false); }}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronUp size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="self-start flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
        >
          <ChevronDown size={11} /> Add note
        </button>
      )}
    </div>
  );
}

export default function DailyLogModal({ isOpen, onClose, onSubmitted }) {
  const [devices, setDevices]       = useState([]);
  const [todayMap, setTodayMap]     = useState(new Map());   // deviceId → existing log
  const [entries, setEntries]       = useState(new Map());   // deviceId → {status, notes}
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [result, setResult]         = useState(null);        // {ok, failed}

  const today = todayISO();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const [devRes, logRes] = await Promise.all([
        getDevices({ limit: 100 }),
        getDailyLogs({ date: today, limit: 100 }),
      ]);

      const devItems = (devRes?.items ?? []).filter(
        (d) => d.status !== 'retired' && d.status !== 'provisioned' && d.zoneId,
      );

      const tMap = new Map(
        (logRes?.items ?? []).map((l) => [l.device?.id ?? l.deviceId, l]),
      );

      // Pre-fill entries from existing logs; un-logged devices start with null status.
      const eMap = new Map(
        devItems.map((d) => {
          const existing = tMap.get(d.id);
          return [d.id, { status: existing?.status ?? null, notes: existing?.notes ?? '' }];
        }),
      );

      setDevices(devItems);
      setTodayMap(tMap);
      setEntries(eMap);
    } catch (err) {
      setError(err.message || 'Failed to load devices.');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleChange = (deviceId, entry) => {
    setEntries((prev) => new Map(prev).set(deviceId, entry));
  };

  const pendingCount = [...entries.values()].filter((e) => e.status !== null).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setResult(null);

    const toSubmit = devices.filter((d) => entries.get(d.id)?.status);
    const results = await Promise.allSettled(
      toSubmit.map((d) => {
        const e = entries.get(d.id);
        return submitDailyLog({
          deviceId: d.id,
          status:   e.status,
          notes:    e.notes || '',
          overwrite: todayMap.has(d.id),
        });
      }),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    const ok     = results.length - failed.length;

    setSubmitting(false);

    if (failed.length === 0) {
      setResult({ ok, failed: 0 });
      onSubmitted?.();
      setTimeout(onClose, 1200);
    } else {
      setResult({ ok, failed: failed.length });
      setError(`${failed.length} log${failed.length !== 1 ? 's' : ''} failed to submit. ${ok} succeeded.`);
    }
  };

  if (!isOpen) return null;

  const unlogged      = devices.filter((d) => !todayMap.has(d.id));
  const alreadyLogged = devices.filter((d) =>  todayMap.has(d.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">

        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <ClipboardList size={17} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Submit Today's Status</h2>
              <p className="text-[11px] text-slate-400">
                {fmtDate(today)}
                {!loading && unlogged.length > 0 && ` · ${unlogged.length} not yet logged`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {loading && (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin text-amber-500" />
              <span className="text-sm">Loading devices…</span>
            </div>
          )}

          {!loading && devices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
              <Package size={28} className="opacity-40" />
              <p className="text-sm font-medium">No deployed devices in your scope</p>
            </div>
          )}

          {/* Error / result banners */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {result && result.failed === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={14} />
              {result.ok} device{result.ok !== 1 ? 's' : ''} logged successfully.
            </div>
          )}

          {/* Not logged today */}
          {!loading && unlogged.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  Not Logged Today
                </span>
                <span className="text-[10px] font-semibold text-amber-600">
                  {unlogged.length} device{unlogged.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {unlogged.map((d) => (
                  <DeviceRow
                    key={d.id}
                    device={d}
                    entry={entries.get(d.id) ?? { status: null, notes: '' }}
                    existingLog={false}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider between sections */}
          {!loading && unlogged.length > 0 && alreadyLogged.length > 0 && (
            <div className="border-t border-dashed border-slate-200" />
          )}

          {/* Already logged */}
          {!loading && alreadyLogged.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Already Logged
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  change to update
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {alreadyLogged.map((d) => (
                  <DeviceRow
                    key={d.id}
                    device={d}
                    entry={entries.get(d.id) ?? { status: null, notes: '' }}
                    existingLog
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && devices.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pendingCount === 0 || submitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                : <>Submit {pendingCount > 0 ? `${pendingCount} Device${pendingCount !== 1 ? 's' : ''}` : ''} →</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
