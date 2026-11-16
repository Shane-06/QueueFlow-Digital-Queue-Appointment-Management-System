import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { queueService } from '../../services/queueService';
import { QueueEntry } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, PhoneCall, RotateCw, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const StaffQueueList: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [queueData, setQueueData] = useState<{
    waitingList: QueueEntry[];
    currentServing: QueueEntry | null;
    completedList: QueueEntry[];
  }>({
    waitingList: [],
    currentServing: null,
    completedList: [],
  });

  const fetchQueue = async () => {
    const data = await queueService.getCounterQueue('cnt-2');
    setQueueData({
      waitingList: data.waitingList,
      currentServing: data.currentServing,
      completedList: data.completedList,
    });
  };

  useEffect(() => {
    fetchQueue();
  }, [dataVersion]);

  const handleCallNext = async () => {
    if (!user) return;
    try {
      const nextToken = await queueService.callNextToken('cnt-2', user);
      showToast(`Called token ${nextToken.tokenNo}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error calling token', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider font-mono">
            Live Stream
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Today&apos;s Full Queue Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time FIFO queue stream for Transcript Verification and Bonafide services.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCallNext}
          disabled={!user || queueData.waitingList.length === 0}
          leftIcon={<PhoneCall className="w-4 h-4" />}
        >
          Call Next In Line
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Active Waiting Line"
          subtitle={`${queueData.waitingList.length} students currently queued in FIFO sequence`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Queue Pos</th>
                <th>Token</th>
                <th>Student</th>
                <th>Roll No</th>
                <th>Service</th>
                <th>Type</th>
                <th>Time Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queueData.waitingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    Queue is empty.
                  </td>
                </tr>
              ) : (
                queueData.waitingList.map((item, idx) => (
                  <tr key={item.id} className={idx === 0 ? 'bg-amber-50/40' : ''}>
                    <td className="font-mono text-xs text-slate-500">#{idx + 1}</td>
                    <td>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-900 rounded border border-slate-300">
                        {item.tokenNo}
                      </span>
                    </td>
                    <td className="font-semibold text-xs text-slate-900">{item.userName}</td>
                    <td className="font-mono text-xs text-slate-600">{item.userRollNo || '—'}</td>
                    <td className="text-xs text-slate-700">{item.serviceName}</td>
                    <td>
                      <Badge variant={item.isWalkIn ? 'WALK_IN' : 'APPOINTMENT'} size="sm">
                        {item.isWalkIn ? 'Walk-in' : 'Appointment'}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs text-slate-500">
                      {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
};
