import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { AlertTriangle, X, CheckCircle2, RotateCcw, MinusCircle } from 'lucide-react';

export const BulkConfirmationModal: React.FC = () => {
  const { bulkConfirmModal, closeBulkConfirmModal, executeBulkActionConfirmed } = useAnomaly();

  if (!bulkConfirmModal || !bulkConfirmModal.isOpen) return null;

  const actionLabels = {
    resolve: { label: 'Mark Resolved', color: 'bg-emerald-600 hover:bg-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    'no-action': { label: 'No Action Needed', color: 'bg-slate-700 hover:bg-slate-800', icon: <MinusCircle className="w-4 h-4" /> },
    reopen: { label: 'Reopen Anomalies', color: 'bg-indigo-600 hover:bg-indigo-700', icon: <RotateCcw className="w-4 h-4" /> },
  }[bulkConfirmModal.action];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-amber-50/70 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Confirm Bulk Action ({bulkConfirmModal.ids.length} Items)
              </h3>
              <p className="text-xs text-slate-500">
                Action Safety Policy Triggered (&gt; 5 items selected)
              </p>
            </div>
          </div>
          <button
            onClick={closeBulkConfirmModal}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 text-xs text-slate-700">
          <p>
            You are about to execute <strong className="font-bold text-slate-900">"{actionLabels.label}"</strong> on{' '}
            <strong className="font-bold text-slate-900">{bulkConfirmModal.ids.length} anomalies</strong> simultaneously across the active period.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Audit Pre-check</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>Each affected anomaly status will transition to the new target state immediately.</li>
              <li>An immutable entry will be written to the system audit trail.</li>
              <li>You may undo individual items within 10 seconds of submission if needed.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeBulkConfirmModal}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={executeBulkActionConfirmed}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors shadow-sm ${actionLabels.color}`}
          >
            {actionLabels.icon}
            <span>Confirm {actionLabels.label}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
