import React, { useState, useEffect } from 'react';
import { X, XCircle, AlertTriangle, Loader2, Package, Tag } from 'lucide-react';
import { getIssues } from '../../../api/issuesApi';
import { getDevices } from '../../../api/devicesApi';

const PRIORITY_STYLE = {
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_STYLE = {
  open:        'bg-rose-50 text-rose-700',
  assigned:    'bg-sky-50 text-sky-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  on_hold:     'bg-amber-50 text-amber-700',
  reopened:    'bg-orange-50 text-orange-700',
};

export default function ZoneIssuesModal({ zoneId, zoneName, onClose }) {
  const [devices, setDevices]   = useState([]);
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!zoneId) return;
    let cancelled = false;
    setLoading(true); setError('');

    Promise.all([
      getDevices({ zoneId, status: 'faulty', limit: 100 }),
      getIssues({ zoneId, status: 'open,assigned,in_progress,on_hold,reopened', limit: 100 }),
    ])
      .then(([devData, issData]) => {
        if (cancelled) return;
        setDevices(devData.items ?? []);
        setIssues(issData.items ?? []);
      })
      .catch((ex) => { if (!cancelled) setError(ex.message || 'Failed to load.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [zoneId]);

  // Group issues by deviceId for quick lookup
  const issuesByDevice = issues.reduce((acc, iss) => {
    const id = iss.device?.id ?? iss.deviceId;
    if (!acc[id]) acc[id] = [];
    acc[id].push(iss);
    return acc;
  }, {});

  // Devices that appear in issues but may not be in the faulty list (e.g. under_maintenance)
  const allBadDeviceIds = [...new Set([
    ...devices.map((d) => d.id),
    ...issues.map((i) => i.device?.id ?? i.deviceId),
  ])];

  const deviceMap = Object.fromEntries(devices.map((d) => [d.id, d]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <XCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Not Working — {zoneName}</h2>
              <p className="text-xs text-rose-200">Faulty devices and their open issues</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {!loading && !error && allBadDeviceIds.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
              <Package size={28} className="text-slate-300" />
              <p className="text-sm font-semibold">No faulty devices or open issues in this zone.</p>
            </div>
          )}

          {!loading && !error && allBadDeviceIds.map((deviceId) => {
            const device = deviceMap[deviceId];
            const deviceIssues = issuesByDevice[deviceId] ?? [];
            const deviceName = device?.name ?? issues.find(i => (i.device?.id ?? i.deviceId) === deviceId)?.device?.name ?? 'Unknown Device';

            return (
              <div key={deviceId} className="border border-slate-200 rounded-2xl overflow-hidden">
                {/* Device row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-rose-50/60">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Package size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{deviceName}</p>
                    {device?.code && <p className="text-[10px] text-slate-400 font-mono">{device.code}</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                    {device?.status ?? 'faulty'}
                  </span>
                </div>

                {/* Issues for this device */}
                {deviceIssues.length === 0 ? (
                  <p className="text-[11px] text-slate-400 px-4 py-2">No open issues logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {deviceIssues.map((iss) => (
                      <div key={iss.id} className="px-4 py-3 flex items-start gap-3">
                        <Tag size={13} className="text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {iss.category?.name ?? 'Issue'} — {iss.description?.slice(0, 60)}{iss.description?.length > 60 ? '…' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(iss.createdAt).toLocaleDateString()} · raised by {iss.raisedBy?.name ?? 'unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${PRIORITY_STYLE[iss.priority] ?? PRIORITY_STYLE.medium}`}>
                            {iss.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${STATUS_STYLE[iss.status] ?? ''}`}>
                            {iss.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
          <AlertTriangle size={11} />
          Showing faulty devices and all non-closed issues in <span className="font-bold text-slate-600">{zoneName}</span>.
        </div>
      </div>
    </div>
  );
}
