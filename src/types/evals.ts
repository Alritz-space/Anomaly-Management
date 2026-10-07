export type EvalSuiteId =
  | 'detection_accuracy'
  | 'summary_grounding'
  | 'format_compliance'
  | 'adversarial_robustness'
  | 'rule_coverage';

export type EvalStatus = 'Pass' | 'Fail' | 'Warn';

export interface EvalTestCaseResult {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'Pass' | 'Fail';
  score?: number;
  errorReason?: string;
  metadata?: Record<string, any>;
}

export interface EvalSuiteResult {
  id: EvalSuiteId;
  name: string;
  description: string;
  primaryMetricName: string;
  primaryMetricValue: number; // e.g. 94.2 (percentage) or 0.94
  displayMetric: string;
  threshold: string;
  isHardGate: boolean;
  status: EvalStatus;
  historyScores: number[]; // last 5 runs
  testCases: EvalTestCaseResult[];
  passCount: number;
  failCount: number;
  totalCount: number;
}

export interface EvalRunSummary {
  runId: string;
  timestamp: string;
  version: 'v1.2 (Current)' | 'v1.3 (Candidate)';
  overallStatus: 'Pass' | 'Fail';
  hardGatesPassed: boolean;
  suites: EvalSuiteResult[];
  summaryStats: {
    precision: number;
    recall: number;
    f1Score: number;
    hallucinationRate: number;
    formatCompliance: number;
    defenseRate: number;
    ruleCoverageRate: number;
    ruleFalsePositiveRate: number;
  };
}

export interface EvalRunHistoryEntry {
  runId: string;
  timestamp: string;
  version: string;
  f1Score: number;
  hallucinationRate: number;
  formatCompliance: number;
  defenseRate: number;
  overallStatus: 'Pass' | 'Fail';
}

export interface QualityDriftMetric {
  date: string;
  userApprovalRate: number; // Thumbs up %
  falsePositiveRate: number; // % of marked No Action
  guardrailTriggerCount: number; // Count of triggers
}

export type EvalFailureCase = EvalTestCaseResult;

