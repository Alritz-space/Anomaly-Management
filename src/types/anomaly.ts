export type AnomalyStatus = 'Need Review' | 'Verified' | 'Reopen';

export type TransactionAnomalyType =
  | 'Unusual Account'
  | 'Unusual Amount'
  | 'Incorrect/Missing Segment'
  | 'Duplicate'
  | 'Vendor/Customer Alert';

export type ExpectedMissingType = 'Expected' | 'Missing';

export type InventoryAnomalyType =
  | 'Stockout'
  | 'Overstock'
  | 'Shortage - Low Risk'
  | 'Shortage - High Risk';

export type TransactionType =
  | 'Vendor Bill'
  | 'Invoice'
  | 'Journal Entry'
  | 'Purchase Order'
  | 'Sales Order'
  | 'Expense Report'
  | 'Payment'
  | 'Credit Memo';

export interface PastTransactionComparison {
  id: string;
  tranId: string;
  date: string;
  account: string;
  amount: number;
  entity: string;
  matchScore: string;
  status: string;
}

export interface TransactionAnomaly {
  id: string;
  tranId: string;
  transactionType: TransactionType;
  anomalyType: TransactionAnomalyType;
  importanceScore: number; // 1-100 (100 = highest importance)
  accountingPeriod: string;
  impactedAmount: number;
  entity: string;
  entityType: 'Vendor' | 'Customer' | 'Employee';
  subsidiary: string;
  status: AnomalyStatus;
  resolutionType?: 'Resolved' | 'No Action Needed';
  resolutionNote?: string;
  isBookmarked: boolean;
  memo?: string;
  account?: string;
  detectedAccount?: string;
  expectedAccount?: string;
  detectedSegment?: string;
  expectedSegment?: string;
  flowGroupId?: string; // Grouping ID e.g., 'FLOW-PO104-INV882'
  flowRole?: 'Purchase Order' | 'Sales Order' | 'Invoice' | 'Payment';
  createdAt: string;
  createdBy: string;
  summary: string;
  comparisonTransactions: PastTransactionComparison[];
}

export interface ExpectedMissingAnomaly {
  id: string;
  tranId: string;
  transactionType: TransactionType;
  anomalyType: ExpectedMissingType;
  accountingPeriod: string;
  expectedDate: string;
  impactedAmount: number;
  entity: string;
  entityType: 'Vendor' | 'Customer';
  subsidiary: string;
  account?: string;
  status: AnomalyStatus;
  resolutionType?: 'Resolved' | 'No Action Needed';
  resolutionNote?: string;
  isBookmarked: boolean;
  memo?: string;
  createdAt: string;
  createdBy: string;
  summary: string;
  isSupportedForCreation: boolean;
  recurringPattern: string; // e.g. "Monthly on the 1st", "Bi-weekly recurring"
  pastTransactionBasis: {
    tranId: string;
    date: string;
    amount: number;
    period: string;
  }[];
}

export interface InventoryAnomaly {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  location: string;
  startDate: string;
  leadTimeDays: number;
  projectedBalance: number;
  safetyStock: number;
  reorderPoint: number;
  preferredStockLevel: number;
  warning: string;
  anomalyType: InventoryAnomalyType;
  subsidiary: string;
  status: AnomalyStatus;
  resolutionType?: 'Resolved' | 'No Action Needed';
  resolutionNote?: string;
  isBookmarked: boolean;
  summary: string;
  nextActions: string[];
  projectionTimeline: {
    date: string;
    projected: number;
    safetyStock: number;
    reorderPoint: number;
    preferredLevel: number;
  }[];
}

export type RulePriority = 'High' | 'Medium' | 'Low';
export type RuleStatus = 'Active' | 'Draft' | 'Paused';

export interface RuleCondition {
  id: string;
  field:
    | 'Account'
    | 'Account Type'
    | 'Amount'
    | 'Approval Status'
    | 'Class'
    | 'Currency'
    | 'Date'
    | 'Subsidiary'
    | 'Transaction Type'
    | 'Entity';
  operator: string;
  value: string;
  value2?: string; // for 'is between'
}

export interface RuleAuditLog {
  id: string;
  timestamp: string;
  editor: string;
  action: string;
  details: string;
}

export interface AnomalyRule {
  id: string;
  name: string;
  template: string;
  description: string;
  status: RuleStatus;
  owner: string;
  priority: RulePriority;
  subsidiaries: string[];
  transactionTypes: TransactionType[];
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
  openCount: number;
  resolvedCount: number;
  noActionCount: number;
  lastRun: string;
  createdAt: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
  createForExisting: boolean;
  auditTrail: RuleAuditLog[];
}

export interface CustomAnomaly {
  id: string;
  tranId: string;
  transactionType: TransactionType;
  ruleId: string;
  ruleName: string;
  anomalyType: string;
  accountingPeriod: string;
  impactedAmount: number;
  entity: string;
  subsidiary: string;
  date: string;
  status: AnomalyStatus;
  resolutionType?: 'Resolved' | 'No Action Needed';
  resolutionNote?: string;
  assignedTo?: string;
  isBookmarked: boolean;
  memo?: string;
  createdAt: string;
  createdBy: string;
  summary: string;
  transactionDetails: {
    account: string;
    department: string;
    class: string;
    approvalStatus: string;
    currency: string;
  };
}

export interface AnomalyGlobalConfig {
  enabledTypes: Record<string, boolean>;
  includedTransactionTypes: TransactionType[];
  minAmountThreshold: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
