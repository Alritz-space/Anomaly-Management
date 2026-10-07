import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { UserRole } from '../../types/guardrails';
import {
  Shield,
  Users,
  Activity,
  FileText,
  Gauge,
  Sliders,
  ChevronUp,
  ChevronDown,
  Building,
  Snowflake,
} from 'lucide-react';

export const DevToolbar: React.FC = () => {
  const {
    currentUserRole,
    setCurrentUserRole,
    activeTenantId,
    setActiveTenantId,
    coldStartEnabled,
    setColdStartEnabled,
    evalConfigVersion,
    setEvalConfigVersion,
    activePage,
    setActivePage,
    addToast,
    logGuardrailEvent,
    guardrailEvents,
  } = useAnomaly();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    addToast('Role Switched', `Active user role changed to "${newRole}".`, 'info');
  };

  const handleTenantChange = (tenant: string) => {
    setActiveTenantId(tenant);
    if (tenant !== 'tenant-corp-acme-01') {
      logGuardrailEvent({
        type: 'Tenant Isolation',
        severity: 'critical',
        actionTaken: 'blocked',
        reason: `Tenant switched to rogue foreign tenant "${tenant}". Data isolation guard will suppress non-matching records.`,
      });
      addToast('Tenant Switched (Rogue)', `Switched to foreign tenant "${tenant}". Tenant guard active.`, 'warning');
    } else {
      addToast('Tenant Restored', 'Switched back to default corporate tenant.', 'success');
    }
  };

  const handleColdStartToggle = () => {
    const nextVal = !coldStartEnabled;
    setColdStartEnabled(nextVal);
    if (nextVal) {
      logGuardrailEvent({
        type: 'Cold-Start / Confidence',
        severity: 'medium',
        actionTaken: 'warned',
        reason: 'Cold-start guard enabled: Entities with <3 historical transactions will be gated.',
      });
      addToast('Cold-Start Active', 'Entities with <3 transactions are gated for predictive anomalies.', 'info');
    } else {
      addToast('Cold-Start Disabled', 'All predictive anomalies surfaced regardless of transaction volume.', 'warning');
    }
  };

  const blockedCount = guardrailEvents.filter((e) => e.actionTaken === 'blocked').length;

  return (
    <aside
      aria-label="Developer & Governance Testing Toolbar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700 shadow-2xl transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-xs">
        {/* Left: Role Switcher & Dev Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/80 rounded-md border border-blue-500/40 text-blue-300 font-mono text-[10px]">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>TEST TOOLBAR</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <span className="text-[11px] text-slate-400 font-medium mr-1">Role:</span>
            {(['Admin', 'Finance Manager', 'Viewer'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  currentUserRole === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                title={`Switch active user role to ${r}`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Expanded controls */}
          {isExpanded && (
            <>
              {/* Tenant Switcher */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
                <span className="text-[11px] text-slate-400 font-medium mr-1">Tenant:</span>
                <select
                  value={activeTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="bg-transparent text-slate-200 text-[11px] font-mono py-0.5 px-1 focus:outline-hidden cursor-pointer"
                >
                  <option value="tenant-corp-acme-01" className="bg-slate-900 text-white">
                    Acme Corp (Primary)
                  </option>
                  <option value="tenant-rogue-foreign-99" className="bg-slate-900 text-amber-300">
                    Rogue Tenant (Foreign)
                  </option>
                </select>
              </div>

              {/* Cold-Start Toggle */}
              <button
                type="button"
                onClick={handleColdStartToggle}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  coldStartEnabled
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="When active, entities with <3 transactions are gated for predictive anomalies"
              >
                <Snowflake className={`w-3.5 h-3.5 ${coldStartEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Cold-Start Guard: {coldStartEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Eval Version Toggle */}
              <div className="hidden xl:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium ml-1.5 mr-1">Candidate Model:</span>
                {(['v1.2 (Current)', 'v1.3 (Candidate)'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEvalConfigVersion(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      evalConfigVersion === v
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {v.split(' ')[0]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Quick Navigation to Governance Pages */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePage('evals')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activePage === 'evals'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Model Evals</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('guardrails')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activePage === 'guardrails'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Guardrail Telemetry</span>
            {blockedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {blockedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePage('audit-log')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activePage === 'audit-log'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Audit Log</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            title={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
