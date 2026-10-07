import React, { useState } from 'react';
import { ExpectedMissingAnomaly } from '../../types/anomaly';
import { useAnomaly } from '../../context/AnomalyContext';
import { X, CheckCircle, FilePlus, Building2, Calendar, DollarSign } from 'lucide-react';

interface Props {
  anomaly: ExpectedMissingAnomaly;
  onClose: () => void;
}

export const CreateTransactionModal: React.FC<Props> = ({ anomaly, onClose }) => {
  const { markResolved, closeDrawer, addToast } = useAnomaly();

  const [date, setDate] = useState(anomaly.expectedDate || '2026-10-06');
  const [amount, setAmount] = useState(anomaly.impactedAmount.toString());
  const [account, setAccount] = useState('6100 - Cloud & Tech Infrastructure');
  const [memo, setMemo] = useState(anomaly.memo || `Generated for ${anomaly.anomalyType} transaction`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markResolved('expected-missing', anomaly.id, `Created transaction via quick entry on ${date} for $${amount}`);
    addToast(
      'Transaction Created Successfully',
      `New ${anomaly.transactionType} created for ${anomaly.entity} ($${parseFloat(amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}). Anomaly marked resolved.`,
      'success'
    );
    closeDrawer();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Create {anomaly.transactionType}: {anomaly.entity}
              </h3>
              <p className="text-xs text-slate-500">
                Resolution workflow for predicted anomaly {anomaly.id}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-xs">
            <span className="font-semibold block mb-0.5">Automated Pre-population</span>
            Fields have been initialized based on historical pattern for {anomaly.entity} ({anomaly.recurringPattern}).
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase text-[10px] block">
                Entity ({anomaly.entityType})
              </label>
              <input
                type="text"
                disabled
                value={anomaly.entity}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase text-[10px] block">
                Subsidiary
              </label>
              <input
                type="text"
                disabled
                value={anomaly.subsidiary}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase text-[10px] block">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase text-[10px] block">
                Total Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold uppercase text-[10px] block">
              Expense / Asset GL Account *
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="6100 - Cloud & Tech Infrastructure">6100 - Cloud & Tech Infrastructure</option>
              <option value="6210 - Office Supplies & Expense">6210 - Office Supplies & Expense</option>
              <option value="6300 - Rent & Facility Lease">6300 - Rent & Facility Lease</option>
              <option value="6400 - Professional Services & Consulting">6400 - Professional Services & Consulting</option>
              <option value="5120 - Freight & Shipping COGS">5120 - Freight & Shipping COGS</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold uppercase text-[10px] block">
              Transaction Memo
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Create & Mark Resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
