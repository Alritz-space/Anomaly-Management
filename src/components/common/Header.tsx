import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  ShieldAlert,
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
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#ebdcd3] px-5 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_1px_3px_rgba(40,16,10,0.03)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8d3c26] to-[#6d2715] text-white flex items-center justify-center font-bold shadow-xs">
            <ShieldAlert className="w-4.5 h-4.5 text-[#fdece6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 text-sm tracking-tight">Enterprise ERP</span>
              <span className="text-stone-300">/</span>
              <span className="font-semibold text-[#8d3c26] text-sm">Anomaly Management</span>
            </div>
            <span className="text-[11px] text-stone-500 hidden sm:inline font-normal">
              Period Close Internal Controls & Outlier Audit
            </span>
          </div>
        </div>
      </div>

      {/* Global Center Meta: Subsidiary, Period & Audit Status */}
      <div className="hidden lg:flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5 text-stone-600">
          <Building2 className="w-3.5 h-3.5 text-[#a85a43]" />
          <span className="text-stone-400">Subsidiary:</span>
          <span className="font-medium text-stone-800">Corp Consolidated</span>
        </div>

        <span className="text-stone-200" aria-hidden="true">·</span>

        <div className="flex items-center gap-1.5 text-stone-600">
          <Calendar className="w-3.5 h-3.5 text-[#a85a43]" />
          <span className="text-stone-400">Period:</span>
          <span className="font-medium text-stone-800">Oct 2026 (Open)</span>
        </div>

        <span className="text-stone-200" aria-hidden="true">·</span>

        <div className="flex items-center gap-1.5 text-stone-600">
          <Layers className="w-3.5 h-3.5 text-[#a85a43]" />
          <span className="text-stone-400">Audit Status:</span>
          <span className="text-[#a4543d] font-semibold">Pre-Close Review</span>
        </div>
      </div>

      {/* Right User & Alert Actions */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-[#f6eee8] rounded-lg transition-colors"
            title="Pending Anomalies"
          >
            <Bell className="w-4 h-4" />
            {totalPending > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9e3b20] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {totalPending > 99 ? '99+' : totalPending}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-[#f6eee8] rounded-lg transition-colors"
          title="Anomaly Management Help & Guidance"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#ebdcd3] mx-1" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-7 h-7 rounded-full bg-[#752e1d] text-[#fbf5f2] text-xs font-semibold flex items-center justify-center shadow-2xs">
            SJ
          </div>
          <div className="hidden md:block text-left text-xs leading-tight">
            <div className="font-semibold text-stone-800">Sarah Jenkins</div>
            <div className="text-[10px] text-stone-400">Corporate Controller</div>
          </div>
        </div>
      </div>
    </header>
  );
};
