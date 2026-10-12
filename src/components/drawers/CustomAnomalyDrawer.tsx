import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { CustomAnomaly } from '../../types/anomaly';
import {
  X,
  Star,
  ExternalLink,
  CheckCircle2,
  MinusCircle,
  RotateCcw,
  Cpu,
  UserCheck,
  FileText,
  Calendar,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react';

interface Props {
  anomaly: CustomAnomaly;
  onClose: () => void;
}

const AUDITORS = [
  'Sarah Jenkins (Controller)',
  'Marcus Vance (Internal Audit)',
  'Elena Rostova (Treasury)',
  'David Kim (AP Supervisor)',
  'Rachel Green (Revenue Mgr)',
];

export const CustomAnomalyDrawer: React.FC<Props> = ({ anomaly, onClose }) => {
  const {
    markResolved,
    markNoAction,
    reopenAnomaly,
    discardAnomaly,
    toggleBookmark,
    openTransactionModal,
    openEntityModal,
    assignCustomAnomaly,
  } = useAnomaly();

  const [assigned, setAssigned] = useState(anomaly.assignedTo || AUDITORS[0].split(' ')[0]);
  const [note, setNote] = useState(anomaly.resolutionNote || '');

  const statusBadge = {
    'Need Review': 'text-amber-700 bg-amber-50 ring-1 ring-amber-300',
    Verified: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300',
    Reopen: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-300',
  }[anomaly.status];

  const handleAssignChange = (newAssignee: string) => {
    setAssigned(newAssignee);
    assignCustomAnomaly(anomaly.id, newAssignee);
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
              {anomaly.ruleName}: {anomaly.tranId}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBookmark('custom', anomaly.id)}
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

        {/* Metadata Strip Required by Prompt:
            rule name, status, linked id, created by, date/time */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Linked ID</span>
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
        {/* Summary */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Rule Trigger Summary
            </h3>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed font-medium">
            {anomaly.summary}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-emerald-900">
            <div>
              <span className="text-emerald-700">Impacted Amount:</span>{' '}
              <span className="font-bold">
                ${anomaly.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-emerald-700">Accounting Period:</span>{' '}
              <span className="font-bold">{anomaly.accountingPeriod}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details (Account, Department, Class, Approval Status, Currency) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Matched Transaction Attributes
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">GL Account</span>
              <span className="font-semibold text-slate-800">{anomaly.transactionDetails.account}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Department</span>
              <span className="font-semibold text-slate-800">{anomaly.transactionDetails.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Class Segment</span>
              <span className={`font-semibold ${anomaly.transactionDetails.class === '[None]' ? 'text-rose-600' : 'text-slate-800'}`}>
                {anomaly.transactionDetails.class}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Approval Status</span>
              <span className="font-semibold text-slate-800">{anomaly.transactionDetails.approvalStatus}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Currency</span>
              <span className="font-semibold text-slate-800">{anomaly.transactionDetails.currency}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Subsidiary</span>
              <span className="font-semibold text-slate-800">{anomaly.subsidiary}</span>
            </div>
          </div>

          {anomaly.memo && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase mb-1">Memo</span>
              <p className="text-slate-700 italic">"{anomaly.memo}"</p>
            </div>
          )}
        </div>

        {/* 'Assign to' dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Assign Anomaly To Reviewer
          </label>
          <select
            value={assigned}
            onChange={(e) => handleAssignChange(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
          >
            {AUDITORS.map((auditor) => (
              <option key={auditor} value={auditor.split(' ')[0]}>
                {auditor}
              </option>
            ))}
          </select>
        </div>

        {/* Resolution Note text area */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Resolution Note
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document compliance verification, journal reallocation details, or internal signoff..."
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
          <button
            type="button"
            onClick={() => {
              const ok = discardAnomaly('custom', anomaly.id, note);
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
                reopenAnomaly('custom', anomaly.id, note);
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
                onClick={() => {
                  markNoAction('custom', anomaly.id, note);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
                Not an Error
              </button>

              <button
                type="button"
                onClick={() => {
                  markResolved('custom', anomaly.id, note);
                  onClose();
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
