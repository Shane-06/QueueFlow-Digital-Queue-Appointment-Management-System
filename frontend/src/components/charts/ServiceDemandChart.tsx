import React from 'react';

interface ServiceDemand {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const DEFAULT_DEMAND: ServiceDemand[] = [
  { name: 'Transcript Verification', count: 38, percentage: 35, color: 'bg-[#0f243d]' },
  { name: 'Bonafide Certificate', count: 28, percentage: 26, color: 'bg-brand-600' },
  { name: 'Fee & Accounts Assistance', count: 18, percentage: 17, color: 'bg-slate-700' },
  { name: 'Scholarship Verification', count: 12, percentage: 11, color: 'bg-amber-600' },
  { name: 'ID Card & Other Services', count: 12, percentage: 11, color: 'bg-slate-400' },
];

export const ServiceDemandChart: React.FC<{ items?: ServiceDemand[] }> = ({
  items = DEFAULT_DEMAND,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-medium text-slate-500">Demand by Service (Today)</span>
        <span className="text-slate-400">108 total requests</span>
      </div>

      {/* Progress segmented bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 mb-4">
        {items.map((item) => (
          <div
            key={item.name}
            style={{ width: `${item.percentage}%` }}
            className={`${item.color} h-full transition-all`}
            title={`${item.name}: ${item.count} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Breakdown list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-slate-700 font-medium truncate max-w-[200px]">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono">
              <span className="font-semibold text-slate-800">{item.count}</span>
              <span className="text-slate-400">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
