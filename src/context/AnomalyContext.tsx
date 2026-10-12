import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  TransactionAnomaly,
  ExpectedMissingAnomaly,
  InventoryAnomaly,
  CustomAnomaly,
  AnomalyRule,
  AnomalyGlobalConfig,
  ToastNotification,
  AnomalyStatus,
} from '../types/anomaly';
import {
  INITIAL_TRANSACTION_ANOMALIES,
  INITIAL_EXPECTED_MISSING,
  INITIAL_INVENTORY_ANOMALIES,
  INITIAL_CUSTOM_ANOMALIES,
  INITIAL_RULES,
  INITIAL_CONFIG,
  MOCK_ENTITIES,
  MOCK_TRANSACTIONS,
  MockEntity,
  MockTransactionRecord,
} from '../data/mockData';
import { UserRole, GuardrailEvent, AuditLogEntry } from '../types/guardrails';
import { INITIAL_AUDIT_LOGS, INITIAL_GUARDRAIL_EVENTS } from '../data/guardrailData';
import { getRolePermissions, getActionRestrictionReason } from '../guardrails/rbac';
import { validateTenantAccess, DEFAULT_TENANT_ID } from '../guardrails/tenantGuard';
import {
  evaluateBulkActionPolicy,
  validateHighImpactResolutionNote,
  globalNoActionTracker,
} from '../guardrails/actionPolicies';
import { runAllEvals } from '../evals/runner';
import { EvalRunSummary, EvalRunHistoryEntry } from '../types/evals';

export type ActivePage =
  | 'dashboard'
  | 'home'
  | 'config'
  | 'transaction-record'
  | 'evals'
  | 'guardrails'
  | 'audit-log';

export type DashboardTab = 'transactions' | 'expected-missing' | 'inventory' | 'custom';
export type CustomSubTab = 'anomalies' | 'rules';

export interface ActiveDrawerState {
  type: 'transaction' | 'expected-missing' | 'inventory' | 'custom';
  item: TransactionAnomaly | ExpectedMissingAnomaly | InventoryAnomaly | CustomAnomaly;
}

export interface UndoableAction {
  id: string;
  anomalyType: 'transaction' | 'expected-missing' | 'inventory' | 'custom';
  anomalyItemId: string;
  previousStatus: AnomalyStatus;
  previousResolutionType?: 'Resolved' | 'No Action Needed';
  previousResolutionNote?: string;
  targetStatus: AnomalyStatus;
  expiresAt: number; // Date.now() + 10000 (10 seconds)
}

export interface BulkConfirmationModalState {
  isOpen: boolean;
  type: 'transaction' | 'expected-missing' | 'inventory' | 'custom';
  ids: string[];
  action: 'resolve' | 'no-action' | 'reopen' | 'discard';
}

interface AnomalyContextType {
  // Navigation & Page State
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  customSubTab: CustomSubTab;
  setCustomSubTab: (subTab: CustomSubTab) => void;
  currentRecordTranId: string;
  setCurrentRecordTranId: (id: string) => void;

  // RBAC & Dev Toolbar
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  activeTenantId: string;
  setActiveTenantId: (tenantId: string) => void;
  coldStartEnabled: boolean;
  setColdStartEnabled: (val: boolean) => void;

  // Global Configuration
  config: AnomalyGlobalConfig;
  updateConfig: (newConfig: AnomalyGlobalConfig) => void;

  // Data Collections (Raw & Effective)
  transactionAnomalies: TransactionAnomaly[];
  expectedMissingAnomalies: ExpectedMissingAnomaly[];
  inventoryAnomalies: InventoryAnomaly[];
  customAnomalies: CustomAnomaly[];
  rules: AnomalyRule[];

  // Filtered lists conforming to global config, confidence gating, and tenant guard
  effectiveTransactionAnomalies: TransactionAnomaly[];
  effectiveExpectedMissingAnomalies: ExpectedMissingAnomaly[];
  effectiveInventoryAnomalies: InventoryAnomaly[];
  effectiveCustomAnomalies: CustomAnomaly[];

