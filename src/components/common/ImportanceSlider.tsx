import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface ImportanceSliderProps {
  step: number; // 1 to 9
  onChange: (newStep: number) => void;
  filteredCount: number;
  totalCount: number;
}

export const IMPORTANCE_STEPS = [
  { step: 1, label: 'Top 10%', threshold: 88, name: 'Critical Only' },
  { step: 2, label: 'Top 20%', threshold: 80, name: 'Very High' },
  { step: 3, label: 'Top 30%', threshold: 72, name: 'High' },
  { step: 4, label: 'Top 40%', threshold: 64, name: 'Medium-High' },
  { step: 5, label: 'Top 50%', threshold: 56, name: 'Medium' },
  { step: 6, label: 'Top 60%', threshold: 48, name: 'Moderate' },
  { step: 7, label: 'Top 75%', threshold: 38, name: 'Low-Medium' },
  { step: 8, label: 'Top 90%', threshold: 25, name: 'Low' },
  { step: 9, label: 'All 100%', threshold: 0, name: 'All Anomalies' },
];

export const ImportanceSlider: React.FC<ImportanceSliderProps> = ({
  step,
  onChange,
  filteredCount,
  totalCount,
}) => {
  const currentStepInfo = IMPORTANCE_STEPS[step - 1] || IMPORTANCE_STEPS[0];

  return (
    <div className="bg-white/90 border border-[#ebdcd3] rounded-2xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#fbf0eb] text-[#8d3c26] flex items-center justify-center font-bold text-xs shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-800 tracking-wide uppercase">
              Anomaly Importance Sensitivity
            </span>
            <p className="text-xs text-stone-500">
              Surfacing <span className="font-semibold text-stone-800">{filteredCount}</span> of {totalCount} transactions ({currentStepInfo.name} · {currentStepInfo.label})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-[#782e1b] bg-[#fbf0eb] px-2.5 py-1 rounded-lg border border-[#ebdcd3]">
            High Impact (10%)
          </span>
          <span className="text-stone-300">→</span>
          <span className="font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
            Broad View (100%)
          </span>
        </div>
      </div>

      <div className="relative pt-2 pb-1 px-1">
        <input
          type="range"
          min="1"
          max="9"
          step="1"
          value={step}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-[#ebdcd3] rounded-lg appearance-none cursor-pointer accent-[#8d3c26] focus:outline-hidden"
        />

        {/* 9 Step Markers */}
        <div className="flex justify-between items-center mt-2.5 px-0.5">
          {IMPORTANCE_STEPS.map((s) => {
            const isSelected = s.step === step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onChange(s.step)}
                className={`flex flex-col items-center group transition-colors focus:outline-hidden ${
                  isSelected ? 'text-[#8d3c26] font-bold' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mb-1 transition-all ${
                    isSelected
                      ? 'bg-[#8d3c26] ring-4 ring-[#fbf0eb] scale-125'
                      : 'bg-[#ded0c6] group-hover:bg-[#cb9f8f]'
                  }`}
                />
                <span className="text-[10px] hidden md:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
