import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { TransactionAnomaliesTab } from '../tabs/TransactionAnomaliesTab';
import { ExpectedMissingTab } from '../tabs/ExpectedMissingTab';
import { InventoryAnomaliesTab } from '../tabs/InventoryAnomaliesTab';
import { CustomAnomaliesTab } from '../tabs/CustomAnomaliesTab';
import {
  AlertTriangle,
  Clock,
  Boxes,
  Cpu,
  Layers,
} from 'lucide-react';

export const AnomalyDashboardPage: React.FC = () => {
  const {
    dashboardTab,
    setDashboardTab,
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveInventoryAnomalies,
    effectiveCustomAnomalies,
    rules,
  } = useAnomaly();

  // Counts for the 4 Domains
  const txCount = effectiveTransactionAnomalies.length;
  const txPending = effectiveTransactionAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  const expMissingCount = effectiveExpectedMissingAnomalies.length;
  const expMissingPending = effectiveExpectedMissingAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  const invCount = effectiveInventoryAnomalies.length;
  const invPending = effectiveInventoryAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  const customRuleCount = rules.length;
  const customAnomPending = effectiveCustomAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  const domainTabs = [
    {
      id: 'transactions' as const,
      label: 'Transaction Outliers',
      count: txCount,
      pending: txPending,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#8d3c26]" />,
    },
    {
      id: 'expected-missing' as const,
      label: 'Expected / Missing',
      count: expMissingCount,
      pending: expMissingPending,
      icon: <Clock className="w-3.5 h-3.5 text-[#8d3c26]" />,
    },
    {
      id: 'inventory' as const,
      label: 'Inventory Anomalies',
      count: invCount,
      pending: invPending,
      icon: <Boxes className="w-3.5 h-3.5 text-[#8d3c26]" />,
    },
    {
      id: 'custom' as const,
      label: 'Custom Rules & Outliers',
      count: customRuleCount,
      pending: customAnomPending,
      icon: <Cpu className="w-3.5 h-3.5 text-[#8d3c26]" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Sleek, Clean Page Header & Segmented Domain Switcher */}
      <div className="bg-white/95 rounded-xl border border-[#ebdcd3] px-5 py-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
                Anomaly Intelligence Dashboard
              </h1>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-semibold text-[#8d3c26] bg-[#fbf0eb] px-2 py-0.5 rounded-md border border-[#ebdcd3]">
                Oct 2026 Close
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Continuous audit controls across general ledger transactions, recurring disbursements, and inventory.
            </p>
          </div>
        </div>

        {/* Clean Segmented Domain Switcher */}
        <div className="flex items-center gap-1 bg-[#fbf5f2] p-1 rounded-xl border border-[#ebdcd3] overflow-x-auto text-xs">
          {domainTabs.map((tab) => {
            const isActive = dashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDashboardTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#8d3c26] text-white'
                      : 'bg-[#ebdcd3] text-stone-700'
                  }`}
                >
                  {tab.pending > 0 ? tab.pending : tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel */}
      <div className="transition-all">
        {dashboardTab === 'transactions' && <TransactionAnomaliesTab />}
        {dashboardTab === 'expected-missing' && <ExpectedMissingTab />}
        {dashboardTab === 'inventory' && <InventoryAnomaliesTab />}
        {dashboardTab === 'custom' && <CustomAnomaliesTab />}
      </div>
    </div>
  );
};
