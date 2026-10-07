import React, { useState } from 'react';
import { AnomalyRule } from '../../types/anomaly';
import { useAnomaly } from '../../context/AnomalyContext';
import { getRolePermissions, getActionRestrictionReason } from '../../guardrails/rbac';
import {
  X,
  Play,
  Pause,
  Trash2,
  Cpu,
  Layers,
  History,
  CheckCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface Props {
  rule: AnomalyRule;
  onClose: () => void;
}

export const RuleDetailsModal: React.FC<Props> = ({ rule, onClose }) => {
  const {
    activateRule,
    pauseRule,
    deleteDraftRule,
    effectiveCustomAnomalies,
    openTransactionModal,
    openDrawer,
    currentUserRole,
  } = useAnomaly();

  const perms = getRolePermissions(currentUserRole);

  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'anomalies' | 'activity'>('overview');

  const matchingAnomalies = effectiveCustomAnomalies.filter((a) => a.ruleId === rule.id);

  const statusBadge = {
    Active: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300',
    Draft: 'text-slate-700 bg-slate-100 ring-1 ring-slate-300',
    Paused: 'text-amber-700 bg-amber-50 ring-1 ring-amber-300',
  }[rule.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{rule.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge}`}>
                  {rule.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {rule.id}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>Template: <strong className="text-slate-700">{rule.template}</strong></span>
                <span>·</span>
                <span>Created: {rule.createdAt}</span>
                <span>·</span>
                <span>Last Run: {rule.lastRun}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'conditions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Conditions ({rule.conditions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anomalies')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'anomalies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Anomalies ({matchingAnomalies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Audit Log ({rule.auditTrail.length})
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 3 KPI Cards: Open, Resolved, No Action */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Open Anomalies</span>
                  <span className="text-2xl font-bold text-amber-600">{rule.openCount}</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resolved</span>
                  <span className="text-2xl font-bold text-emerald-600">{rule.resolvedCount}</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">No Action Needed</span>
                  <span className="text-2xl font-bold text-slate-600">{rule.noActionCount}</span>
                </div>
              </div>

              {/* Rule Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs">
                  Rule Configuration Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Rule Owner</span>
                    <span className="font-semibold text-slate-800 text-sm">{rule.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Audit Priority</span>
                    <span className="font-semibold text-slate-800 text-sm">{rule.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Condition Logic</span>
                    <span className="font-bold text-blue-700 text-sm">{rule.logic} (Match {rule.logic === 'AND' ? 'All' : 'Any'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Subsidiaries</span>
                    <span className="font-medium text-slate-800">{rule.subsidiaries.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Transaction Types</span>
                    <span className="font-medium text-slate-800">{rule.transactionTypes.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Notification Channels</span>
                    <span className="font-medium text-slate-800">
                      {[rule.notifyEmail && 'Email', rule.notifyInApp && 'In-App'].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Rule Description</span>
                <p className="text-slate-700 leading-relaxed text-xs">{rule.description}</p>
              </div>
            </div>
          )}

          {/* Tab 2: Conditions (Read-only view defined at creation) */}
          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-xs">
                Evaluation Rule: Match <strong className="font-bold">{rule.logic}</strong> of the following condition rules.
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                      <th className="py-2.5 px-4 font-semibold w-12">#</th>
                      <th className="py-2.5 px-4 font-semibold">Field</th>
                      <th className="py-2.5 px-4 font-semibold">Operator</th>
                      <th className="py-2.5 px-4 font-semibold">Evaluated Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rule.conditions.map((cond, idx) => (
                      <tr key={cond.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{cond.field}</td>
                        <td className="py-2.5 px-4 text-blue-700 font-mono text-[11px]">{cond.operator}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {cond.operator === 'is empty' || cond.operator === 'is not empty' ? (
                            <span className="text-slate-400 italic">[None]</span>
                          ) : cond.operator === 'is between' ? (
                            <span>{cond.value} AND {cond.value2}</span>
                          ) : (
                            <span>"{cond.value}"</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Anomalies */}
          {activeTab === 'anomalies' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                      <th className="py-2.5 px-3 font-semibold">Transaction</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Impacted Amount</th>
                      <th className="py-2.5 px-3 font-semibold">Entity</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {matchingAnomalies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No active anomalies currently surfaced for this rule.
                        </td>
                      </tr>
                    ) : (
                      matchingAnomalies.map((anom) => (
                        <tr key={anom.id} className="hover:bg-slate-50/70">
                          <td
                            className="py-2.5 px-3 font-semibold text-blue-600 hover:underline cursor-pointer"
                            onClick={() => openTransactionModal(anom.tranId)}
                          >
                            {anom.tranId}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{anom.transactionType}</td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            ${anom.impactedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">{anom.entity}</td>
                          <td className="py-2.5 px-3 text-slate-500">{anom.date}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                anom.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : anom.status === 'Reopen'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {anom.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                openDrawer('custom', anom);
                              }}
                              className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Activity Audit Log */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {rule.auditTrail.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 capitalize text-xs">
                          {log.action}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 font-medium">{log.editor}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{log.details}</p>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons required by prompt:
            Close (always); Activate Rule (Draft or Paused); Pause (Active); Delete (Draft only) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {rule.status === 'Draft' && (
              <button
                type="button"
                disabled={!perms.canDeleteRules}
                onClick={() => deleteDraftRule(rule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
                title={!perms.canDeleteRules ? getActionRestrictionReason('delete_rule', currentUserRole) : 'Delete Draft Rule'}
              >
                {!perms.canDeleteRules ? <Lock className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Draft Rule
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            {rule.status === 'Active' ? (
              <button
                type="button"
                disabled={!perms.canPauseActivateRules}
                onClick={() => pauseRule(rule.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
                title={!perms.canPauseActivateRules ? getActionRestrictionReason('toggle_rule', currentUserRole) : 'Pause active rule'}
              >
                {!perms.canPauseActivateRules ? <Lock className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                Pause Rule
              </button>
            ) : (
              <button
                type="button"
                disabled={!perms.canPauseActivateRules}
                onClick={() => activateRule(rule.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                title={!perms.canPauseActivateRules ? getActionRestrictionReason('toggle_rule', currentUserRole) : 'Activate production rule'}
              >
                {!perms.canPauseActivateRules ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                Activate Rule
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
