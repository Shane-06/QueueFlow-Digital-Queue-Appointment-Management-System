import React from 'react';

export type BadgeVariant =
  | 'WAITING'
  | 'CALLED'
  | 'SERVING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'HOLD'
  | 'NO_SHOW'
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'WALK_IN'
  | 'APPOINTMENT'
  | 'DEFAULT';

interface BadgeProps {
  variant?: BadgeVariant | string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'DEFAULT',
  children,
  size = 'md',
  className = '',
  pulse = false,
}) => {
  const norm = variant.toUpperCase().replace(/\s+/g, '_');

  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (norm) {
    case 'WAITING':
    case 'PENDING':
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'CALLED':
      styleClasses = 'bg-blue-50 text-blue-800 border-blue-400 font-semibold ring-1 ring-blue-400/30';
      break;
    case 'SERVING':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-semibold ring-1 ring-emerald-400/30';
      break;
    case 'COMPLETED':
      styleClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'CANCELLED':
    case 'SKIPPED':
    case 'NO_SHOW':
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-300';
      break;
    case 'HOLD':
      styleClasses = 'bg-purple-50 text-purple-800 border-purple-300';
      break;
    case 'BOOKED':
    case 'CHECKED_IN':
      styleClasses = 'bg-cyan-50 text-cyan-800 border-cyan-300';
      break;
    case 'ACTIVE':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'INACTIVE':
      styleClasses = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'WALK_IN':
      styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'APPOINTMENT':
      styleClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    default:
      styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium tracking-tight ${sizeClasses} ${styleClasses} ${className}`}
    >
      {(pulse || norm === 'CALLED' || norm === 'SERVING') && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              norm === 'SERVING' ? 'bg-emerald-400' : 'bg-blue-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              norm === 'SERVING' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
          />
        </span>
      )}
      {children || variant}
    </span>
  );
};
