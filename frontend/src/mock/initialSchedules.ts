import { WorkingSchedule } from '../types';

export const INITIAL_SCHEDULES: WorkingSchedule[] = [
  {
    id: 'sch-default',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    slotDurationMinutes: 15,
    dailyCapacity: 40,
    breakStartTime: '01:00 PM',
    breakEndTime: '02:00 PM',
    holidays: [
      { date: '2026-10-02', name: 'Gandhi Jayanti' },
      { date: '2026-10-20', name: 'Dussehra / Vijayadashami' },
      { date: '2026-11-08', name: 'Diwali Festival' },
      { date: '2026-12-25', name: 'Christmas Day' },
    ],
  },
];
