import React, { useState, useEffect, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  AnomalyRule,
  RuleCondition,
  RulePriority,
  TransactionType,
} from '../../types/anomaly';
import {
  SUBSIDIARIES,
  TRANSACTION_TYPES,
  GL_ACCOUNTS,
  ACCOUNT_TYPES,
  APPROVAL_STATUSES,
  CLASSES,
  CURRENCIES,
  ENTITIES,
} from '../../data/mockData';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import {
  sanitizeFreeText,
  validateRuleBuilderConditions,
  checkOverBroadRule,
} from '../../guardrails/inputValidators';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
  Layers,
  Save,
  Play,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  onClose: () => void;
  initialTemplate?: string | null;
}

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Create your own rule / blank',
    description: 'Start with an empty canvas and customize evaluation logic for any standard or custom segment.',
    icon: '✨',
    defaults: {
      name: '',
      description: '',
      priority: 'Medium' as RulePriority,
      conditions: [{ id: 'cond-1', field: 'Amount' as const, operator: 'greater than', value: '10000' }],
    },
  },
  {
    id: 'expense-missing-segment',
    name: 'Expense Missing Segment',
    description: 'Enforce SOX compliance by detecting expense items missing department or class segmentation.',
    icon: '📋',
    defaults: {
      name: 'Audit Missing Department on High Expense',
      description: 'Flags AP bills and employee expenses missing mandatory department cost center.',
      priority: 'High' as RulePriority,
      conditions: [
        { id: 'cond-1', field: 'Class' as const, operator: 'is empty', value: '' },
        { id: 'cond-2', field: 'Amount' as const, operator: 'greater than', value: '2500' },
      ],
    },
  },
  {
    id: 'manual-journal-entries',
    name: 'Manual Journal Entries',
    description: 'Detect high-value manual journal vouchers posted outside standard automated subledger feeds.',
    icon: '📑',
    defaults: {
      name: 'High-Value Manual Journal Entry Review',
      description: 'Monitors manual GL entries exceeding $25,000 for required management authorization.',
      priority: 'High' as RulePriority,
      conditions: [
        { id: 'cond-1', field: 'Amount' as const, operator: 'greater than', value: '25000' },
        { id: 'cond-2', field: 'Approval Status' as const, operator: 'is not', value: 'Approved by CFO' },
      ],
    },
  },
  {
    id: 'large-transactions',
    name: 'Large Transactions',
    description: 'Flag exceptional multi-currency transaction volumes exceeding standard variance tolerance.',
    icon: '💰',
    defaults: {
      name: 'Unusual Outlier Transaction Threshold',
      description: 'Isolates any single transaction exceeding standard velocity baseline across all subsidiaries.',
      priority: 'Medium' as RulePriority,
      conditions: [
        { id: 'cond-1', field: 'Amount' as const, operator: 'greater than', value: '75000' },
        { id: 'cond-2', field: 'Currency' as const, operator: 'does not equal', value: 'USD' },
      ],
    },
  },
];

const OWNERS = [
  'Sarah Jenkins (Controller)',
  'Marcus Vance (Internal Audit)',
  'Elena Rostova (Treasury)',
  'David Kim (AP Supervisor)',
  'Rachel Green (Revenue Mgr)',
];

const FIELDS: RuleCondition['field'][] = [
  'Account',
  'Account Type',
  'Amount',
  'Approval Status',
  'Class',
  'Currency',
  'Date',
  'Subsidiary',
  'Transaction Type',
  'Entity',
];

const getExistingValuesForField = (field: RuleCondition['field']): string[] => {
  switch (field) {
    case 'Account':
      return GL_ACCOUNTS;
    case 'Account Type':
      return ACCOUNT_TYPES;
    case 'Approval Status':
      return APPROVAL_STATUSES;
    case 'Class':
      return CLASSES;
    case 'Currency':
      return CURRENCIES;
    case 'Subsidiary':
      return SUBSIDIARIES;
    case 'Transaction Type':
      return TRANSACTION_TYPES;
    case 'Entity':
      return ENTITIES;
    default:
      return [];
  }
};

