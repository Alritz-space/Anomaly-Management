import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { AlertTriangle, X, CheckCircle2, RotateCcw, ThumbsDown, Trash2 } from 'lucide-react';

export const BulkConfirmationModal: React.FC = () => {
  const { bulkConfirmModal, closeBulkConfirmModal, executeBulkActionConfirmed } = useAnomaly();
  const [comment, setComment] = useState('');
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  if (!bulkConfirmModal || !bulkConfirmModal.isOpen) return null;

  const actionLabels = {
    resolve: {
      actionName: 'Mark Resolved',
      buttonText: 'Continue Mark Resolved',
      color: 'bg-emerald-700 hover:bg-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4" />,
      description: 'mark these exceptions as resolved and verified',
    },
    'no-action': {
      actionName: 'Not an Error',
      buttonText: 'Continue Not an Error',
      color: 'bg-stone-700 hover:bg-stone-800',
      icon: <ThumbsDown className="w-4 h-4" />,
      description: 'classify these exceptions as normal business operations (not an error)',
    },
    reopen: {
      actionName: 'Reopen',
      buttonText: 'Continue Reopen',
      color: 'bg-[#8d3c26] hover:bg-[#732918]',
      icon: <RotateCcw className="w-4 h-4" />,
      description: 'reopen these exceptions for further investigation',
    },
    discard: {
      actionName: 'Remove Exceptions',
      buttonText: 'Continue Discard & Remove',
      color: 'bg-[#9e3424] hover:bg-[#802517]',
      icon: <Trash2 className="w-4 h-4" />,
      description: 'permanently remove these exceptions from the system',
    },
  }[bulkConfirmModal.action];

  const handleConfirm = () => {
    executeBulkActionConfirmed(comment.trim() ? comment.trim() : undefined, doNotShowAgain);
    setComment('');
    setDoNotShowAgain(false);
  };

  const handleCancel = () => {
    setComment('');
    setDoNotShowAgain(false);
    closeBulkConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-[#ebdcd3] w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#ebdcd3] bg-[#fbf5f2] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f7e3db] text-[#8d3c26] flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Are you sure?
              </h3>
              <p className="text-xs text-stone-500">
                Bulk action on {bulkConfirmModal.ids.length} selected exception{bulkConfirmModal.ids.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-stone-700">
          <p>
            Are you sure you want to {actionLabels.description} for{' '}
            <strong className="font-bold text-stone-900">{bulkConfirmModal.ids.length} exception{bulkConfirmModal.ids.length > 1 ? 's' : ''}</strong>?
          </p>

          {/* Optional Comment Section */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-stone-700">
              Optional Comment / Audit Justification
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add optional notes, justification, or reference ID..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-[#ebdcd3] focus:outline-none focus:ring-2 focus:ring-[#8d3c26] bg-[#fdfcfb] focus:bg-white resize-none"
            />
          </div>

          {/* Checkbox: Do not show this message again */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 text-xs pt-1">
            <input
              type="checkbox"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              className="rounded border-[#ebdcd3] text-[#8d3c26] focus:ring-[#8d3c26] w-4 h-4"
            />
            <span>Do not show this message again</span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ebdcd3] bg-[#fbf8f5] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-[#ebdcd3] rounded-xl text-stone-700 hover:bg-[#f2e6de] text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs ${actionLabels.color}`}
          >
            {actionLabels.icon}
            <span>{actionLabels.buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