  // Drawers and Modals
  activeDrawer: ActiveDrawerState | null;
  openDrawer: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    item: TransactionAnomaly | ExpectedMissingAnomaly | InventoryAnomaly | CustomAnomaly
  ) => void;
  closeDrawer: () => void;

  selectedEntityModal: MockEntity | null;
  openEntityModal: (entityName: string) => void;
  closeEntityModal: () => void;

  selectedTransactionModal: MockTransactionRecord | null;
  openTransactionModal: (tranId: string) => void;
  closeTransactionModal: () => void;

  createTransactionModalItem: ExpectedMissingAnomaly | null;
  openCreateTransactionModal: (item: ExpectedMissingAnomaly) => void;
  closeCreateTransactionModal: () => void;

  ruleDetailsModalRule: AnomalyRule | null;
  openRuleDetailsModal: (rule: AnomalyRule) => void;
  closeRuleDetailsModal: () => void;

  isCreateRuleModalOpen: boolean;
  openCreateRuleModal: (template?: string) => void;
  closeCreateRuleModal: () => void;
  initialTemplateForCreate: string | null;

  // Anomaly Status Actions with Action Guardrails
  markResolved: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ) => boolean;
  markNoAction: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ) => boolean;
  reopenAnomaly: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ) => boolean;
  bulkUpdateStatus: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    ids: string[],
    action: 'resolve' | 'no-action' | 'reopen' | 'discard'
  ) => void;
  discardAnomaly: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ) => boolean;
  toggleBookmark: (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string
  ) => void;
  assignCustomAnomaly: (id: string, assignee: string) => void;

  // Action Guardrail States & Callbacks
  undoAction: UndoableAction | null;
  triggerUndo: () => void;
  dismissUndo: () => void;
  bulkConfirmModal: BulkConfirmationModalState | null;
  closeBulkConfirmModal: () => void;
  executeBulkActionConfirmed: (comment?: string, doNotShowAgain?: boolean) => void;
  noActionAbuseNudge: string | null;
  dismissNoActionNudge: () => void;

  // Audit Logs & Telemetry
  auditLogs: AuditLogEntry[];
  guardrailEvents: GuardrailEvent[];
  logAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'role'>) => void;
  logGuardrailEvent: (event: Omit<GuardrailEvent, 'id' | 'timestamp'>) => void;
  clearGuardrailEvents: () => void;

  // Evals Execution & Results
  evalResults: EvalRunSummary | null;
  evalRunHistory: EvalRunHistoryEntry[];
  isEvalRunning: boolean;
  evalConfigVersion: 'v1.2 (Current)' | 'v1.3 (Candidate)';
  setEvalConfigVersion: (v: 'v1.2 (Current)' | 'v1.3 (Candidate)') => void;
  runEvals: () => Promise<void>;

  // Rules Actions
  activateRule: (ruleId: string) => void;
  pauseRule: (ruleId: string) => void;
  deleteDraftRule: (ruleId: string) => void;
  saveNewRule: (rule: AnomalyRule) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}

const AnomalyContext = createContext<AnomalyContextType | undefined>(undefined);

