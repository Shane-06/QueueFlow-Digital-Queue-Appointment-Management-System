import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, Search, ShieldCheck, Clock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { dataVersion } = useAppData();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  useEffect(() => {
    adminService.getAuditLogs().then((data) => setLogs(data));
  }, [dataVersion]);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card">
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
          Security & Compliance
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          System Audit Trail Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable institutional audit record of administrative adjustments, bookings, and counter transactions.
        </p>
      </div>

      <Card>
        <CardBody className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'APPOINTMENT', 'QUEUE', 'SERVICE', 'COUNTER', 'SCHEDULE'].map((type) => (
              <button
                key={type}
                onClick={() => setEntityFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  entityFilter === type
                    ? 'bg-[#0f243d] text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none w-full sm:w-60 bg-white"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Audit Trail Records"
          subtitle={`Showing ${filtered.length} timestamped audit entries`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Transaction Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="font-semibold text-xs text-slate-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td>
                      <Badge variant={log.actorRole} size="sm">
                        {log.actorRole}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-800">
                      {log.action}
                    </td>
                    <td>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="text-xs text-slate-700 max-w-md leading-relaxed">
                      {log.details}
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
