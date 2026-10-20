import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  ShieldAlert,
  Bell,
  HelpCircle,
  Building2,
  Calendar,
  Layers,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveInventoryAnomalies,
    effectiveCustomAnomalies,
    activeScenario,
    selectScenario,
    researchScenarios,
    completedTaskIds,
    guidedTasks,
    setIsGuidedLearningHubOpen,
    setIsFeedbackModalOpen,
  } = useAnomaly();

  const totalPending =
    effectiveTransactionAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveExpectedMissingAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveInventoryAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length +
    effectiveCustomAnomalies.filter((a) => a.status === 'Need Review' || a.status === 'Reopen').length;

  const completedCount = completedTaskIds.length;
  const totalTasks = guidedTasks.length;

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#ebdcd3] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_1px_3px_rgba(40,16,10,0.03)]">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8d3c26] to-[#6d2715] text-white flex items-center justify-center font-bold shadow-xs">
            <ShieldAlert className="w-4.5 h-4.5 text-[#fdece6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm tracking-tight">Enterprise ERP</span>
              <span className="text-stone-300">/</span>
              <span className="font-bold text-[#8d3c26] text-sm">Anomaly Intelligence</span>
            </div>
            <span className="text-[11px] text-stone-500 hidden md:inline font-normal">
              Continuous Financial Internal Controls · SOX 404 Prototype
            </span>
          </div>
        </div>
      </div>

      {/* Global Center Meta & Scenario Switcher */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        {/* Quick Scenario Selector for User Research */}
        <div className="flex items-center gap-1.5 bg-[#fbf5f2] px-2.5 py-1 rounded-xl border border-[#ebdcd3]">
          <span className="text-[10px] font-bold text-[#8d3c26] uppercase tracking-wider">Scenario:</span>
          <select
            value={activeScenario?.id || ''}
            onChange={(e) => selectScenario(e.target.value || null)}
            className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
          >
            {researchScenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-stone-200" aria-hidden="true">·</span>

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
      </div>

      {/* Right User & Research Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Guided Learning Hub Trigger */}
        <button
          type="button"
          onClick={() => setIsGuidedLearningHubOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf4f0] hover:bg-[#f5e8e2] border border-[#ebdcd3] text-[#8d3c26] rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
          title="Open Guided Learning & Research Suite"
        >
          <Compass className="w-3.5 h-3.5 text-[#8d3c26]" />
          <span className="hidden sm:inline">Guided Learning</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#8d3c26] text-white text-[10px] font-bold">
            {completedCount}/{totalTasks}
          </span>
        </button>

        {/* User Research Feedback Button */}
        <button
          type="button"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#fbf7f4] border border-[#ebdcd3] text-stone-700 rounded-xl text-xs font-medium transition-colors shadow-2xs"
          title="Submit Participant Research Feedback"
        >
          <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden md:inline">Feedback</span>
        </button>

        <div className="relative">
          <button
            type="button"
            className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-[#f6eee8] rounded-xl transition-colors"
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

        <div className="h-5 w-px bg-[#ebdcd3] mx-0.5" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-[#752e1d] text-[#fbf5f2] text-xs font-semibold flex items-center justify-center shadow-2xs">
            SJ
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-semibold text-stone-800">Sarah Jenkins</div>
            <div className="text-[10px] text-stone-400">Corporate Controller</div>
          </div>
        </div>
      </div>
    </header>
  );
};
