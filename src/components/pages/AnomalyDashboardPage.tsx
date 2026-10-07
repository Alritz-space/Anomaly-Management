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
  Layers,
  HelpCircle,
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
  // 1. Transaction Anomalies (count)
  const txCount = effectiveTransactionAnomalies.length;
  const txPending = effectiveTransactionAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  // 2. Expected / Missing (count of missing and predicted)
  const expMissingCount = effectiveExpectedMissingAnomalies.length;
  const expMissingPending = effectiveExpectedMissingAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  // 3. Inventory Anomalies (count flagged)
  const invCount = effectiveInventoryAnomalies.length;
  const invPending = effectiveInventoryAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  // 4. Custom Anomalies (count of rule types)
  const customRuleCount = rules.length;
  const customAnomPending = effectiveCustomAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & How-to-use Guidance Text Required by Prompt */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Anomaly Dashboard
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              How to use: Select an anomaly category tab below to review flagged accounting outliers. Use the importance sensitivity slider to isolate critical transactions, filter by entity or subsidiary, and review individual line discrepancies in the side drawer. Take bulk actions or resolve anomalies individually to clear items before closing the fiscal period.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Click any summary card to switch anomaly domain</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards That Act as Tabs Required by Prompt:
          - Transaction Anomalies (count)
          - Expected / Missing (count of missing and predicted)
          - Inventory Anomalies (count flagged)
          - Custom Anomalies (count of rule types) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Transaction Anomalies"
          value={txCount}
          subValue={`${txPending} pending review`}
          badge={txPending > 0 ? `${txPending} Action Required` : 'Verified'}
          badgeColor={txPending > 0 ? 'amber' : 'emerald'}
          icon={<AlertTriangle className="w-5 h-5 text-blue-600" />}
          isActive={dashboardTab === 'transactions'}
          onClick={() => setDashboardTab('transactions')}
          description="Outlier amounts, accounts, segments & duplicates"
        />

        <KpiCard
          label="Expected / Missing"
          value={expMissingCount}
          subValue={`${expMissingPending} pending review`}
          badge="Cyclical Variance"
          badgeColor="blue"
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
          isActive={dashboardTab === 'expected-missing'}
          onClick={() => setDashboardTab('expected-missing')}
          description="Predicted and missed recurring transactions"
        />

        <KpiCard
          label="Inventory Anomalies"
          value={invCount}
          subValue={`${invPending} pending review`}
          badge="Stock Risks"
          badgeColor="amber"
          icon={<Boxes className="w-5 h-5 text-amber-600" />}
          isActive={dashboardTab === 'inventory'}
          onClick={() => setDashboardTab('inventory')}
          description="Projected stockouts, overstock & safety shortfalls"
        />

        <KpiCard
          label="Custom Anomalies"
          value={customRuleCount}
          subValue={`${customAnomPending} matching items`}
          badge="Active Rules"
          badgeColor="purple"
          icon={<Cpu className="w-5 h-5 text-purple-600" />}
          isActive={dashboardTab === 'custom'}
          onClick={() => setDashboardTab('custom')}
          description="User-defined controls & SOX audit criteria"
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
