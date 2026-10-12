import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { CustomAnomaly, AnomalyRule, TransactionType, RuleStatus, RulePriority } from '../../types/anomaly';
import { KpiCard } from '../common/KpiCard';
import { Pagination } from '../common/Pagination';
import { getRolePermissions, getActionRestrictionReason } from '../../guardrails/rbac';
import {
  Search,
  Star,
  ExternalLink,
  Plus,
  Cpu,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Eye,
  Sliders,
  Play,
  Pause,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { SUBSIDIARIES, ACCOUNTING_PERIODS, TRANSACTION_TYPES } from '../../data/mockData';

export const CustomAnomaliesTab: React.FC = () => {
  const {
    customSubTab,
    setCustomSubTab,
    effectiveCustomAnomalies,
    rules,
    openDrawer,
    openTransactionModal,
    openEntityModal,
    openRuleDetailsModal,
    openCreateRuleModal,
    toggleBookmark,
    bulkUpdateStatus,
    currentUserRole,
  } = useAnomaly();

  const perms = getRolePermissions(currentUserRole);

  // === SUB-TAB 1: ANOMALIES STATE ===
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRule, setFilterRule] = useState<string>('All');
  const [filterTxType, setFilterTxType] = useState<string>('All');
  const [filterAnomalyType, setFilterAnomalyType] = useState<string>('All');
  const [filterPeriod, setFilterPeriod] = useState<string>('All');
  const [filterEntity, setFilterEntity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSubsidiary, setFilterSubsidiary] = useState<string>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [withMemoOnly, setWithMemoOnly] = useState(false);
  const [anomPage, setAnomPage] = useState(1);
  const pageSize = 25;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // === SUB-TAB 2: ANOMALY RULES STATE ===
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleFilterStatus, setRuleFilterStatus] = useState<string>('All');
  const [ruleFilterOwner, setRuleFilterOwner] = useState<string>('All');
  const [ruleFilterPriority, setRuleFilterPriority] = useState<string>('All');
  const [rulePage, setRulePage] = useState(1);

  // Filtered custom anomalies
  const filteredAnomalies = useMemo(() => {
    return effectiveCustomAnomalies.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTran = item.tranId.toLowerCase().includes(q);
        const matchesEntity = item.entity.toLowerCase().includes(q);
        const matchesRule = item.ruleName.toLowerCase().includes(q);
        const matchesMemo = item.memo?.toLowerCase().includes(q) || false;
        if (!matchesTran && !matchesEntity && !matchesRule && !matchesMemo) return false;
      }

      if (filterRule !== 'All' && item.ruleName !== filterRule) return false;
      if (filterTxType !== 'All' && item.transactionType !== filterTxType) return false;
      if (filterAnomalyType !== 'All' && item.anomalyType !== filterAnomalyType) return false;
      if (filterPeriod !== 'All' && item.accountingPeriod !== filterPeriod) return false;
      if (filterEntity !== 'All' && item.entity !== filterEntity) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterSubsidiary !== 'All' && item.subsidiary !== filterSubsidiary) return false;

      if (bookmarkedOnly && !item.isBookmarked) return false;
      if (withMemoOnly && !item.memo) return false;

      return true;
    });
  }, [
    effectiveCustomAnomalies,
    searchTerm,
    filterRule,
    filterTxType,
    filterAnomalyType,
    filterPeriod,
    filterEntity,
    filterStatus,
    filterSubsidiary,
    bookmarkedOnly,
    withMemoOnly,
  ]);

  // 4 KPI Cards for Anomalies Sub-tab:
  // Open Anomalies, Resolved, No Action, Active Rules
  const openCount = filteredAnomalies.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;
  const resolvedCount = filteredAnomalies.filter(
    (x) => x.status === 'Verified' && x.resolutionType === 'Resolved'
  ).length;
  const noActionCount = filteredAnomalies.filter(
    (x) => x.status === 'Verified' && x.resolutionType === 'No Action Needed'
  ).length;
  const activeRulesCount = rules.filter((r) => r.status === 'Active').length;

  // Pagination for anomalies
  const paginatedAnomalies = useMemo(() => {
    const start = (anomPage - 1) * pageSize;
    return filteredAnomalies.slice(start, start + pageSize);
  }, [filteredAnomalies, anomPage]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (ruleSearch) {
        const q = ruleSearch.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesOwner = r.owner.toLowerCase().includes(q);
        const matchesTmpl = r.template.toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesTmpl) return false;
      }
      if (ruleFilterStatus !== 'All' && r.status !== ruleFilterStatus) return false;
      if (ruleFilterOwner !== 'All' && r.owner !== ruleFilterOwner) return false;
      if (ruleFilterPriority !== 'All' && r.priority !== ruleFilterPriority) return false;
      return true;
    });
  }, [rules, ruleSearch, ruleFilterStatus, ruleFilterOwner, ruleFilterPriority]);

  const paginatedRules = useMemo(() => {
    const start = (rulePage - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, rulePage]);

  // Bulk actions for custom anomalies
  const allSelected =
    paginatedAnomalies.length > 0 && paginatedAnomalies.every((x) => selectedIds.includes(x.id));

  const toggleSelectAll = () => {
    const curIds = paginatedAnomalies.map((x) => x.id);
    if (allSelected) setSelectedIds((prev) => prev.filter((id) => !curIds.includes(id)));
    else setSelectedIds((prev) => Array.from(new Set([...prev, ...curIds])));
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds((prev) => prev.filter((x) => x !== id));
    else setSelectedIds((prev) => [...prev, id]);
  };

  const uniqueRuleNames = Array.from(new Set(rules.map((r) => r.name))).sort();
  const uniqueOwners = Array.from(new Set(rules.map((r) => r.owner))).sort();
  const uniqueEntities = Array.from(new Set(effectiveCustomAnomalies.map((a) => a.entity))).sort();

  return (
    <div className="space-y-4">
      {/* Sub-tab Switcher: Anomalies | Anomaly Rules */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCustomSubTab('anomalies')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              customSubTab === 'anomalies'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom Anomalies ({effectiveCustomAnomalies.length})
          </button>
          <button
            type="button"
            onClick={() => setCustomSubTab('rules')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              customSubTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anomaly Rules ({rules.length})
          </button>
        </div>

        {customSubTab === 'rules' && (
          <button
            type="button"
            disabled={!perms.canCreateRules}
            onClick={() => openCreateRuleModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            title={!perms.canCreateRules ? getActionRestrictionReason('create_rule', currentUserRole) : 'Create Anomaly Rule'}
          >
            {!perms.canCreateRules ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            Create Rule
          </button>
        )}
      </div>

      {/* SUB-TAB 1: ANOMALIES VIEW */}
      {customSubTab === 'anomalies' && (
        <div className="space-y-4">
          {/* 4 KPI Cards Required by Prompt:
              Open Anomalies, Resolved, No Action, Active Rules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard
              label="Open Anomalies"
              value={openCount}
              badge="Pending Review"
              badgeColor="amber"
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            />
            <KpiCard
              label="Resolved"
              value={resolvedCount}
              badge="Compliant"
              badgeColor="emerald"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
            <KpiCard
              label="No Action"
              value={noActionCount}
              badge="Accepted"
              badgeColor="slate"
              icon={<MinusCircle className="w-5 h-5 text-slate-500" />}
            />
            <KpiCard
              label="Active Rules"
              value={activeRulesCount}
              subValue={`of ${rules.length} configured`}
              badge="Live Scanning"
              badgeColor="blue"
              icon={<Cpu className="w-5 h-5 text-blue-600" />}
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
                    setAnomPage(1);
                  }}
                  placeholder="Search by transaction #, entity, or rule..."
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
                      setAnomPage(1);
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
                      setAnomPage(1);
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>With memo</span>
                </label>
              </div>
            </div>

            {/* Dropdowns: Rule, Transaction Type, Anomaly Type, Accounting Period, Entity, Status, Subsidiary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Rule</label>
                <select
                  value={filterRule}
                  onChange={(e) => {
                    setFilterRule(e.target.value);
                    setAnomPage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="All">All Rules</option>
                  {uniqueRuleNames.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Tran Type</label>
                <select
                  value={filterTxType}
                  onChange={(e) => {
                    setFilterTxType(e.target.value);
                    setAnomPage(1);
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
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Period</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => {
                    setFilterPeriod(e.target.value);
                    setAnomPage(1);
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
                    setAnomPage(1);
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
                    setAnomPage(1);
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
                    setAnomPage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="All">All Subsidiaries</option>
                  {SUBSIDIARIES.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Anomaly Type</label>
                <select
                  value={filterAnomalyType}
                  onChange={(e) => {
                    setFilterAnomalyType(e.target.value);
                    setAnomPage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="All">All Types</option>
                  <option value="Missing Segment Rule">Missing Segment Rule</option>
                  <option value="High-Dollar Manual JE">High-Dollar Manual JE</option>
                  <option value="FX Exposure Spike">FX Exposure Spike</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-blue-50/70 p-2.5 rounded-lg text-xs">
                <span className="font-semibold text-blue-900">
                  {selectedIds.length} custom anomalies selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStatus('custom', selectedIds, 'resolve');
                      setSelectedIds([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStatus('custom', selectedIds, 'no-action');
                      setSelectedIds([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
                    Not an Error
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStatus('custom', selectedIds, 'discard');
                      setSelectedIds([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-md font-semibold hover:bg-rose-100 transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Remove Exceptions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStatus('custom', selectedIds, 'reopen');
                      setSelectedIds([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table:
              Transaction (link), Transaction Type, Rule, Accounting Period, Impacted Amount, Entity (link), Subsidiary, Date, Status, Action (Review) */}
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
                    <th className="py-3 px-3">Transaction</th>
                    <th className="py-3 px-3">Transaction Type</th>
                    <th className="py-3 px-3">Rule Name</th>
                    <th className="py-3 px-3">Period</th>
                    <th className="py-3 px-3 text-right">Impacted Amount</th>
                    <th className="py-3 px-3">Entity</th>
                    <th className="py-3 px-3">Subsidiary</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedAnomalies.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        No custom rule anomalies match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedAnomalies.map((item) => (
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
                            onClick={() => toggleBookmark('custom', item.id)}
                            className={`p-1 rounded hover:bg-slate-100 ${
                              item.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          <button
                            onClick={() => openTransactionModal(item.tranId)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {item.tranId}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{item.transactionType}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-44 truncate" title={item.ruleName}>
                          {item.ruleName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{item.accountingPeriod}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">
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
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-28">{item.subsidiary}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.date}</td>
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
                            onClick={() => openDrawer('custom', item)}
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
              currentPage={anomPage}
              totalItems={filteredAnomalies.length}
              pageSize={pageSize}
              onPageChange={setAnomPage}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANOMALY RULES VIEW */}
      {customSubTab === 'rules' && (
        <div className="space-y-4">
          {/* Rules Filter Bar: Search, Status, Owner, Priority */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(e) => {
                    setRuleSearch(e.target.value);
                    setRulePage(1);
                  }}
                  placeholder="Search rules by name, owner, or template..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <select
                  value={ruleFilterStatus}
                  onChange={(e) => {
                    setRuleFilterStatus(e.target.value);
                    setRulePage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              <div>
                <select
                  value={ruleFilterOwner}
                  onChange={(e) => {
                    setRuleFilterOwner(e.target.value);
                    setRulePage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="All">All Owners</option>
                  {uniqueOwners.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={ruleFilterPriority}
                  onChange={(e) => {
                    setRuleFilterPriority(e.target.value);
                    setRulePage(1);
                  }}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rules Table:
              Rule Name, Template, Status (Active/Draft/Paused), Owner, Priority (High/Medium/Low), Open, Resolved, No Action, Last Run, Actions (View Details | Edit). 25 per page. */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                    <th className="py-3 px-4">Rule Name</th>
                    <th className="py-3 px-3">Template</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3 text-center">Open</th>
                    <th className="py-3 px-3 text-center">Resolved</th>
                    <th className="py-3 px-3 text-center">No Action</th>
                    <th className="py-3 px-3">Last Run</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedRules.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No rules found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => openRuleDetailsModal(rule)}
                            className="text-left font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                          >
                            {rule.name}
                          </button>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ID: {rule.id}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{rule.template}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              rule.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rule.status === 'Paused'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {rule.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">{rule.owner}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              rule.priority === 'High'
                                ? 'text-rose-600'
                                : rule.priority === 'Medium'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {rule.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-600">{rule.openCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{rule.resolvedCount}</td>
                        <td className="py-3 px-3 text-center font-medium text-slate-500">{rule.noActionCount}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{rule.lastRun}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openRuleDetailsModal(rule)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => openCreateRuleModal(rule.template)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              Clone / Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={rulePage}
              totalItems={filteredRules.length}
              pageSize={pageSize}
              onPageChange={setRulePage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
