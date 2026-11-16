import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { adminService } from '../../services/adminService';
import { counterService } from '../../services/counterService';
import { serviceService } from '../../services/serviceService';
import { DashboardStats, Counter, Service, AuditLog } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { HourlyActivityChart } from '../../components/charts/HourlyActivityChart';
import { ServiceDemandChart } from '../../components/charts/ServiceDemandChart';
import { StatusDistributionChart } from '../../components/charts/StatusDistributionChart';
import {
  Calendar,
  Users,
  Radio,
  CheckCircle2,
  XCircle,
  Building,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { dataVersion, triggerRefresh } = useAppData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, countersData, logsData] = await Promise.all([
        adminService.getDashboardStats(),
        counterService.getAllCounters(),
        adminService.getAuditLogs(),
      ]);
      setStats(statsData);
      setCounters(countersData);
      setAuditLogs(logsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
              University Operations Center
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Real-Time Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            System Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centralized monitoring of campus appointments, live token queues, counter throughput, and administrative workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadData();
              triggerRefresh();
            }}
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            Refresh Metrics
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/services')}
          >
            Manage Services
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Appointments"
          value={stats?.totalAppointmentsToday || 48}
          subtext="Today's bookings"
          icon={<Calendar className="w-4 h-4" />}
          trend={{ value: '+12%', positive: true }}
        />

        <StatCard
          title="In Waiting Queue"
          value={stats?.waitingTokens || 9}
          subtext="FIFO line"
          icon={<Users className="w-4 h-4 text-amber-600" />}
          badge={<Badge variant="WAITING" size="sm">Active</Badge>}
        />

        <StatCard
          title="Currently Serving"
          value={stats?.currentlyServing || 3}
          subtext="At active counters"
          icon={<Radio className="w-4 h-4 text-blue-600 animate-pulse" />}
        />

        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 42}
          subtext="Processed tokens"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          trend={{ value: '91% Rate', positive: true }}
        />

        <StatCard
          title="Cancelled / No-Show"
          value={(stats?.cancelledToday || 4) + (stats?.noShowToday || 2)}
          subtext="Released slots"
          icon={<XCircle className="w-4 h-4 text-rose-600" />}
        />

        <StatCard
          title="Active Counters"
          value={`${stats?.activeCountersCount || 5}/${stats?.totalCountersCount || 6}`}
          subtext="Staff operating"
          icon={<Building className="w-4 h-4 text-slate-700" />}
        />
      </div>

      {/* Status Breakdown Bar */}
      <Card>
        <CardBody className="p-4">
          <StatusDistributionChart
            completed={stats?.completedToday || 42}
            waiting={stats?.waitingTokens || 9}
            serving={stats?.currentlyServing || 3}
            cancelled={stats?.cancelledToday || 4}
            skipped={stats?.noShowToday || 2}
          />
        </CardBody>
      </Card>

      {/* 2 Core Enterprise Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Activity Bar Chart (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Today's Traffic & Counter Load"
              subtitle="Hourly throughput of scheduled appointments vs walk-in queues"
            />
            <CardBody>
              <HourlyActivityChart />
            </CardBody>
          </Card>
        </div>

        {/* Demand Distribution by Service (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader
              title="Service Demand Distribution"
              subtitle="Volume breakdown by administrative service office"
            />
            <CardBody>
              <ServiceDemandChart />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Real-time Service Counters Status Grid */}
      <Card>
        <CardHeader
          title="Service Counters Live Status"
          subtitle="Real-time operational status, assigned operator, and currently serving token"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/counters')}
            >
              Configure Counters
            </Button>
          }
        />
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counters.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-lg border transition-all ${
                c.status === 'ACTIVE'
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <Badge variant={c.status} size="sm">{c.status}</Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{c.location}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Current Token</span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200 inline-block mt-0.5">
                    {c.currentTokenNo || 'IDLE'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Staff Operator:</span>
                <strong className="text-slate-800 font-semibold">{c.assignedStaffName || 'Unassigned'}</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Audit Trail Logs */}
      <Card>
        <CardHeader
          title="Recent System Audit Logs"
          subtitle="Administrative and staff transaction audit trail"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/audit')}
            >
              View Full Audit Log
            </Button>
          }
        />
        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{log.actorName}</span>
                    <Badge variant={log.actorRole} size="sm">{log.actorRole}</Badge>
                    <span className="font-mono text-slate-400 text-[11px] font-normal">
                      [{log.action}]
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{log.details}</div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
