import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientAssetList from '../overview/components/ClientAssetList';
import ClientMaintenanceSchedule from '../overview/components/ClientMaintenanceSchedule';
import { clientFacilityData } from '../../api/clientAdminApi';

export default function ClientAssetsPage() {
  const context = useOutletContext() || {};

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Facility Machinery & Telemetry Register</h1>
        <p className="text-xs text-slate-500">Live IoT sensor status, vibration diagnostics, and servicing logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientAssetList assets={clientFacilityData.assets} onNotify={context.showToast || alert} />
        <ClientMaintenanceSchedule schedule={clientFacilityData.pmSchedule} onNotify={context.showToast || alert} />
      </div>
    </div>
  );
}
