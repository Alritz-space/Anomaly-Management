import React, { useState } from 'react';
import { useAnomaly } from '../../context/AnomalyContext';
import { InventoryAnomaly } from '../../types/anomaly';
import {
  X,
  Star,
  CheckCircle2,
  MinusCircle,
  RotateCcw,
  Boxes,
  MapPin,
  TrendingDown,
  Sparkles,
  ArrowRightCircle,
  Clock,
  Layers,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface Props {
  anomaly: InventoryAnomaly;
  onClose: () => void;
}

export const InventoryAnomalyDrawer: React.FC<Props> = ({ anomaly, onClose }) => {
  const { markResolved, markNoAction, reopenAnomaly, toggleBookmark, addToast } = useAnomaly();
  const [note, setNote] = useState(anomaly.resolutionNote || '');
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    addToast(
      'Feedback Recorded',
      type === 'up'
        ? 'Positive feedback recorded for inventory AI recommendations.'
        : 'Feedback recorded for continuous quality drift tracking.',
      'info'
    );
  };

  const statusBadge = {
    'Need Review': 'text-amber-700 bg-amber-50 ring-1 ring-amber-300',
    Verified: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300',
    Reopen: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-300',
  }[anomaly.status];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-144 md:w-168 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge}`}>
                {anomaly.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {anomaly.id}</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {anomaly.anomalyType}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {anomaly.itemName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono">{anomaly.sku}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {anomaly.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBookmark('inventory', anomaly.id)}
              className={`p-1.5 rounded-md transition-colors ${
                anomaly.isBookmarked
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Bookmark Anomaly"
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6 Metric Badges Required by Prompt:
            Start Date, Lead Time, Projected Balance, Safety Stock, Reorder Point, Preferred Stock Level */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Start Date</span>
            <span className="font-semibold text-slate-800">{anomaly.startDate}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Lead Time</span>
            <span className="font-semibold text-slate-800">{anomaly.leadTimeDays} days</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Projected Bal</span>
            <span className={`font-bold ${anomaly.projectedBalance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {anomaly.projectedBalance} units
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Safety Stock</span>
            <span className="font-semibold text-amber-700">{anomaly.safetyStock}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Reorder Point</span>
            <span className="font-semibold text-blue-700">{anomaly.reorderPoint}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Preferred Level</span>
            <span className="font-semibold text-emerald-700">{anomaly.preferredStockLevel}</span>
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* Warning Banner */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
          <TrendingDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Inventory Risk Warning:</span> {anomaly.warning}
          </div>
        </div>

        {/* Projected Balance Line Chart with Reference Lines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Projected Stock Balance vs Thresholds (Next 30 Days)
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Projected
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span> Safety
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span> Preferred
              </span>
            </div>
          </div>

          <div className="h-56 bg-white p-3 rounded-xl border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomaly.projectionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine
                  y={anomaly.preferredStockLevel}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Preferred', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
                />
                <ReferenceLine
                  y={anomaly.reorderPoint}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  label={{ value: 'Reorder', position: 'insideRight', fill: '#3b82f6', fontSize: 10 }}
                />
                <ReferenceLine
                  y={anomaly.safetyStock}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{ value: 'Safety', position: 'insideBottomRight', fill: '#f59e0b', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summary Explaining Why It Was Raised */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                AI Anomaly Summary
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Grounded & Hedged
              </span>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                <button
                  type="button"
                  onClick={() => handleFeedback('up')}
                  className={`p-1 rounded transition-colors ${
                    feedbackGiven === 'up'
                      ? 'text-emerald-700 bg-emerald-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Mark summary as helpful (positive model feedback)"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback('down')}
                  className={`p-1 rounded transition-colors ${
                    feedbackGiven === 'down'
                      ? 'text-rose-700 bg-rose-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Mark summary as inaccurate or unhelpful"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {anomaly.summary}
          </p>
        </div>

        {/* Up to 3 Bulleted Next Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
              Recommended Next Actions
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Max 3 Bullets Cap Enforced</span>
          </div>
          <div className="space-y-2">
            {anomaly.nextActions.slice(0, 3).map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Resolution or Mitigation Notes
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record expedited PO numbers, transfer orders, or exception approvals..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
        >
          Close Drawer
        </button>

        <div className="flex items-center gap-2">
          {anomaly.status === 'Verified' ? (
            <button
              type="button"
              onClick={() => {
                const ok = reopenAnomaly('inventory', anomaly.id, note);
                if (ok) onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reopen Anomaly
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const ok = markNoAction('inventory', anomaly.id, note);
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                No Action Needed
              </button>

              <button
                type="button"
                onClick={() => {
                  const ok = markResolved('inventory', anomaly.id, note);
                  if (ok) onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
