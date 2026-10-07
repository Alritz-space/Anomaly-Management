import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { ExpectedMissingAnomaly, TransactionType } from '../../types/anomaly';
import { KpiCard } from '../common/KpiCard';
import { Pagination } from '../common/Pagination';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

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
    <div className="space-y-4">
      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Expected Anomalies (Predicted)"
          value={pendingExpected.length}
          subValue={`$${expectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} impact`}
          badge="Upcoming Recurring"
          badgeColor="blue"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          description="Predicted recurring transactions due before period close"
        />
        <KpiCard
          label="Missing Anomalies (Overdue)"
          value={pendingMissing.length}
          subValue={`$${missingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} impact`}
          badge="Overdue Recurring"
          badgeColor="amber"
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          description="Expected bills or invoices that failed to arrive on schedule"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction/ref #, entity, or memo..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto text-xs">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bookmarkedOnly}
                onChange={(e) => {
                  setBookmarkedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                Bookmarked only
              </span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={withMemoOnly}
                onChange={(e) => {
                  setWithMemoOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>With memo</span>
            </label>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Tran Type</label>
            <select
              value={filterTxType}
              onChange={(e) => {
                setFilterTxType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Anomaly Type</label>
            <select
              value={filterAnomalyType}
              onChange={(e) => {
                setFilterAnomalyType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Expected & Missing</option>
              <option value="Expected">Expected Only</option>
              <option value="Missing">Missing Only</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Account</label>
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="All">All Accounts</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Periods</option>
              {ACCOUNTING_PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Entity</label>
            <select
              value={filterEntity}
              onChange={(e) => {
                setFilterEntity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="All">All Entities</option>
              {uniqueEntities.map((ent) => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Need Review">Need Review</option>
              <option value="Verified">Verified</option>
              <option value="Reopen">Reopen</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Subsidiary</label>
            <select
              value={filterSubsidiary}
              onChange={(e) => {
                setFilterSubsidiary(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="All">All Subsidiaries</option>
              {SUBSIDIARIES.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-blue-50/70 p-2.5 rounded-lg text-xs">
            <span className="font-semibold text-blue-900">
              {selectedIds.length} anomalies selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('expected-missing', selectedIds, 'resolve');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('expected-missing', selectedIds, 'no-action');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                No Action Needed
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateStatus('expected-missing', selectedIds, 'reopen');
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table:
          Transaction (link), Anomaly Type (Expected/Missing), Accounting Period, Expected Date, Impacted Amount, Entity (link), Subsidiary, Status, Action (Review) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">★</th>
                <th className="py-3 px-3">Transaction / Ref</th>
                <th className="py-3 px-3">Anomaly Type</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3">Accounting Period</th>
                <th className="py-3 px-3">Expected Date</th>
                <th className="py-3 px-3 text-right">Impacted Amount</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Subsidiary</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No expected/missing anomalies match current filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      selectedIds.includes(item.id) ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleBookmark('expected-missing', item.id)}
                        className={`p-1 rounded hover:bg-slate-100 ${
                          item.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.transactionType}
                        </span>
                        <button
                          onClick={() => openTransactionModal(item.tranId)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {item.tranId}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.anomalyType === 'Expected'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.anomalyType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 truncate max-w-44" title={item.account || '6000 - Operating Expenses'}>
                      {item.account || '6000 - Operating Expenses'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.accountingPeriod}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{item.expectedDate}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      ${item.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openEntityModal(item.entity)}
                        className="text-blue-600 hover:underline truncate max-w-36 block text-left"
                      >
                        {item.entity}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-28">{item.subsidiary}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Reopen'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDrawer('expected-missing', item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
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
