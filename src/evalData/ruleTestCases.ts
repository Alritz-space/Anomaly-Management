export interface RuleCoverageTestCase {
  id: string;
  name: string;
  ruleDefinition: {
    name: string;
    field: string;
    operator: string;
    value: string;
    logic: 'AND' | 'OR';
  };
  simulatedMatchedCount: number;
  totalHistoricalCount: number;
  expectedOverBroad: boolean;
  expectedFalsePositiveRate: number; // e.g. 0.08 = 8%
  description: string;
}

export const RULE_COVERAGE_CASES: RuleCoverageTestCase[] = [
  {
    id: 'rc-01',
    name: 'Precision rule: High AP bill without department',
    ruleDefinition: {
      name: 'Unsegmented AP Bills > $25k',
      field: 'Amount',
      operator: 'greater than',
      value: '25000',
      logic: 'AND',
    },
    simulatedMatchedCount: 8,
    totalHistoricalCount: 2410,
    expectedOverBroad: false,
    expectedFalsePositiveRate: 0.04,
    description: 'Targeted rule matching 0.33% of volume with high signal-to-noise ratio.',
  },
  {
    id: 'rc-02',
    name: 'Over-broad rule: Any transaction with amount > $10',
    ruleDefinition: {
      name: 'All Transactions Exceeding $10',
      field: 'Amount',
      operator: 'greater than',
      value: '10',
      logic: 'AND',
    },
    simulatedMatchedCount: 1980,
    totalHistoricalCount: 2410,
    expectedOverBroad: true,
    expectedFalsePositiveRate: 0.82,
    description: 'Matches 82.1% of transactions (>50%), generating massive review noise.',
  },
  {
    id: 'rc-03',
    name: 'Targeted rule: Journal entry direct to operating cash',
    ruleDefinition: {
      name: 'Direct Manual Cash Postings',
      field: 'Account',
      operator: 'equals',
      value: '1010 - Operating Cash',
      logic: 'AND',
    },
    simulatedMatchedCount: 14,
    totalHistoricalCount: 2410,
    expectedOverBroad: false,
    expectedFalsePositiveRate: 0.06,
    description: 'Surgical internal control rule flagging direct cash balance bypasses.',
  },
  {
    id: 'rc-04',
    name: 'Over-broad rule: Incomplete status check',
    ruleDefinition: {
      name: 'Any Non-Empty Memo Field',
      field: 'Memo',
      operator: 'is not empty',
      value: '',
      logic: 'AND',
    },
    simulatedMatchedCount: 1650,
    totalHistoricalCount: 2410,
    expectedOverBroad: true,
    expectedFalsePositiveRate: 0.68,
    description: 'Matches 68.4% of transactions, flagged as over-broad by evaluator.',
  },
  {
    id: 'rc-05',
    name: 'Balanced rule: Intercompany revaluation anomalies',
    ruleDefinition: {
      name: 'Intercompany Variance Threshold',
      field: 'Amount',
      operator: 'greater than',
      value: '50000',
      logic: 'AND',
    },
    simulatedMatchedCount: 22,
    totalHistoricalCount: 2410,
    expectedOverBroad: false,
    expectedFalsePositiveRate: 0.05,
    description: 'Matches 0.91% of transactions with low false-positive rate.',
  },
];