export const CreateRuleModal: React.FC<Props> = ({ onClose, initialTemplate }) => {
  const { saveNewRule } = useAnomaly();

  // Wizard state: 0 = Template selection, 1 = Details, 2 = Conditions, 3 = Preview, 4 = Review & Activate
  const [currentStep, setCurrentStep] = useState<number>(initialTemplate ? 1 : 0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplate ? TEMPLATES.find((t) => t.name === initialTemplate)?.id || 'blank' : 'blank'
  );

  // Step 1: Details
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState(OWNERS[0]);
  const [priority, setPriority] = useState<RulePriority>('Medium');
  const [selectedSubsidiaries, setSelectedSubsidiaries] = useState<string[]>([SUBSIDIARIES[0]]);
  const [selectedTxTypes, setSelectedTxTypes] = useState<TransactionType[]>([
    'Vendor Bill',
    'Invoice',
  ]);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Step 2: Conditions
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { id: 'cond-init-1', field: 'Amount', operator: 'greater than', value: '10000' },
  ]);
  const [conditionsError, setConditionsError] = useState<string | null>(null);

  // Step 3 & 4: Over-broad Rule Confirmation Guardrail
  const [explicitOverBroadConfirm, setExplicitOverBroadConfirm] = useState<boolean>(false);

  // Compute simulated preview match count (over-broad check if matching > 50% of 2,410 transactions)
  const isRuleBroadCriteria = useMemo(() => {
    // If Amount <= 100 or operator is 'is not empty', simulate broad match > 50%
    const firstCond = conditions[0];
    if (firstCond?.field === 'Amount' && Number(firstCond.value || 0) <= 50) return true;
    if (logic === 'OR' && conditions.length >= 2) return true;
    return false;
  }, [conditions, logic]);

  const simulatedMatchedCount = isRuleBroadCriteria ? 1380 : 3;
  const overBroadEvaluation = useMemo(() => {
    return checkOverBroadRule(simulatedMatchedCount, 2410);
  }, [simulatedMatchedCount]);

  // Step 4: Notification options & checkboxes
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [createForExisting, setCreateForExisting] = useState(true);

  // Initialize defaults if template selected
  const applyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setRuleName(tmpl.defaults.name);
      setDescription(tmpl.defaults.description);
      setPriority(tmpl.defaults.priority);
      setConditions(tmpl.defaults.conditions.map((c, i) => ({ ...c, id: `cond-tmpl-${i}` })));
    }
  };

  useEffect(() => {
    if (initialTemplate) {
      const match = TEMPLATES.find((t) => t.name === initialTemplate);
      if (match) applyTemplate(match.id);
    }
  }, [initialTemplate]);

  // Field operator lookup
  const getOperatorsForField = (field: RuleCondition['field']) => {
    switch (field) {
      case 'Amount':
        return [
          'greater than',
          'less than',
          'equals',
          'does not equal',
          'greater than or equal',
          'less than or equal',
        ];
      case 'Date':
        return ['is', 'is before', 'is after', 'is between'];
      default:
        // Multi-select dropdown fields (Account, Account Type, Approval Status, Class, Currency, Subsidiary, Transaction Type, Entity)
        return ['is', 'is not', 'is empty', 'is not empty'];
    }
  };

  const handleFieldChange = (idx: number, newField: RuleCondition['field']) => {
    const updated = [...conditions];
    const ops = getOperatorsForField(newField);
    let initialValue = '';
    if (newField === 'Amount') {
      initialValue = '5000';
    } else if (newField === 'Date') {
      initialValue = new Date().toISOString().split('T')[0];
    } else {
      const existing = getExistingValuesForField(newField);
      initialValue = existing[0] || '';
    }

    updated[idx] = {
      ...updated[idx],
      field: newField,
      operator: ops[0],
      value: initialValue,
      value2: undefined,
    };
    setConditions(updated);
  };

  const handleOperatorChange = (idx: number, newOp: string) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], operator: newOp };
    setConditions(updated);
  };

  const handleValueChange = (idx: number, val: string) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], value: val };
    setConditions(updated);
  };

  const handleValue2Change = (idx: number, val2: string) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], value2: val2 };
    setConditions(updated);
  };

  const addConditionRow = () => {
    if (conditions.length >= 10) {
      setConditionsError('Input Guardrail: Maximum limit of 10 conditions per rule reached.');
      return;
    }
    setConditionsError(null);
    const newCond: RuleCondition = {
      id: `cond-${Date.now()}`,
      field: 'Amount',
      operator: 'greater than',
      value: '10000',
    };
    setConditions([...conditions, newCond]);
  };

  const removeConditionRow = (idx: number) => {
    if (conditions.length <= 1) return;
    setConditionsError(null);
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  // Step 1 Validation with Free Text Sanitization & Injection Guardrail
  const validateStep1 = () => {
    if (!ruleName.trim()) {
      setDetailsError('Rule Name is required.');
      return false;
    }

    // Input Guardrail: Free text sanitization and prompt injection check
    const nameSanitized = sanitizeFreeText(ruleName, 500, 'Rule Name');
    if (!nameSanitized.isValid) {
      setDetailsError(nameSanitized.error || 'Invalid Rule Name.');
      return false;
    }

    if (description.trim()) {
      const descSanitized = sanitizeFreeText(description, 500, 'Rule Description');
      if (!descSanitized.isValid) {
        setDetailsError(descSanitized.error || 'Invalid Rule Description.');
        return false;
      }
    }

    if (!owner) {
      setDetailsError('Owner is required.');
      return false;
    }
    if (!priority) {
      setDetailsError('Priority is required.');
      return false;
    }
    if (selectedSubsidiaries.length === 0) {
      setDetailsError('At least one subsidiary must be selected.');
      return false;
    }
    if (selectedTxTypes.length === 0) {
      setDetailsError('At least one transaction type must be selected.');
      return false;
    }
    setDetailsError(null);
    return true;
  };

  // Step 2 Validation: Conditions Guardrail
  const validateStep2 = () => {
    const val = validateRuleBuilderConditions(conditions);
    if (!val.isValid) {
      setConditionsError(val.errors.join(' '));
      return false;
    }
    setConditionsError(null);
    return true;
  };

  // Save rule handler with Over-broad guardrail check
  const handleSave = (status: 'Active' | 'Draft') => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    // Over-broad rule check guardrail (>50% match requires explicit confirmation)
    if (overBroadEvaluation.isOverBroad && !explicitOverBroadConfirm) {
      setDetailsError(
        `Over-broad Rule Alert: Matches ${simulatedMatchedCount} of 2,410 transactions (${overBroadEvaluation.matchPercentage}%). You must explicitly check the confirmation box on the Review step to proceed.`
      );
      setCurrentStep(3);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRule: AnomalyRule = {
      id: `RULE-00${Math.floor(Math.random() * 90 + 10)}`,
      name: ruleName.trim(),
      template: TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Custom Rule',
      description: description.trim() || 'Custom user rule for transaction anomaly detection.',
      status: status,
      owner: owner,
      priority: priority,
      subsidiaries: selectedSubsidiaries,
      transactionTypes: selectedTxTypes,
      logic: logic,
      conditions: conditions,
      openCount: status === 'Active' ? 3 : 0,
      resolvedCount: 0,
      noActionCount: 0,
      lastRun: status === 'Active' ? now : 'Never',
      createdAt: now,
      notifyEmail: notifyEmail,
      notifyInApp: notifyInApp,
      createForExisting: createForExisting,
      auditTrail: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          editor: owner.split(' ')[0],
          action: status === 'Active' ? 'rule activated' : 'saved as draft',
          details: `Rule created from template: ${TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}. Over-broad check: ${overBroadEvaluation.matchPercentage}% match.`,
        },
      ],
    };

    saveNewRule(newRule);
    onClose();
  };

  // Mock preview items for Step 3
  const previewMatches = [
    {
      tranId: 'BILL-54890',
      type: 'Vendor Bill',
      entity: 'Apex Office Supplies',
      amount: 48900.0,
      account: '6210 - Office Supplies',
      date: '2026-10-04',
    },
    {
      tranId: 'INV-88902',
      type: 'Invoice',
      entity: 'Acme Cloud Corp',
      amount: 112500.0,
      account: '4010 - Subscription Revenue',
      date: '2026-10-03',
    },
    {
      tranId: 'JE-11044',
      type: 'Journal Entry',
      entity: 'Global Logistics Ltd',
      amount: 83200.0,
      account: '5120 - Freight Expense',
      date: '2026-09-29',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {currentStep === 0 ? 'Select Anomaly Rule Template' : `Create Anomaly Rule: Step ${currentStep} of 4`}
              </h3>
              <p className="text-xs text-slate-500">
                {currentStep === 0
                  ? 'Choose a starting template or build a custom anomaly rule from scratch'
                  : currentStep === 1
                  ? 'Define rule name, ownership, and scope'
                  : currentStep === 2
                  ? 'Configure conditional filter rules'
                  : currentStep === 3
                  ? 'Evaluate rule against mock 90-day dataset'
                  : 'Review summary, notifications, and activate'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Indicator (Steps 1 to 4) */}
        {currentStep > 0 && (
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Conditions' },
              { num: 3, label: 'Preview' },
              { num: 4, label: 'Review & Activate' },
            ].map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex items-center gap-2 flex-1 justify-center first:justify-start last:justify-end">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : s.num}
                  </span>
                  <span className={`font-semibold ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* STEP 0: Template Selection Modal */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="text-2xl mb-2">{tmpl.icon}</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{tmpl.name}</h4>
                      <p className="text-slate-600 leading-relaxed text-xs">{tmpl.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {detailsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase text-[10px] block">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Unusual AP Bills Above $25k"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase text-[10px] block">
                  Rule Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the operational audit intention or control requirement..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 uppercase text-[10px] block">
                    Owner *
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {OWNERS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 uppercase text-[10px] block">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RulePriority)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Subsidiary dropdown with multi-select and All option */}
              <div className="space-y-1">
                <MultiSelectDropdown
                  label="Subsidiaries (Multi-select) *"
                  options={SUBSIDIARIES}
                  selected={selectedSubsidiaries}
                  onChange={setSelectedSubsidiaries}
                  placeholder="Select subsidiaries..."
                  allOptionLabel="All Subsidiaries"
                  error={selectedSubsidiaries.length === 0}
                />
              </div>

              {/* Transaction types dropdown with multi-select and All option */}
              <div className="space-y-1">
                <MultiSelectDropdown
                  label="Target Transaction Types (Multi-select) *"
                  options={TRANSACTION_TYPES}
                  selected={selectedTxTypes}
                  onChange={(vals) => setSelectedTxTypes(vals as TransactionType[])}
                  placeholder="Select transaction types..."
                  allOptionLabel="All Transaction Types"
                  error={selectedTxTypes.length === 0}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Conditions */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {conditionsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{conditionsError}</span>
                </div>
              )}

              {/* AND / OR logic selector */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Condition Evaluation Logic:</span>
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setLogic('AND')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      logic === 'AND' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Match ALL (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogic('OR')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      logic === 'OR' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Match ANY (OR)
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  {logic === 'AND' ? 'All conditions must be satisfied.' : 'Any single condition triggers an anomaly.'}
                </span>
              </div>

              {/* Conditions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
                    Rule Conditions ({conditions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addConditionRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Condition
                  </button>
                </div>

                <div className="space-y-2.5">
                  {conditions.map((cond, idx) => {
                    const ops = getOperatorsForField(cond.field);
                    const hideValue = cond.operator === 'is empty' || cond.operator === 'is not empty';
                    const isBetween = cond.operator === 'is between';
                    const isAmount = cond.field === 'Amount';
                    const isDate = cond.field === 'Date';

                    return (
                      <div
                        key={cond.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-2 shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Field dropdown */}
                        <select
                          value={cond.field}
                          onChange={(e) => handleFieldChange(idx, e.target.value as any)}
                          className="p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-w-32"
                        >
                          {FIELDS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>

                        {/* Operator dropdown */}
                        <select
                          value={cond.operator}
                          onChange={(e) => handleOperatorChange(idx, e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-w-36"
                        >
                          {ops.map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>

                        {/* Value inputs */}
                        {!hideValue && (
                          <div className="flex-1 flex items-center gap-2 min-w-44">
                            {isAmount ? (
                              <>
                                <input
                                  type="number"
                                  value={cond.value}
                                  onChange={(e) => handleValueChange(idx, e.target.value)}
                                  placeholder="Amount in $..."
                                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                                {isBetween && (
                                  <>
                                    <span className="text-slate-400 font-medium">to</span>
                                    <input
                                      type="number"
                                      value={cond.value2 || ''}
                                      onChange={(e) => handleValue2Change(idx, e.target.value)}
                                      placeholder="Max amount in $..."
                                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                    />
                                  </>
                                )}
                              </>
                            ) : isDate ? (
                              <>
                                <input
                                  type="date"
                                  value={cond.value}
                                  onChange={(e) => handleValueChange(idx, e.target.value)}
                                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                                {isBetween && (
                                  <>
                                    <span className="text-slate-400 font-medium">to</span>
                                    <input
                                      type="date"
                                      value={cond.value2 || ''}
                                      onChange={(e) => handleValue2Change(idx, e.target.value)}
                                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                    />
                                  </>
                                )}
                              </>
                            ) : (
                              /* Apart from Amount and Date: dropdown (support multi select, All option) with existing values */
                              (() => {
                                const existingValues = getExistingValuesForField(cond.field);
                                const isAll = cond.value === 'All';
                                const selectedVals = isAll
                                  ? existingValues
                                  : cond.value
                                  ? cond.value
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter((s) => existingValues.includes(s))
                                  : [];

                                return (
                                  <MultiSelectDropdown
                                    className="w-full"
                                    options={existingValues}
                                    selected={selectedVals}
                                    onChange={(newVals) => {
                                      if (
                                        newVals.length === existingValues.length &&
                                        existingValues.length > 0
                                      ) {
                                        handleValueChange(idx, 'All');
                                      } else {
                                        handleValueChange(idx, newVals.join(', '));
                                      }
                                    }}
                                    placeholder={`Select ${cond.field}...`}
                                    allOptionLabel={`All ${cond.field}s`}
                                    error={!selectedVals.length}
                                  />
                                );
                              })()
                            )}
                          </div>
                        )}

                        {hideValue && (
                          <div className="flex-1 text-slate-400 italic text-[11px] px-2">
                            [No value required for this operator]
                          </div>
                        )}

                        {/* Remove condition */}
                        <button
                          type="button"
                          disabled={conditions.length <= 1}
                          onClick={() => removeConditionRow(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Remove condition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-xs">
                Simulated execution against past 90 days audit history (2,410 transactions analyzed).
              </div>

              {/* 2 KPI Cards: Matching Anomalies, Volume Alert */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Matching Anomalies</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{simulatedMatchedCount}</span>
                    <span className="text-xs text-slate-500">historical matches found</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Volume Alert Indicator</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded border ${
                        overBroadEvaluation.isOverBroad
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      {overBroadEvaluation.isOverBroad ? 'High Noise (Over-Broad)' : 'Normal (Low Noise)'}
                    </span>
                    <span className="text-xs text-slate-500">~{overBroadEvaluation.matchPercentage}% match rate</span>
                  </div>
                </div>
              </div>

              {/* Over-broad Rule Warning & Required Confirmation */}
              {overBroadEvaluation.isOverBroad && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Over-broad Rule Alert: Matches {simulatedMatchedCount} of 2,410 transactions ({overBroadEvaluation.matchPercentage}%)</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Safety Guardrail: This rule matches &gt;50% of the entire 90-day ERP volume. Activating it will produce excessive alerts. You must explicitly confirm below to proceed.
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-semibold text-xs text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={explicitOverBroadConfirm}
                      onChange={(e) => setExplicitOverBroadConfirm(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>I explicitly confirm that I want to proceed with this broad rule</span>
                  </label>
                </div>
              )}

              {/* Preview Table: Transaction link, Transaction Type, Entity, Amount, Account, Date */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
                  Sample Matches in Prior 90 Days
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <th className="py-2.5 px-3 font-semibold">Transaction</th>
                        <th className="py-2.5 px-3 font-semibold">Type</th>
                        <th className="py-2.5 px-3 font-semibold">Entity</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                        <th className="py-2.5 px-3 font-semibold">GL Account</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewMatches.map((m) => (
                        <tr key={m.tranId} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-semibold text-blue-600">{m.tranId}</td>
                          <td className="py-2.5 px-3 text-slate-600">{m.type}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{m.entity}</td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            ${m.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{m.account}</td>
                          <td className="py-2.5 px-3 text-slate-500">{m.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Activate */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Rule Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
                  Rule Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Rule Name</span>
                    <span className="font-semibold text-slate-800 text-sm">{ruleName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Owner / Assignee</span>
                    <span className="font-semibold text-slate-800 text-sm">{owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Priority</span>
                    <span className="font-semibold text-slate-800">{priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Condition Logic</span>
                    <span className="font-bold text-blue-700">
                      {logic === 'AND' ? 'Match All (AND)' : 'Match Any (OR)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Subsidiaries</span>
                    <span className="font-medium text-slate-800">{selectedSubsidiaries.join(', ')}</span>
                  </div>
                </div>

                {/* Readable conditions text representation */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase mb-1">
                    Evaluated Criteria Logic
                  </span>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 space-y-1 font-mono text-[11px]">
                    {conditions.map((c, i) => (
                      <div key={c.id}>
                        {i > 0 && <span className="text-blue-600 font-bold mr-2">{logic}</span>}
                        <span>{c.field} {c.operator} "{c.value || '[empty]'}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notification options & checkboxes */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
                  Alert Notifications & Actions
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Send email notifications to Rule Owner when new anomalies are surfaced</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyInApp}
                      onChange={(e) => setNotifyInApp(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Post in-app alert banner on matched ERP transaction records</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1 border-t border-slate-100">
                    <input
                      type="checkbox"
                      checked={createForExisting}
                      onChange={(e) => setCreateForExisting(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-900">
                      Create anomalies for existing matches immediately upon activation
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                Continue to Wizard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : currentStep < 4 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !validateStep1()) return;
                    if (currentStep === 2 && !validateStep2()) return;
                    if (currentStep === 3 && overBroadEvaluation.isOverBroad && !explicitOverBroadConfirm) {
                      setDetailsError('Over-broad Rule Alert: You must explicitly check the confirmation box to proceed.');
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Active')}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Activate Rule
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
