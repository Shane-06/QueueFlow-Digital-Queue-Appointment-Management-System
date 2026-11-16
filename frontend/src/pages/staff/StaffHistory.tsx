import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { queueService } from '../../services/queueService';
import { QueueEntry } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { History, CheckCircle2, Clock } from 'lucide-react';

export const StaffHistory: React.FC = () => {
  const { dataVersion } = useAppData();
  const [completedList, setCompletedList] = useState<QueueEntry[]>([]);

  useEffect(() => {
    queueService.getCounterQueue('cnt-2').then((data) => {
      setCompletedList(data.completedList);
    });
  }, [dataVersion]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card">
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider font-mono">
          Audit & History
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Counter 2 Service History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Archived log of all tokens served, completed, and skipped at Counter 2 today.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Completed / Processed Tokens Today"
          subtitle={`Showing ${completedList.length} processed records`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Student Name</th>
                <th>Service</th>
                <th>Completed At</th>
                <th>Status</th>
                <th>Remarks / Outcome</th>
              </tr>
            </thead>
            <tbody>
              {completedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No completed records yet today.
                  </td>
                </tr>
              ) : (
                completedList.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-900 rounded border border-slate-300">
                        {entry.tokenNo}
                      </span>
                    </td>
                    <td className="font-semibold text-xs text-slate-900">{entry.userName}</td>
                    <td className="text-xs text-slate-700">{entry.serviceName}</td>
                    <td className="font-mono text-xs text-slate-600">
                      {entry.completedAt ? new Date(entry.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <Badge variant={entry.status}>{entry.status}</Badge>
                    </td>
                    <td className="text-xs text-slate-500">
                      {entry.notes || 'Service successfully completed.'}
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
