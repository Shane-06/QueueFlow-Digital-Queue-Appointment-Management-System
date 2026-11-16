import React from 'react';

interface StatusItem {
  label: string;
  count: number;
  color: string;
  textColor: string;
  bgLight: string;
}

export const StatusDistributionChart: React.FC<{
  completed?: number;
  waiting?: number;
  serving?: number;
  cancelled?: number;
  skipped?: number;
}> = ({
  completed = 42,
  waiting = 9,
  serving = 3,
  cancelled = 4,
  skipped = 2,
}) => {
  const total = completed + waiting + serving + cancelled + skipped;

  const items: StatusItem[] = [
    { label: 'Completed', count: completed, color: '#16a34a', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50' },
    { label: 'Serving', count: serving, color: '#2563eb', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    { label: 'Waiting', count: waiting, color: '#d97706', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
    { label: 'Cancelled', count: cancelled, color: '#64748b', textColor: 'text-slate-700', bgLight: 'bg-slate-50' },
    { label: 'Skipped', count: skipped, color: '#dc2626', textColor: 'text-rose-700', bgLight: 'bg-rose-50' },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.label}
              className={`p-3 rounded-lg border border-slate-200/80 ${item.bgLight} flex flex-col justify-between`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-xl font-bold ${item.textColor}`}>{item.count}</span>
                <span className="text-[11px] font-mono text-slate-400">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
