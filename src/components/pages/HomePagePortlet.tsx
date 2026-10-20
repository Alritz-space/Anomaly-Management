import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Boxes,
  Cpu,
  Layers,
  Compass,
  BookOpen,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const HomePagePortlet: React.FC = () => {
  const {
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveInventoryAnomalies,
    effectiveCustomAnomalies,
    setActivePage,
    setDashboardTab,
    openDrawer,
    openTransactionModal,
    openEntityModal,
    toggleBookmark,
    activeScenario,
    selectScenario,
    researchScenarios,
    setIsGuidedLearningHubOpen,
    setIsFeedbackModalOpen,
    completedTaskIds,
    guidedTasks,
  } = useAnomaly();

  const [activePortletTab, setActivePortletTab] = useState<
    'transactions' | 'expected-missing' | 'inventory' | 'custom'
  >('transactions');

  // Top 5 of each category
  const topTransactions = effectiveTransactionAnomalies
    .filter((a) => a.status === 'Need Review' || a.status === 'Reopen')
    .slice(0, 5);

  const topExpectedMissing = effectiveExpectedMissingAnomalies
    .filter((a) => a.status === 'Need Review' || a.status === 'Reopen')
    .slice(0, 5);

  const topInventory = effectiveInventoryAnomalies
    .filter((a) => a.status === 'Need Review' || a.status === 'Reopen')
    .slice(0, 5);

  const topCustom = effectiveCustomAnomalies
    .filter((a) => a.status === 'Need Review' || a.status === 'Reopen')
    .slice(0, 5);

  const goToDashboard = (tab: 'transactions' | 'expected-missing' | 'inventory' | 'custom') => {
    setDashboardTab(tab);
    setActivePage('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#7a301d] via-[#8d3c26] to-[#592215] rounded-2xl p-6.5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#8d3c26]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#5d2314] text-[#fceee9] text-[11px] font-semibold tracking-wide uppercase border border-[#a2513a]">
              Financial Period Oct 2026
            </span>
            <span className="text-[#f7d6cb] text-xs">· Audit Window: 5 Days to Close</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Period Close Anomaly Management Center</h1>
          <p className="text-[#f7e0d7] text-xs max-w-2xl leading-relaxed">
            Continuous controls engine automatically surfaces accounting outliers, missing cyclical transactions, warehouse inventory discrepancies, and compliance rule violations before ledger lock.
          </p>
        </div>

        <button
          type="button"
          onClick={() => goToDashboard(activePortletTab)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#782e1b] rounded-xl text-xs font-bold hover:bg-[#faf4f0] transition-colors shadow-xs shrink-0"
        >
          <span>Go to Anomaly Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Enterprise User Research & Guided Learning Launchpad */}
      <div className="bg-white/95 rounded-2xl border border-[#ebdcd3] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdcd3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-[#8d3c26]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-stone-900">Enterprise Research & Guided Audit Workflows</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#fbf0eb] text-[#8d3c26] text-[10px] font-bold uppercase tracking-wider">
                  Interactive Evaluation
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Test pre-seeded enterprise scenarios designed for controllers, SOX auditors, and operational accountants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGuidedLearningHubOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8d3c26] text-white hover:bg-[#782e1d] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Guided Learning Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ebdcd3] text-stone-700 hover:bg-[#fbf7f4] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              <span>Participant Feedback</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {researchScenarios.map((sc) => {
            const isSelected = activeScenario?.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  selectScenario(sc.id);
                  goToDashboard(sc.targetTab);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#8d3c26] bg-[#fbf5f2] ring-1 ring-[#8d3c26] shadow-2xs'
                    : 'border-[#ebdcd3] bg-white hover:border-[#cb927b] hover:bg-[#fdfaf8]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#8d3c26] px-1.5 py-0.5 rounded bg-[#f6ede7]">
                      {sc.badge}
                    </span>
                    {isSelected && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8d3c26] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8d3c26]"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 group-hover:text-[#8d3c26] transition-colors leading-snug">
                    {sc.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {sc.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#ebdcd3]/70 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-medium">Click to Launch</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8d3c26] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PORTLET WIDGET CONTAINER */}
      <div className="bg-white/95 rounded-2xl border border-[#ebdcd3] shadow-2xs overflow-hidden">
        {/* Portlet Header */}
        <div className="px-6 py-4.5 border-b border-[#ebdcd3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center font-bold">
              <ShieldAlert className="w-4.5 h-4.5 text-[#8d3c26]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900">Period Close Anomaly Portlet</h2>
              <p className="text-[11px] text-stone-500">Top 5 high-priority anomalies requiring immediate review</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToDashboard(activePortletTab)}
            className="text-xs font-bold text-[#8d3c26] hover:text-[#6e2b19] flex items-center gap-1 self-end sm:self-auto hover:underline"
          >
            <span>Go to Anomaly Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Portlet Tabs */}
        <div className="px-6 bg-white border-b border-[#ebdcd3] flex items-center gap-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActivePortletTab('transactions')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activePortletTab === 'transactions'
                ? 'border-[#8d3c26] text-[#8d3c26] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span>Transaction Anomalies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fbf0eb] text-[#8d3c26]">
              {topTransactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortletTab('expected-missing')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activePortletTab === 'expected-missing'
                ? 'border-[#8d3c26] text-[#8d3c26] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span>Expected / Missing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fbf0eb] text-[#8d3c26]">
              {topExpectedMissing.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortletTab('inventory')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activePortletTab === 'inventory'
                ? 'border-[#8d3c26] text-[#8d3c26] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span>Inventory Anomalies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fbf0eb] text-[#8d3c26]">
              {topInventory.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortletTab('custom')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activePortletTab === 'custom'
                ? 'border-[#8d3c26] text-[#8d3c26] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span>Custom Anomalies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fbf0eb] text-[#8d3c26]">
              {topCustom.length}
            </span>
          </button>
        </div>

        {/* Portlet Content Table */}
        <div className="overflow-x-auto text-xs">
          {activePortletTab === 'transactions' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-4 w-8 text-center">★</th>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3 text-right">Impacted Amount</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => toggleBookmark('transaction', item.id)}
                        className={`p-1 rounded ${item.isBookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-600">
                      <button
                        onClick={() => openTransactionModal(item.tranId)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.tranId}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.anomalyType}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${item.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openEntityModal(item.entity)}
                        className="text-blue-600 hover:underline truncate max-w-32 block text-left"
                      >
                        {item.entity}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.accountingPeriod}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => openDrawer('transaction', item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePortletTab === 'expected-missing' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-4 w-8 text-center">★</th>
                  <th className="py-2.5 px-3">Transaction / Ref</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3 text-right">Impacted Amount</th>
                  <th className="py-2.5 px-3">Expected Date</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topExpectedMissing.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => toggleBookmark('expected-missing', item.id)}
                        className={`p-1 rounded ${item.isBookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-600">
                      <button
                        onClick={() => openTransactionModal(item.tranId)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.tranId}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {item.anomalyType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${item.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.expectedDate}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openEntityModal(item.entity)}
                        className="text-blue-600 hover:underline truncate max-w-32 block text-left"
                      >
                        {item.entity}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => openDrawer('expected-missing', item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePortletTab === 'inventory' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-4 w-8 text-center">★</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Anomaly Type</th>
                  <th className="py-2.5 px-3 text-right">Projected Balance</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Warning</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => toggleBookmark('inventory', item.id)}
                        className={`p-1 rounded ${item.isBookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.itemName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                        {item.anomalyType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 font-mono">
                      {item.projectedBalance} units
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-28">{item.location}</td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-44 text-[11px]">{item.warning}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => openDrawer('inventory', item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePortletTab === 'custom' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-4 w-8 text-center">★</th>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Rule Triggered</th>
                  <th className="py-2.5 px-3 text-right">Impacted Amount</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topCustom.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => toggleBookmark('custom', item.id)}
                        className={`p-1 rounded ${item.isBookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-600">
                      <button
                        onClick={() => openTransactionModal(item.tranId)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.tranId}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.ruleName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${item.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openEntityModal(item.entity)}
                        className="text-blue-600 hover:underline truncate max-w-32 block text-left"
                      >
                        {item.entity}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.accountingPeriod}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => openDrawer('custom', item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Portlet Footer Link */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing top items. Full datasets and bulk audit workflows available on the main dashboard.
          </span>
          <button
            type="button"
            onClick={() => goToDashboard(activePortletTab)}
            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            <span>Go to Anomaly Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
