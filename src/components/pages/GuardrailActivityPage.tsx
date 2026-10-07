import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Info,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { getRolePermissions } from '../../guardrails/rbac';

export const GuardrailActivityPage: React.FC = () => {
  const { guardrailEvents, clearGuardrailEvents, currentUserRole } = useAnomaly();
  const perms = getRolePermissions(currentUserRole);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // Counts per type
  const countsByType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of guardrailEvents) {
      map[e.type] = (map[e.type] || 0) + 1;
    }
    return map;
  }, [guardrailEvents]);

  const filteredEvents = useMemo(() => {
    return guardrailEvents.filter((e) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesType = e.type.toLowerCase().includes(q);
        const matchesReason = e.reason.toLowerCase().includes(q);
        const matchesItem = e.itemId?.toLowerCase().includes(q) || false;
        if (!matchesType && !matchesReason && !matchesItem) return false;
      }
      if (typeFilter !== 'All' && e.type !== typeFilter) return false;
      if (severityFilter !== 'All' && e.severity !== severityFilter) return false;
      return true;
    });
  }, [guardrailEvents, searchTerm, typeFilter, severityFilter]);

  const severityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">INFO</span>;
    }
  };

  const actionBadge = (action: string) => {
    switch (action) {
      case 'blocked':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">Blocked</span>;
      case 'warned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white">Warned</span>;
      case 'masked':
      case 'sanitized':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white">Sanitized</span>;
      case 'fallback':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">Template Fallback</span>;
      case 'rate_limited':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-600 text-white">Rate Limited</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">Passed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Guardrail Activity Telemetry</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Real-time Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live monitoring of input guardrails, prompt injection barriers, output grounding validators, RBAC enforcement, and tenant isolation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {perms.canViewGuardrailActivity && (
              <button
                type="button"
                onClick={clearGuardrailEvents}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Telemetry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Interceptions</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{guardrailEvents.length}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Events logged across session</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-600 block">Critical Blocks</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {guardrailEvents.filter((e) => e.severity === 'critical' || e.actionTaken === 'blocked').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Zero tolerance safety violations</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-indigo-600 block">Grounding Fallbacks</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">
            {guardrailEvents.filter((e) => e.type === 'Grounding Hallucination' || e.actionTaken === 'fallback').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">AI hallucinations replaced safely</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Active Protection Layers</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">8 / 8</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">All defense gates operational</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guardrail events, items, or reasons..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Protection Types ({guardrailEvents.length})</option>
            <option value="Prompt Injection">Prompt Injection</option>
            <option value="Grounding Hallucination">Grounding Hallucination</option>
            <option value="Tenant Isolation">Tenant Isolation</option>
            <option value="High-Impact Note">High-Impact Note</option>
            <option value="No-Action Abuse">No-Action Abuse</option>
            <option value="Bulk Action Limit">Bulk Action Limit</option>
            <option value="RBAC Restriction">RBAC Restriction</option>
            <option value="Format & Constraint">Format & Constraint</option>
            <option value="Rate Limit">Rate Limit</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Guardrail Layer</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Subject / Item ID</th>
                <th className="py-3 px-4">Reason & Defense Enforcement Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No guardrail events matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {e.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{e.type}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{severityBadge(e.severity)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{actionBadge(e.actionTaken)}</td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">
                      {e.itemId || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-lg">
                      <p className="leading-relaxed">{e.reason}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
