import React from 'react';

interface HourlyData {
  hour: string;
  appointments: number;
  walkIns: number;
}

const DEFAULT_DATA: HourlyData[] = [
  { hour: '10 AM', appointments: 12, walkIns: 8 },
  { hour: '11 AM', appointments: 18, walkIns: 14 },
  { hour: '12 PM', appointments: 15, walkIns: 10 },
  { hour: '01 PM', appointments: 4, walkIns: 2 }, // Lunch break period
  { hour: '02 PM', appointments: 16, walkIns: 12 },
  { hour: '03 PM', appointments: 14, walkIns: 9 },
  { hour: '04 PM', appointments: 8, walkIns: 5 },
];

export const HourlyActivityChart: React.FC<{ data?: HourlyData[] }> = ({
  data = DEFAULT_DATA,
}) => {
  const maxValue = Math.max(...data.map((d) => d.appointments + d.walkIns), 35);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-medium text-slate-500">Hourly Throughput (Today)</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0f243d]" />
            <span className="text-slate-600">Appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-brand-400" />
            <span className="text-slate-600">Walk-ins</span>
          </div>
        </div>
      </div>

      {/* Bar graph container */}
      <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200">
        {data.map((item) => {
          const apptHeight = (item.appointments / maxValue) * 100;
          const walkInHeight = (item.walkIns / maxValue) * 100;
          const total = item.appointments + item.walkIns;

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[11px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                {total} total ({item.appointments} appt, {item.walkIns} walk-in)
              </div>

              {/* Stacked bar */}
              <div className="w-full max-w-[28px] flex flex-col items-stretch justify-end h-full rounded-t-sm overflow-hidden bg-slate-100">
                <div
                  style={{ height: `${walkInHeight}%` }}
                  className="bg-brand-400 transition-all duration-300 w-full"
                />
                <div
                  style={{ height: `${apptHeight}%` }}
                  className="bg-[#0f243d] transition-all duration-300 w-full"
                />
              </div>

              <span className="text-[11px] font-medium text-slate-500">{item.hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
