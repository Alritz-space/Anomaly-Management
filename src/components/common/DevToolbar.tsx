import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { UserRole } from '../../types/guardrails';
import {
  Shield,
  Users,
  Activity,
  FileText,
  Gauge,
  ChevronUp,
  ChevronDown,
  Building,
  Snowflake,
  RotateCcw,
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
    resetAllDataToBaseline,
    activePage,
    setActivePage,
    addToast,
    logGuardrailEvent,
    guardrailEvents,
  } = useAnomaly();

  // Keep collapsed by default so UI is clean, spacious, and not crowded for end users
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#2e1914]/95 backdrop-blur-md text-[#fcf8f5] border-t border-[#4f2a20] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-xs">
        {/* Left: Role Switcher & Dev Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#42221b] rounded-md border border-[#6b382d] text-[#e8a292] font-mono text-[10px]">
            <Shield className="w-3.5 h-3.5 text-[#e8a292]" />
            <span>ROLE & TEST</span>
          </div>

          <div className="flex items-center gap-1 bg-[#3a1f19] p-0.5 rounded-lg border border-[#4f2a20]">
            <Users className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
            <span className="text-[11px] text-stone-400 font-medium mr-1">Role:</span>
            {(['Admin', 'Finance Manager', 'Viewer'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  currentUserRole === r
                    ? 'bg-[#8d3c26] text-white shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-[#4f2a20]'
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
              <div className="hidden lg:flex items-center gap-1 bg-[#3a1f19] p-0.5 rounded-lg border border-[#4f2a20]">
                <Building className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
                <span className="text-[11px] text-stone-400 font-medium mr-1">Tenant:</span>
                <select
                  value={activeTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="bg-transparent text-stone-200 text-[11px] font-mono py-0.5 px-1 focus:outline-hidden cursor-pointer"
                >
                  <option value="tenant-corp-acme-01" className="bg-[#2e1914] text-white">
                    Acme Corp (Primary)
                  </option>
                  <option value="tenant-rogue-foreign-99" className="bg-[#2e1914] text-amber-300">
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
                    ? 'bg-[#4f2a20] border-[#8d3c26] text-[#fbf0eb]'
                    : 'bg-[#3a1f19] border-[#4f2a20] text-stone-400 hover:text-stone-200'
                }`}
                title="When active, entities with <3 transactions are gated for predictive anomalies"
              >
                <Snowflake className={`w-3.5 h-3.5 ${coldStartEnabled ? 'text-[#e8a292]' : 'text-stone-500'}`} />
                <span>Cold-Start Guard: {coldStartEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Eval Version Toggle */}
              <div className="hidden xl:flex items-center gap-1 bg-[#3a1f19] p-0.5 rounded-lg border border-[#4f2a20]">
                <span className="text-[11px] text-stone-400 font-medium ml-1.5 mr-1">Candidate Model:</span>
                {(['v1.2 (Current)', 'v1.3 (Candidate)'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEvalConfigVersion(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      evalConfigVersion === v
                        ? 'bg-[#8d3c26] text-white font-bold'
                        : 'text-stone-400 hover:text-white'
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
                ? 'bg-[#8d3c26] text-white'
                : 'bg-[#3a1f19] hover:bg-[#4f2a20] text-stone-300'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-[#e8a292]" />
            <span>Model Evals</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('guardrails')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activePage === 'guardrails'
                ? 'bg-[#8d3c26] text-white'
                : 'bg-[#3a1f19] hover:bg-[#4f2a20] text-stone-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#e8a292]" />
            <span>Guardrail Telemetry</span>
            {blockedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#a33b20] text-white text-[9px] font-bold flex items-center justify-center">
                {blockedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={resetAllDataToBaseline}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#3a1f19] hover:bg-[#59261c] text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Reset all reviewed anomalies and task states back to original prototype baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e8a292]" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('audit-log')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activePage === 'audit-log'
                ? 'bg-[#8d3c26] text-white'
                : 'bg-[#3a1f19] hover:bg-[#4f2a20] text-stone-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#e8a292]" />
            <span>Audit Log</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-stone-400 hover:text-white rounded-md transition-colors"
            title={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
