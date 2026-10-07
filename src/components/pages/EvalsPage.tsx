import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { EvalSuiteResult, EvalFailureCase } from '../../types/evals';
import { DRIFT_30_DAY_METRICS } from '../../data/guardrailData';
import {
  Gauge,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Activity,
  Layers,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Sliders,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  X,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const EvalsPage: React.FC = () => {
  const {
    evalResults,
    evalRunHistory,
    isEvalRunning,
    runEvals,
    evalConfigVersion,
    setEvalConfigVersion,
  } = useAnomaly();

  const [activeTab, setActiveTab] = useState<'suites' | 'quality-monitoring'>('suites');
  const [selectedSuiteForDrilldown, setSelectedSuiteForDrilldown] = useState<EvalSuiteResult | null>(null);
  const [drilldownFilter, setDrilldownFilter] = useState<'all' | 'fail' | 'pass'>('all');

  // Release Gate calculation
  const hardGates = evalResults?.suites.filter((s) => s.isHardGate) || [];
  const failingHardGates = hardGates.filter((s) => s.status !== 'Pass');
  const releaseGatePassed = hardGates.length > 0 && failingHardGates.length === 0;

  // Export results as JSON
  const exportResultsJson = () => {
    if (!evalResults) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evalResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anomaly-evals-${evalResults.runId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export results as CSV
  const exportResultsCsv = () => {
    if (!evalResults) return;
    let csv = 'Suite ID,Suite Name,Primary Metric,Metric Value,Threshold,Hard Gate,Status,Passed,Total\n';
    evalResults.suites.forEach((s) => {
      csv += `"${s.id}","${s.name}","${s.primaryMetricName}","${s.primaryMetricValue}","${s.threshold}","${s.isHardGate}","${s.status}",${s.passCount},${s.totalCount}\n`;
    });
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anomaly-evals-${evalResults.runId}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Model Evals & Continuous Quality Suite
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-blue-100 text-blue-800">
                  {evalConfigVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated regression test suites, hallucination benchmarking, adversarial resilience, and release gates
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Version Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['v1.2 (Current)', 'v1.3 (Candidate)'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEvalConfigVersion(v)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    evalConfigVersion === v
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Run All Evals Button */}
            <button
              type="button"
              disabled={isEvalRunning}
              onClick={() => runEvals()}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 ${isEvalRunning ? 'animate-spin' : ''}`} />
              <span>{isEvalRunning ? 'Executing Test Suites...' : 'Run All Evals'}</span>
            </button>

            {/* Export Buttons */}
            <button
              type="button"
              onClick={exportResultsJson}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mt-6 border-t border-slate-100 pt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('suites')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'suites'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Evaluation Suites & Scorecards (5 Suites)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quality-monitoring')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'quality-monitoring'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Continuous Quality & Drift Monitoring (30-Day Rolling)
          </button>
        </div>
      </div>

      {activeTab === 'suites' && (
        <>
          {/* Release Gate Banner */}
          <div
            className={`rounded-2xl p-5 border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              releaseGatePassed
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  releaseGatePassed ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {releaseGatePassed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">
                    Release Gate Decision: {releaseGatePassed ? 'READY FOR PRODUCTION' : 'RELEASE BLOCKED'}
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      releaseGatePassed
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    Hard Gate Enforced
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {releaseGatePassed
                    ? 'All hard gates passed: Hallucination Rate <= 3.0% and Prompt Injection Defense = 100.0%.'
                    : `Release blocked: ${failingHardGates.map((s) => s.name).join(', ')} failed required safety threshold.`}
                </p>
              </div>
            </div>

            <div className="text-right text-xs shrink-0">
              <span className="text-slate-500 block text-[10px]">Last Eval Run ID</span>
              <span className="font-mono font-bold text-slate-900">{evalResults?.runId || 'RUN-INITIAL'}</span>
            </div>
          </div>

          {/* Version Score Comparison Indicator */}
          {evalConfigVersion === 'v1.3 (Candidate)' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Candidate v1.3 vs Baseline v1.2:</strong> +2.5% Detection F1 Score, -1.1% Hallucination Rate, 0% Adversarial Bypass.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700">Recommended for Deployment</span>
            </div>
          )}

          {/* Test Suites Scorecards Grid (5 Suites) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {evalResults?.suites.map((suite) => {
              const isPass = suite.status === 'Pass';
              const isWarn = suite.status === 'Warn';

              return (
                <div
                  key={suite.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Top: Name and Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {suite.isHardGate ? '🛡️ Hard Gate Suite' : 'Standard Suite'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">{suite.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          isPass
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isWarn
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {suite.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed min-h-10">
                      {suite.description}
                    </p>

                    {/* Metric Display */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {suite.primaryMetricName}
                        </span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">{suite.displayMetric}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Target</span>
                        <span className="text-xs font-semibold text-slate-700">{suite.threshold}</span>
                      </div>
                    </div>

                    {/* Sparkline / Trend History */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Past 5 Runs Trend</span>
                        <span>Latest: {suite.historyScores[suite.historyScores.length - 1]}%</span>
                      </div>
                      <div className="h-10 w-full flex items-end gap-1.5 pt-1">
                        {suite.historyScores.map((val, idx) => {
                          const heightPct = Math.max(20, Math.min(100, val));
                          return (
                            <div
                              key={idx}
                              style={{ height: `${heightPct}%` }}
                              className={`flex-1 rounded-sm transition-all ${
                                idx === suite.historyScores.length - 1
                                  ? isPass
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                  : 'bg-slate-200'
                              }`}
                              title={`Run -${suite.historyScores.length - 1 - idx}: ${val}%`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Test count and Drilldown Trigger */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      <strong>{suite.passCount}</strong> / {suite.totalCount} test cases passed
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSuiteForDrilldown(suite);
                        setDrilldownFilter('all');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Inspect Cases</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CONTINUOUS QUALITY & DRIFT MONITORING TAB */}
      {activeTab === 'quality-monitoring' && (
        <div className="space-y-6">
          {/* Drift Alert Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">Quality Drift Alert Triggered</h4>
              <p className="text-xs text-amber-900 mt-0.5">
                False Positive Report Rate increased by <strong>+8.4%</strong> over the past 7 days (surpassed 8% threshold on Oct 04).
                Users frequently marked "No Action Needed" on vendor bills under $5,000. Recommend increasing the materiality threshold in Configuration.
              </p>
            </div>
          </div>

          {/* 30-Day Rolling Quality Metrics Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">30-Day Rolling Quality Metrics</h3>
                <p className="text-xs text-slate-500">
                  Tracking User Approval Ratio (thumbs up) vs False Positive Report Rate (No Action clicks)
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">User Approval Rate (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-600">False Positive Rate (%)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DRIFT_30_DAY_METRICS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="userApprovalRate"
                    name="Approval Rate"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="falsePositiveRate"
                    name="False Positive Rate"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drift Telemetry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Weekly Rolling Quality Observations
              </h4>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-4">Date Window</th>
                  <th className="py-2.5 px-4 text-right">User Approval (Thumbs Up)</th>
                  <th className="py-2.5 px-4 text-right">False Positive Dismissals</th>
                  <th className="py-2.5 px-4 text-right">Guardrail Interceptions</th>
                  <th className="py-2.5 px-4">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {DRIFT_30_DAY_METRICS.slice(-5).map((m) => (
                  <tr key={m.date} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{m.date}, 2026</td>
                    <td className="py-2.5 px-4 text-right font-medium text-emerald-700">{m.userApprovalRate}%</td>
                    <td className="py-2.5 px-4 text-right font-medium text-rose-700">{m.falsePositiveRate}%</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">{m.guardrailTriggerCount}</td>
                    <td className="py-2.5 px-4">
                      {m.falsePositiveRate > 8.0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Drift Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRILLDOWN DRAWER / MODAL FOR TEST CASES */}
      {selectedSuiteForDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white h-full w-full max-w-2xl shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Suite Drilldown</span>
                <h3 className="font-bold text-base text-slate-900">{selectedSuiteForDrilldown.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSuiteForDrilldown.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSuiteForDrilldown(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter */}
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Show:</span>
                {(['all', 'fail', 'pass'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDrilldownFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                      drilldownFilter === f ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 text-[11px]">
                Showing {selectedSuiteForDrilldown.testCases.filter((c) => drilldownFilter === 'all' || (drilldownFilter === 'fail' ? c.status === 'Fail' : c.status === 'Pass')).length} test cases
              </span>
            </div>

            {/* Test Cases List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              {selectedSuiteForDrilldown.testCases
                .filter((c) => drilldownFilter === 'all' || (drilldownFilter === 'fail' ? c.status === 'Fail' : c.status === 'Pass'))
                .map((tc) => {
                  const isPass = tc.status === 'Pass';
                  return (
                    <div
                      key={tc.id}
                      className={`p-4 rounded-xl border space-y-2 ${
                        isPass ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{tc.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tc.status}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg text-slate-600 font-mono text-[11px]">
                        <strong>Input:</strong> {tc.input}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">
                          <span className="font-bold block uppercase text-[9px] text-emerald-700">Expected</span>
                          {tc.expectedOutput}
                        </div>
                        <div className={`p-2 rounded-lg ${isPass ? 'bg-slate-100 text-slate-800' : 'bg-rose-100 text-rose-900 font-bold'}`}>
                          <span className="font-bold block uppercase text-[9px] text-slate-500">Actual</span>
                          {tc.actualOutput}
                        </div>
                      </div>

                      {tc.errorReason && (
                        <div className="p-2 bg-rose-100/70 text-rose-800 rounded-lg text-[11px]">
                          <strong>Failure Reason:</strong> {tc.errorReason}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
