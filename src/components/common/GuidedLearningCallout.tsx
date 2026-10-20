import React, { useState } from 'react';
import { Lightbulb, ChevronRight, X, ShieldCheck } from 'lucide-react';

interface GuidedLearningCalloutProps {
  title: string;
  description: string;
  complianceNote?: string;
  badge?: string;
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
  storageKey?: string;
}

export const GuidedLearningCallout: React.FC<GuidedLearningCalloutProps> = ({
  title,
  description,
  complianceNote,
  badge = 'Guidance',
  actionText,
  onAction,
  dismissible = true,
  storageKey,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(`gl_callout_${storageKey}`) === 'true';
    } catch {
      return false;
    }
  });

  const [expanded, setExpanded] = useState<boolean>(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try {
        localStorage.setItem(`gl_callout_${storageKey}`, 'true');
      } catch {
        // no-op
      }
    }
  };

  return (
    <div className="bg-[#fbf7f4] border border-[#ebdcd3] rounded-xl px-4 py-2 text-stone-800 transition-all text-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#f2e2da] text-[#8d3c26] flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-[#8d3c26]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d3c26] bg-[#f7ebe4] px-1.5 py-0.5 rounded border border-[#ebdcd3] shrink-0">
            {badge}
          </span>
          <span className="font-semibold text-stone-900 truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-[#8d3c26] hover:underline cursor-pointer"
          >
            {expanded ? 'Hide Details' : 'View Protocol'}
          </button>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer transition-colors"
              title="Dismiss guidance"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="pt-2.5 mt-2.5 border-t border-[#ebdcd3] space-y-2 text-stone-600 leading-relaxed animate-in fade-in duration-150">
          <p>{description}</p>
          {complianceNote && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8d3c26] shrink-0" />
              <span className="font-medium text-stone-700">{complianceNote}</span>
            </div>
          )}
          {actionText && onAction && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8d3c26] hover:bg-[#782e1b] text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>{actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
