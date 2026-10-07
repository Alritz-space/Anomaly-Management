import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  description?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  badge,
  badgeColor = 'blue',
  icon,
  isActive,
  onClick,
  description,
}) => {
  const badgeClasses = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    purple: 'text-purple-700 bg-purple-50 border-purple-200',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
  }[badgeColor];

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all text-left ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isActive
          ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-slate-500 truncate">
            {subValue}
          </span>
        )}
      </div>

      {(badge || description) && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${badgeClasses}`}
            >
              {badge}
            </span>
          )}
          {description && (
            <span className="text-slate-500 truncate">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
