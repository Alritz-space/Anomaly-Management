import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { TransactionAnomaly } from '../../types/anomaly';
import {
  X,
  Star,
  ExternalLink,
  CheckCircle2,
  MinusCircle,
  RotateCcw,
  AlertTriangle,
  History,
  FileText,
  User,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react';

interface Props {
  anomaly: TransactionAnomaly;
  onClose: () => void;
}

export const TransactionAnomalyDrawer: React.FC<Props> = ({ anomaly, onClose }) => {
  const {
    markResolved,
    markNoAction,
    reopenAnomaly,
    discardAnomaly,
    toggleBookmark,
    openTransactionModal,
    openEntityModal,
    addToast,
  } = useAnomaly();

  const [note, setNote] = useState(anomaly.resolutionNote || '');
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    addToast(
      'Feedback Recorded',
      type === 'up'
        ? 'Thank you! Positive feedback recorded for model calibration.'
        : 'Feedback noted. Grounding & specificity metrics updated.',
      'info'
    );
  };

  const isHighImpact = anomaly.impactedAmount >= 25000;

  const statusBadge = {
    'Need Review': 'text-amber-700 bg-amber-50 ring-1 ring-amber-300',
    Verified: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300',
    Reopen: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-300',
  }[anomaly.status];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-136 md:w-160 bg-white shadow-2xl z-50 flex flex-col border-l border-[#ebdcd3] animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-5 border-b border-[#ebdcd3] bg-[#fbf7f4]">
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
              {anomaly.anomalyType}: {anomaly.tranId}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBookmark('transaction', anomaly.id)}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Transaction</span>
            <button
              onClick={() => openTransactionModal(anomaly.tranId)}
              className="font-medium text-blue-600 hover:underline flex items-center gap-1"
            >
              {anomaly.tranId}
              <ExternalLink className="w-3 h-3" />
            </button>
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
            <span className="text-slate-400 block text-[10px] uppercase">Created By</span>
            <span className="font-medium text-slate-800 truncate block">{anomaly.createdBy}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Date / Time</span>
            <span className="font-medium text-slate-800">{anomaly.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* Why it was raised (Summary) */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Why This Anomaly Was Raised
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Grounded & Hedged
              </span>
              <div className="flex items-center gap-1 border-l border-amber-200 pl-1.5">
                <button
                  type="button"
                  onClick={() => handleFeedback('up')}
                  className={`p-1 rounded transition-colors ${
                    feedbackGiven === 'up'
                      ? 'text-emerald-700 bg-emerald-100'
                      : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100'
                  }`}
                  title="Mark summary as helpful (positive model feedback)"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback('down')}
                  className={`p-1 rounded transition-colors ${
                    feedbackGiven === 'down'
                      ? 'text-rose-700 bg-rose-100'
                      : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100'
                  }`}
                  title="Mark summary as inaccurate or unhelpful (feedback drift)"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            {anomaly.summary}
          </p>
          <div className="pt-1 flex items-center gap-4 text-xs text-amber-900">
            <div>
              <span className="text-amber-700">Impacted Amount:</span>{' '}
              <span className="font-bold">
                ${anomaly.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-amber-700">Importance Score:</span>{' '}
              <span className="font-bold">{anomaly.importanceScore}/100</span>
            </div>
          </div>
        </div>

        {/* Anomaly Details Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Detected Outlier Variance
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {anomaly.detectedAccount && (
              <>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Detected Account</span>
                  <span className="font-semibold text-rose-700">{anomaly.detectedAccount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Expected Account</span>
                  <span className="font-semibold text-emerald-700">{anomaly.expectedAccount || '6100 - Standard Ops'}</span>
                </div>
              </>
            )}

            {anomaly.detectedSegment && (
              <>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Detected Segment</span>
                  <span className="font-semibold text-rose-700">{anomaly.detectedSegment}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Expected Segment</span>
                  <span className="font-semibold text-emerald-700">{anomaly.expectedSegment}</span>
                </div>
              </>
            )}

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Accounting Period</span>
              <span className="font-medium text-slate-800">{anomaly.accountingPeriod}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Subsidiary</span>
              <span className="font-medium text-slate-800">{anomaly.subsidiary}</span>
            </div>
          </div>

          {/* Memo if present */}
          {anomaly.memo && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase mb-1">Transaction Memo</span>
              <p className="text-slate-700 italic">"{anomaly.memo}"</p>
            </div>
          )}
        </div>

        {/* Similar Past Error-Free Transactions Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Similar Past Error-Free Transactions (Baseline Comparison)
            </h3>
            <span className="text-[11px] text-slate-400">Prior 90 Days</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2 px-3 font-semibold">Transaction</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                  <th className="py-2 px-3 font-semibold">Account Coded</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2 px-3 font-semibold text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {anomaly.comparisonTransactions.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => openTransactionModal(comp.tranId)}>
                      {comp.tranId}
                    </td>
                    <td className="py-2 px-3 text-slate-500">{comp.date}</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-36">{comp.account}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      ${comp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {comp.matchScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500">
            Baseline models compare historical coding distribution for vendor {anomaly.entity} across prior successful audits.
          </p>
        </div>

        {/* Review Notes Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Audit Reviewer Notes
            </label>
            {isHighImpact && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                High Impact: Min 10 chars required for No Action
              </span>
            )}
          </div>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isHighImpact
                ? 'High-impact anomaly ($25k+): Min 10-char note required if dismissing as No Action...'
                : 'Add context or rationale for resolution or reopening...'
            }
            className={`w-full p-2.5 text-xs bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-800 ${
              isHighImpact && note.trim().length > 0 && note.trim().length < 10
                ? 'border-amber-400 bg-amber-50/20'
                : 'border-slate-200'
            }`}
          />
          {isHighImpact && (
            <p className="text-[11px] text-slate-400">
              Current note length: <strong className={note.trim().length >= 10 ? 'text-emerald-600' : 'text-amber-700'}>{note.trim().length}</strong> / 10 characters minimum.
            </p>
          )}
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-[#ebdcd3] bg-[#fbf7f4] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
        >
          Close Drawer
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const ok = discardAnomaly('transaction', anomaly.id, note);
              if (ok) onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors shadow-2xs"
            title="Remove this exception from system"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Discard
          </button>

          {anomaly.status === 'Verified' ? (
            <button
              type="button"
              onClick={() => {
                const ok = reopenAnomaly('transaction', anomaly.id, note);
                if (ok) onClose();
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
                onClick={() => {
                  const ok = markNoAction('transaction', anomaly.id, note);
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
                Not an Error
              </button>

              <button
                type="button"
                onClick={() => {
                  const ok = markResolved('transaction', anomaly.id, note);
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
