import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { appointmentService } from '../../services/appointmentService';
import { queueService } from '../../services/queueService';
import { Appointment, QueueEntry } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  Radio,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CalendarPlus,
  Compass,
  FileCheck,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion } = useAppData();
  const [upcomingApt, setUpcomingApt] = useState<Appointment | null>(null);
  const [activeQueue, setActiveQueue] = useState<QueueEntry | null>(null);
  const [allApts, setAllApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      appointmentService.getMyAppointments(user.id),
      queueService.getMyActiveQueueEntry(user.id),
    ])
      .then(([apts, queueEntry]) => {
        setAllApts(apts);
        // Find upcoming booked appointment
        const upcoming = apts.find(
          (a) => a.status === 'BOOKED' || a.status === 'CHECKED_IN' || a.status === 'SERVING'
        );
        setUpcomingApt(upcoming || null);
        setActiveQueue(queueEntry);
      })
      .finally(() => setLoading(false));
  }, [user, dataVersion]);

  return (
    <div className="space-y-6">
      {/* Student Welcome & Identity Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
              Student Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Roll: {user?.rollNumber || '2023CS042'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Good morning, {user?.name?.split(' ')[0] || 'Aarav'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Department of {user?.department || 'Computer Science & Engineering'} • Semester 5
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/student/appointments/new')}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            Book Appointment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/services')}
            leftIcon={<Compass className="w-4 h-4" />}
          >
            Browse Services
          </Button>
        </div>
      </div>

      {/* Main Dual Cards: Upcoming Appointment & Live Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Upcoming Appointment */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-700" />
                  <span>Upcoming Appointment</span>
                </div>
              }
              subtitle="Confirmed administrative office booking"
              action={
                upcomingApt && (
                  <Badge variant={upcomingApt.status}>
                    {upcomingApt.status}
                  </Badge>
                )
              }
            />

            <CardBody>
              {upcomingApt ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-base font-bold text-slate-900 leading-snug">
                      {upcomingApt.serviceName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{upcomingApt.office}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/70 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Date & Time</span>
                        <strong className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Today • {upcomingApt.slotTime}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Allocated Token</span>
                        <span className="inline-block mt-0.5 font-mono font-bold text-xs px-2 py-0.5 bg-brand-100 text-brand-900 rounded border border-brand-200">
                          {upcomingApt.tokenNo || 'TV-024'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Service Counter</span>
                        <strong className="text-slate-800 font-semibold block mt-0.5">
                          Counter {upcomingApt.counterNumber || 2}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-1">
                    <span>Reference: <code className="font-mono font-semibold text-slate-700">{upcomingApt.referenceNo}</code></span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No Upcoming Appointments</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You do not have any scheduled appointments for today. You can book an appointment or walk in.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/student/appointments/new')}
                  >
                    Schedule an Appointment
                  </Button>
                </div>
              )}
            </CardBody>
          </div>

          {upcomingApt && (
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-lg flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/appointments')}
              >
                View Appointment Details
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/queue')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Track In Queue
              </Button>
            </div>
          )}
        </Card>

        {/* Card 2: Current Queue Status */}
        <Card className="flex flex-col justify-between border-brand-200">
          <div>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-700 animate-pulse" />
                  <span>Current Queue Status</span>
                </div>
              }
              subtitle="Live token progress & counter tracking"
              action={
                activeQueue ? (
                  <Badge variant={activeQueue.status} pulse>
                    {activeQueue.status}
                  </Badge>
                ) : (
                  <Badge variant="DEFAULT">No Active Token</Badge>
                )
              }
            />

            <CardBody>
              {activeQueue ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-brand-50/40 border border-brand-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-800">
                          Your Active Token
                        </span>
                        <div className="text-3xl font-mono font-bold text-[#0f243d] mt-0.5 tracking-tight">
                          {activeQueue.tokenNo}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {activeQueue.serviceName} • Counter {activeQueue.counterNumber || 2}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Currently Serving</span>
                        <span className="text-lg font-mono font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded border border-emerald-200 inline-block mt-0.5">
                          TV-019
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-brand-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded bg-white text-slate-700 border border-slate-200">
                          <Users className="w-4 h-4 text-brand-700" />
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">People Ahead</span>
                          <strong className="text-slate-900 font-bold text-sm">
                            {activeQueue.peopleAhead !== undefined ? activeQueue.peopleAhead : 4} people
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded bg-white text-slate-700 border border-slate-200">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Estimated Wait</span>
                          <strong className="text-slate-900 font-bold text-sm">
                            ~{activeQueue.estimatedWaitMinutes || 20} mins
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeQueue.status === 'CALLED' ? (
                    <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-2 text-xs text-blue-900 font-medium animate-pulse">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Your token has been called! Please proceed immediately to Counter {activeQueue.counterNumber || 2}.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>Status: Waiting for turn in FIFO order</span>
                      <span className="text-brand-700 font-medium">Auto-updating</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Radio className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Not in Any Queue</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You currently do not have an active walk-in or appointment queue token for today.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/student/services')}
                  >
                    Join Walk-in Queue
                  </Button>
                </div>
              )}
            </CardBody>
          </div>

          {activeQueue && (
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-lg flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Counter {activeQueue.counterNumber || 2} • Admin Block
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/queue')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Full Queue Tracker
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions & Recent History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Activity & History"
              subtitle="Your past appointment bookings and queue engagements"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/appointments')}
                >
                  View All History
                </Button>
              }
            />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {allApts.slice(0, 4).map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-mono font-bold text-xs shrink-0">
                        {apt.tokenNo?.slice(0, 2) || 'TV'}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                          {apt.serviceName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{apt.slotDate}</span>
                          <span>•</span>
                          <span>{apt.slotTime}</span>
                          <span>•</span>
                          <span className="font-mono">{apt.referenceNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={apt.status}>{apt.status}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/student/appointments')}
                        className="hidden sm:inline-flex"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 1 Col: Quick Action Shortcuts */}
        <div>
          <Card>
            <CardHeader
              title="Quick Actions"
              subtitle="Frequently accessed student services"
            />
            <CardBody className="space-y-2.5">
              <button
                onClick={() => navigate('/student/appointments/new')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-brand-100 text-brand-800">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-brand-900">
                      Book New Appointment
                    </div>
                    <div className="text-[11px] text-slate-500">Pick service, date & available slot</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/student/services')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-emerald-100 text-emerald-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-brand-900">
                      Join Walk-in Queue
                    </div>
                    <div className="text-[11px] text-slate-500">Instant token for same-day service</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/student/queue')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-100 text-blue-800">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-brand-900">
                      Live Queue Display
                    </div>
                    <div className="text-[11px] text-slate-500">View real-time token calling screen</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all" />
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
