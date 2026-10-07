import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { MOCK_TRANSACTIONS } from '../../data/mockData';
import {
  FileText,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const TransactionRecordPage: React.FC = () => {
  const {
    currentRecordTranId,
    setCurrentRecordTranId,
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveCustomAnomalies,
    openDrawer,
    setActivePage,
    setDashboardTab,
  } = useAnomaly();

  const record = MOCK_TRANSACTIONS[currentRecordTranId] || MOCK_TRANSACTIONS['PO-10492'];

  // Check if this record has related anomalies
  const relatedTxAnomaly = effectiveTransactionAnomalies.find((a) => a.tranId === record.tranId);
  const relatedExpAnomaly = effectiveExpectedMissingAnomalies.find((a) => a.tranId === record.tranId);
  const relatedCustAnomaly = effectiveCustomAnomalies.find((a) => a.tranId === record.tranId);

  const matchedAnomaly = relatedTxAnomaly || relatedExpAnomaly || relatedCustAnomaly;
  const anomalyType = relatedTxAnomaly
    ? 'transaction'
    : relatedExpAnomaly
    ? 'expected-missing'
    : relatedCustAnomaly
    ? 'custom'
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Transaction Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase text-[10px]">Active Record:</span>
          <select
            value={currentRecordTranId}
            onChange={(e) => setCurrentRecordTranId(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {Object.keys(MOCK_TRANSACTIONS).map((id) => (
              <option key={id} value={id}>
                {id} ({MOCK_TRANSACTIONS[id].type} - {MOCK_TRANSACTIONS[id].entity})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Status: <strong className="text-emerald-700">{record.status}</strong> · Period:{' '}
          <strong className="text-slate-800">{record.postingPeriod}</strong>
        </span>
      </div>

      {/* TOP ANOMALY ALERT BANNER REQUIRED BY PROMPT:
          If it has related anomalies, show a banner at the top with "View Details" (opens the same anomaly drawer without leaving the page) and "View Anomaly Dashboard". */}
      {matchedAnomaly && anomalyType && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-xl border border-amber-600/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950 text-amber-300 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wide text-amber-950 block">
                Anomaly Alert: Potential Outlier Detected
              </span>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                This transaction has an active anomaly flagged ({matchedAnomaly.id}: {matchedAnomaly.summary})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => openDrawer(anomalyType as any, matchedAnomaly as any)}
              className="px-3.5 py-2 bg-amber-950 text-white rounded-lg text-xs font-semibold hover:bg-slate-950 transition-colors shadow-xs"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                if (anomalyType === 'transaction') setDashboardTab('transactions');
                else if (anomalyType === 'expected-missing') setDashboardTab('expected-missing');
                else if (anomalyType === 'custom') setDashboardTab('custom');
              }}
              className="px-3.5 py-2 bg-white text-amber-950 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors"
            >
              View Anomaly Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Realistic Enterprise ERP Transaction Record Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Record Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900">{record.type}</h1>
                <span className="text-base font-mono text-slate-500">#{record.tranId}</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Subsidiary: {record.subsidiary} · Posting Period: {record.postingPeriod} · Currency: {record.currency}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-bold text-slate-900">
              ${record.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Primary Form Fields Grid */}
        <div className="p-6 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entity (Vendor / Customer)</span>
            <span className="font-semibold text-slate-900 text-sm">{record.entity}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction Date</span>
            <span className="font-semibold text-slate-800 text-sm">{record.date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Approval Status</span>
            <span className="font-semibold text-emerald-700 text-sm">{record.approvalStatus}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Exchange Rate</span>
            <span className="font-semibold text-slate-800 text-sm font-mono">{record.exchangeRate.toFixed(2)}</span>
          </div>
        </div>

        {/* Memo text if present */}
        {record.memo && (
          <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-400 uppercase text-[10px] mr-2">Transaction Memo:</span>
            <span className="italic">"{record.memo}"</span>
          </div>
        )}

        {/* GL Distribution Lines Table */}
        <div className="p-6 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
              General Ledger Account Distribution Lines
            </h3>
            <span className="text-slate-400">{record.glLines.length} lines</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Debit ($)</th>
                  <th className="py-2.5 px-3 text-right">Credit ($)</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Memo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {record.glLines.map((line) => (
                  <tr key={line.line} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{line.line}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{line.account}</td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {line.debit > 0 ? `$${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {line.credit > 0 ? `$${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={line.department.includes('Flagged') ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {line.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={line.class.includes('Flagged') ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {line.class}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{line.location}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic max-w-44 truncate">{line.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Audit Log */}
        <div className="p-6 pt-0 space-y-3 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
            System Audit Trail
          </h3>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {record.auditHistory.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 text-[11px]">{item.date}</span>
                  <span className="font-semibold text-slate-800">{item.user}</span>
                  <span className="text-slate-600">{item.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
