import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { getRolePermissions, getActionRestrictionReason } from '../../guardrails/rbac';
import {
  LayoutDashboard,
  Home,
  FileText,
  Sliders,
  AlertTriangle,
  FolderSync,
  Boxes,
  Cpu,
  Gauge,
  Activity,
  Shield,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    dashboardTab,
    setDashboardTab,
    effectiveTransactionAnomalies,
    effectiveExpectedMissingAnomalies,
    effectiveInventoryAnomalies,
    effectiveCustomAnomalies,
    currentUserRole,
    addToast,
    guardrailEvents,
  } = useAnomaly();

  const perms = getRolePermissions(currentUserRole);

  const countPending = (list: any[]) =>
    list.filter((x) => x.status === 'Need Review' || x.status === 'Reopen').length;

  const pendingTx = countPending(effectiveTransactionAnomalies);
  const pendingExp = countPending(effectiveExpectedMissingAnomalies);
  const pendingInv = countPending(effectiveInventoryAnomalies);
  const pendingCust = countPending(effectiveCustomAnomalies);
  const totalPending = pendingTx + pendingExp + pendingInv + pendingCust;

  return (
    <aside className="w-64 bg-slate-50/70 border-r border-slate-200 shrink-0 flex flex-col justify-between py-4 select-none">
      <div className="space-y-6">
        {/* Navigation Sections */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                <span>Home Portlet</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activePage === 'home' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Overview
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Anomaly Dashboard</span>
              </div>
              {totalPending > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activePage === 'dashboard'
                      ? 'bg-white text-blue-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {totalPending}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Anomaly Dashboard Quick Category Links */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
            Anomaly Focus Areas
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('transactions');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'transactions'
                  ? 'bg-blue-100/70 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">Transaction Outliers</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{pendingTx}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('expected-missing');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'expected-missing'
                  ? 'bg-blue-100/70 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderSync className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Expected / Missing</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{pendingExp}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('inventory');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'inventory'
                  ? 'bg-blue-100/70 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">Inventory Risks</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{pendingInv}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('custom');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'custom'
                  ? 'bg-blue-100/70 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Custom Rules & Outliers</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{pendingCust}</span>
            </button>
          </div>
        </div>

        {/* ERP Records & Admin */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
            ERP Records & Admin
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('transaction-record')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'transaction-record'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Transaction Record</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">PO-10492</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!perms.canModifyConfiguration) {
                  addToast(
                    'Configuration Restricted',
                    getActionRestrictionReason('config', currentUserRole),
                    'error'
                  );
                  return;
                }
                setActivePage('config');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'config'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : !perms.canModifyConfiguration
                  ? 'text-slate-400 opacity-70 cursor-not-allowed hover:bg-slate-100'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
              title={
                !perms.canModifyConfiguration
                  ? getActionRestrictionReason('config', currentUserRole)
                  : 'Configure anomaly detection parameters'
              }
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" />
                <span>Configuration</span>
              </div>
              <div className="flex items-center gap-1">
                {!perms.canModifyConfiguration && <Lock className="w-3 h-3 text-slate-400" />}
                <span className="text-[10px] text-slate-400">Admin</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Governance, Guardrails & Evals */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-2">
            Governance & Assurance
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('evals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'evals'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>Model Evals</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activePage === 'evals' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                5 Suites
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('guardrails')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'guardrails'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Guardrail Telemetry</span>
              </div>
              {guardrailEvents.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activePage === 'guardrails' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {guardrailEvents.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('audit-log')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activePage === 'audit-log'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Enterprise Audit Log</span>
              </div>
              <span className="text-[10px] text-slate-400">SOX</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="px-4">
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Anomaly Engine Online
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Last continuous scan completed at 05:30 AM today.
          </p>
        </div>
      </div>
    </aside>
  );
};
