import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { MessageSquare, X, Star, ThumbsUp, Send, CheckCircle2 } from 'lucide-react';

export const ResearchFeedbackModal: React.FC = () => {
  const { isFeedbackModalOpen, setIsFeedbackModalOpen, submitUserFeedback, activeScenario } = useAnomaly();
  
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'usability' | 'enterprise_fit' | 'explainability' | 'feature_request'>('enterprise_fit');
  const [frictionPoints, setFrictionPoints] = useState<string>('');
  const [whatWorkedWell, setWhatWorkedWell] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isFeedbackModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUserFeedback({
      scenarioId: activeScenario?.id,
      rating,
      category,
      frictionPoints: frictionPoints.trim() || undefined,
      whatWorkedWell: whatWorkedWell.trim() || undefined,
      suggestions: suggestions.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsFeedbackModalOpen(false);
      setFrictionPoints('');
      setWhatWorkedWell('');
      setSuggestions('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Redwood accents */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-stone-800 to-[#8E3A2B] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#A43425]/40 border border-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Enterprise User Research & Study Feedback</h3>
              <p className="text-xs text-stone-300">Evaluating Prototype Fit for Enterprise Audit Workflows</p>
            </div>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(false)}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-900">Feedback Recorded</h4>
              <p className="text-sm text-stone-600 mt-1">
                Your qualitative notes and ease-of-use scores have been captured for enterprise product synthesis.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {activeScenario && (
              <div className="bg-[#FAF7F5] border border-[#ECD9D6] rounded-lg p-3 text-xs text-stone-700 flex items-center justify-between">
                <span>Active Scenario: <strong>{activeScenario.title}</strong></span>
                <span className="font-mono text-[#8E3A2B] font-semibold">{activeScenario.badge}</span>
              </div>
            )}

            {/* Overall Experience Rating */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Enterprise Readiness & Ease of Use (1 - 5)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg border text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                      rating >= star
                        ? 'border-amber-400 bg-amber-50 text-amber-800'
                        : 'border-stone-200 text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${rating >= star ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span>{star}</span>
                  </button>
                ))}
                <span className="text-xs text-stone-500 ml-2">
                  {rating === 5 ? 'Production Ready' : rating === 4 ? 'Good Enterprise Fit' : rating === 3 ? 'Usable with gaps' : 'High Friction'}
                </span>
              </div>
            </div>

            {/* Evaluation Category */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Primary Feedback Focus
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'enterprise_fit', label: 'SOX / Compliance Fit' },
                  { id: 'usability', label: 'Navigation & Density' },
                  { id: 'explainability', label: 'AI Transparency / Reasons' },
                  { id: 'feature_request', label: 'Workflow Gap / Next Steps' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`px-3 py-2 text-left rounded-lg border font-medium transition-all ${
                      category === cat.id
                        ? 'border-[#8E3A2B] bg-[#F7EBE8] text-[#8E3A2B] font-semibold ring-1 ring-[#8E3A2B]'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Friction Points */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Any friction points, confusion, or crowded areas?
              </label>
              <textarea
                value={frictionPoints}
                onChange={(e) => setFrictionPoints(e.target.value)}
                rows={2}
                placeholder="e.g. Filter bar felt cluttered before collapse, need faster bulk review..."
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E3A2B] focus:border-transparent text-stone-800"
              />
            </div>

            {/* What Worked Well */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                What worked well or was intuitive?
              </label>
              <textarea
                value={whatWorkedWell}
                onChange={(e) => setWhatWorkedWell(e.target.value)}
                rows={2}
                placeholder="e.g. Redwood status indicators, audit trail in drawer, clear reason codes..."
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E3A2B] focus:border-transparent text-stone-800"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#8E3A2B] hover:bg-[#782E21] rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Research Notes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
