import React, { useEffect, useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { RotateCcw, X } from 'lucide-react';

export const UndoToast: React.FC = () => {
  const { undoAction, triggerUndo, dismissUndo } = useAnomaly();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);

  useEffect(() => {
    if (!undoAction) return;

    const interval = setInterval(() => {
      const remainingMs = undoAction.expiresAt - Date.now();
      const secs = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [undoAction]);

  if (!undoAction) return null;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-250">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>
          Anomaly <strong>{undoAction.anomalyItemId}</strong> updated to{' '}
          <strong className="text-amber-300">{undoAction.targetStatus}</strong>.
        </span>
      </div>

      <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
        <button
          type="button"
          onClick={triggerUndo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo ({secondsRemaining}s)</span>
        </button>

        <button
          type="button"
          onClick={dismissUndo}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
