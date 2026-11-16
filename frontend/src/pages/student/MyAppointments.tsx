import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  CalendarCheck,
  Search,
  Calendar,
  Clock,
  Building,
  AlertTriangle,
  XCircle,
  FileText,
  CalendarPlus,
  Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Details Modal State
  const [detailsModalApt, setDetailsModalApt] = useState<Appointment | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    appointmentService
      .getMyAppointments(user.id)
      .then((data) => setAppointments(data))
      .finally(() => setLoading(false));
  }, [user, dataVersion]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.tokenNo && apt.tokenNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalApt) return;
    setSubmittingCancel(true);
    try {
      await appointmentService.cancelAppointment(
        cancelModalApt.id,
        cancelReason || 'Cancelled by student'
      );
      showToast(
        `Appointment ${cancelModalApt.referenceNo} has been cancelled.`,
        'info',
        'Appointment Cancelled'
      );
      triggerRefresh();
      setCancelModalApt(null);
      setCancelReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
            Booking Records & History
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            My Appointments & Tokens
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your scheduled campus visits, token assignments, and past verification records.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/student/appointments/new')}
          leftIcon={<CalendarPlus className="w-4 h-4" />}
        >
          Book New Appointment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'BOOKED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? 'bg-[#0f243d] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Bookings' : status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, token..."
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none w-full sm:w-64 bg-white"
            />
          </div>
        </CardBody>
      </Card>

      {/* Appointments Data Table */}
      <Card>
        <CardHeader
          title="Appointments Log"
          subtitle={`Showing ${filteredAppointments.length} matching records`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Reference No</th>
                <th>Service & Office</th>
                <th>Date & Time</th>
                <th>Token</th>
                <th>Counter</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No appointments matching your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const canCancel =
                    apt.status === 'BOOKED' || apt.status === 'CHECKED_IN';

                  return (
                    <tr key={apt.id}>
                      <td className="font-mono font-semibold text-xs text-slate-900">
                        {apt.referenceNo}
                      </td>

                      <td>
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {apt.serviceName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {apt.office}
                        </div>
                      </td>

                      <td className="text-xs text-slate-700 font-mono">
                        <div>{apt.slotDate}</div>
                        <div className="text-slate-500 text-[11px]">{apt.slotTime}</div>
                      </td>

                      <td>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {apt.tokenNo || 'N/A'}
                        </span>
                      </td>

                      <td className="text-xs text-slate-700">
                        Counter {apt.counterNumber || 2}
                      </td>

                      <td>
                        <Badge variant={apt.status}>{apt.status}</Badge>
                      </td>

                      <td className="text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailsModalApt(apt)}
                        >
                          Details
                        </Button>

                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            onClick={() => setCancelModalApt(apt)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalApt}
        onClose={() => setCancelModalApt(null)}
        title="Cancel Appointment"
        subtitle={`Reference: ${cancelModalApt?.referenceNo}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalApt(null)}
              disabled={submittingCancel}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={submittingCancel}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Are you sure you want to cancel this appointment?</strong>
              <span className="text-[11px] text-rose-800 mt-0.5 block">
                This action will release your reserved slot ({cancelModalApt?.slotTime} on {cancelModalApt?.slotDate}) and void token {cancelModalApt?.tokenNo}.
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, document delay..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!detailsModalApt}
        onClose={() => setDetailsModalApt(null)}
        title="Appointment Specifications"
        subtitle={`Reference: ${detailsModalApt?.referenceNo}`}
        footer={
          <Button variant="primary" size="sm" onClick={() => setDetailsModalApt(null)}>
            Close
          </Button>
        }
      >
        {detailsModalApt && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Status</span>
                  <Badge variant={detailsModalApt.status} size="md">
                    {detailsModalApt.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Token Number</span>
                  <span className="font-mono font-bold text-sm px-2 py-0.5 bg-brand-100 text-brand-900 rounded border border-brand-200">
                    {detailsModalApt.tokenNo || 'TV-024'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Service</span>
                  <strong className="text-slate-900 font-semibold">{detailsModalApt.serviceName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Counter</span>
                  <strong className="text-slate-900 font-semibold">Counter {detailsModalApt.counterNumber || 2}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Date</span>
                  <strong className="text-slate-900 font-semibold">{detailsModalApt.slotDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Time</span>
                  <strong className="text-slate-900 font-semibold">{detailsModalApt.slotTime}</strong>
                </div>
              </div>
            </div>

            {detailsModalApt.notes && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Student Notes:</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600">
                  {detailsModalApt.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
