import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getImportTemplate, importProducts } from '../api/productsApi';

/**
 * Excel/CSV bulk import for units. Flow: download template → choose file →
 * dry-run preview (valid rows + per-row errors) → commit. `companyId` is passed
 * for a super_admin (who picks the org); omitted for a client_admin (own org).
 */
export default function ExcelImportModal({ isOpen, onClose, onImported, companyId = null }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // dry-run result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const reset = () => { setFile(null); setPreview(null); setError(null); };
  const close = () => { reset(); onClose(); };

  const downloadTemplate = async () => {
    try {
      const blob = await getImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'units_import_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Could not download template');
    }
  };

  const pickFile = (f) => {
    setFile(f);
    setPreview(null);
    setError(null);
  };

  const runDryRun = async () => {
    if (!file) return;
    setBusy(true); setError(null);
    try {
      setPreview(await importProducts(file, { companyId, dryRun: true }));
    } catch (e) {
      setError(e.message || 'Validation failed');
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const res = await importProducts(file, { companyId, dryRun: false });
      onImported?.(res);
      close();
    } catch (e) {
      setError(e.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const canImport = preview && preview.summary?.validRows > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Bulk Import Units</h2>
              <p className="text-xs text-slate-400">Excel/CSV → validate → import. Codes are generated automatically.</p>
            </div>
          </div>
          <button onClick={close} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"><X size={16} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Step 1: template */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800">Step 1.</span> Download the template and fill in your units.
              <div className="text-[11px] text-slate-400 mt-0.5">Required: name, category (name or code). Optional: quantity, zone (blank = in stock), price, purchase date.</div>
            </div>
            <button onClick={downloadTemplate} className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer">
              <Download size={14} /> Template
            </button>
          </div>

          {/* Step 2: file */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-600"><span className="font-bold text-slate-800">Step 2.</span> Choose your completed file.</span>
            <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 cursor-pointer transition-colors">
              <UploadCloud size={22} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">{file ? file.name : 'Click to select an .xlsx / .csv file'}</span>
                <span className="text-[11px] text-slate-400">Max 5 MB</span>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Step 3: preview */}
          {preview && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={14} /> {preview.summary.validRows} valid row(s) → {preview.summary.unitsToCreate} unit(s)</span>
                {preview.summary.errorRows > 0 && <span className="flex items-center gap-1 text-rose-700"><AlertTriangle size={14} /> {preview.summary.errorRows} error row(s)</span>}
              </div>
              {preview.errors?.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-[11px] text-rose-700 flex flex-col gap-1">
                  {preview.errors.map((e, i) => (
                    <div key={i}>Row {e.row} — <span className="font-semibold">{e.field}</span>: {e.message}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={close} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer">Cancel</button>
          {!preview ? (
            <button onClick={runDryRun} disabled={!file || busy} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
              {busy ? 'Validating…' : 'Validate'}
            </button>
          ) : (
            <button onClick={commit} disabled={!canImport || busy} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
              {busy ? 'Importing…' : `Import ${preview.summary.unitsToCreate} unit(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