export const AnomalyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('transactions');
  const [customSubTab, setCustomSubTab] = useState<CustomSubTab>('anomalies');
  const [currentRecordTranId, setCurrentRecordTranId] = useState<string>('PO-10492');

  // RBAC & Dev Toolbar State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin');
  const [activeTenantId, setActiveTenantId] = useState<string>(DEFAULT_TENANT_ID);
  const [coldStartEnabled, setColdStartEnabled] = useState<boolean>(true);

  // Guardrail action states
  const [undoAction, setUndoAction] = useState<UndoableAction | null>(null);
  const [bulkConfirmModal, setBulkConfirmModal] = useState<BulkConfirmationModalState | null>(null);
  const [noActionAbuseNudge, setNoActionAbuseNudge] = useState<string | null>(null);

  // Audit Logs & Guardrail Telemetry
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [guardrailEvents, setGuardrailEvents] = useState<GuardrailEvent[]>(INITIAL_GUARDRAIL_EVENTS);

  // Evals state
  const [evalResults, setEvalResults] = useState<EvalRunSummary | null>(null);
  const [evalRunHistory, setEvalRunHistory] = useState<EvalRunHistoryEntry[]>([
    { runId: 'RUN-910241', timestamp: '2026-10-05 18:30:10', version: 'v1.2 (Current)', f1Score: 92.1, hallucinationRate: 2.9, formatCompliance: 100.0, defenseRate: 100.0, overallStatus: 'Pass' },
    { runId: 'RUN-891044', timestamp: '2026-10-04 12:15:40', version: 'v1.2 (Current)', f1Score: 91.5, hallucinationRate: 3.2, formatCompliance: 98.2, defenseRate: 100.0, overallStatus: 'Pass' },
    { runId: 'RUN-820199', timestamp: '2026-10-03 09:40:02', version: 'v1.2 (Current)', f1Score: 89.1, hallucinationRate: 3.8, formatCompliance: 97.5, defenseRate: 100.0, overallStatus: 'Pass' },
  ]);
  const [isEvalRunning, setIsEvalRunning] = useState<boolean>(false);
  const [evalConfigVersion, setEvalConfigVersion] = useState<'v1.2 (Current)' | 'v1.3 (Candidate)'>('v1.2 (Current)');

  // Main collections
  const [config, setConfig] = useState<AnomalyGlobalConfig>(INITIAL_CONFIG);
  const [transactionAnomalies, setTransactionAnomalies] = useState<TransactionAnomaly[]>(INITIAL_TRANSACTION_ANOMALIES);
  const [expectedMissingAnomalies, setExpectedMissingAnomalies] = useState<ExpectedMissingAnomaly[]>(INITIAL_EXPECTED_MISSING);
  const [inventoryAnomalies, setInventoryAnomalies] = useState<InventoryAnomaly[]>(INITIAL_INVENTORY_ANOMALIES);
  const [customAnomalies, setCustomAnomalies] = useState<CustomAnomaly[]>(INITIAL_CUSTOM_ANOMALIES);
  const [rules, setRules] = useState<AnomalyRule[]>(INITIAL_RULES);

  // Modals & Drawers
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerState | null>(null);
  const [selectedEntityModal, setSelectedEntityModal] = useState<MockEntity | null>(null);
  const [selectedTransactionModal, setSelectedTransactionModal] = useState<MockTransactionRecord | null>(null);
  const [createTransactionModalItem, setCreateTransactionModalItem] = useState<ExpectedMissingAnomaly | null>(null);
  const [ruleDetailsModalRule, setRuleDetailsModalRule] = useState<AnomalyRule | null>(null);
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState<boolean>(false);
  const [initialTemplateForCreate, setInitialTemplateForCreate] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Initialize evals on first load
  useEffect(() => {
    runAllEvals('v1.2 (Current)').then((initialRes) => {
      setEvalResults(initialRes);
    });
  }, []);

  // Logging helpers
  const logAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'role'>) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      role: currentUserRole,
      tenantId: activeTenantId,
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const logGuardrailEvent = (event: Omit<GuardrailEvent, 'id' | 'timestamp'>) => {
    const newEv: GuardrailEvent = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tenantId: activeTenantId,
      user: currentUserRole,
      ...event,
    };
    setGuardrailEvents((prev) => [newEv, ...prev]);
  };

  const clearGuardrailEvents = () => {
    setGuardrailEvents([]);
    addToast('Telemetry Cleared', 'Guardrail event log has been reset.', 'info');
  };

  // Toast Helpers
  const addToast = (
    title: string,
    message: string,
    type: ToastNotification['type'] = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync active drawer item
  useEffect(() => {
    if (!activeDrawer) return;
    const { type, item } = activeDrawer;
    if (type === 'transaction') {
      const found = transactionAnomalies.find((x) => x.id === item.id);
      if (found) setActiveDrawer({ type, item: found });
    } else if (type === 'expected-missing') {
      const found = expectedMissingAnomalies.find((x) => x.id === item.id);
      if (found) setActiveDrawer({ type, item: found });
    } else if (type === 'inventory') {
      const found = inventoryAnomalies.find((x) => x.id === item.id);
      if (found) setActiveDrawer({ type, item: found });
    } else if (type === 'custom') {
      const found = customAnomalies.find((x) => x.id === item.id);
      if (found) setActiveDrawer({ type, item: found });
    }
  }, [transactionAnomalies, expectedMissingAnomalies, inventoryAnomalies, customAnomalies]);

  // Sync rule details modal
  useEffect(() => {
    if (!ruleDetailsModalRule) return;
    const found = rules.find((r) => r.id === ruleDetailsModalRule.id);
    if (found) setRuleDetailsModalRule(found);
  }, [rules]);

  // Effective filtered lists with tenant isolation and cold-start logic
  const effectiveTransactionAnomalies = useMemo(() => {
    return transactionAnomalies.filter((item) => {
      // Tenant Isolation Guard
      const tenantCheck = validateTenantAccess(undefined, activeTenantId);
      if (!tenantCheck.isAllowed) return false;

      // Min amount threshold
      if (item.impactedAmount < config.minAmountThreshold) return false;
      // Anomaly type enabled
      if (!config.enabledTypes[item.anomalyType]) return false;
      // Transaction type enabled
      if (!config.includedTransactionTypes.includes(item.transactionType)) return false;
      return true;
    });
  }, [transactionAnomalies, config, activeTenantId]);

  const effectiveExpectedMissingAnomalies = useMemo(() => {
    return expectedMissingAnomalies.filter((item) => {
      // Tenant Isolation Guard
      const tenantCheck = validateTenantAccess(undefined, activeTenantId);
      if (!tenantCheck.isAllowed) return false;

      // Cold start / low confidence filter
      // If cold start enabled and entity has < 3 transactions, suppress or check
      if (coldStartEnabled) {
        const ent = MOCK_ENTITIES[item.entity] || Object.values(MOCK_ENTITIES).find((e: any) => e.name === item.entity);
        const historyCount = (ent as any)?.historicalTransactionsCount || item.pastTransactionBasis?.length || 4;
        if (historyCount < 3) {
          // Suppress predictive anomalies with insufficient history
          return false;
        }
      }

      if (item.impactedAmount < config.minAmountThreshold) return false;
      if (!config.enabledTypes['Expected/Missing']) return false;
      if (!config.includedTransactionTypes.includes(item.transactionType)) return false;
      return true;
    });
  }, [expectedMissingAnomalies, config, activeTenantId, coldStartEnabled]);

  const effectiveInventoryAnomalies = useMemo(() => {
    return inventoryAnomalies.filter(() => {
      const tenantCheck = validateTenantAccess(undefined, activeTenantId);
      if (!tenantCheck.isAllowed) return false;
      if (!config.enabledTypes['Inventory']) return false;
      return true;
    });
  }, [inventoryAnomalies, config, activeTenantId]);

  const effectiveCustomAnomalies = useMemo(() => {
    return customAnomalies.filter((item) => {
      const tenantCheck = validateTenantAccess(undefined, activeTenantId);
      if (!tenantCheck.isAllowed) return false;
      if (item.impactedAmount < config.minAmountThreshold) return false;
      if (!config.enabledTypes['Custom']) return false;
      if (!config.includedTransactionTypes.includes(item.transactionType)) return false;
      return true;
    });
  }, [customAnomalies, config, activeTenantId]);

  // Drawer & Modal control
  const openDrawer = (type: any, item: any) => setActiveDrawer({ type, item });
  const closeDrawer = () => setActiveDrawer(null);

  const openEntityModal = (entityName: string) => {
    const ent = MOCK_ENTITIES[entityName] || Object.values(MOCK_ENTITIES).find((e: any) => e.name.toLowerCase() === entityName.toLowerCase());
    setSelectedEntityModal(ent || {
      name: entityName,
      type: 'Vendor',
      subsidiary: 'US - West Corp',
      email: `contact@${entityName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: '+1 (555) 019-2834',
      status: 'Active',
      terms: 'Net 30',
      creditLimit: 100000,
      balance: 24500,
      historicalTransactionsCount: 12,
      riskLevel: 'Low',
    });
  };
  const closeEntityModal = () => setSelectedEntityModal(null);

  const openTransactionModal = (tranId: string) => {
    const tx = MOCK_TRANSACTIONS[tranId] || Object.values(MOCK_TRANSACTIONS).find((t: any) => t.tranId === tranId);
    setSelectedTransactionModal(tx || {
      tranId: tranId,
      type: 'Vendor Bill',
      entity: 'Apex Legal Partners',
      subsidiary: 'US - West Corp',
      postingPeriod: 'Oct 2026',
      date: '2026-10-04',
      amount: 64200.0,
      currency: 'USD',
      memo: 'Professional services for patent compliance docket.',
      status: 'Pending Approval',
      approvalStatus: 'Pending CFO Approval',
      hasAnomaly: true,
      anomalyId: 'ANOM-102',
      glLines: [
        { account: '6810 - Legal Fees', debit: 64200, credit: 0, department: 'Legal', class: 'Corp', location: 'HQ' },
        { account: '2010 - Accounts Payable', debit: 0, credit: 64200, department: 'Legal', class: 'Corp', location: 'HQ' },
      ],
      auditHistory: [{ date: '2026-10-04 09:30', user: 'David Kim', action: 'Created Vendor Bill' }],
    });
  };
  const closeTransactionModal = () => setSelectedTransactionModal(null);

  const openCreateTransactionModal = (item: ExpectedMissingAnomaly) => setCreateTransactionModalItem(item);
  const closeCreateTransactionModal = () => setCreateTransactionModalItem(null);

  const openRuleDetailsModal = (rule: AnomalyRule) => setRuleDetailsModalRule(rule);
  const closeRuleDetailsModal = () => setRuleDetailsModalRule(null);

  const openCreateRuleModal = (template?: string) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canCreateRules) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('create_rule', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('create_rule', currentUserRole), 'error');
      return;
    }
    setInitialTemplateForCreate(template || null);
    setIsCreateRuleModalOpen(true);
  };
  const closeCreateRuleModal = () => {
    setIsCreateRuleModalOpen(false);
    setInitialTemplateForCreate(null);
  };

  // Helper to schedule 10-second undoable state
  const registerUndo = (
    anomalyType: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    previousStatus: AnomalyStatus,
    targetStatus: AnomalyStatus,
    previousResolutionType?: 'Resolved' | 'No Action Needed',
    previousResolutionNote?: string
  ) => {
    setUndoAction({
      id: `undo-${Date.now()}`,
      anomalyType,
      anomalyItemId: id,
      previousStatus,
      targetStatus,
      previousResolutionType,
      previousResolutionNote,
      expiresAt: Date.now() + 10000,
    });
  };

  const triggerUndo = () => {
    if (!undoAction) return;
    const { anomalyType, anomalyItemId, previousStatus, previousResolutionType, previousResolutionNote } = undoAction;

    if (anomalyType === 'transaction') {
      setTransactionAnomalies((prev) =>
        prev.map((item) =>
          item.id === anomalyItemId
            ? { ...item, status: previousStatus, resolutionType: previousResolutionType, resolutionNote: previousResolutionNote }
            : item
        )
      );
    } else if (anomalyType === 'expected-missing') {
      setExpectedMissingAnomalies((prev) =>
        prev.map((item) =>
          item.id === anomalyItemId
            ? { ...item, status: previousStatus, resolutionType: previousResolutionType, resolutionNote: previousResolutionNote }
            : item
        )
      );
    } else if (anomalyType === 'inventory') {
      setInventoryAnomalies((prev) =>
        prev.map((item) =>
          item.id === anomalyItemId
            ? { ...item, status: previousStatus, resolutionType: previousResolutionType, resolutionNote: previousResolutionNote }
            : item
        )
      );
    } else if (anomalyType === 'custom') {
      setCustomAnomalies((prev) =>
        prev.map((item) =>
          item.id === anomalyItemId
            ? { ...item, status: previousStatus, resolutionType: previousResolutionType, resolutionNote: previousResolutionNote }
            : item
        )
      );
    }

    logAuditEntry({
      user: currentUserRole,
      action: 'Status Change Undone',
      category: 'Status Change',
      entityId: anomalyItemId,
      details: `Reverted anomaly ${anomalyItemId} back to original status "${previousStatus}".`,
    });

    addToast('Action Undone', `Anomaly ${anomalyItemId} reverted back to "${previousStatus}".`, 'info');
    setUndoAction(null);
  };

  const dismissUndo = () => setUndoAction(null);

  // Status Action: Mark Resolved
  const markResolved = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ): boolean => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canReviewAnomalies) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('review', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('review', currentUserRole), 'error');
      return false;
    }

    const updater = (item: any) => {
      registerUndo(type, id, item.status, 'Verified', item.resolutionType, item.resolutionNote);
      return {
        ...item,
        status: 'Verified' as AnomalyStatus,
        resolutionType: 'Resolved' as const,
        resolutionNote: note || item.resolutionNote,
      };
    };

    if (type === 'transaction') {
      setTransactionAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'expected-missing') {
      setExpectedMissingAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'inventory') {
      setInventoryAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'custom') {
      setCustomAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    }

    logAuditEntry({
      user: currentUserRole,
      action: 'Anomaly Resolved',
      category: 'Status Change',
      entityId: id,
      after: 'Verified (Resolved)',
      details: note ? `Resolution Note: ${note}` : 'Marked resolved by reviewer.',
    });

    addToast('Anomaly Verified', `Anomaly ${id} has been marked as Resolved.`, 'success');
    return true;
  };

  // Status Action: Mark No Action Needed (with High-impact validation & abuse tracker)
  const markNoAction = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ): boolean => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canReviewAnomalies) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('review', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('review', currentUserRole), 'error');
      return false;
    }

    // Locate target item to validate high impact requirement
    let targetItem: any = null;
    let anomTypeStr = 'Transaction';
    let entityStr = 'General';

    if (type === 'transaction') {
      targetItem = transactionAnomalies.find((x) => x.id === id);
      if (targetItem) {
        anomTypeStr = targetItem.anomalyType;
        entityStr = targetItem.entity;
      }
    } else if (type === 'expected-missing') {
      targetItem = expectedMissingAnomalies.find((x) => x.id === id);
      if (targetItem) {
        anomTypeStr = 'Expected/Missing';
        entityStr = targetItem.entity;
      }
    } else if (type === 'inventory') {
      targetItem = inventoryAnomalies.find((x) => x.id === id);
      if (targetItem) {
        anomTypeStr = 'Inventory Risk';
        entityStr = targetItem.location;
      }
    } else if (type === 'custom') {
      targetItem = customAnomalies.find((x) => x.id === id);
      if (targetItem) {
        anomTypeStr = targetItem.ruleName;
        entityStr = targetItem.entity;
      }
    }

    const impactedAmount = targetItem?.impactedAmount || targetItem?.amount || 0;

    // A2: High-Impact Resolution Note Guardrail
    const highImpactCheck = validateHighImpactResolutionNote(impactedAmount, 'No Action Needed', note);
    if (!highImpactCheck.isValid) {
      logGuardrailEvent({
        type: 'High-Impact Note',
        severity: 'high',
        itemId: id,
        actionTaken: 'blocked',
        reason: highImpactCheck.error || 'High impact dismissal requires min 10-char resolution note.',
      });
      addToast('Guardrail Blocked', highImpactCheck.error || 'Resolution note of min 10 chars required.', 'error');
      return false;
    }

    // A2: No-Action Abuse Tracker & Nudge
    const abuseResult = globalNoActionTracker.recordNoAction(anomTypeStr, entityStr);
    if (abuseResult.triggerNudge && abuseResult.message) {
      setNoActionAbuseNudge(abuseResult.message);
      logGuardrailEvent({
        type: 'No-Action Abuse',
        severity: 'medium',
        itemId: id,
        actionTaken: 'warned',
        reason: abuseResult.message,
      });
    }

    const updater = (item: any) => {
      registerUndo(type, id, item.status, 'Verified', item.resolutionType, item.resolutionNote);
      return {
        ...item,
        status: 'Verified' as AnomalyStatus,
        resolutionType: 'No Action Needed' as const,
        resolutionNote: note || item.resolutionNote,
      };
    };

    if (type === 'transaction') {
      setTransactionAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'expected-missing') {
      setExpectedMissingAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'inventory') {
      setInventoryAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'custom') {
      setCustomAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    }

    logAuditEntry({
      user: currentUserRole,
      action: 'No Action Needed Marked',
      category: 'Status Change',
      entityId: id,
      after: 'Verified (No Action Needed)',
      details: note ? `Documented Note: ${note}` : 'Dismissed as normal business operational pattern.',
    });

    addToast('Anomaly Dismissed', `Anomaly ${id} marked as "No Action Needed".`, 'info');
    return true;
  };

  // Status Action: Reopen Anomaly
  const reopenAnomaly = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ): boolean => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canReviewAnomalies) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('review', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('review', currentUserRole), 'error');
      return false;
    }

    const updater = (item: any) => {
      registerUndo(type, id, item.status, 'Reopen', item.resolutionType, item.resolutionNote);
      return {
        ...item,
        status: 'Reopen' as AnomalyStatus,
        resolutionType: undefined,
        resolutionNote: note || item.resolutionNote,
      };
    };

    if (type === 'transaction') {
      setTransactionAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'expected-missing') {
      setExpectedMissingAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'inventory') {
      setInventoryAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    } else if (type === 'custom') {
      setCustomAnomalies((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    }

    logAuditEntry({
      user: currentUserRole,
      action: 'Anomaly Reopened',
      category: 'Status Change',
      entityId: id,
      after: 'Reopen',
      details: note ? `Reopen justification: ${note}` : 'Reopened for further audit investigation.',
    });

    addToast('Anomaly Reopened', `Anomaly ${id} status set to Reopen.`, 'warning');
    return true;
  };

  // Discard Anomaly (Completely removes the exception from the system)
  const discardAnomaly = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string,
    note?: string
  ): boolean => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canReviewAnomalies) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('review', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('review', currentUserRole), 'error');
      return false;
    }

    if (type === 'transaction') {
      setTransactionAnomalies((prev) => prev.filter((item) => item.id !== id));
    } else if (type === 'expected-missing') {
      setExpectedMissingAnomalies((prev) => prev.filter((item) => item.id !== id));
    } else if (type === 'inventory') {
      setInventoryAnomalies((prev) => prev.filter((item) => item.id !== id));
    } else if (type === 'custom') {
      setCustomAnomalies((prev) => prev.filter((item) => item.id !== id));
    }

    logAuditEntry({
      user: currentUserRole,
      action: 'Anomaly Discarded',
      category: 'Status Change',
      entityId: id,
      after: 'Discarded (Removed)',
      details: note ? `Discard justification: ${note}` : 'Exception removed from system.',
    });

    addToast('Anomaly Discarded', `Anomaly ${id} has been removed from the system.`, 'info');
    return true;
  };

  // Skip confirmation preference state
  const [skipBulkConfirmation, setSkipBulkConfirmation] = useState<boolean>(() => {
    try {
      return localStorage.getItem('erp_skip_bulk_confirm') === 'true';
    } catch {
      return false;
    }
  });

  // Bulk update with confirmation modal prompt, optional comments, and discard action support
  const bulkUpdateStatus = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    ids: string[],
    action: 'resolve' | 'no-action' | 'reopen' | 'discard'
  ) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canPerformBulkActions) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('bulk_action', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('bulk_action', currentUserRole), 'error');
      return;
    }

    const policy = evaluateBulkActionPolicy(ids.length);
    if (!policy.allowed) {
      logGuardrailEvent({
        type: 'Bulk Action Limit',
        severity: 'high',
        actionTaken: 'blocked',
        reason: policy.reason || 'Bulk action not allowed.',
      });
      addToast('Action Guardrail Blocked', policy.reason || 'Bulk action limit exceeded.', 'error');
      return;
    }

    // Always ask confirmation if not opted out via 'Do not show this message again'
    if (!skipBulkConfirmation) {
      setBulkConfirmModal({ isOpen: true, type, ids, action });
      return;
    }

    // Otherwise execute immediately
    executeBulkInternal(type, ids, action);
  };

  const closeBulkConfirmModal = () => setBulkConfirmModal(null);

  const executeBulkActionConfirmed = (comment?: string, doNotShowAgain?: boolean) => {
    if (!bulkConfirmModal) return;
    const { type, ids, action } = bulkConfirmModal;

    if (doNotShowAgain) {
      setSkipBulkConfirmation(true);
      try {
        localStorage.setItem('erp_skip_bulk_confirm', 'true');
      } catch {
        // ignore localStorage errors
      }
    }

    executeBulkInternal(type, ids, action, comment);
    setBulkConfirmModal(null);
  };

  const executeBulkInternal = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    ids: string[],
    action: 'resolve' | 'no-action' | 'reopen' | 'discard',
    comment?: string
  ) => {
    if (action === 'discard') {
      const filterOut = (item: any) => !ids.includes(item.id);
      if (type === 'transaction') {
        setTransactionAnomalies((prev) => prev.filter(filterOut));
      } else if (type === 'expected-missing') {
        setExpectedMissingAnomalies((prev) => prev.filter(filterOut));
      } else if (type === 'inventory') {
        setInventoryAnomalies((prev) => prev.filter(filterOut));
      } else if (type === 'custom') {
        setCustomAnomalies((prev) => prev.filter(filterOut));
      }

      logAuditEntry({
        user: currentUserRole,
        action: 'Bulk Action: DISCARD',
        category: 'Bulk Action',
        details: `Bulk removed ${ids.length} anomalies of type "${type}" from system.${comment ? ` Comment: ${comment}` : ''}`,
      });

      addToast(
        'Bulk Action Completed',
        `Successfully removed ${ids.length} anomalies from system.`,
        'success'
      );
      return;
    }

    const targetStatus: AnomalyStatus = action === 'reopen' ? 'Reopen' : 'Verified';
    const resolutionType =
      action === 'resolve' ? ('Resolved' as const) : action === 'no-action' ? ('No Action Needed' as const) : undefined;

    const updater = (item: any) =>
      ids.includes(item.id)
        ? {
            ...item,
            status: targetStatus,
            resolutionType: resolutionType !== undefined ? resolutionType : item.resolutionType,
            resolutionNote: comment ? (item.resolutionNote ? `${item.resolutionNote} | Bulk: ${comment}` : `Bulk: ${comment}`) : item.resolutionNote,
          }
        : item;

    if (type === 'transaction') {
      setTransactionAnomalies((prev) => prev.map(updater));
    } else if (type === 'expected-missing') {
      setExpectedMissingAnomalies((prev) => prev.map(updater));
    } else if (type === 'inventory') {
      setInventoryAnomalies((prev) => prev.map(updater));
    } else if (type === 'custom') {
      setCustomAnomalies((prev) => prev.map(updater));
    }

    logAuditEntry({
      user: currentUserRole,
      action: `Bulk Action: ${action.toUpperCase()}`,
      category: 'Bulk Action',
      details: `Bulk updated ${ids.length} anomalies of type "${type}" to "${targetStatus}".${comment ? ` Comment: ${comment}` : ''}`,
    });

    addToast(
      'Bulk Action Completed',
      `Successfully updated ${ids.length} anomalies to "${targetStatus}".`,
      'success'
    );
  };

  const dismissNoActionNudge = () => setNoActionAbuseNudge(null);

  // Bookmark toggle
  const toggleBookmark = (
    type: 'transaction' | 'expected-missing' | 'inventory' | 'custom',
    id: string
  ) => {
    const updater = (item: any) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item);
    if (type === 'transaction') setTransactionAnomalies((prev) => prev.map(updater));
    else if (type === 'expected-missing') setExpectedMissingAnomalies((prev) => prev.map(updater));
    else if (type === 'inventory') setInventoryAnomalies((prev) => prev.map(updater));
    else if (type === 'custom') setCustomAnomalies((prev) => prev.map(updater));
  };

  // Assign Custom Anomaly
  const assignCustomAnomaly = (id: string, assignee: string) => {
    setCustomAnomalies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignedTo: assignee } : item))
    );
    logAuditEntry({
      user: currentUserRole,
      action: 'Anomaly Assigned',
      category: 'Status Change',
      entityId: id,
      after: assignee,
      details: `Assigned custom anomaly ${id} to ${assignee}.`,
    });
    addToast('Assignment Updated', `Anomaly assigned to ${assignee}.`, 'info');
  };

  // Rule Management Actions with RBAC
  const activateRule = (ruleId: string) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canPauseActivateRules) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('toggle_rule', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('toggle_rule', currentUserRole), 'error');
      return;
    }

    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              status: 'Active',
              lastRun: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );
    logAuditEntry({
      user: currentUserRole,
      action: 'Rule Activated',
      category: 'Rule Management',
      entityId: ruleId,
      after: 'Active',
      details: `Production anomaly rule ${ruleId} activated.`,
    });
    addToast('Rule Activated', `Rule ${ruleId} is now actively scanning transactions.`, 'success');
  };

  const pauseRule = (ruleId: string) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canPauseActivateRules) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('toggle_rule', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('toggle_rule', currentUserRole), 'error');
      return;
    }

    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, status: 'Paused' } : r)));
    logAuditEntry({
      user: currentUserRole,
      action: 'Rule Paused',
      category: 'Rule Management',
      entityId: ruleId,
      after: 'Paused',
      details: `Production anomaly rule ${ruleId} paused.`,
    });
    addToast('Rule Paused', `Rule ${ruleId} has been paused.`, 'warning');
  };

  const deleteDraftRule = (ruleId: string) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canDeleteRules) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'high',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('delete_rule', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('delete_rule', currentUserRole), 'error');
      return;
    }

    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    logAuditEntry({
      user: currentUserRole,
      action: 'Rule Deleted',
      category: 'Rule Management',
      entityId: ruleId,
      details: `Rule ${ruleId} permanently removed.`,
    });
    addToast('Rule Removed', `Rule ${ruleId} was deleted.`, 'info');
  };

  const saveNewRule = (newRule: AnomalyRule) => {
    setRules((prev) => [newRule, ...prev]);
    logAuditEntry({
      user: currentUserRole,
      action: 'Rule Created',
      category: 'Rule Management',
      entityId: newRule.id,
      after: newRule.status,
      details: `Created new anomaly rule "${newRule.name}" (${newRule.conditions.length} conditions).`,
    });
    addToast('Rule Created', `Rule "${newRule.name}" created successfully.`, 'success');
  };

  // Config Update with RBAC and Audit
  const updateConfig = (newConfig: AnomalyGlobalConfig) => {
    const perms = getRolePermissions(currentUserRole);
    if (!perms.canModifyConfiguration) {
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'high',
        actionTaken: 'blocked',
        reason: getActionRestrictionReason('config', currentUserRole),
      });
      addToast('Permission Denied', getActionRestrictionReason('config', currentUserRole), 'error');
      return;
    }

    setConfig(newConfig);
    logAuditEntry({
      user: currentUserRole,
      action: 'Configuration Saved',
      category: 'Configuration',
      details: `Threshold set to $${newConfig.minAmountThreshold.toLocaleString()}; ${Object.values(newConfig.enabledTypes).filter(Boolean).length} anomaly types enabled.`,
    });
    addToast('Configuration Saved', 'Anomaly detection configuration updated successfully.', 'success');
  };

  // Evals Runner
  const runEvals = async () => {
    setIsEvalRunning(true);
    addToast('Starting Evals', `Executing test suites against ${evalConfigVersion}...`, 'info');

    try {
      const summary = await runAllEvals(evalConfigVersion);
      setEvalResults(summary);
      setEvalRunHistory((prev) => [
        {
          runId: summary.runId,
          timestamp: summary.timestamp,
          version: summary.version,
          f1Score: summary.summaryStats.f1Score,
          hallucinationRate: summary.summaryStats.hallucinationRate,
          formatCompliance: summary.summaryStats.formatCompliance,
          defenseRate: summary.summaryStats.defenseRate,
          overallStatus: summary.overallStatus,
        },
        ...prev.slice(0, 7),
      ]);

      logAuditEntry({
        user: currentUserRole,
        action: 'Evals Executed',
        category: 'AI Evaluation',
        details: `Ran 5 test suites. Status: ${summary.overallStatus}. F1=${summary.summaryStats.f1Score}%, Hallucination=${summary.summaryStats.hallucinationRate}%, Defense=${summary.summaryStats.defenseRate}%.`,
      });

      addToast(
        summary.overallStatus === 'Pass' ? 'Evals Passed' : 'Evals Warning / Gate Blocked',
        `Run ${summary.runId} completed. ${summary.hardGatesPassed ? 'All hard gates passed.' : 'Hard gate failed!'}`,
        summary.overallStatus === 'Pass' ? 'success' : 'warning'
      );
    } catch (e: any) {
      addToast('Eval Run Failed', e?.message || 'Error executing test suite.', 'error');
    } finally {
      setIsEvalRunning(false);
    }
  };

  return (
    <AnomalyContext.Provider
      value={{
        activePage,
        setActivePage,
        dashboardTab,
        setDashboardTab,
        customSubTab,
        setCustomSubTab,
        currentRecordTranId,
        setCurrentRecordTranId,
        currentUserRole,
        setCurrentUserRole,
        activeTenantId,
        setActiveTenantId,
        coldStartEnabled,
        setColdStartEnabled,
        config,
        updateConfig,
        transactionAnomalies,
        expectedMissingAnomalies,
        inventoryAnomalies,
        customAnomalies,
        rules,
        effectiveTransactionAnomalies,
        effectiveExpectedMissingAnomalies,
        effectiveInventoryAnomalies,
        effectiveCustomAnomalies,
        activeDrawer,
        openDrawer,
        closeDrawer,
        selectedEntityModal,
        openEntityModal,
        closeEntityModal,
        selectedTransactionModal,
        openTransactionModal,
        closeTransactionModal,
        createTransactionModalItem,
        openCreateTransactionModal,
        closeCreateTransactionModal,
        ruleDetailsModalRule,
        openRuleDetailsModal,
        closeRuleDetailsModal,
        isCreateRuleModalOpen,
        openCreateRuleModal,
        closeCreateRuleModal,
        initialTemplateForCreate,
        markResolved,
        markNoAction,
        reopenAnomaly,
        discardAnomaly,
        bulkUpdateStatus,
        toggleBookmark,
        assignCustomAnomaly,
        undoAction,
        triggerUndo,
        dismissUndo,
        bulkConfirmModal,
        closeBulkConfirmModal,
        executeBulkActionConfirmed,
        noActionAbuseNudge,
        dismissNoActionNudge,
        auditLogs,
        guardrailEvents,
        logAuditEntry,
        logGuardrailEvent,
        clearGuardrailEvents,
        evalResults,
        evalRunHistory,
        isEvalRunning,
        evalConfigVersion,
        setEvalConfigVersion,
        runEvals,
        activateRule,
        pauseRule,
        deleteDraftRule,
        saveNewRule,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AnomalyContext.Provider>
  );
};

export const useAnomaly = () => {
  const ctx = useContext(AnomalyContext);
  if (!ctx) throw new Error('useAnomaly must be used within an AnomalyProvider');
  return ctx;
};
