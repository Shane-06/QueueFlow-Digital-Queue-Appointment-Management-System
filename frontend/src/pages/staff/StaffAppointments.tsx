import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Search, Clock, Building, User, FileText } from 'lucide-react';

export const StaffAppointments: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion } = useAppData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    appointmentService
      .getAllAppointments()
      .then((data) => {
        // Filter for Counter 2 assigned services (Transcript Verification, Bonafide)
        const counterApts = data.filter(
          (a) => a.counterNumber === 2 || a.serviceId === 'srv-1' || a.serviceId === 'srv-2'
        );
        setAppointments(counterApts);
      })
      .finally(() => setLoading(false));
  }, [dataVersion]);

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tokenNo && a.tokenNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider font-mono">
            Counter 2 Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Today&apos;s Booked Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Scheduled student appointments mapped to Counter 2 (Academic Affairs).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="ACTIVE" size="lg">Counter 2 Operator: Rajesh Kumar</Badge>
        </div>
      </div>

      <Card>
        <CardBody className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'BOOKED', 'CHECKED_IN', 'SERVING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-[#0f243d] text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Counter Appointments' : st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student, token..."
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none w-full sm:w-60 bg-white"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Scheduled Appointments Table"
          subtitle={`Showing ${filtered.length} appointment entries`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Service</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-900 rounded border border-slate-300">
                        {apt.tokenNo || '—'}
                      </span>
                    </td>
                    <td className="font-semibold text-xs text-slate-900">{apt.userName}</td>
                    <td className="font-mono text-xs text-slate-600">{apt.userRollNo || '—'}</td>
                    <td className="text-xs text-slate-700">{apt.serviceName}</td>
                    <td className="font-mono text-xs text-slate-700">{apt.slotTime}</td>
                    <td>
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs truncate">
                      {apt.notes || '—'}
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
