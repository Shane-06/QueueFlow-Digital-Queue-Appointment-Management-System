import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { queueService } from '../../services/queueService';
import { QueueEntry, Counter } from '../../types';
import { getStoredQueue, getStoredCounters } from '../../services/storage';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Radio,
  Users,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QueueLiveTracker: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const [activeEntry, setActiveEntry] = useState<QueueEntry | null>(null);
  const [allQueueForService, setAllQueueForService] = useState<QueueEntry[]>([]);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQueueState = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const entry = await queueService.getMyActiveQueueEntry(user.id);
      setActiveEntry(entry);

      const allQueue = getStoredQueue();
      const counters = getStoredCounters();

      if (entry) {
        // Filter queue for this service & today
        const serviceQueue = allQueue.filter(
          (q) => q.serviceId === entry.serviceId && q.queueDate === entry.queueDate
        );
        setAllQueueForService(serviceQueue);

        const assignedCounter = counters.find((c) => c.id === entry.counterId) || counters[1];
        setCounter(assignedCounter);
      } else {
        // Fallback demo queue display
        setAllQueueForService(allQueue.filter((q) => q.serviceId === 'srv-1'));
        setCounter(counters[1]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueState();
  }, [user, dataVersion]);

  // Determine current serving token for this counter/service
  const currentServingToken =
    allQueueForService.find((q) => q.status === 'SERVING' || q.status === 'CALLED') || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live FIFO Queue Telemetry
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Counter 2 (Academic Affairs)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Digital Queue Live Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time token sequence updates. Approach the service counter when your token is called.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            leftIcon={soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            title="Toggle audio alert chime"
          >
            {soundEnabled ? 'Chime ON' : 'Muted'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchQueueState();
              triggerRefresh();
            }}
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* When Called: High-Priority Emergency Callout Banner */}
      {activeEntry?.status === 'CALLED' && (
        <div className="p-5 bg-blue-600 text-white rounded-xl shadow-lg border border-blue-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-white/20 rounded-full">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Turn Alert • Immediate Action Required
              </div>
              <div className="text-lg sm:text-xl font-extrabold mt-0.5">
                YOUR TOKEN ({activeEntry.tokenNo}) HAS BEEN CALLED!
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Please proceed immediately to <strong>Counter {activeEntry.counterNumber || 2}</strong> ({counter?.location || 'Admin Block Ground Floor - Hall A'}).
              </p>
            </div>
          </div>
          <Badge variant="CALLED" size="lg" className="bg-white text-blue-900 border-white font-bold">
            PROCEED NOW
          </Badge>
        </div>
      )}

      {/* Main Token Display Dashboard */}
      {activeEntry ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Big Token Card */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-300 shadow-md">
              <div className="p-6 sm:p-8 text-center bg-radial from-slate-50 to-white rounded-t-lg border-b border-slate-200">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
                  YOUR ASSIGNED TOKEN
                </span>

                {/* Big Token Typography */}
                <div className="text-5xl sm:text-6xl font-mono font-extrabold text-[#0f243d] mt-2 tracking-tight">
                  {activeEntry.tokenNo}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant={activeEntry.status} size="lg" pulse>
                    STATUS: {activeEntry.status}
                  </Badge>
                  {activeEntry.isWalkIn ? (
                    <Badge variant="WALK_IN" size="lg">Walk-in</Badge>
                  ) : (
                    <Badge variant="APPOINTMENT" size="lg">Booked Appointment</Badge>
                  )}
                </div>

                <div className="mt-4 text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{activeEntry.serviceName} • Counter {activeEntry.counterNumber || 2}</span>
                </div>
              </div>

              {/* Real-time Telemetry 3-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/60 p-4 sm:p-6 text-center">
                <div className="p-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Currently Serving
                  </span>
                  <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">
                    {currentServingToken?.tokenNo || 'TV-019'}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Counter {counter?.counterNumber || 2}
                  </span>
                </div>

                <div className="p-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    People Ahead
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {activeEntry.peopleAhead !== undefined ? activeEntry.peopleAhead : 4}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">In waiting line</span>
                </div>

                <div className="p-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Estimated Wait
                  </span>
                  <div className="text-2xl font-bold text-amber-700 mt-1">
                    ~{activeEntry.estimatedWaitMinutes || 20} min
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Calculated in real-time</span>
                </div>
              </div>
            </Card>

            {/* Service & Counter Location Details */}
            <Card>
              <CardHeader
                title="Service Counter Information"
                subtitle="Location and counter operator details"
              />
              <CardBody className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Location</span>
                    <strong className="text-slate-900 font-semibold block mt-0.5">
                      {counter?.location || 'Admin Block Ground Floor - Hall A'}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Counter Operator</span>
                    <strong className="text-slate-900 font-semibold block mt-0.5">
                      {counter?.assignedStaffName || 'Rajesh Kumar (Operator)'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-between">
                  <span>Queue Joined At: <strong className="font-mono text-slate-800">{new Date(activeEntry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  <span className="font-mono text-slate-500">Service Code: TV</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right 5 Cols: Live Queue Timeline & Stream */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center justify-between w-full">
                    <span>Queue Sequence Timeline</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      {allQueueForService.filter((q) => q.status === 'WAITING').length} waiting
                    </span>
                  </div>
                }
                subtitle="Strict First-In-First-Out (FIFO) queue order"
              />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                  {/* Current Serving at top */}
                  {currentServingToken && (
                    <div className="p-3.5 bg-emerald-50/70 flex items-center justify-between border-l-4 border-emerald-500">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          ▶
                        </span>
                        <div>
                          <div className="font-mono font-bold text-xs sm:text-sm text-emerald-950">
                            {currentServingToken.tokenNo} (Now Serving)
                          </div>
                          <div className="text-[11px] text-emerald-800">
                            Counter {currentServingToken.counterNumber || 2}
                          </div>
                        </div>
                      </div>
                      <Badge variant="SERVING" size="sm" pulse>SERVING</Badge>
                    </div>
                  )}

                  {/* Waiting sequence */}
                  {allQueueForService
                    .filter((q) => q.status === 'WAITING')
                    .map((item, index) => {
                      const isMe = item.id === activeEntry.id || item.tokenNo === activeEntry.tokenNo;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 flex items-center justify-between transition-colors ${
                            isMe
                              ? 'bg-brand-50/90 border-l-4 border-[#0f243d] font-semibold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-400 w-5">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                {item.tokenNo}
                                {isMe && (
                                  <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.2 rounded bg-[#0f243d] text-white">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-normal">
                                Joined {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          <Badge variant={item.status} size="sm">
                            {item.status}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        /* Empty Queue State */
        <Card className="text-center py-12">
          <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Active Queue Token</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You are not currently in any waiting line. You can join a digital walk-in queue or book an administrative appointment.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/services')}
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Browse Services & Join Queue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/appointments/new')}
            >
              Schedule an Appointment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
