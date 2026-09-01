import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ClipboardList,
  ShieldCheck,
  Package,
  IndianRupee,
  Building2,
  CheckCircle2,
  X
} from 'lucide-react';

import StatCard from './components/StatCard';
import QuickActions from './components/QuickActions';
import EquipmentStatusStats from './components/EquipmentStatusStats';
import WorkOrderStatus from './components/WorkOrderStatus';
import CriticalAlerts from './components/CriticalAlerts';
import AssetHealthOverview from './components/AssetHealthOverview';
import FacilityOverviewTable from './components/FacilityOverviewTable';
import TechnicianWorkload from './components/TechnicianWorkload';
import RecentActivityFeed from './components/RecentActivityFeed';
import NewWorkOrderModal from './components/NewWorkOrderModal';
import { getStoredProducts } from '../addproducts/productsData';

export default function Overview() {
  const context = useOutletContext() || {};
  const selectedFacility = context.selectedFacility || 'all';

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    setProductsList(getStoredProducts());
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleWorkOrderCreated = (data) => {
    showToast(`Work Order "${data.title}" successfully dispatched to ${data.assignedTech}!`);
  };

  // Calculate Total Products and Total Inventory Amount
  const totalProductsCount = productsList.length > 0 ? productsList.length : 6;
  const totalAmountSum = productsList.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0),
    0
  );
  const formattedTotalAmount = `₹${totalAmountSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Headline Banner */}
      <div className="flex flex-col gap-1 py-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Maintenance Operations Overview
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
          Centralized multi-facility command center for assets, work orders, telemetry, and SLA compliance.
        </p>
      </div>

      {/* Primary KPI Summary Stat Cards: Total Products, Total Amount (INR), Active Work Orders, SLA Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <StatCard
          title="Total Products"
          value={totalProductsCount.toString()}
          icon={Package}
          iconBg="primary"
        />

        {/* Card 2: Total Amount in INR */}
        <StatCard
          title="Total Amount (₹)"
          value={formattedTotalAmount}
          icon={IndianRupee}
          iconBg="success"
        />

        {/* Card 3: Active Work Orders */}
        <StatCard
          title="Active Work Orders"
          value="78"
          icon={ClipboardList}
          iconBg="cyan"
        />

        {/* Card 4: SLA Compliance Rate */}
        <StatCard
          title="SLA Compliance Rate"
          value="99.2%"
          icon={ShieldCheck}
          iconBg="purple"
        />
      </div>

      {/* Equipment Live Working / Breakdown Status Stats Widget */}
      <EquipmentStatusStats onNotify={showToast} />

      {/* Quick Action Triggers */}
      <QuickActions
        onOpenNewWorkOrder={() => setIsWorkOrderModalOpen(true)}
        onNotify={showToast}
      />

      {/* Mid Section: Work Orders Status & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WorkOrderStatus />
        <CriticalAlerts onNotify={showToast} />
      </div>

      {/* Next Row: Asset Health Telemetry & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AssetHealthOverview />
        <TechnicianWorkload />
      </div>

      {/* Multi-facility performance table */}
      <FacilityOverviewTable onNotify={showToast} />

      {/* Real-time Activity Feed */}
      <RecentActivityFeed />

      {/* New Work Order Modal */}
      <NewWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onCreated={handleWorkOrderCreated}
      />
    </div>
  );
}
