import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  Compass,
  X,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Layers,
  Star,
  Sparkles,
  HelpCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export const GuidedLearningHubModal: React.FC = () => {
  const {
    isGuidedLearningHubOpen,
    setIsGuidedLearningHubOpen,
    activeScenario,
    selectScenario,
    researchScenarios,
    guidedTasks,
    activeGuidedTaskIndex,
    setActiveGuidedTaskIndex,
    completedTaskIds,
    markTaskComplete,
    setIsGuidedBannerVisible,
    setActivePage,
    setDashboardTab,
    openDrawer,
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    submitFeedback,
    feedbackEntries,
    addToast,
  } = useAnomaly();

  const [activeTab, setActiveTab] = useState<'scenarios' | 'tasks' | 'feedback'>('tasks');

  // Feedback form state
  const [easeRating, setEaseRating] = useState<number>(5);
  const [explainabilityRating, setExplainabilityRating] = useState<number>(5);
  const [guardrailsTrustRating, setGuardrailsTrustRating] = useState<number>(5);
  const [frictionPoint, setFrictionPoint] = useState<string>('None - flow feels clear');
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  if (!isGuidedLearningHubOpen) return null;

  const totalTasks = guidedTasks.length;
  const completedCount = completedTaskIds.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const handleLaunchTask = (index: number) => {
    setActiveGuidedTaskIndex(index);
    const task = guidedTasks[index];
    setActivePage('dashboard');
    setDashboardTab(task.targetTab);
    setIsGuidedBannerVisible(true);
    setIsGuidedLearningHubOpen(false);

    if (task.targetAnomalyId) {
      if (task.targetTab === 'transactions') {
        const item = effectiveTransactionAnomalies.find((x) => x.id === task.targetAnomalyId);
        if (item) openDrawer('transaction', item);
      } else if (task.targetTab === 'expected-missing') {
        const item = effectiveExpectedMissingAnomalies.find((x) => x.id === task.targetAnomalyId);
        if (item) openDrawer('expected-missing', item);
      }
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      easeRating,
      explainabilityRating,
      guardrailsTrustRating,
      primaryFrictionPoint: frictionPoint,
      comments: feedbackComment || 'Evaluated prototype workflow during enterprise research testing.',
    });
    setFeedbackComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl border border-[#ebdcd3] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="bg-[#fbf7f4] border-b border-[#ebdcd3] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8d3c26] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-[#fdece6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  Enterprise Guided Learning & User Research Suite
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f7ebe4] text-[#8d3c26] border border-[#ebdcd3]">
                  Participant Ready
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Interactive scenarios, step-by-step triage walkthroughs, and in-product evaluator feedback
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGuidedLearningHubOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#f2e6de] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-[#ebdcd3] px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-[#8d3c26] text-[#8d3c26]'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guided Tasks ({completedCount}/{totalTasks})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scenarios')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'scenarios'
                  ? 'border-[#8d3c26] text-[#8d3c26]'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Research Scenarios ({researchScenarios.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-[#8d3c26] text-[#8d3c26]'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Evaluator Feedback</span>
            </button>
          </div>

          {/* Quick Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-stone-400">Evaluation Progress:</span>
            <div className="w-24 h-2 bg-[#f2e6de] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8d3c26] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-bold text-stone-700">{progressPercent}%</span>
          </div>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fdfcf9] space-y-6">
          {/* TAB 1: GUIDED TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-[#fbf7f4] border border-[#ebdcd3] rounded-2xl p-4 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-stone-900">
                    Step-by-Step Enterprise Evaluation Protocol
                  </div>
                  <p>
                    Follow these 4 curated tasks to test machine learning explainability, enterprise internal controls, bulk triage guardrails, and compliance auditability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuidedBannerVisible(true)}
                  className="px-3 py-1.5 bg-[#8d3c26] text-white rounded-xl text-xs font-semibold hover:bg-[#782e1b] transition-colors shrink-0 self-start sm:self-auto"
                >
                  Show Top Banner
                </button>
              </div>

              <div className="space-y-3">
                {guidedTasks.map((task, idx) => {
                  const isDone = completedTaskIds.includes(task.id);
                  const isCurrent = activeGuidedTaskIndex === idx;

                  return (
                    <div
                      key={task.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-white border-[#8d3c26] shadow-sm ring-1 ring-[#8d3c26]/20'
                          : isDone
                          ? 'bg-[#faf8f5] border-[#e8ded6]'
                          : 'bg-white border-[#ebdcd3] hover:border-stone-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <button
                            type="button"
                            onClick={() => markTaskComplete(task.id)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#f6eee8] text-stone-500 hover:bg-[#8d3c26] hover:text-white'
                            }`}
                            title={isDone ? 'Task completed' : 'Mark complete'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d3c26] bg-[#fbf0eb] px-2 py-0.5 rounded-md border border-[#ebdcd3]">
                                Task {task.stepNumber}
                              </span>
                              <h4 className="text-sm font-bold text-stone-900">
                                {task.title}
                              </h4>
                              {isDone && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Verified
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                              {task.detailedGuidance}
                            </p>

                            <div className="pt-1 text-[11px] text-stone-500 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-[#8d3c26]" />
                              <span>{task.complianceStandard}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLaunchTask(idx)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8d3c26] text-white rounded-xl text-xs font-semibold hover:bg-[#782e1b] transition-colors shadow-2xs"
                          >
                            <span>Launch Step</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600">
                Select an operational scenario to configure the prototype with realistic enterprise data, filters, and audit objectives.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchScenarios.map((sc) => {
                  const isSelected = activeScenario?.id === sc.id;

                  return (
                    <div
                      key={sc.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-white border-[#8d3c26] shadow-sm ring-2 ring-[#8d3c26]/20'
                          : 'bg-white border-[#ebdcd3] hover:border-stone-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d3c26] bg-[#fbf0eb] px-2 py-0.5 rounded-md border border-[#ebdcd3]">
                            {sc.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Active Scenario
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {sc.title}
                        </h4>
                        <div className="text-[11px] text-stone-500 font-medium">
                          {sc.subtitle}
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed pt-1">
                          {sc.description}
                        </p>

                        <div className="pt-2 border-t border-[#f2e6de] space-y-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Key Evaluation Checklist:
                          </span>
                          <ul className="text-[11px] text-stone-600 space-y-1 pl-4 list-disc">
                            {sc.checklist.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#f2e6de]">
                        <span className="text-[11px] text-stone-500">
                          Target: <strong className="text-stone-700 capitalize">{sc.targetTab}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            selectScenario(sc.id);
                            setIsGuidedLearningHubOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#f6eee8] text-[#8d3c26] hover:bg-[#eddacf]'
                              : 'bg-[#8d3c26] text-white hover:bg-[#782e1b]'
                          }`}
                        >
                          {isSelected ? 'Loaded · Jump to View' : 'Load Scenario'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <form onSubmit={handleSubmitFeedback} className="bg-white p-6 rounded-2xl border border-[#ebdcd3] space-y-5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">
                    Enterprise User Research Assessment Form
                  </h4>
                  <p className="text-xs text-stone-500">
                    Your feedback is logged into the audit telemetry for internal controls research.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Triage Ease of Use (1-5)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEaseRating(s)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            easeRating >= s
                              ? 'bg-[#8d3c26] border-[#8d3c26] text-white'
                              : 'bg-white border-[#ebdcd3] text-stone-500 hover:bg-[#f6eee8]'
                          }`}
                        >
                          ★ {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">
                      AI Explainability Clarity (1-5)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setExplainabilityRating(s)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            explainabilityRating >= s
                              ? 'bg-[#8d3c26] border-[#8d3c26] text-white'
                              : 'bg-white border-[#ebdcd3] text-stone-500 hover:bg-[#f6eee8]'
                          }`}
                        >
                          ★ {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Guardrail Safety Trust (1-5)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setGuardrailsTrustRating(s)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            guardrailsTrustRating >= s
                              ? 'bg-[#8d3c26] border-[#8d3c26] text-white'
                              : 'bg-white border-[#ebdcd3] text-stone-500 hover:bg-[#f6eee8]'
                          }`}
                        >
                          ★ {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Observed Friction Point (if any):
                  </label>
                  <select
                    value={frictionPoint}
                    onChange={(e) => setFrictionPoint(e.target.value)}
                    className="w-full p-2.5 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26]"
                  >
                    <option value="None - flow feels clear">None - flow is intuitive and clear</option>
                    <option value="Bulk action confirmation needs more context">Bulk action confirmation needs more context</option>
                    <option value="Distinction between Resolved and Not an Error">Distinction between Resolved and Not an Error</option>
                    <option value="Importance sensitivity slider thresholding">Importance sensitivity slider thresholding</option>
                    <option value="Audit trail visibility">Audit trail visibility</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Qualitative Evaluator Comments:
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Enter observations on usability, visual hierarchy, Redwood styling, or enterprise compliance requirements..."
                    className="w-full p-3 bg-[#fcf9f6] border border-[#ebdcd3] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#8d3c26] resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#8d3c26] text-white rounded-xl text-xs font-bold hover:bg-[#782e1b] transition-colors shadow-xs"
                  >
                    Submit Research Evaluation
                  </button>
                </div>
              </form>

              {/* Past Submitted Feedback in Session */}
              {feedbackEntries.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Evaluation Log Entries ({feedbackEntries.length})
                  </h5>
                  <div className="space-y-2">
                    {feedbackEntries.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 bg-white rounded-xl border border-[#ebdcd3] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800">{fb.userName} ({fb.userRole})</span>
                          <span className="text-[11px] text-stone-400">{fb.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone-600">
                          <span>Ease: ★{fb.easeRating}</span>
                          <span>·</span>
                          <span>Explainability: ★{fb.explainabilityRating}</span>
                          <span>·</span>
                          <span>Trust: ★{fb.guardrailsTrustRating}</span>
                        </div>
                        <p className="text-stone-700 text-xs italic">
                          "{fb.comments}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
