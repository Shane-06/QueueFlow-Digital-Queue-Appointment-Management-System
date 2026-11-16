import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  badge,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-card flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[#0f243d] shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtext || trend || badge) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.neutral
                    ? 'text-slate-600'
                    : trend.positive
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
};
