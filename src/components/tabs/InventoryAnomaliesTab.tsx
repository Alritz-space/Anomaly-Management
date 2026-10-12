import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { InventoryAnomaly, InventoryAnomalyType } from '../../types/anomaly';
import { KpiCard } from '../common/KpiCard';
import { Pagination } from '../common/Pagination';
import {
  Search,
  Star,
  Boxes,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  MapPin,
  TrendingDown,
} from 'lucide-react';
import { SUBSIDIARIES } from '../../data/mockData';

export const InventoryAnomaliesTab: React.FC = () => {
  const {
    effectiveInventoryAnomalies,
    openDrawer,
    toggleBookmark,
    bulkUpdateStatus,
  } = useAnomaly();

  // Search by item name and by location
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  // Filters: Anomaly Type, Status, Subsidiary
  const [filterAnomalyType, setFilterAnomalyType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSubsidiary, setFilterSubsidiary] = useState<string>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Selected row checkboxes for bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtered dataset
  const filteredList = useMemo(() => {
    return effectiveInventoryAnomalies.filter((item) => {
      // Search by item name or SKU
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.itemName.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesSummary) return false;
      }

      // Search by location
      if (locationSearch) {
        const q = locationSearch.toLowerCase();
        if (!item.location.toLowerCase().includes(q)) return false;
      }

      // Dropdowns
      if (filterAnomalyType !== 'All' && item.anomalyType !== filterAnomalyType) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterSubsidiary !== 'All' && item.subsidiary !== filterSubsidiary) return false;

      // Toggle
      if (bookmarkedOnly && !item.isBookmarked) return false;

      return true;
    });
  }, [
    effectiveInventoryAnomalies,
    searchTerm,
    locationSearch,
    filterAnomalyType,
    filterStatus,
    filterSubsidiary,
    bookmarkedOnly,
  ]);

  // 1 KPI Card Required by Prompt: "Anomalies Pending Review"
  const pendingCount = filteredList.filter(
    (x) => x.status === 'Need Review' || x.status === 'Reopen'
  ).length;

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

  return (
    <div className="space-y-4">
      {/* 1 KPI Card Required by Prompt: "Anomalies Pending Review" */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Anomalies Pending Review"
          value={pendingCount}
          subValue={`of ${filteredList.length} items`}
          badge="Stock Risk Priority"
          badgeColor="amber"
          icon={<Boxes className="w-5 h-5 text-amber-600" />}
          description="Stockouts, overstock & projected shortage warnings"
        />
        <div className="sm:col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
              Predictive MRP Telemetry
            </span>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              Projected balances evaluate purchase order receipts, lead times, and open sales orders against safety stock and reorder thresholds across regional hubs.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0 hidden md:inline">
            Lead Time Aware
          </span>
        </div>
      </div>

      {/* Filter Bar: search item name + search location + filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by item name or SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by warehouse location..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-4 self-center justify-end text-xs">
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
          </div>
        </div>

        {/* Dropdowns: Anomaly Type, Status, Subsidiary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
              <option value="All">All Anomaly Types</option>
              <option value="Stockout">Stockout</option>
              <option value="Overstock">Overstock</option>
              <option value="Shortage - Low Risk">Shortage - Low Risk</option>
              <option value="Shortage - High Risk">Shortage - High Risk</option>
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
                  bulkUpdateStatus('inventory', selectedIds, 'resolve');
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
                  bulkUpdateStatus('inventory', selectedIds, 'no-action');
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
                  bulkUpdateStatus('inventory', selectedIds, 'discard');
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
                  bulkUpdateStatus('inventory', selectedIds, 'reopen');
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
          Item (link), Location, Start Date, Projected Balance, Warning, Anomaly Type, Status, Action (Review) */}
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
                <th className="py-3 px-3">Item / SKU</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3 text-right">Projected Balance</th>
                <th className="py-3 px-3">Warning Rationale</th>
                <th className="py-3 px-3">Anomaly Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No inventory anomalies match current filters.
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
                        onClick={() => toggleBookmark('inventory', item.id)}
                        className={`p-1 rounded hover:bg-slate-100 ${
                          item.isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      <div>
                        <button
                          onClick={() => openDrawer('inventory', item)}
                          className="text-blue-600 hover:underline font-bold text-left block"
                        >
                          {item.itemName}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {item.sku}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.startDate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-bold font-mono ${
                          item.projectedBalance < 0
                            ? 'text-rose-600'
                            : item.anomalyType === 'Overstock'
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.projectedBalance > 0 ? `+${item.projectedBalance}` : item.projectedBalance} units
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-56">
                      <span className="text-slate-600 truncate block text-[11px]" title={item.warning}>
                        {item.warning}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.anomalyType === 'Stockout'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.anomalyType === 'Overstock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.anomalyType === 'Shortage - High Risk'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        }`}
                      >
                        {item.anomalyType}
                      </span>
                    </td>
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
                        onClick={() => openDrawer('inventory', item)}
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
