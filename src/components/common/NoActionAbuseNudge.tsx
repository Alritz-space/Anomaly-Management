import React from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { AlertCircle, Sliders, X } from 'lucide-react';

export const NoActionAbuseNudge: React.FC = () => {
  const { noActionAbuseNudge, dismissNoActionNudge, setActivePage } = useAnomaly();

  if (!noActionAbuseNudge) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 max-w-md bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-250">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
              Threshold Recommendation Nudge
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              {noActionAbuseNudge}
            </p>
          </div>
        </div>

        <button
          onClick={dismissNoActionNudge}
          className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={dismissNoActionNudge}
          className="px-3 py-1.5 text-xs text-amber-800 hover:text-amber-950 font-medium transition-colors"
        >
          Keep Reviewing
        </button>
        <button
          type="button"
          onClick={() => {
            dismissNoActionNudge();
            setActivePage('config');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Open Configuration</span>
        </button>
      </div>
    </div>
  );
};
