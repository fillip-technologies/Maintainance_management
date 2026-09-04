import React, { useState, useEffect } from 'react';
import {
  X, AlertTriangle, Trash2, Download, MapPin,
  Users, Package, ClipboardList, Wrench, Building2, Loader2
} from 'lucide-react';
import { getClientDependents, downloadClientExport, deleteClient } from '../../../api/clientsApi';

function DependentRow({ icon: Icon, color, label, count, note }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        {note && <p className="text-[11px] text-slate-500 mt-0.5">{note}</p>}
      </div>
      <span className="text-sm font-extrabold text-slate-900 shrink-0">{count}</span>
    </div>
  );
}

export default function DeleteClientModal({ isOpen, client, onClose, onDeleted }) {
  const [dependents, setDependents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !client?.clientId) return;
    setDependents(null);
    setError(null);
    setLoading(true);
    getClientDependents(client.clientId)
      .then(setDependents)
      .catch((err) => setError(err.message || 'Could not load client data.'))
      .finally(() => setLoading(false));
  }, [isOpen, client?.clientId]);

  if (!isOpen || !client) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadClientExport(client.clientId, dependents?.client?.name || client.facilityName);
    } catch (err) {
      setError(err.message || 'Export failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteClient(client.clientId);
      onDeleted(client);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete client.');
      setDeleting(false);
    }
  };

  const d = dependents?.dependents;
  const clientLabel = dependents?.client?.name || client.facilityName || client.companyName;
  const orgLabel = dependents?.organization?.name || client.companyName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Remove Client</h2>
              <p className="text-xs text-rose-200">Review what will be deleted before confirming</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Client identity */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Organization</span>
              <span className="text-xs font-bold text-slate-700">{orgLabel}</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 mt-1">{clientLabel}</p>
          </div>

          {/* Dependents breakdown */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-semibold">Loading client data…</span>
            </div>
          )}

          {!loading && d && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">What will happen</p>
              <DependentRow
                icon={MapPin}
                color="bg-rose-50 text-rose-600"
                label="Zones"
                count={d.zones}
                note="Permanently deleted"
              />
              <DependentRow
                icon={Users}
                color="bg-rose-50 text-rose-600"
                label="User accounts"
                count={d.users}
                note="Permanently deleted"
              />
              <DependentRow
                icon={Package}
                color="bg-amber-50 text-amber-600"
                label="Deployed devices"
                count={d.devicesDeployed}
                note="Returned to org stock — not deleted"
              />
              <DependentRow
                icon={ClipboardList}
                color="bg-amber-50 text-amber-600"
                label="Open issues"
                count={d.openIssues}
                note="Remain on devices in org stock"
              />
              <DependentRow
                icon={Wrench}
                color="bg-slate-100 text-slate-500"
                label="Technician assignments"
                count={d.technicianAssignments}
                note="Removed"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Warning banner */}
          {!loading && d && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-amber-800">
                This action cannot be undone. Download the client data first if you need a record.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || downloading || !d}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {downloading ? 'Downloading…' : 'Download Data'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || deleting || !d}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Removing…' : 'Yes, Remove Client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
