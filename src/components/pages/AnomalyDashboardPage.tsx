import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { KpiCard } from '../common/KpiCard';
import { TransactionAnomaliesTab } from '../tabs/TransactionAnomaliesTab';
import { ExpectedMissingTab } from '../tabs/ExpectedMissingTab';
import { InventoryAnomaliesTab } from '../tabs/InventoryAnomaliesTab';
import { CustomAnomaliesTab } from '../tabs/CustomAnomaliesTab';
import {
  AlertTriangle,
  Clock,
  Boxes,
  Cpu,
  Info,
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

  // Counts for the 4 Summary Cards Acting as Tabs:
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & How-to-use Guidance Header */}
      <div className="bg-white/95 rounded-2xl border border-[#ebdcd3] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Anomaly Dashboard
              </h1>
              <span className="text-xs text-stone-400 font-normal">·</span>
              <span className="text-xs font-medium text-[#8d3c26]">Continuous Financial Intelligence</span>
            </div>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              Review flagged general ledger outliers and cycle variances before fiscal period close. Use the sensitivity slider to focus on high-impact transactions, filter by entity or account, and inspect details in the drawer.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600 bg-[#fbf5f2] px-3.5 py-2 rounded-xl border border-[#ebdcd3] shrink-0 self-start md:self-auto">
            <Info className="w-4 h-4 text-[#8d3c26] shrink-0" />
            <span>Select a domain card below to switch audit view</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards That Act as Domain Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Transaction Outliers"
          value={txCount}
          subValue={`${txPending} pending review`}
          badge={txPending > 0 ? `${txPending} Action Required` : 'Verified'}
          badgeColor={txPending > 0 ? 'redwood' : 'emerald'}
          icon={<AlertTriangle className="w-5 h-5 text-[#8d3c26]" />}
          isActive={dashboardTab === 'transactions'}
          onClick={() => setDashboardTab('transactions')}
          description="Unusual amounts, accounts & duplicate batches"
        />

        <KpiCard
          label="Expected / Missing"
          value={expMissingCount}
          subValue={`${expMissingPending} pending review`}
          badge="Cycle Variance"
          badgeColor="redwood"
          icon={<Clock className="w-5 h-5 text-[#8d3c26]" />}
          isActive={dashboardTab === 'expected-missing'}
          onClick={() => setDashboardTab('expected-missing')}
          description="Predicted and omitted recurring entries"
        />

        <KpiCard
          label="Inventory Anomalies"
          value={invCount}
          subValue={`${invPending} pending review`}
          badge="Stock Risks"
          badgeColor="amber"
          icon={<Boxes className="w-5 h-5 text-[#8d3c26]" />}
          isActive={dashboardTab === 'inventory'}
          onClick={() => setDashboardTab('inventory')}
          description="Projected stockouts & safety buffer risks"
        />

        <KpiCard
          label="Custom Anomalies"
          value={customRuleCount}
          subValue={`${customAnomPending} matching items`}
          badge="Audit Rules"
          badgeColor="redwood"
          icon={<Cpu className="w-5 h-5 text-[#8d3c26]" />}
          isActive={dashboardTab === 'custom'}
          onClick={() => setDashboardTab('custom')}
          description="User-defined controls & SOX audit logic"
        />
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
