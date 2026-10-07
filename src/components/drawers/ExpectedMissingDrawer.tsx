import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { ExpectedMissingAnomaly } from '../../types/anomaly';
import {
  X,
  Star,
  ExternalLink,
  CheckCircle2,
  MinusCircle,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  History,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface Props {
  anomaly: ExpectedMissingAnomaly;
  onClose: () => void;
}

export const ExpectedMissingDrawer: React.FC<Props> = ({ anomaly, onClose }) => {
  const {
    markResolved,
    markNoAction,
    reopenAnomaly,
    toggleBookmark,
    openTransactionModal,
    openEntityModal,
    openCreateTransactionModal,
    addToast,
  } = useAnomaly();

  const [note, setNote] = useState(anomaly.resolutionNote || '');

  const statusBadge = {
    'Need Review': 'text-amber-700 bg-amber-50 ring-1 ring-amber-300',
    Verified: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300',
    Reopen: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-300',
  }[anomaly.status];

  const handleCreateTransaction = () => {
    if (anomaly.isSupportedForCreation) {
      openCreateTransactionModal(anomaly);
    } else {
      addToast(
        'Transaction Creation Route',
        `Direct generation of ${anomaly.transactionType} is routed via the Statutory Tax & Accruals Suite (Transactions > Financial > Process Accruals).`,
        'info'
      );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-136 md:w-160 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge}`}>
                {anomaly.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {anomaly.id}</span>
              {anomaly.resolutionType && (
                <span className="text-xs text-slate-500">
                  · ({anomaly.resolutionType})
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {anomaly.anomalyType} Transaction: {anomaly.tranId}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBookmark('expected-missing', anomaly.id)}
              className={`p-1.5 rounded-md transition-colors ${
                anomaly.isBookmarked
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Bookmark Anomaly"
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Transaction / Ref</span>
            <span className="font-medium text-slate-800">{anomaly.tranId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Entity</span>
            <button
              onClick={() => openEntityModal(anomaly.entity)}
              className="font-medium text-blue-600 hover:underline flex items-center gap-1 truncate max-w-full text-left"
            >
              {anomaly.entity}
            </button>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Account</span>
            <span className="font-medium text-slate-800 truncate block" title={anomaly.account || '6000 - Operating Expenses'}>
              {anomaly.account || '6000 - Operating Expenses'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Expected Date</span>
            <span className="font-medium text-slate-800">{anomaly.expectedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Period</span>
            <span className="font-medium text-slate-800">{anomaly.accountingPeriod}</span>
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* Prediction Summary */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-indigo-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Why This {anomaly.anomalyType} Anomaly Was Raised
            </h3>
          </div>
          <p className="text-xs text-indigo-950 leading-relaxed font-medium">
            {anomaly.summary}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-indigo-900">
            <div>
              <span className="text-indigo-700">Projected Financial Impact:</span>{' '}
              <span className="font-bold">
                ${anomaly.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-indigo-700">Recurring Cadence:</span>{' '}
              <span className="font-medium text-indigo-800">{anomaly.recurringPattern}</span>
            </div>
          </div>
        </div>

        {/* Historical Transactions The Prediction is Based On */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Past Transactions Prediction Basis
            </h3>
            <span className="text-[11px] text-slate-400">Cyclical History</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2 px-3 font-semibold">Prior Tran #</th>
                  <th className="py-2 px-3 font-semibold">Date Posted</th>
                  <th className="py-2 px-3 font-semibold">Period</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {anomaly.pastTransactionBasis.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td
                      className="py-2 px-3 font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => openTransactionModal(p.tranId)}
                    >
                      {p.tranId}
                    </td>
                    <td className="py-2 px-3 text-slate-500">{p.date}</td>
                    <td className="py-2 px-3 text-slate-600">{p.period}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Creation Routing Guidance */}
        {!anomaly.isSupportedForCreation && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">External Process Workflow Required</span>
              Direct in-place creation is not enabled for {anomaly.transactionType} entries. Please navigate to the specialized accounting schedule or tax module to generate this transaction.
            </div>
          </div>
        )}

        {/* Memo & Notes */}
        {anomaly.memo && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase mb-1">Expected Transaction Memo</span>
            <p className="text-slate-700 italic">"{anomaly.memo}"</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Audit Reviewer Notes
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add reasoning for resolving or reopening..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
        >
          Close Drawer
        </button>

        <div className="flex items-center gap-2">
          {anomaly.status === 'Verified' ? (
            <button
              type="button"
              onClick={() => {
                reopenAnomaly('expected-missing', anomaly.id, note);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reopen Anomaly
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCreateTransaction}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create Transaction
              </button>

              <button
                type="button"
                onClick={() => {
                  markNoAction('expected-missing', anomaly.id, note);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                No Action Needed
              </button>

              <button
                type="button"
                onClick={() => {
                  markResolved('expected-missing', anomaly.id, note);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
