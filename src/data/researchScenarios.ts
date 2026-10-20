import { ResearchScenario, GuidedTask } from '../types/research';

export const RESEARCH_SCENARIOS: ResearchScenario[] = [
  {
    id: 'sox-404-period-close',
    title: 'Quarter-End Financial Close & SOX 404 Audit',
    subtitle: 'SEC Compliance · Material General Ledger Postings',
    badge: 'Internal Controls',
    description:
      'Evaluate material period-end manual journal entries and unexpected account reclassifications before fiscal ledger lock. Focus on high-dollar outliers ($> $500,000) that carry internal control audit risk.',
    objective:
      'Identify and triage the $1.4M equipment reclassification (JE-90214). Validate machine learning feature attribution, inspect past ledger lines, and either mark resolved with an audit note or flag as Not an Error.',
    targetTab: 'transactions',
    suggestedThresholdStep: 4, // High importance >= 80
    keyAnomalyId: 'TR-ANOM-001',
    checklist: [
      'Filter for high-importance journal entries (Threshold Level 4+)',
      'Inspect TR-ANOM-001 (JE-90214: $1,420,000 reclassification)',
      'Review AI feature attribution explaining the account mismatch',
      'Record formal controller justification and Mark Resolved',
    ],
  },
  {
    id: 'ap-duplicate-fraud-prevention',
    title: 'AP Disbursement & Duplicate Invoice Safeguard',
    subtitle: 'Vendor Risk · Cash Outflow Leakage Prevention',
    badge: 'Cash Governance',
    description:
      'Examine duplicate vendor billing submissions and anomalous billing frequencies. Test enterprise bulk guardrails, peer confirmation modals, and the 10-second undo safety net.',
    objective:
      'Perform a multi-item bulk review of vendor bill duplicates. Verify that the enterprise confirmation modal enforces comment logging and that changes remain undoable.',
    targetTab: 'transactions',
    suggestedThresholdStep: 3,
    keyAnomalyId: 'TR-ANOM-004',
    checklist: [
      'Filter anomaly type to "Duplicate" and "Vendor Bill"',
      'Multi-select flagged duplicate vendor submissions',
      'Execute bulk "Not an Error" or "Remove Exceptions"',
      'Verify the Enterprise Confirmation modal with optional justification',
      'Test the 10-second countdown Undo Toast',
    ],
  },
  {
    id: 'accrual-cycle-variance',
    title: 'Predictive Periodicity & Unrecorded Accruals',
    subtitle: 'GAAP / ASC 606 · Automated Liability Detection',
    badge: 'Accrual Completeness',
    description:
      'Detect recurring vendor services that failed to post in the current fiscal period. Prevent period-end unrecorded liabilities by generating automated voucher adjustments.',
    objective:
      'Inspect the missing AWS Cloud Infrastructure invoice ($68,400). Use the one-click "Create Transaction" workflow to generate a draft journal voucher.',
    targetTab: 'expected-missing',
    suggestedThresholdStep: 2,
    keyAnomalyId: 'EXP-ANOM-001',
    checklist: [
      'Navigate to the Expected / Missing domain tab',
      'Select EXP-ANOM-001 (AWS Infrastructure - Oct 2026)',
      'Inspect machine learning recurrence pattern (12-month cadence)',
      'Click "Create Transaction" to generate the draft accrual voucher',
    ],
  },
  {
    id: 'inventory-reconciliation',
    title: 'Supply Chain & Inventory Valuation Control',
    subtitle: 'Cost Accounting · Physical vs Perpetual Discrepancies',
    badge: 'Valuation Audit',
    description:
      'Audit negative perpetual balances and critical warehouse shortages before month-end cost allocation and physical cycle counting.',
    objective:
      'Investigate negative on-hand balances in the San Jose Distribution Hub and determine whether inventory records require physical recount adjustment.',
    targetTab: 'inventory',
    suggestedThresholdStep: 3,
    keyAnomalyId: 'INV-ANOM-001',
    checklist: [
      'Switch to the Inventory Anomalies domain view',
      'Filter for High Risk / Shortage items',
      'Examine Item ITEM-1002 balance deficit (-15 units)',
      'Document corrective warehouse action in the details drawer',
    ],
  },
];

export const GUIDED_TASKS: GuidedTask[] = [
  {
    id: 'task-1-outlier-triage',
    stepNumber: 1,
    title: 'AI Outlier Inspection & Explainability',
    shortDescription: 'Review ML feature attribution and audit evidence on a high-risk outlier.',
    detailedGuidance:
      'Click into TR-ANOM-001 (JE-90214) to open the Enterprise Drawer. Notice how the continuous intelligence engine highlights the specific GL account mismatch against 3 historical baseline postings. Review the confidence score, evaluate the risk summary, and click "Mark Resolved" (with a Thumbs Up) or "Not an Error" (with a Thumbs Down).',
    complianceStandard: 'SOX 404 Control Activity #FA-104: Manual Journal Voucher Materiality Review',
    targetTab: 'transactions',
    targetAnomalyId: 'TR-ANOM-001',
    actionHint: 'Open TR-ANOM-001 in Transaction Outliers',
  },
  {
    id: 'task-2-bulk-guardrails',
    stepNumber: 2,
    title: 'Bulk Triage & Safety Guardrails',
    shortDescription: 'Test multi-select bulk operations, confirmation safety prompt, and 10s undo.',
    detailedGuidance:
      'Select multiple anomaly checkboxes in the transaction table. In the bulk action bar, click "Mark Resolved", "Not an Error", or "Remove Exceptions". Notice how the enterprise modal asks "Are you sure?", provides an optional justification comment field, and offers a "Do not show again" preference. After proceeding, observe the 10-second Undo Toast at bottom-center.',
    complianceStandard: 'Enterprise Internal Control Safeguard #SEC-209: Mass State Transition Authorization',
    targetTab: 'transactions',
    actionHint: 'Select 2 or more rows and use the Bulk Action bar',
  },
  {
    id: 'task-3-missing-accrual',
    stepNumber: 3,
    title: 'Predictive Periodicity & Transaction Generation',
    shortDescription: 'Inspect an omitted monthly recurring expense and generate a voucher.',
    detailedGuidance:
      'Navigate to the "Expected / Missing" tab. Select the flagged AWS Cloud Infrastructure invoice (EXP-ANOM-001). Review the historical periodicity chart showing 12 months of on-time postings. Click "Create Transaction" in the drawer to draft a pre-populated balancing entry.',
    complianceStandard: 'GAAP Matching Principle: Accrual Completeness and Unrecorded Liability Prevention',
    targetTab: 'expected-missing',
    targetAnomalyId: 'EXP-ANOM-001',
    actionHint: 'Open EXP-ANOM-001 and click Create Transaction',
  },
  {
    id: 'task-4-audit-verification',
    stepNumber: 4,
    title: 'Audit Trail & Compliance Verification',
    shortDescription: 'Verify immutable user logs, timestamps, and guardrail enforcement history.',
    detailedGuidance:
      'From the sidebar, open the "SOX Audit Log" or "Guardrail Activity" view. Confirm that your triage decisions, bulk approvals, and rule triggers are recorded with ISO timestamps, user ID (Sarah Jenkins / Controller), and exact before-and-after states.',
    complianceStandard: 'AICPA SOC 1 / SOC 2 Trust Services Criteria: CC6.1 - Logical Access and Activity Auditability',
    targetTab: 'transactions',
    actionHint: 'Navigate to Audit Log in the left sidebar',
  },
];
