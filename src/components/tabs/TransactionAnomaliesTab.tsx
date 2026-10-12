import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { TransactionAnomaly, TransactionAnomalyType, TransactionType, AnomalyStatus } from '../../types/anomaly';
import { KpiCard } from '../common/KpiCard';
import { ImportanceSlider, IMPORTANCE_STEPS } from '../common/ImportanceSlider';
import { Pagination } from '../common/Pagination';
import {
  Search,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SUBSIDIARIES, ACCOUNTING_PERIODS, TRANSACTION_TYPES } from '../../data/mockData';

export const TransactionAnomaliesTab: React.FC = () => {
  const {
    effectiveTransactionAnomalies,
    openDrawer,
    openTransactionModal,
    openEntityModal,
    toggleBookmark,
    bulkUpdateStatus,
  } = useAnomaly();

  // Importance slider step (1 to 9, default is 1 = Top 10% High Importance)
  const [sliderStep, setSliderStep] = useState<number>(1);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTxType, setFilterTxType] = useState<string>('All');
  const [filterAnomalyType, setFilterAnomalyType] = useState<string>('All');
  const [filterAccount, setFilterAccount] = useState<string>('All');
  const [filterPeriod, setFilterPeriod] = useState<string>('All');
  const [filterEntity, setFilterEntity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSubsidiary, setFilterSubsidiary] = useState<string>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [withMemoOnly, setWithMemoOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Selected row checkboxes for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Expanded Flow Group IDs
  const [expandedFlows, setExpandedFlows] = useState<Record<string, boolean>>({
    'FLOW-OFFICE-OCT26': true,
  });

  const toggleFlow = (flowId: string) => {
    setExpandedFlows((prev) => ({ ...prev, [flowId]: !prev[flowId] }));
  };

  const currentThreshold = IMPORTANCE_STEPS[sliderStep - 1]?.threshold ?? 0;

  // Filter pipeline
  const filteredList = useMemo(() => {
    return effectiveTransactionAnomalies.filter((item) => {
      // 1. Slider importance filter
      if (item.importanceScore < currentThreshold) return false;

      // 2. Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTran = item.tranId.toLowerCase().includes(q);
        const matchesEntity = item.entity.toLowerCase().includes(q);
        const matchesMemo = item.memo?.toLowerCase().includes(q) || false;
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const itemAcc = item.account || item.detectedAccount || item.expectedAccount || '';
        const matchesAccount = itemAcc.toLowerCase().includes(q);
        if (!matchesTran && !matchesEntity && !matchesMemo && !matchesSummary && !matchesAccount) return false;
      }

      // 3. Dropdowns
      if (filterTxType !== 'All' && item.transactionType !== filterTxType) return false;
      if (filterAnomalyType !== 'All' && item.anomalyType !== filterAnomalyType) return false;
      if (filterAccount !== 'All') {
        const itemAcc = item.account || item.detectedAccount || item.expectedAccount || '6000 - Operating Expenses';
        if (itemAcc !== filterAccount) return false;
      }
      if (filterPeriod !== 'All' && item.accountingPeriod !== filterPeriod) return false;
      if (filterEntity !== 'All' && item.entity !== filterEntity) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterSubsidiary !== 'All' && item.subsidiary !== filterSubsidiary) return false;

      // 4. Toggles
      if (bookmarkedOnly && !item.isBookmarked) return false;
      if (withMemoOnly && !item.memo) return false;

      return true;
    });
  }, [
    effectiveTransactionAnomalies,
    currentThreshold,
    searchTerm,
    filterTxType,
    filterAnomalyType,
    filterAccount,
    filterPeriod,
    filterEntity,
    filterStatus,
    filterSubsidiary,
    bookmarkedOnly,
    withMemoOnly,
  ]);

  // Dynamic KPIs:
  // "Anomalies Pending Review" (Need Review + Reopen count)
  // "Total Financial Impact" (sum of impacted amount of pending ones)
  const pendingItems = filteredList.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  );
  const pendingCount = pendingItems.length;
  const totalFinancialImpact = pendingItems.reduce((acc, curr) => acc + curr.impactedAmount, 0);

  // Flow Grouping logic:
  // Group anomalies that belong to the same flow (flowGroupId)
  // The page limit counts a group as one item!
  type TableItem =
    | { type: 'group'; flowGroupId: string; items: TransactionAnomaly[] }
    | { type: 'single'; item: TransactionAnomaly };

  const tableItems: TableItem[] = useMemo(() => {
    const groupsMap = new Map<string, TransactionAnomaly[]>();
    const seenFlows = new Set<string>();
    const result: TableItem[] = [];

    // First collect all flow items
    for (const anom of filteredList) {
      if (anom.flowGroupId) {
        if (!groupsMap.has(anom.flowGroupId)) {
          groupsMap.set(anom.flowGroupId, []);
        }
        groupsMap.get(anom.flowGroupId)!.push(anom);
      }
    }

    // Now build ordered list
    for (const anom of filteredList) {
      if (anom.flowGroupId) {
        if (!seenFlows.has(anom.flowGroupId)) {
          seenFlows.add(anom.flowGroupId);
          result.push({
            type: 'group',
            flowGroupId: anom.flowGroupId,
            items: groupsMap.get(anom.flowGroupId)!,
          });
        }
      } else {
        result.push({ type: 'single', item: anom });
      }
    }

    return result;
  }, [filteredList]);

  // Paginated items (group counts as 1 item)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tableItems.slice(start, start + pageSize);
  }, [tableItems, currentPage]);

  // Checkbox bulk actions
  const allCurrentIds = useMemo(() => {
    const ids: string[] = [];
    paginatedItems.forEach((ti) => {
      if (ti.type === 'single') ids.push(ti.item.id);
      else ti.items.forEach((x) => ids.push(x.id));
    });
    return ids;
  }, [paginatedItems]);

  const allSelected = allCurrentIds.length > 0 && allCurrentIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allCurrentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Unique entities for filter
  const uniqueEntities = useMemo(() => {
    return Array.from(new Set(effectiveTransactionAnomalies.map((a) => a.entity))).sort();
  }, [effectiveTransactionAnomalies]);

  // Unique accounts for filter
  const uniqueAccounts = useMemo(() => {
    const set = new Set<string>();
    effectiveTransactionAnomalies.forEach((a) => {
      const acc = a.account || a.detectedAccount || a.expectedAccount;
      if (acc) set.add(acc);
    });
    return Array.from(set).sort();
  }, [effectiveTransactionAnomalies]);

  return (
    <div className="space-y-4">
      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Anomalies Pending Review"
          value={pendingCount}
          subValue={`of ${filteredList.length} surfaced items`}
          badge="Audit Pending"
          badgeColor="redwood"
          icon={<AlertTriangle className="w-5 h-5 text-[#8d3c26]" />}
          description="Requires accountant review before period close"
        />
        <KpiCard
          label="Total Financial Exposure"
          value={`$${totalFinancialImpact.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          badge="Unresolved GL Balance"
          badgeColor="redwood"
          icon={<DollarSign className="w-5 h-5 text-[#8d3c26]" />}
          description="Cumulative financial exposure of pending anomalies"
        />
      </div>

      {/* Top 9-Step Importance Slider */}
      <ImportanceSlider
        step={sliderStep}
        onChange={(newStep) => {
          setSliderStep(newStep);
          setCurrentPage(1);
        }}
        filteredCount={filteredList.length}
        totalCount={effectiveTransactionAnomalies.length}
      />

      {/* Filter Bar */}
      <div className="bg-white/95 border border-[#ebdcd3] rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        {/* Search Row & Toggles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction #, entity, or memo..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-[#8d3c26] focus:border-transparent focus:outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center gap-5 self-end md:self-auto text-xs">
            <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bookmarkedOnly}
                onChange={(e) => {
                  setBookmarkedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-[#8d3c26] focus:ring-[#8d3c26]"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#b25336] fill-current" />
                Bookmarked only
              </span>
            </label>

            <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={withMemoOnly}
                onChange={(e) => {
                  setWithMemoOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-[#8d3c26] focus:ring-[#8d3c26]"
              />
              <span>With memo</span>
            </label>
          </div>
        </div>

        {/* Filter Dropdowns Grid: Transaction Type, Anomaly Type, Account, Accounting Period, Entity, Status, Subsidiary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Tran Type</label>
            <select
              value={filterTxType}
              onChange={(e) => {
                setFilterTxType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
            >
              <option value="All">All Types</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Anomaly Type</label>
            <select
              value={filterAnomalyType}
              onChange={(e) => {
                setFilterAnomalyType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
            >
              <option value="All">All Anomalies</option>
              <option value="Unusual Account">Unusual Account</option>
              <option value="Unusual Amount">Unusual Amount</option>
              <option value="Incorrect/Missing Segment">Incorrect/Missing Segment</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Vendor/Customer Alert">Vendor/Customer Alert</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Account</label>
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
            >
              <option value="All">All Accounts</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
            >
              <option value="All">All Periods</option>
              {ACCOUNTING_PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Entity</label>
            <select
              value={filterEntity}
              onChange={(e) => {
                setFilterEntity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
            >
              <option value="All">All Entities</option>
              {uniqueEntities.map((ent) => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
            >
              <option value="All">All Statuses</option>
              <option value="Need Review">Need Review</option>
              <option value="Verified">Verified</option>
              <option value="Reopen">Reopen</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">Subsidiary</label>
            <select
              value={filterSubsidiary}
              onChange={(e) => {
                setFilterSubsidiary(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
            >
              <option value="All">All Subsidiaries</option>
              {SUBSIDIARIES.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions Floating/Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-2.5 border-t border-[#f0dfd5] flex flex-wrap items-center justify-between gap-2.5 bg-[#fbf3ef] p-3 rounded-xl text-xs">
            <span className="font-semibold text-[#732918]">
              {selectedIds.length} anomalies selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('transaction', selectedIds, 'resolve');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-2xs"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('transaction', selectedIds, 'no-action');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#ebdcd3] text-stone-700 rounded-lg font-semibold hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-stone-500" />
                Not an Error
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('transaction', selectedIds, 'discard');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-semibold hover:bg-rose-100 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Remove Exceptions
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('transaction', selectedIds, 'reopen');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8d3c26] text-white rounded-lg font-semibold hover:bg-[#732918] transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Anomaly Table */}
      <div className="bg-white/95 border border-[#ebdcd3] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fcf9f6] border-b border-[#ebdcd3] text-stone-600 text-[11px] font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">★</th>
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Anomaly Type</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3">Accounting Period</th>
                <th className="py-3 px-3 text-right">Impacted Amount</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Subsidiary</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No transaction anomalies match current filters or importance threshold.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  // Case 1: Group Row (Flow e.g. PO > SO > INV > PMT)
                  if (item.type === 'group') {
                    const isExpanded = expandedFlows[item.flowGroupId];
                    const first = item.items[0];
                    const totalGroupAmount = item.items.reduce((s, i) => s + i.impactedAmount, 0);

                    return (
                      <React.Fragment key={item.flowGroupId}>
                        {/* Parent Group Row */}
                        <tr className="bg-slate-100/70 border-y border-slate-200 font-medium">
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={item.items.every((x) => selectedIds.includes(x.id))}
                              onChange={() => {
                                const groupIds = item.items.map((x) => x.id);
                                const allIn = groupIds.every((id) => selectedIds.includes(id));
                                if (allIn) {
                                  setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
                                } else {
                                  setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Layers className="w-3.5 h-3.5 text-blue-600 inline" />
                          </td>
                          <td colSpan={4} className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => toggleFlow(item.flowGroupId)}
                              className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              )}
                              <span>Flow: {item.flowGroupId}</span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                {item.items.length} related anomalies in transaction flow
                              </span>
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            ${totalGroupAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{first.entity}</td>
                          <td className="py-2 px-3 text-slate-600">{first.subsidiary}</td>
                          <td colSpan={2} className="py-2 px-3 text-right text-slate-500 text-[11px]">
                            {item.items.filter((x) => x.status === 'Need Review').length} pending review
                          </td>
                        </tr>

                        {/* Child Rows in Flow */}
                        {isExpanded &&
                          item.items.map((child) => {
                            const childAccount = child.account || child.detectedAccount || child.expectedAccount || '6000 - Operating Expenses';
                            return (
                              <tr
                                key={child.id}
                                className={`hover:bg-slate-50/80 transition-colors pl-6 ${
                                  selectedIds.includes(child.id) ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(child.id)}
                                    onChange={() => toggleSelectOne(child.id)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleBookmark('transaction', child.id)}
                                    className={`p-1 rounded hover:bg-slate-100 ${
                                      child.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                                    }`}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${child.isBookmarked ? 'fill-current' : ''}`} />
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 font-semibold">
                                  <div className="flex items-center gap-1.5 pl-4 border-l-2 border-blue-400">
                                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                                      {child.flowRole}
                                    </span>
                                    <button
                                      onClick={() => openTransactionModal(child.tranId)}
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      {child.tranId}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="font-medium text-slate-800">{child.anomalyType}</span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 truncate max-w-44" title={childAccount}>
                                  {childAccount}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{child.accountingPeriod}</td>
                                <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                                  ${child.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3">
                                  <button
                                    onClick={() => openEntityModal(child.entity)}
                                    className="text-blue-600 hover:underline truncate max-w-36 block text-left"
                                  >
                                    {child.entity}
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 truncate max-w-28">{child.subsidiary}</td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      child.status === 'Verified'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : child.status === 'Reopen'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    {child.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openDrawer('transaction', child)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  }

                  // Case 2: Single Anomaly Row
                  const single = item.item;
                  const singleAccount = single.account || single.detectedAccount || single.expectedAccount || '6000 - Operating Expenses';
                  return (
                    <tr
                      key={single.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedIds.includes(single.id) ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(single.id)}
                          onChange={() => toggleSelectOne(single.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleBookmark('transaction', single.id)}
                          className={`p-1 rounded hover:bg-slate-100 ${
                            single.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${single.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {single.transactionType}
                          </span>
                          <button
                            onClick={() => openTransactionModal(single.tranId)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {single.tranId}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{single.anomalyType}</span>
                        {single.memo && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-44 italic">
                            "{single.memo}"
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 truncate max-w-44" title={singleAccount}>
                        {singleAccount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{single.accountingPeriod}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        ${single.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => openEntityModal(single.entity)}
                          className="text-blue-600 hover:underline truncate max-w-36 block text-left"
                        >
                          {single.entity}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-28">{single.subsidiary}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            single.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : single.status === 'Reopen'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {single.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDrawer('transaction', single)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 25 Rows per page Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={tableItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
