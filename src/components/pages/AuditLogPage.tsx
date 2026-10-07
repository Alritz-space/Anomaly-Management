import React, { useState, useMemo } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useAnomaly();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesUser = log.user.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q) || false;
        const matchesEntity = log.entityId?.toLowerCase().includes(q) || false;
        if (!matchesAction && !matchesUser && !matchesDetails && !matchesEntity) return false;
      }
      if (categoryFilter !== 'All' && log.category !== categoryFilter) return false;
      return true;
    });
  }, [auditLogs, searchTerm, categoryFilter]);

  const exportAuditLogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anomaly-audit-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Enterprise Audit Log</h1>
              <p className="text-xs text-slate-500">
                Immutable record of every status transition, anomaly dismissal, rule modification, and configuration adjustment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportAuditLogJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail (JSON)</span>
            </button>
          </div>
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
            placeholder="Search audit actions, users, or record IDs..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Categories ({auditLogs.length})</option>
            <option value="Status Change">Status Changes</option>
            <option value="Bulk Action">Bulk Actions</option>
            <option value="Rule Management">Rule Management</option>
            <option value="Configuration">Configuration</option>
            <option value="AI Evaluation">AI Evaluations</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record / Entity</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Audit Details & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No matching audit entries found for current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{log.user}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">
                      {log.entityId || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.before || log.after ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {log.before && <span className="text-slate-500 line-through">{log.before}</span>}
                          {log.before && log.after && <ArrowRight className="w-3 h-3 text-slate-400" />}
                          {log.after && <span className="font-bold text-slate-800">{log.after}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      <p className="line-clamp-2">{log.details || '—'}</p>
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
