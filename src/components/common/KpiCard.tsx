import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate' | 'redwood';
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
  badgeColor = 'redwood',
  icon,
  isActive,
  onClick,
  description,
}) => {
  const badgeClasses = {
    emerald: 'text-emerald-800 bg-[#edf7f0] border-emerald-200/80',
    amber: 'text-[#874b12] bg-[#fdf4e8] border-[#f2dcc3]',
    blue: 'text-[#782e1b] bg-[#f7ebe6] border-[#eccdc2]',
    redwood: 'text-[#8d3c26] bg-[#fbf0eb] border-[#ebd0c5]',
    purple: 'text-stone-700 bg-stone-100 border-stone-200',
    slate: 'text-stone-600 bg-stone-100 border-stone-200',
  }[badgeColor];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-150 text-left ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isActive
          ? 'bg-white border-[#8d3c26] shadow-[0_4px_16px_rgba(141,60,38,0.08)] ring-1 ring-[#8d3c26]'
          : 'bg-white/90 border-[#ebdcd3] hover:border-[#cb9f8f] hover:bg-white hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 truncate">
          {label}
        </span>
        {icon && <span className="text-[#a4543d]">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-stone-900">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-normal text-stone-500 truncate">
            {subValue}
          </span>
        )}
      </div>

      {(badge || description) && (
        <div className="mt-3 pt-2.5 border-t border-[#f4eae3] flex items-center justify-between gap-2 text-xs">
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] border ${badgeClasses}`}
            >
              {badge}
            </span>
          )}
          {description && (
            <span className="text-stone-500 text-[11px] truncate">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
