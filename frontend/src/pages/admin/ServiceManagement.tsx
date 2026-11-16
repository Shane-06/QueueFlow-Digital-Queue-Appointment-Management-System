import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { serviceService } from '../../services/serviceService';
import { Service, ServiceStatus } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Plus,
  Search,
  Edit2,
  Power,
  Building,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    office: '',
    durationMinutes: 15,
    dailyCapacity: 40,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE' as ServiceStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    const data = await serviceService.getAllServices(true);
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [dataVersion]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      office: '',
      durationMinutes: 15,
      dailyCapacity: 40,
      appointmentEnabled: true,
      walkInEnabled: true,
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      code: service.code,
      description: service.description,
      office: service.office,
      durationMinutes: service.durationMinutes,
      dailyCapacity: service.dailyCapacity,
      appointmentEnabled: service.appointmentEnabled,
      walkInEnabled: service.walkInEnabled,
      status: service.status,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const updated = await serviceService.toggleServiceStatus(service.id, 'Dr. Sunita Mehra');
      showToast(
        `Service "${updated.name}" is now ${updated.status}.`,
        updated.status === 'ACTIVE' ? 'success' : 'warning'
      );
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update service status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.office) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await serviceService.updateService(
          editingService.id,
          {
            ...formData,
            durationMinutes: Number(formData.durationMinutes),
            dailyCapacity: Number(formData.dailyCapacity),
          },
          'Dr. Sunita Mehra'
        );
        showToast(`Service "${formData.name}" updated successfully.`, 'success');
      } else {
        await serviceService.createService(
          {
            ...formData,
            durationMinutes: Number(formData.durationMinutes),
            dailyCapacity: Number(formData.dailyCapacity),
            requiredDocuments: ['College Identity Card', 'Official Application Form'],
          },
          'Dr. Sunita Mehra'
        );
        showToast(`Service "${formData.name}" created successfully.`, 'success');
      }
      setModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save service', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
            Administration & Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Service Catalog Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Define administrative offices, service durations, daily capacities, and booking modes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Service
        </Button>
      </div>

      <Card>
        <CardBody className="p-4 flex items-center justify-between gap-3">
          <div className="text-xs font-medium text-slate-500">
            Total Services: <strong className="text-slate-800 font-bold">{services.length}</strong> (Active: {services.filter(s => s.status === 'ACTIVE').length})
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services, codes..."
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none w-64 bg-white"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Campus Services Directory"
          subtitle={`Showing ${filtered.length} configured services`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service Name</th>
                <th>Office / Location</th>
                <th>Duration</th>
                <th>Daily Capacity</th>
                <th>Booking Modes</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr key={service.id}>
                  <td>
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-[#0f243d] text-white rounded">
                      {service.code}
                    </span>
                  </td>
                  <td>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {service.name}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                      {service.description}
                    </div>
                  </td>
                  <td className="text-xs text-slate-700 max-w-[200px] truncate">
                    {service.office}
                  </td>
                  <td className="text-xs text-slate-700 font-mono">
                    {service.durationMinutes} min
                  </td>
                  <td className="text-xs text-slate-700 font-mono">
                    {service.dailyCapacity} / day
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {service.appointmentEnabled && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          Appt
                        </span>
                      )}
                      {service.walkInEnabled && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Walk-in
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant={service.status}>{service.status}</Badge>
                  </td>
                  <td className="text-right space-x-1 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(service)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(service)}
                      className={service.status === 'ACTIVE' ? 'text-amber-700' : 'text-emerald-700'}
                      leftIcon={<Power className="w-3.5 h-3.5" />}
                    >
                      {service.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Administrative Service' : 'Add New Administrative Service'}
        subtitle="Configure service parameters and queue dispatch options"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={handleSubmit}>
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alumni Clearance Certificate"
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code (2-3 chars) *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. AC"
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none font-mono"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Location *</label>
            <input
              type="text"
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              placeholder="e.g. Academic Affairs (Admin Block - Room 104)"
              className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Brief summary of what this service handles..."
              className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Avg Duration (Mins)</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                min={5}
                max={60}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Capacity Slots</label>
              <input
                type="number"
                value={formData.dailyCapacity}
                onChange={(e) => setFormData({ ...formData, dailyCapacity: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                min={5}
                max={200}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="font-semibold text-slate-700 block">Dispatch Modes</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.appointmentEnabled}
                  onChange={(e) => setFormData({ ...formData, appointmentEnabled: e.target.checked })}
                  className="rounded text-[#0f243d]"
                />
                <span className="text-slate-700">Appointment Booking Allowed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.walkInEnabled}
                  onChange={(e) => setFormData({ ...formData, walkInEnabled: e.target.checked })}
                  className="rounded text-[#0f243d]"
                />
                <span className="text-slate-700">Walk-in Queue Allowed</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
