import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  ShieldAlert,
  Search,
  Bell,
  HelpCircle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { effectiveTransactionAnomalies, effectiveExpectedMissingAnomalies, effectiveInventoryAnomalies, effectiveCustomAnomalies } = useAnomaly();

  const totalPending =
    effectiveTransactionAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveExpectedMissingAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveInventoryAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveCustomAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">Enterprise ERP</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-blue-700 text-sm">Anomaly Management</span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Period Close Internal Controls & Outlier Audit
            </span>
          </div>
        </div>
      </div>

      {/* Global Center Search & Period Info */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">Subsidiary:</span>
          <span>Corp Consolidated (All)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">Period:</span>
          <span>Oct 2026 (Open)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">Audit Status:</span>
          <span className="text-amber-700 font-semibold">Pre-Close Review</span>
        </div>
      </div>

      {/* Right User & Alert Actions */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Pending Anomalies"
          >
            <Bell className="w-4 h-4" />
            {totalPending > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {totalPending > 99 ? '99+' : totalPending}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Anomaly Management Help & Guidance"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center">
            SJ
          </div>
          <div className="hidden md:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-800">Sarah Jenkins</div>
            <div className="text-[10px] text-slate-500">Corporate Controller</div>
          </div>
        </div>
      </div>
    </header>
  );
};
