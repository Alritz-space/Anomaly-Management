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
    <aside className="w-64 bg-[#fbf8f5] border-r border-[#ebdcd3] shrink-0 flex flex-col justify-between py-5 select-none">
      <div className="space-y-6">
        {/* Navigation Section: Workspace */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'home'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 opacity-90" />
                <span>Home Portlet</span>
              </div>
              <span className={`text-[10px] font-medium ${
                activePage === 'home' ? 'text-stone-200' : 'text-stone-400'
              }`}>
                Overview
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 opacity-90" />
                <span>Anomaly Dashboard</span>
              </div>
              {totalPending > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activePage === 'dashboard'
                      ? 'bg-[#6d2715] text-[#fbf5f2]'
                      : 'bg-[#f7e3db] text-[#8d3c26]'
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
          <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 px-3 mb-2">
            Audit Focus Areas
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
                  ? 'bg-[#f4e6df] text-[#782e1b] font-semibold'
                  : 'text-stone-600 hover:bg-[#f2e6de]/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#9e462d]" />
                <span className="truncate">Transaction Outliers</span>
              </div>
              <span className="text-[11px] font-semibold text-stone-600">{pendingTx}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('expected-missing');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'expected-missing'
                  ? 'bg-[#f4e6df] text-[#782e1b] font-semibold'
                  : 'text-stone-600 hover:bg-[#f2e6de]/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderSync className="w-3.5 h-3.5 text-[#9e462d]" />
                <span className="truncate">Expected / Missing</span>
              </div>
              <span className="text-[11px] font-semibold text-stone-600">{pendingExp}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('inventory');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'inventory'
                  ? 'bg-[#f4e6df] text-[#782e1b] font-semibold'
                  : 'text-stone-600 hover:bg-[#f2e6de]/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-[#9e462d]" />
                <span className="truncate">Inventory Risks</span>
              </div>
              <span className="text-[11px] font-semibold text-stone-600">{pendingInv}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePage('dashboard');
                setDashboardTab('custom');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activePage === 'dashboard' && dashboardTab === 'custom'
                  ? 'bg-[#f4e6df] text-[#782e1b] font-semibold'
                  : 'text-stone-600 hover:bg-[#f2e6de]/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#9e462d]" />
                <span className="truncate">Custom Rules & Outliers</span>
              </div>
              <span className="text-[11px] font-semibold text-stone-600">{pendingCust}</span>
            </button>
          </div>
        </div>

        {/* ERP Records & Admin */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 px-3 mb-2">
            ERP Records & System
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('transaction-record')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'transaction-record'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 opacity-90" />
                <span>Transaction Record</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">PO-10492</span>
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'config'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : !perms.canModifyConfiguration
                  ? 'text-stone-400 opacity-60 cursor-not-allowed hover:bg-transparent'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
              title={
                !perms.canModifyConfiguration
                  ? getActionRestrictionReason('config', currentUserRole)
                  : 'Configure anomaly detection parameters'
              }
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 opacity-90" />
                <span>Configuration</span>
              </div>
              <div className="flex items-center gap-1">
                {!perms.canModifyConfiguration && <Lock className="w-3 h-3 text-stone-400" />}
                <span className="text-[10px] text-stone-400 font-normal">Admin</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Governance, Guardrails & Evals */}
        <div className="px-3">
          <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 px-3 mb-2">
            Assurance & Controls
          </div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePage('evals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'evals'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gauge className="w-4 h-4 opacity-90" />
                <span>Model Evals</span>
              </div>
              <span className={`text-[10px] font-semibold ${
                activePage === 'evals' ? 'text-stone-200' : 'text-stone-500'
              }`}>
                5 Suites
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('guardrails')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'guardrails'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 opacity-90" />
                <span>Guardrail Telemetry</span>
              </div>
              {guardrailEvents.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activePage === 'guardrails' ? 'bg-[#6d2715] text-[#fbf5f2]' : 'bg-[#f7e3db] text-[#8d3c26]'
                }`}>
                  {guardrailEvents.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('audit-log')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activePage === 'audit-log'
                  ? 'bg-[#8d3c26] text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:bg-[#f2e6de]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 opacity-90" />
                <span>Enterprise Audit Log</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">SOX</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer System Status Card */}
      <div className="px-4">
        <div className="p-3.5 bg-white/80 rounded-xl border border-[#ebdcd3] text-[11px] text-stone-600 space-y-1 shadow-2xs">
          <div className="font-semibold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Anomaly Engine Online
          </div>
          <p className="text-[10px] text-stone-400 leading-tight">
            Last continuous GL scan: Today 05:30 AM
          </p>
        </div>
      </div>
    </aside>
  );
};
