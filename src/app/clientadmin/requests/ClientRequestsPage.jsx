import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientTicketStatus from '../overview/components/ClientTicketStatus';
import { clientFacilityData } from '../../api/clientAdminApi';

export default function ClientRequestsPage() {
  const context = useOutletContext() || {};

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Service Requests & Maintenance Tickets</h1>
        <p className="text-xs text-slate-500">Track real-time engineering work orders, field dispatches, and SLA milestones.</p>
      </div>

      <ClientTicketStatus
        tickets={clientFacilityData.tickets}
        onOpenRequestModal={context.onOpenRequestModal}
        onNotify={context.showToast || alert}
      />
    </div>
  );
}
