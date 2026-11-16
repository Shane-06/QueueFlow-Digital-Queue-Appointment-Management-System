import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/serviceService';
import { queueService } from '../../services/queueService';
import { Service } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Building,
  Clock,
  Users,
  CalendarPlus,
  Radio,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServicesCatalog: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Walk-in queue modal state
  const [walkInModalService, setWalkInModalService] = useState<Service | null>(null);
  const [walkInNotes, setWalkInNotes] = useState('');
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  // Document checklist modal
  const [docsModalService, setDocsModalService] = useState<Service | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    serviceService
      .getAllServices(false)
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, [dataVersion]);

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.office.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOffice =
      selectedOffice === 'ALL' || s.office.includes(selectedOffice);

    return matchesSearch && matchesOffice;
  });

  const handleJoinQueueSubmit = async () => {
    if (!walkInModalService || !user) return;
    setSubmittingWalkIn(true);
    try {
      const entry = await queueService.joinWalkInQueue(
        walkInModalService.id,
        user,
        walkInNotes
      );
      showToast(
        `Digital Token ${entry.tokenNo} generated! Position: #${(entry.peopleAhead || 0) + 1}`,
        'success',
        'Queue Token Allocated'
      );
      triggerRefresh();
      setWalkInModalService(null);
      setWalkInNotes('');
      navigate('/student/queue');
    } catch (err: any) {
      showToast(err.message || 'Failed to join walk-in queue', 'error');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
            College Administrative Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Administrative Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select a service to schedule an appointment or obtain a digital walk-in queue token.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services, offices..."
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none w-full sm:w-60 bg-white"
            />
          </div>

          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none bg-white text-slate-700"
          >
            <option value="ALL">All Administrative Offices</option>
            <option value="Academic Affairs">Academic Affairs (Admin Block)</option>
            <option value="Records">Student Records</option>
            <option value="Finance">Finance & Accounts</option>
            <option value="Welfare">Student Welfare & Dean</option>
            <option value="Exam">Controller of Examinations</option>
            <option value="Security">ID & Security Section</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <Card key={service.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              {/* Header with code and modes */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-[#0f243d] text-white rounded">
                    {service.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {service.name}
                  </h3>
                </div>
                <Badge variant={service.status}>{service.status}</Badge>
              </div>

              <CardBody className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-start gap-2 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-medium text-slate-700">{service.office}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Avg: <strong className="text-slate-700 font-semibold">{service.durationMinutes} mins</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capacity: <strong className="text-slate-700 font-semibold">{service.dailyCapacity}/day</strong></span>
                    </div>
                  </div>
                </div>

                {/* Badges for service modes */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {service.appointmentEnabled && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                      ✓ Appointment
                    </span>
                  )}
                  {service.walkInEnabled && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ Walk-in Queue
                    </span>
                  )}
                </div>
              </CardBody>
            </div>

            {/* Card Actions */}
            <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                onClick={() => setDocsModalService(service)}
                className="text-xs text-slate-600 hover:text-[#0f243d] font-medium flex items-center gap-1 py-1"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Doc Checklist</span>
              </button>

              <div className="flex items-center gap-1.5">
                {service.walkInEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWalkInModalService(service)}
                    leftIcon={<Radio className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    Walk-in
                  </Button>
                )}

                {service.appointmentEnabled && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/student/appointments/new?serviceId=${service.id}`)}
                    leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                  >
                    Book
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Walk-in Confirmation Modal */}
      <Modal
        isOpen={!!walkInModalService}
        onClose={() => setWalkInModalService(null)}
        title="Join Digital Walk-in Queue"
        subtitle={`Generate a same-day token for ${walkInModalService?.name}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWalkInModalService(null)}
              disabled={submittingWalkIn}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submittingWalkIn}
              onClick={handleJoinQueueSubmit}
              leftIcon={<Radio className="w-3.5 h-3.5" />}
            >
              Generate Queue Token
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-bold text-sm text-slate-900">{walkInModalService?.name}</div>
            <div className="text-slate-600 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{walkInModalService?.office}</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-500">
              <div>
                <span>Operating Period:</span>
                <strong className="block text-slate-800 font-semibold mt-0.5">Today (10 AM - 4 PM)</strong>
              </div>
              <div>
                <span>Avg. Handling Time:</span>
                <strong className="block text-slate-800 font-semibold mt-0.5">{walkInModalService?.durationMinutes} minutes</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Brief Purpose / Notes (Optional)
            </label>
            <input
              type="text"
              value={walkInNotes}
              onChange={(e) => setWalkInNotes(e.target.value)}
              placeholder="e.g. Urgent transcript for scholarship submission..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Queue Policy Notice</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800">
              Walk-in tokens are served in strict FIFO sequence after scheduled appointments. You will be notified when your turn approaches.
            </p>
          </div>
        </div>
      </Modal>

      {/* Required Documents Checklist Modal */}
      <Modal
        isOpen={!!docsModalService}
        onClose={() => setDocsModalService(null)}
        title="Required Documents Checklist"
        subtitle={`Required verification papers for ${docsModalService?.name}`}
        footer={
          <Button variant="primary" size="sm" onClick={() => setDocsModalService(null)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please ensure you have physical copies and original documents ready before approaching the service counter:
          </p>

          <div className="space-y-2">
            {docsModalService?.requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-700 mt-0.5 shrink-0" />
                <span className="font-medium">{doc}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Incomplete document submissions may require requeuing or a new appointment.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
