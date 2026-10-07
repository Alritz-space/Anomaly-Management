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
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Anomaly Importance Sensitivity
            </span>
            <p className="text-xs text-slate-500">
              Filtered view: <span className="font-semibold text-slate-700">{filteredCount}</span> of {totalCount} transactions surfaced ({currentStepInfo.name} · {currentStepInfo.label})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200/60">
            High Importance (10%)
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Low Importance (100%)
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
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-hidden"
        />

        {/* 9 Step Markers */}
        <div className="flex justify-between items-center mt-2 px-0.5">
          {IMPORTANCE_STEPS.map((s) => {
            const isSelected = s.step === step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onChange(s.step)}
                className={`flex flex-col items-center group transition-colors focus:outline-hidden ${
                  isSelected ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mb-1 transition-all ${
                    isSelected
                      ? 'bg-blue-600 ring-4 ring-blue-100 scale-125'
                      : 'bg-slate-300 group-hover:bg-slate-400'
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
