import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientRecentInvoices from '../overview/components/ClientRecentInvoices';
import { clientFacilityData } from '../../api/clientAdminApi';

export default function ClientInvoicesPage() {
  const context = useOutletContext() || {};

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Service Bills & Invoices</h1>
        <p className="text-xs text-slate-500">Facility AMC billing history, component replacement statements, and tax receipts.</p>
      </div>

      <ClientRecentInvoices
        invoices={clientFacilityData.invoices}
        onNotify={context.showToast || alert}
      />
    </div>
  );
}
