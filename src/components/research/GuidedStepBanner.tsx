import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';

export const GuidedStepBanner: React.FC = () => {
  const {
    activeScenario,
    guidedTasks,
    activeGuidedTaskIndex,
    setActiveGuidedTaskIndex,
    completedTaskIds,
    markTaskComplete,
    isGuidedBannerVisible,
    setIsGuidedBannerVisible,
    setIsGuidedLearningHubOpen,
    setActivePage,
    setDashboardTab,
    openDrawer,
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    addToast,
  } = useAnomaly();

  if (!isGuidedBannerVisible) return null;

  const currentTask = guidedTasks[activeGuidedTaskIndex] || guidedTasks[0];
  const isCurrentCompleted = completedTaskIds.includes(currentTask.id);
  const totalTasks = guidedTasks.length;

  const handleNext = () => {
    if (activeGuidedTaskIndex < totalTasks - 1) {
      setActiveGuidedTaskIndex(activeGuidedTaskIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeGuidedTaskIndex > 0) {
      setActiveGuidedTaskIndex(activeGuidedTaskIndex - 1);
    }
  };

  const handleExecuteTaskAction = () => {
    setActivePage('dashboard');
    setDashboardTab(currentTask.targetTab);

    if (currentTask.targetAnomalyId) {
      if (currentTask.targetTab === 'transactions') {
        const item = effectiveTransactionAnomalies.find((x) => x.id === currentTask.targetAnomalyId);
        if (item) {
          openDrawer('transaction', item);
          addToast('Guided Step Active', `Opened details for ${item.tranId} (${item.entity})`, 'info');
        }
      } else if (currentTask.targetTab === 'expected-missing') {
        const item = effectiveExpectedMissingAnomalies.find((x) => x.id === currentTask.targetAnomalyId);
        if (item) {
          openDrawer('expected-missing', item);
          addToast('Guided Step Active', `Opened details for ${item.tranId}`, 'info');
        }
      }
    } else {
      addToast('Navigated to Target Tab', `Review the ${currentTask.targetTab} view to complete this task.`, 'info');
    }
  };

  return (
    <div className="bg-[#fbf7f4] border-b border-[#ebdcd3] px-4 sm:px-6 py-2.5 transition-all text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Scenario & Step Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8d3c26] text-white font-semibold text-[11px] shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#fdece6]" />
            <span>Guided Task {activeGuidedTaskIndex + 1} of {totalTasks}</span>
          </div>

          {activeScenario && (
            <div className="hidden sm:flex items-center gap-1.5 text-stone-600 font-medium">
              <span className="text-stone-300">|</span>
              <span className="text-stone-400">Scenario:</span>
              <span className="font-semibold text-stone-800">{activeScenario.title}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-stone-300 hidden sm:inline">·</span>
            <span className="font-bold text-stone-900">{currentTask.title}</span>
            {isCurrentCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="text-stone-500 hidden lg:inline truncate max-w-md">
                — {currentTask.shortDescription}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={handleExecuteTaskAction}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#ebdcd3] text-[#8d3c26] rounded-lg font-semibold hover:bg-[#f6eee8] transition-colors shadow-2xs"
            title="Jump to relevant area"
          >
            <span>{currentTask.actionHint}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {!isCurrentCompleted && (
            <button
              type="button"
              onClick={() => markTaskComplete(currentTask.id)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-[#ebdcd3] pl-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeGuidedTaskIndex === 0}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-[#f2e6de] disabled:opacity-40 disabled:hover:bg-transparent"
              title="Previous Task"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeGuidedTaskIndex === totalTasks - 1}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-[#f2e6de] disabled:opacity-40 disabled:hover:bg-transparent"
              title="Next Task"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsGuidedLearningHubOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-600 hover:text-[#8d3c26] rounded-lg hover:bg-[#f2e6de] transition-colors font-medium"
            title="Open Scenarios & Checklist"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span className="hidden sm:inline">Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGuidedBannerVisible(false)}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-[#f2e6de] rounded-lg transition-colors"
            title="Hide banner (can reopen from Header)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
