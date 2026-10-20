import React, { useState } from 'react';
import { SlidersHorizontal, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface ImportanceSliderProps {
  step: number; // 1 to 9
  onChange: (newStep: number) => void;
  filteredCount: number;
  totalCount: number;
}

export const IMPORTANCE_STEPS = [
  { step: 1, label: 'Top 10%', threshold: 88, name: 'Critical Only', desc: 'Focus strictly on material deviations ($> $500k or unapproved accounts)' },
  { step: 2, label: 'Top 20%', threshold: 80, name: 'Very High', desc: 'High risk outliers with significant feature deviation' },
  { step: 3, label: 'Top 30%', threshold: 72, name: 'High', desc: 'Standard recommended threshold for monthly financial close' },
  { step: 4, label: 'Top 40%', threshold: 64, name: 'Medium-High', desc: 'Captures moderate variances and segment mismatches' },
  { step: 5, label: 'Top 50%', threshold: 56, name: 'Medium', desc: 'Balanced operational and accounting variance review' },
  { step: 6, label: 'Top 60%', threshold: 48, name: 'Moderate', desc: 'Includes smaller cycle timing and vendor variations' },
  { step: 7, label: 'Top 75%', threshold: 38, name: 'Low-Medium', desc: 'Pre-audit comprehensive sweep' },
  { step: 8, label: 'Top 90%', threshold: 25, name: 'Low', desc: 'Detailed forensic investigation baseline' },
  { step: 9, label: 'All 100%', threshold: 0, name: 'All Outliers', desc: 'Unfiltered ledger population for audit completeness' },
];

export const ImportanceSlider: React.FC<ImportanceSliderProps> = ({
  step,
  onChange,
  filteredCount,
  totalCount,
}) => {
  const [showGuidance, setShowGuidance] = useState<boolean>(false);
  const currentStepInfo = IMPORTANCE_STEPS[step - 1] || IMPORTANCE_STEPS[0];

  return (
    <div className="bg-white/95 border border-[#ebdcd3] rounded-xl p-3.5 shadow-2xs space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center font-bold text-xs shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8d3c26]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 tracking-wide uppercase">
                Sensitivity Filter
              </span>
              <button
                type="button"
                onClick={() => setShowGuidance(!showGuidance)}
                className="text-[11px] text-[#8d3c26] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                title="Explain sensitivity governance"
              >
                <Info className="w-3 h-3" />
                <span>{showGuidance ? 'Hide' : 'Info'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              Showing <strong className="font-semibold text-stone-800">{filteredCount}</strong> of {totalCount} outliers ({currentStepInfo.name} · {currentStepInfo.label})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-bold text-[#8d3c26] bg-[#fbf0eb] px-2.5 py-0.5 rounded-lg border border-[#ebdcd3]">
            {currentStepInfo.name} (Score ≥ {currentStepInfo.threshold})
          </span>
        </div>
      </div>

      {showGuidance && (
        <div className="bg-[#fbf7f4] border border-[#ebdcd3] rounded-lg p-2.5 text-xs text-stone-600 space-y-1">
          <div className="font-bold text-stone-900 flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8d3c26]" />
            <span>Enterprise Sensitivity Governance (SOX Control Protocol)</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Adjusting sensitivity balances reviewer fatigue against detection coverage. Step 3 (Top 30%, Score ≥ 72) surfaces high-materiality entries.
          </p>
        </div>
      )}

      {/* Sleek, Clean Range Slider */}
      <div className="pt-0.5 pb-1">
        <input
          type="range"
          min="1"
          max="9"
          step="1"
          value={step}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-[#ebdcd3] rounded-lg appearance-none cursor-pointer accent-[#8d3c26] focus:outline-hidden"
        />

        {/* 9 Step Markers */}
        <div className="flex justify-between items-center mt-1.5 px-0.5">
          {IMPORTANCE_STEPS.map((s) => {
            const isSelected = s.step === step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onChange(s.step)}
                className={`text-[10px] font-medium transition-colors cursor-pointer px-1 py-0.5 rounded ${
                  isSelected
                    ? 'font-bold text-[#8d3c26] bg-[#fbf0eb]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title={`${s.name} (Score ≥ ${s.threshold}): ${s.desc}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
