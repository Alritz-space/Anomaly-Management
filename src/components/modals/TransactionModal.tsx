import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { MockTransactionRecord } from '../../data/mockData';
import {
  X,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  transaction: MockTransactionRecord;
  onClose: () => void;
}

export const TransactionModal: React.FC<Props> = ({ transaction, onClose }) => {
  const {
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveCustomAnomalies,
    openDrawer,
    setActivePage,
    setDashboardTab,
  } = useAnomaly();

  // Find any related anomalies for this transaction
  const relatedTxAnomaly = effectiveTransactionAnomalies.find((a) => a.tranId === transaction.tranId);
  const relatedExpAnomaly = effectiveExpectedMissingAnomalies.find((a) => a.tranId === transaction.tranId);
  const relatedCustAnomaly = effectiveCustomAnomalies.find((a) => a.tranId === transaction.tranId);

  const matchedAnomaly = relatedTxAnomaly || relatedExpAnomaly || relatedCustAnomaly;
  const anomalyType = relatedTxAnomaly
    ? 'transaction'
    : relatedExpAnomaly
    ? 'expected-missing'
    : relatedCustAnomaly
    ? 'custom'
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Anomaly Banner if related anomalies exist */}
        {matchedAnomaly && anomalyType && (
          <div className="bg-amber-500 text-slate-900 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-600/20">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-950 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-amber-950 block">
                  Anomaly Alert Detected
                </span>
                <span className="text-xs text-amber-950">
                  This transaction has an active anomaly flagged: <span className="font-bold">{matchedAnomaly.id}</span> ({matchedAnomaly.status})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openDrawer(anomalyType as any, matchedAnomaly as any);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-950 text-white text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActivePage('dashboard');
                  if (anomalyType === 'transaction') setDashboardTab('transactions');
                  else if (anomalyType === 'expected-missing') setDashboardTab('expected-missing');
                  else if (anomalyType === 'custom') setDashboardTab('custom');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/90 text-amber-950 text-xs font-semibold hover:bg-white transition-colors"
              >
                View Anomaly Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              ERP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{transaction.type}: {transaction.tranId}</h3>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">Posting Period: {transaction.postingPeriod} · Subsidiary: {transaction.subsidiary}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Header Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entity</span>
              <span className="font-semibold text-slate-800 text-sm">{transaction.entity}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction Date</span>
              <span className="font-semibold text-slate-800 text-sm">{transaction.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Amount</span>
              <span className="font-bold text-slate-900 text-sm">
                ${transaction.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Approval Status</span>
              <span className="font-semibold text-emerald-700 text-sm">{transaction.approvalStatus}</span>
            </div>
          </div>

          {transaction.memo && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Header Memo</span>
              <p className="text-slate-700 text-xs italic">"{transaction.memo}"</p>
            </div>
          )}

          {/* GL Accounting Distribution Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                General Ledger Distribution Lines
              </h4>
              <span className="text-slate-400 text-[11px]">{transaction.glLines.length} lines</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold w-10">#</th>
                    <th className="py-2.5 px-3 font-semibold">Account</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Debit ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Credit ($)</th>
                    <th className="py-2.5 px-3 font-semibold">Department</th>
                    <th className="py-2.5 px-3 font-semibold">Class</th>
                    <th className="py-2.5 px-3 font-semibold">Line Memo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transaction.glLines.map((line) => (
                    <tr key={line.line} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{line.line}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{line.account}</td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {line.debit > 0 ? line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {line.credit > 0 ? line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={line.department.includes('Flagged') ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {line.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={line.class.includes('Flagged') ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {line.class}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic max-w-44 truncate">{line.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Audit History */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              System Audit Trail & Log
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {transaction.auditHistory.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">{item.date}</span>
                    <span className="font-semibold text-slate-800">{item.user}</span>
                    <span className="text-slate-600">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
