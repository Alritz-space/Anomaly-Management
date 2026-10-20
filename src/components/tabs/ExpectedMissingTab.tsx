import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { ExpectedMissingAnomaly, TransactionType } from '../../types/anomaly';
import { KpiCard } from '../common/KpiCard';
import { Pagination } from '../common/Pagination';
import { GuidedLearningCallout } from '../common/GuidedLearningCallout';
import {
  Search,
  Star,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { SUBSIDIARIES, ACCOUNTING_PERIODS, TRANSACTION_TYPES } from '../../data/mockData';

export const ExpectedMissingTab: React.FC = () => {
  const {
    effectiveExpectedMissingAnomalies,
    openDrawer,
    openTransactionModal,
    openEntityModal,
    toggleBookmark,
    bulkUpdateStatus,
  } = useAnomaly();

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

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const activeFilterCount =
    (filterTxType !== 'All' ? 1 : 0) +
    (filterAnomalyType !== 'All' ? 1 : 0) +
    (filterAccount !== 'All' ? 1 : 0) +
    (filterPeriod !== 'All' ? 1 : 0) +
    (filterEntity !== 'All' ? 1 : 0) +
    (filterStatus !== 'All' ? 1 : 0) +
    (filterSubsidiary !== 'All' ? 1 : 0) +
    (bookmarkedOnly ? 1 : 0) +
    (withMemoOnly ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilterTxType('All');
    setFilterAnomalyType('All');
    setFilterAccount('All');
    setFilterPeriod('All');
    setFilterEntity('All');
    setFilterStatus('All');
    setFilterSubsidiary('All');
    setBookmarkedOnly(false);
    setWithMemoOnly(false);
    setCurrentPage(1);
  };

  // Selected for bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtered dataset
  const filteredList = useMemo(() => {
    return effectiveExpectedMissingAnomalies.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTran = item.tranId.toLowerCase().includes(q);
        const matchesEntity = item.entity.toLowerCase().includes(q);
        const matchesMemo = item.memo?.toLowerCase().includes(q) || false;
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesAccount = (item.account || '').toLowerCase().includes(q);
        if (!matchesTran && !matchesEntity && !matchesMemo && !matchesSummary && !matchesAccount) return false;
      }

      if (filterTxType !== 'All' && item.transactionType !== filterTxType) return false;
      if (filterAnomalyType !== 'All' && item.anomalyType !== filterAnomalyType) return false;
      if (filterAccount !== 'All') {
        const itemAcc = item.account || '6000 - Operating Expenses';
        if (itemAcc !== filterAccount) return false;
      }
      if (filterPeriod !== 'All' && item.accountingPeriod !== filterPeriod) return false;
      if (filterEntity !== 'All' && item.entity !== filterEntity) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterSubsidiary !== 'All' && item.subsidiary !== filterSubsidiary) return false;

      if (bookmarkedOnly && !item.isBookmarked) return false;
      if (withMemoOnly && !item.memo) return false;

      return true;
    });
  }, [
    effectiveExpectedMissingAnomalies,
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

  // 2 KPI Cards Required by Prompt:
  // Expected (pending count + total impacted amount)
  // Missing (pending count + total impacted amount)
  const pendingExpected = filteredList.filter(
    (x) => x.anomalyType === 'Expected' && (x.status === 'Need Review' || x.status === 'Reopen')
  );
  const pendingMissing = filteredList.filter(
    (x) => x.anomalyType === 'Missing' && (x.status === 'Need Review' || x.status === 'Reopen')
  );

  const expectedAmount = pendingExpected.reduce((acc, curr) => acc + curr.impactedAmount, 0);
  const missingAmount = pendingMissing.reduce((acc, curr) => acc + curr.impactedAmount, 0);

  // Pagination slice
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const allSelected =
    paginatedList.length > 0 && paginatedList.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    const curIds = paginatedList.map((x) => x.id);
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !curIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...curIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const uniqueEntities = useMemo(() => {
    return Array.from(new Set(effectiveExpectedMissingAnomalies.map((a) => a.entity))).sort();
  }, [effectiveExpectedMissingAnomalies]);

  const uniqueAccounts = useMemo(() => {
    const set = new Set<string>();
    effectiveExpectedMissingAnomalies.forEach((a) => {
      if (a.account) set.add(a.account);
    });
    return Array.from(set).sort();
  }, [effectiveExpectedMissingAnomalies]);

  return (
    <div className="space-y-3.5">
      {/* Sleek Top Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white/95 border border-[#ebdcd3] rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Expected Recurring (Upcoming)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-stone-900">{pendingExpected.length}</span>
              <span className="text-xs text-stone-500">
                (${expectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            </div>
            <span className="text-[10px] font-medium text-stone-500">Predicted cyclical disbursements</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[#8d3c26]" />
          </div>
        </div>

        <div className="bg-white/95 border border-[#ebdcd3] rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d3c26]">
              Missing / Overdue Liabilities
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-[#8d3c26]">{pendingMissing.length}</span>
              <span className="text-xs text-stone-500">
                (${missingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            </div>
            <span className="text-[10px] font-medium text-stone-500">Omitted vendor invoices</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-[#8d3c26]" />
          </div>
        </div>
      </div>

      {/* Guided Learning Callout for Accruals (collapsible 1-line bar) */}
      <GuidedLearningCallout
        badge="Accrual Protocol"
        title="Unrecorded Liability & Recurrence Prediction"
        description="Machine learning monitors historical recurring vendor disbursements (e.g. cloud subscriptions, facility leases, retainers) and detects omissions before period-end closing. For verified unreceived vendor bills, click 'Review' and select 'Create Transaction' to generate a pre-populated draft balancing entry."
        complianceNote="GAAP Matching Principle & ASC 606: Guarantees expenses are matched to the correct accounting period."
        storageKey="exp_missing_guidance"
      />

      {/* Filter Bar */}
      <div className="bg-white/95 border border-[#ebdcd3] rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        {/* Row 1: Search, Quick Pills, and Filter Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction/ref #, entity, or memo..."
              className="w-full pl-9 pr-8 py-2 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-[#8d3c26] focus:border-transparent focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterAnomalyType('All');
                setBookmarkedOnly(false);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                filterAnomalyType === 'All' && !bookmarkedOnly
                  ? 'bg-[#8d3c26] text-white shadow-2xs font-semibold'
                  : 'bg-[#fcf9f6] text-stone-700 hover:bg-[#f6eee8] border border-[#ebdcd3]'
              }`}
            >
              All ({effectiveExpectedMissingAnomalies.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterAnomalyType('Missing');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                filterAnomalyType === 'Missing'
                  ? 'bg-[#8d3c26] text-white shadow-2xs font-semibold'
                  : 'bg-[#fcf9f6] text-stone-700 hover:bg-[#f6eee8] border border-[#ebdcd3]'
              }`}
            >
              Missing Only ({effectiveExpectedMissingAnomalies.filter((x) => x.anomalyType === 'Missing').length})
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterAnomalyType('Expected');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                filterAnomalyType === 'Expected'
                  ? 'bg-[#8d3c26] text-white shadow-2xs font-semibold'
                  : 'bg-[#fcf9f6] text-stone-700 hover:bg-[#f6eee8] border border-[#ebdcd3]'
              }`}
            >
              Expected Only ({effectiveExpectedMissingAnomalies.filter((x) => x.anomalyType === 'Expected').length})
            </button>

            <button
              type="button"
              onClick={() => {
                setBookmarkedOnly(!bookmarkedOnly);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                bookmarkedOnly
                  ? 'bg-[#8d3c26] text-white shadow-2xs font-semibold'
                  : 'bg-[#fcf9f6] text-stone-700 hover:bg-[#f6eee8] border border-[#ebdcd3]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-current' : 'text-[#b25336]'}`} />
              <span>Bookmarked</span>
            </button>

            <div className="h-5 w-px bg-[#ebdcd3] mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-[#fbf0eb] text-[#8d3c26] border-[#ebdcd3]'
                  : 'bg-white text-stone-700 hover:bg-[#fcf9f6] border-[#ebdcd3]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8d3c26] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-stone-400 hover:text-stone-800 text-xs font-medium underline px-1.5 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#f0dfd5] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#fdfaf8] p-4 rounded-xl border border-[#ebdcd3]">
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8d3c26] block">
                Type & Account
              </span>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Transaction Type</label>
                <select
                  value={filterTxType}
                  onChange={(e) => {
                    setFilterTxType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
                >
                  <option value="All">All Types</option>
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Account</label>
                <select
                  value={filterAccount}
                  onChange={(e) => {
                    setFilterAccount(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
                >
                  <option value="All">All Accounts</option>
                  {uniqueAccounts.map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8d3c26] block">
                Timing & Status
              </span>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Accounting Period</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => {
                    setFilterPeriod(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
                >
                  <option value="All">All Periods</option>
                  {ACCOUNTING_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Review Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Need Review">Need Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Reopen">Reopen</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8d3c26] block">
                Entity & Subsidiary
              </span>
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Entity</label>
                <select
                  value={filterEntity}
                  onChange={(e) => {
                    setFilterEntity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
                >
                  <option value="All">All Entities</option>
                  {uniqueEntities.map((ent) => (
                    <option key={ent} value={ent}>{ent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">Subsidiary</label>
                <select
                  value={filterSubsidiary}
                  onChange={(e) => {
                    setFilterSubsidiary(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-white border border-[#ebdcd3] rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] truncate"
                >
                  <option value="All">All Subsidiaries</option>
                  {SUBSIDIARIES.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="pt-2.5 border-t border-[#f0dfd5] flex flex-wrap items-center justify-between gap-2.5 bg-[#fbf3ef] p-3 rounded-xl text-xs">
            <span className="font-semibold text-[#732918]">
              {selectedIds.length} exceptions selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('expected-missing', selectedIds, 'resolve');
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
                  bulkUpdateStatus('expected-missing', selectedIds, 'no-action');
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
                  bulkUpdateStatus('expected-missing', selectedIds, 'discard');
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
                  bulkUpdateStatus('expected-missing', selectedIds, 'reopen');
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

      {/* Table */}
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
                    className="rounded text-[#8d3c26] focus:ring-[#8d3c26]"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center text-stone-400">★</th>
                <th className="py-3 px-3">Transaction / Ref</th>
                <th className="py-3 px-3">Anomaly Type</th>
                <th className="py-3 px-3">GL Account</th>
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Expected Date</th>
                <th className="py-3 px-3 text-right">Impacted Amount</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Subsidiary</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e6de] text-stone-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-stone-400 text-xs">
                    No expected/missing anomalies match current filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#fcfaf8] transition-colors ${
                      selectedIds.includes(item.id) ? 'bg-[#fbf4f0]' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded text-[#8d3c26] focus:ring-[#8d3c26]"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleBookmark('expected-missing', item.id)}
                        className={`p-1 rounded hover:bg-[#f6eee8] ${
                          item.isBookmarked ? 'text-[#b25336]' : 'text-stone-300 hover:text-stone-600'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 bg-[#f6eee8] px-1.5 py-0.5 rounded border border-[#ebdcd3]">
                          {item.transactionType}
                        </span>
                        <button
                          type="button"
                          onClick={() => openTransactionModal(item.tranId)}
                          className="text-[#8d3c26] hover:underline flex items-center gap-1 font-bold"
                        >
                          {item.tranId}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-stone-800">
                        {item.anomalyType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-700 truncate max-w-44" title={item.account || '6000 - Operating Expenses'}>
                      {item.account || '6000 - Operating Expenses'}
                    </td>
                    <td className="py-3 px-3 text-stone-500">{item.accountingPeriod}</td>
                    <td className="py-3 px-3 text-stone-700 font-mono text-[11px] tabular-nums">{item.expectedDate}</td>
                    <td className="py-3 px-3 text-right font-medium text-stone-900 font-mono tabular-nums">
                      ${item.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => openEntityModal(item.entity)}
                        className="text-stone-800 hover:text-[#8d3c26] hover:underline truncate max-w-36 block text-left font-medium"
                      >
                        {item.entity}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-stone-500 truncate max-w-28">{item.subsidiary}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.status === 'Verified'
                              ? 'bg-emerald-600'
                              : item.status === 'Reopen'
                              ? 'bg-indigo-600'
                              : 'bg-[#c06a1c]'
                          }`}
                        />
                        <span className="font-medium text-stone-800">{item.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDrawer('expected-missing', item)}
                        className="px-3 py-1 text-[11px] font-semibold text-[#8d3c26] bg-[#fbf0eb] hover:bg-[#f6eee8] border border-[#ebdcd3] rounded-lg transition-colors shadow-2xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
