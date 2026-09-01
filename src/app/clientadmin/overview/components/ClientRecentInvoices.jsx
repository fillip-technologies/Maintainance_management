import React from 'react';
import { IndianRupee, FileText, Download, CheckCircle2, Clock } from 'lucide-react';

export default function ClientRecentInvoices({ invoices, onNotify }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Service Billing & Invoices</h2>
            <p className="text-[11px] text-slate-500">AMC contracts, replacement parts & dispatch billing</p>
          </div>
        </div>

        <button
          onClick={() => onNotify('Exporting complete billing statements for FY 2026-27...')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          View All Invoices →
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {invoices.map((inv) => {
          const isPaid = inv.status.toLowerCase() === 'paid';
          return (
            <div
              key={inv.invoiceNo}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText size={18} className="text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{inv.invoiceNo}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {inv.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{inv.description}</span>
                  <span className="text-[10px] text-slate-400">{inv.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{inv.amountInr.toLocaleString('en-IN')}
                </span>

                <button
                  onClick={() => onNotify(`Downloading Invoice ${inv.invoiceNo} (PDF)...`)}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                  title="Download PDF"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
