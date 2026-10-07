import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { TRANSACTION_TYPES } from '../../data/mockData';
import { TransactionType } from '../../types/anomaly';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  ShieldAlert,
  Info,
  Lock,
} from 'lucide-react';
import {
  validateAmountThreshold,
  validateAnomalyTypesConfig,
  validateTransactionTypesConfig,
} from '../../guardrails/inputValidators';
import { getRolePermissions, getActionRestrictionReason } from '../../guardrails/rbac';

const ANOMALY_TYPE_KEYS = [
  'Unusual Account',
  'Unusual Amount',
  'Incorrect/Missing Segment',
  'Duplicate',
  'Vendor/Customer Alert',
  'Expected/Missing',
  'Inventory',
  'Custom',
];

export const ConfigurationPage: React.FC = () => {
  const { config, updateConfig, currentUserRole, logGuardrailEvent, addToast } = useAnomaly();
  const perms = getRolePermissions(currentUserRole);

  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({
    ...config.enabledTypes,
  });
  const [includedTxTypes, setIncludedTxTypes] = useState<TransactionType[]>([
    ...config.includedTransactionTypes,
  ]);
  const [minThreshold, setMinThreshold] = useState<string>(
    config.minAmountThreshold.toString()
  );

  const [errorAnomalyTypes, setErrorAnomalyTypes] = useState<string | null>(null);
  const [errorTxTypes, setErrorTxTypes] = useState<string | null>(null);
  const [errorThreshold, setErrorThreshold] = useState<string | null>(null);

  // Validate threshold on change
  const thresholdValidation = useMemo(() => {
    return validateAmountThreshold(minThreshold);
  }, [minThreshold]);

  // Validate anomaly types count
  const anomalyTypesValidation = useMemo(() => {
    return validateAnomalyTypesConfig(enabledTypes);
  }, [enabledTypes]);

  // Validate transaction types count
  const txTypesValidation = useMemo(() => {
    return validateTransactionTypesConfig(includedTxTypes);
  }, [includedTxTypes]);

  // Form overall validity
  const isFormValid =
    perms.canModifyConfiguration &&
    thresholdValidation.isValid &&
    anomalyTypesValidation.isValid &&
    txTypesValidation.isValid;

  // Toggle Anomaly Type Checkbox
  const handleToggleType = (typeKey: string) => {
    if (!perms.canModifyConfiguration) return;

    const isCurrentlyChecked = !!enabledTypes[typeKey];
    const newTypes = { ...enabledTypes, [typeKey]: !isCurrentlyChecked };

    // Validate: At least one must always stay checked (block and show an inline error otherwise)
    const checkedCount = Object.values(newTypes).filter(Boolean).length;
    if (checkedCount === 0) {
      setErrorAnomalyTypes('Input Guardrail: At least one anomaly type must remain enabled. Disabling all models is prohibited.');
      logGuardrailEvent({
        type: 'Input Validation',
        severity: 'low',
        actionTaken: 'blocked',
        reason: 'Blocked attempt to disable all anomaly detection models in Configuration.',
      });
      return;
    }

    setErrorAnomalyTypes(null);
    setEnabledTypes(newTypes);
  };

  // Toggle Transaction Type Checkbox
  const handleToggleTxType = (tt: TransactionType) => {
    if (!perms.canModifyConfiguration) return;

    const isCurrentlyIncluded = includedTxTypes.includes(tt);
    let newIncluded: TransactionType[];

    if (isCurrentlyIncluded) {
      newIncluded = includedTxTypes.filter((t) => t !== tt);
    } else {
      newIncluded = [...includedTxTypes, tt];
    }

    // Validate: Do not allow excluding all transaction types
    if (newIncluded.length === 0) {
      setErrorTxTypes('Input Guardrail: Cannot exclude all transaction types. At least one must be included.');
      logGuardrailEvent({
        type: 'Input Validation',
        severity: 'low',
        actionTaken: 'blocked',
        reason: 'Blocked attempt to exclude all transaction types from anomaly scanning.',
      });
      return;
    }

    setErrorTxTypes(null);
    setIncludedTxTypes(newIncluded);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!perms.canModifyConfiguration) {
      const reason = getActionRestrictionReason('config', currentUserRole);
      logGuardrailEvent({
        type: 'RBAC Restriction',
        severity: 'high',
        actionTaken: 'blocked',
        reason,
      });
      addToast('Permission Denied', reason, 'error');
      return;
    }

    // Check Anomaly Types Guardrail
    if (!anomalyTypesValidation.isValid) {
      setErrorAnomalyTypes(anomalyTypesValidation.error || 'At least one anomaly type must remain enabled.');
      return;
    }

    // Check Transaction Types Guardrail
    if (!txTypesValidation.isValid) {
      setErrorTxTypes(txTypesValidation.error || 'Do not allow excluding all transaction types.');
      return;
    }

    // Check Threshold Guardrail
    if (!thresholdValidation.isValid || thresholdValidation.parsedValue === undefined) {
      setErrorThreshold(thresholdValidation.error || 'Threshold must be a valid non-negative number.');
      logGuardrailEvent({
        type: 'Input Validation',
        severity: 'medium',
        actionTaken: 'blocked',
        reason: `Rejected invalid threshold input "${minThreshold}": ${thresholdValidation.error}`,
      });
      return;
    }

    setErrorAnomalyTypes(null);
    setErrorTxTypes(null);
    setErrorThreshold(null);

    updateConfig({
      enabledTypes,
      includedTransactionTypes: includedTxTypes,
      minAmountThreshold: thresholdValidation.parsedValue,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Intro */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Anomaly Management Configuration
              </h1>
              <p className="text-xs text-slate-500">
                Global administrator controls for detection algorithms, transaction scoping, and minimum dollar thresholds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              Current Role: <strong>{currentUserRole}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* RBAC Restriction Alert Banner if not Admin */}
      {!perms.canModifyConfiguration && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs flex items-start gap-3 shadow-2xs">
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Read-Only Configuration Mode</h4>
            <p className="mt-0.5 text-amber-900">
              {getActionRestrictionReason('config', currentUserRole)} Switch role to <strong>Admin</strong> in the bottom test toolbar to modify global detection parameters.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Anomaly Types to Turn On/Off */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">1. Enabled Anomaly Detection Types</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which anomaly models are active across the ERP environment. At least one anomaly type must always remain enabled.
            </p>
          </div>

          {errorAnomalyTypes && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorAnomalyTypes}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {ANOMALY_TYPE_KEYS.map((key) => {
              const isChecked = !!enabledTypes[key];
              return (
                <label
                  key={key}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    !perms.canModifyConfiguration ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  } ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50/40 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled={!perms.canModifyConfiguration}
                      checked={isChecked}
                      onChange={() => handleToggleType(key)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>{key}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isChecked ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isChecked ? 'Active' : 'Disabled'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2: Multi-select to include/exclude transaction types */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">2. Scoped ERP Transaction Types</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Include or exclude specific transaction types from automated anomaly scanning. Excluding all transaction types is prohibited.
            </p>
          </div>

          {errorTxTypes && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorTxTypes}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {TRANSACTION_TYPES.map((tt) => {
              const isIncluded = includedTxTypes.includes(tt);
              return (
                <label
                  key={tt}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    !perms.canModifyConfiguration ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  } ${
                    isIncluded
                      ? 'border-blue-500 bg-blue-50/40 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!perms.canModifyConfiguration}
                    checked={isIncluded}
                    onChange={() => handleToggleTxType(tt)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="truncate">{tt}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 3: Minimum Amount Threshold in $ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">3. Financial Materiality Threshold ($)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Anomalies with financial impact below this threshold are considered immaterial and will not be surfaced anywhere in the application. Non-negative standard numbers only (scientific notation and negative values rejected).
            </p>
          </div>

          {(!thresholdValidation.isValid || errorThreshold) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{thresholdValidation.error || errorThreshold}</span>
            </div>
          )}

          <div className="max-w-xs space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">
              Minimum Impacted Amount ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
              <input
                type="text"
                disabled={!perms.canModifyConfiguration}
                required
                value={minThreshold}
                onChange={(e) => {
                  setMinThreshold(e.target.value);
                  setErrorThreshold(null);
                }}
                placeholder="e.g. 2500"
                className={`w-full pl-7 pr-3 py-2 bg-white border rounded-lg font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
                  !thresholdValidation.isValid
                    ? 'border-rose-400 text-rose-900 focus:border-rose-500'
                    : 'border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Current setting: <strong className="text-slate-700">${(thresholdValidation.parsedValue || 0).toLocaleString()}</strong>. Items under this value are suppressed.
            </p>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={!perms.canModifyConfiguration}
            onClick={() => {
              setEnabledTypes({ ...config.enabledTypes });
              setIncludedTxTypes([...config.includedTransactionTypes]);
              setMinThreshold(config.minAmountThreshold.toString());
              setErrorAnomalyTypes(null);
              setErrorTxTypes(null);
              setErrorThreshold(null);
            }}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Reset to Last Saved
          </button>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            title={
              !perms.canModifyConfiguration
                ? getActionRestrictionReason('config', currentUserRole)
                : !isFormValid
                ? 'Fix validation errors above to enable saving'
                : 'Save Anomaly Configuration'
            }
          >
            <Save className="w-4 h-4" />
            <span>Save Anomaly Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
