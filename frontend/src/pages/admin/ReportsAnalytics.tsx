import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HourlyActivityChart } from '../../components/charts/HourlyActivityChart';
import { ServiceDemandChart } from '../../components/charts/ServiceDemandChart';
import { StatusDistributionChart } from '../../components/charts/StatusDistributionChart';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ReportsAnalytics: React.FC = () => {
  const { showToast } = useToast();

  const handleExportCSV = () => {
    showToast('Exporting operational throughput report to CSV...', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
            Executive Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Operational Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Service level metrics, average waiting time breakdown, and counter utilization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Queue Wait Time
          </span>
          <div className="text-3xl font-bold text-slate-900 mt-1">14.5 mins</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">↓ 2.3 min from last week</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Handling Time
          </span>
          <div className="text-3xl font-bold text-slate-900 mt-1">11.8 mins</div>
          <span className="text-xs text-slate-500 mt-1 block">Per completed student token</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Counter Utilization Rate
          </span>
          <div className="text-3xl font-bold text-emerald-700 mt-1">87.4%</div>
          <span className="text-xs text-slate-500 mt-1 block">Active serving vs idle time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Hourly Queue Traffic Telemetry"
              subtitle="Demand peaks observed at 11:00 AM and 02:00 PM"
            />
            <CardBody>
              <HourlyActivityChart />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader
              title="Departmental Service Demands"
              subtitle="Share of daily traffic by office category"
            />
            <CardBody>
              <ServiceDemandChart />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
