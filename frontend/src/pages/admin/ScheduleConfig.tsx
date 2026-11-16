import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { WorkingSchedule } from '../../types';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
];

export const ScheduleConfig: React.FC = () => {
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<WorkingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getSchedules().then((schedules) => {
      setSchedule(schedules[0] || null);
      setLoading(false);
    });
  }, [dataVersion]);

  const handleDayToggle = (day: number) => {
    if (!schedule) return;
    const current = schedule.daysOfWeek;
    const nextDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setSchedule({ ...schedule, daysOfWeek: nextDays });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;
    setSaving(true);
    try {
      await adminService.updateSchedule(schedule, 'Dr. Sunita Mehra');
      showToast('Operating schedule and capacity limits successfully updated.', 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !schedule) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading schedule...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card">
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
          System Operational Parameters
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Working Hours & Slot Generation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure administrative operating shifts, appointment slot intervals, and blackout dates.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Working Days Card */}
        <Card>
          <CardHeader
            title="Active Operational Days"
            subtitle="Days when college administrative counters accept bookings and walk-ins"
          />
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {DAYS_OF_WEEK.map((item) => {
                const isActive = schedule.daysOfWeek.includes(item.day);
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => handleDayToggle(item.day)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'bg-[#0f243d] text-white border-[#0f243d] shadow-xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[10px] mt-1 ${isActive ? 'text-brand-200' : 'text-slate-400'}`}>
                      {isActive ? 'Active' : 'Closed'}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Operating Shift Hours & Slot Intervals */}
        <Card>
          <CardHeader
            title="Operating Hours & Slot Geometry"
            subtitle="Defines the appointment matrix and queue active period"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Counter Opening Time
                </label>
                <input
                  type="text"
                  value={schedule.startTime}
                  onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none font-mono"
                  placeholder="e.g. 10:00 AM"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Counter Closing Time
                </label>
                <input
                  type="text"
                  value={schedule.endTime}
                  onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none font-mono"
                  placeholder="e.g. 04:00 PM"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lunch Recess Break Start
                </label>
                <input
                  type="text"
                  value={schedule.breakStartTime || '01:00 PM'}
                  onChange={(e) => setSchedule({ ...schedule, breakStartTime: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lunch Recess Break End
                </label>
                <input
                  type="text"
                  value={schedule.breakEndTime || '02:00 PM'}
                  onChange={(e) => setSchedule({ ...schedule, breakEndTime: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Slot Interval Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={schedule.slotDurationMinutes}
                  onChange={(e) =>
                    setSchedule({ ...schedule, slotDurationMinutes: Number(e.target.value) })
                  }
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                  min={5}
                  max={60}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Daily Desk Capacity
                </label>
                <input
                  type="number"
                  value={schedule.dailyCapacity}
                  onChange={(e) =>
                    setSchedule({ ...schedule, dailyCapacity: Number(e.target.value) })
                  }
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                  min={10}
                  max={200}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Academic Holidays / Blackouts */}
        <Card>
          <CardHeader
            title="Institutional Holidays & Blackout Dates"
            subtitle="Dates where appointment bookings and queue generation are disabled"
          />
          <CardBody className="p-0">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Occasion / Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.holidays.map((h, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs font-semibold text-slate-900">{h.date}</td>
                    <td className="text-xs text-slate-700">{h.name}</td>
                    <td>
                      <Badge variant="INACTIVE" size="sm">Counters Closed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Schedule Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
