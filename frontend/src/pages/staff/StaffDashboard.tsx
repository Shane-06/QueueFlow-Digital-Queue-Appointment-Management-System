import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { queueService } from '../../services/queueService';
import { counterService } from '../../services/counterService';
import { QueueEntry, Counter } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  PhoneCall,
  CheckCircle2,
  SkipForward,
  PauseCircle,
  Users,
  Clock,
  Building,
  UserCheck,
  AlertCircle,
  RotateCw,
  FileText,
  Radio,
  Play,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();

  const [counter, setCounter] = useState<Counter | null>(null);
  const [currentServing, setCurrentServing] = useState<QueueEntry | null>(null);
  const [waitingList, setWaitingList] = useState<QueueEntry[]>([]);
  const [completedList, setCompletedList] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Complete Dialog State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeRemarks, setCompleteRemarks] = useState('All transcripts verified and attested successfully.');

  // Skip Dialog State
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('Student did not report to counter after 3 calls.');

  const fetchCounterData = async () => {
    setLoading(true);
    try {
      // Default to Counter 2 for Rajesh Kumar
      const counterId = 'cnt-2';
      const data = await queueService.getCounterQueue(counterId);
      setCounter(data.counter);
      setCurrentServing(data.currentServing);
      setWaitingList(data.waitingList);
      setCompletedList(data.completedList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounterData();
  }, [dataVersion]);

  const handleCallNext = async () => {
    if (!counter || !user) return;
    setActionLoading(true);
    try {
      const nextToken = await queueService.callNextToken(counter.id, user);
      showToast(
        `Token ${nextToken.tokenNo} (${nextToken.userName}) has been called to Counter ${counter.counterNumber}.`,
        'success',
        'Token Called'
      );
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Unable to call next token', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartServing = async () => {
    if (!currentServing || !user) return;
    setActionLoading(true);
    try {
      await queueService.startServingToken(currentServing.id, user);
      showToast(`Started serving token ${currentServing.tokenNo}.`, 'info');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update token status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async () => {
    if (!currentServing || !user) return;
    setActionLoading(true);
    try {
      await queueService.completeToken(currentServing.id, user, completeRemarks);
      showToast(
        `Token ${currentServing.tokenNo} marked as COMPLETED.`,
        'success',
        'Service Completed'
      );
      setCompleteModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete token', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipSubmit = async () => {
    if (!currentServing || !user) return;
    setActionLoading(true);
    try {
      await queueService.skipToken(currentServing.id, user, skipReason);
      showToast(`Token ${currentServing.tokenNo} recorded as SKIPPED.`, 'warning');
      setSkipModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to skip token', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHold = async () => {
    if (!currentServing || !user) return;
    setActionLoading(true);
    try {
      await queueService.holdToken(currentServing.id, user);
      showToast(`Token ${currentServing.tokenNo} put on HOLD.`, 'info');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to hold token', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Counter Operator Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Counter Operations Terminal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Counter 2 (Hall A)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Service Console — Counter 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operator: <strong>{user?.name || 'Rajesh Kumar'}</strong> • Academic Affairs & Records (Transcript / Bonafide)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCounterData();
              triggerRefresh();
            }}
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Top 3 Operational KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tokens Waiting
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-0.5">
              {waitingList.length}
            </div>
            <span className="text-[11px] text-slate-400">Next eligible in line</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Status
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {currentServing ? currentServing.tokenNo : 'READY / IDLE'}
            </div>
            <span className="text-[11px] text-slate-400">
              {currentServing ? `${currentServing.status}` : 'Awaiting next call'}
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Today
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-0.5">
              {completedList.filter((c) => c.status === 'COMPLETED').length}
            </div>
            <span className="text-[11px] text-slate-400">Verified & dispatched</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Operational Card: Currently Serving Terminal */}
      <Card className="border-slate-300 shadow-md">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-brand-700" />
              <span>Active Counter Console</span>
            </div>
          }
          subtitle="Call next token, start service, and record completion"
          action={
            currentServing ? (
              <Badge variant={currentServing.status} size="lg" pulse>
                {currentServing.status}
              </Badge>
            ) : (
              <Badge variant="DEFAULT" size="md">Counter Ready</Badge>
            )
          }
        />

        <CardBody className="p-6">
          {currentServing ? (
            <div className="space-y-6">
              {/* Active Token Information Box */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                      NOW AT COUNTER 2
                    </span>
                    <div className="text-4xl font-mono font-extrabold text-[#0f243d] mt-1">
                      {currentServing.tokenNo}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-1">
                      {currentServing.serviceName}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1 sm:min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Student Name:</span>
                      <strong className="text-slate-900 font-semibold">{currentServing.userName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Roll Number:</span>
                      <strong className="font-mono text-slate-800">{currentServing.userRollNo || '2024ME015'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Type:</span>
                      <Badge variant={currentServing.isWalkIn ? 'WALK_IN' : 'APPOINTMENT'} size="sm">
                        {currentServing.isWalkIn ? 'Walk-in' : 'Appointment'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {currentServing.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-700">Request Notes:</strong> {currentServing.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Staff Action Command Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {currentServing.status === 'CALLED' && (
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={actionLoading}
                      onClick={handleStartServing}
                      leftIcon={<Play className="w-4 h-4" />}
                    >
                      Start Serving
                    </Button>
                  )}

                  <Button
                    variant="success"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => setCompleteModalOpen(true)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Complete Service
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHold}
                    disabled={actionLoading}
                    leftIcon={<PauseCircle className="w-4 h-4 text-purple-600" />}
                  >
                    Hold / Requeue
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                    onClick={() => setSkipModalOpen(true)}
                    disabled={actionLoading}
                    leftIcon={<SkipForward className="w-4 h-4" />}
                  >
                    Skip Token
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Idle Counter State - Big Call Next Button */
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <PhoneCall className="w-8 h-8 text-brand-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">Counter 2 is Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There is currently no active token being served. Click <strong>Call Next</strong> to atomically fetch the next waiting student from the FIFO queue.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={actionLoading}
                  disabled={waitingList.length === 0}
                  onClick={handleCallNext}
                  className="px-8 py-3 text-base shadow-md"
                  leftIcon={<PhoneCall className="w-5 h-5" />}
                >
                  CALL NEXT TOKEN {waitingList.length > 0 && `(${waitingList[0].tokenNo})`}
                </Button>
                {waitingList.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2">Queue is currently empty for Counter 2.</p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Waiting Queue List Section */}
      <Card>
        <CardHeader
          title="Waiting Queue (FIFO Order)"
          subtitle={`Eligible tokens for Counter 2 services (${waitingList.length} students waiting)`}
          action={
            !currentServing && waitingList.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleCallNext}
                leftIcon={<PhoneCall className="w-4 h-4" />}
              >
                Call Next ({waitingList[0].tokenNo})
              </Button>
            )
          }
        />

        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Queue Pos</th>
                <th>Token No</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Service</th>
                <th>Type</th>
                <th>Wait Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No students currently waiting in queue for Counter 2.
                  </td>
                </tr>
              ) : (
                waitingList.map((item, idx) => (
                  <tr key={item.id} className={idx === 0 ? 'bg-amber-50/40 font-semibold' : ''}>
                    <td className="font-mono text-xs text-slate-500">#{idx + 1}</td>
                    <td>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-900 rounded border border-slate-300">
                        {item.tokenNo}
                      </span>
                    </td>
                    <td className="text-xs font-medium text-slate-900">{item.userName}</td>
                    <td className="font-mono text-xs text-slate-600">{item.userRollNo || '—'}</td>
                    <td className="text-xs text-slate-700">{item.serviceName}</td>
                    <td>
                      <Badge variant={item.isWalkIn ? 'WALK_IN' : 'APPOINTMENT'} size="sm">
                        {item.isWalkIn ? 'Walk-in' : 'Appointment'}
                      </Badge>
                    </td>
                    <td className="text-xs text-slate-500 font-mono">
                      ~{(idx + 1) * 5} min
                    </td>
                    <td>
                      <Badge variant={item.status} size="sm">{item.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service Completion Remarks Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Service Verification"
        subtitle={`Token: ${currentServing?.tokenNo} • Student: ${currentServing?.userName}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              isLoading={actionLoading}
              onClick={handleCompleteSubmit}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Record Completion
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
            <div className="font-bold text-sm">Service Completion Acknowledgment</div>
            <p className="mt-1 text-xs text-emerald-800">
              Confirm that {currentServing?.userName}&apos;s request for {currentServing?.serviceName} has been fully serviced.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution Remarks / Dispatched Certificate No
            </label>
            <textarea
              value={completeRemarks}
              onChange={(e) => setCompleteRemarks(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Skip Confirmation Modal */}
      <Modal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        title="Skip Token"
        subtitle={`Token: ${currentServing?.tokenNo} • Student: ${currentServing?.userName}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSkipModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={actionLoading}
              onClick={handleSkipSubmit}
              leftIcon={<SkipForward className="w-4 h-4" />}
            >
              Confirm Skip
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <strong className="block font-semibold">Skip Notice:</strong>
            <span className="text-[11px] text-amber-800 mt-0.5 block">
              Skipping this token will mark it as skipped and free the counter for the next student.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason for Skipping
            </label>
            <input
              type="text"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
