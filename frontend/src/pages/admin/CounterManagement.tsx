import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { counterService } from '../../services/counterService';
import { serviceService } from '../../services/serviceService';
import { authService } from '../../services/authService';
import { Counter, Service, User } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Building,
  UserCheck,
  Power,
  Plus,
  Edit2,
  Users,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const CounterManagement: React.FC = () => {
  const { dataVersion, triggerRefresh } = useAppData();
  const { showToast } = useToast();
  const [counters, setCounters] = useState<Counter[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Assigning Staff
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Add Counter Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCounterData, setNewCounterData] = useState({
    name: 'Counter 7',
    counterNumber: 7,
    location: 'Student Affairs Annex (Room 105)',
    status: 'ACTIVE' as const,
    assignedServiceIds: ['srv-1'],
  });

  const loadAll = async () => {
    setLoading(true);
    const [cData, sData, uData] = await Promise.all([
      counterService.getAllCounters(),
      serviceService.getAllServices(true),
      authService.getAllUsers(),
    ]);
    setCounters(cData);
    setServices(sData);
    setStaffUsers(uData.filter((u) => u.role === 'STAFF'));
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [dataVersion]);

  const handleToggleStatus = async (counter: Counter) => {
    try {
      const updated = await counterService.toggleCounterStatus(counter.id, 'Dr. Sunita Mehra');
      showToast(
        `${counter.name} is now ${updated.status}.`,
        updated.status === 'ACTIVE' ? 'success' : 'warning'
      );
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle counter status', 'error');
    }
  };

  const handleOpenStaffModal = (counter: Counter) => {
    setSelectedCounter(counter);
    setSelectedStaffId(counter.assignedStaffId || '');
    setStaffModalOpen(true);
  };

  const handleSaveStaffAssignment = async () => {
    if (!selectedCounter) return;
    try {
      await counterService.assignStaff(selectedCounter.id, selectedStaffId, 'Dr. Sunita Mehra');
      showToast(`Operator updated for ${selectedCounter.name}.`, 'success');
      setStaffModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign staff', 'error');
    }
  };

  const handleCreateCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await counterService.createCounter(
        {
          ...newCounterData,
          counterNumber: Number(newCounterData.counterNumber),
        },
        'Dr. Sunita Mehra'
      );
      showToast(`Counter ${newCounterData.name} created successfully.`, 'success');
      setAddModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create counter', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
            Physical Counter Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Service Counter Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage physical service desks, operator assignments, and supported department services.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Counter
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Active Counters Roster"
          subtitle={`Showing ${counters.length} configured service desks`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Desk</th>
                <th>Physical Location</th>
                <th>Assigned Services</th>
                <th>Assigned Operator</th>
                <th>Current Token</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {counters.map((counter) => {
                const assignedServiceObjs = services.filter((s) =>
                  counter.assignedServiceIds.includes(s.id)
                );

                return (
                  <tr key={counter.id}>
                    <td>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {counter.name}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Desk #{counter.counterNumber}
                      </span>
                    </td>

                    <td className="text-xs text-slate-700 max-w-xs">
                      {counter.location}
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {assignedServiceObjs.map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {s.code} - {s.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="text-xs font-medium text-slate-900">
                      {counter.assignedStaffName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{counter.assignedStaffName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                        {counter.currentTokenNo || 'IDLE'}
                      </span>
                    </td>

                    <td>
                      <Badge variant={counter.status}>{counter.status}</Badge>
                    </td>

                    <td className="text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenStaffModal(counter)}
                        leftIcon={<Users className="w-3.5 h-3.5" />}
                      >
                        Assign Staff
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(counter)}
                        className={counter.status === 'ACTIVE' ? 'text-amber-700' : 'text-emerald-700'}
                        leftIcon={<Power className="w-3.5 h-3.5" />}
                      >
                        {counter.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Staff Operator Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Assign Staff Operator"
        subtitle={`Desk: ${selectedCounter?.name} (${selectedCounter?.location})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveStaffAssignment}>
              Save Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Staff Operator
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none bg-white text-slate-800"
            >
              <option value="">-- Leave Unassigned --</option>
              {staffUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.employeeId || 'Staff'}) — {s.department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Add New Counter Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New Service Desk Counter"
        subtitle="Provision physical service counter in enterprise routing engine"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateCounter}>
              Provision Counter
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCounter} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Counter Name *</label>
              <input
                type="text"
                value={newCounterData.name}
                onChange={(e) => setNewCounterData({ ...newCounterData, name: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Counter Number *</label>
              <input
                type="number"
                value={newCounterData.counterNumber}
                onChange={(e) => setNewCounterData({ ...newCounterData, counterNumber: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Location *</label>
            <input
              type="text"
              value={newCounterData.location}
              onChange={(e) => setNewCounterData({ ...newCounterData, location: e.target.value })}
              placeholder="e.g. Admin Block 1st Floor - Wing B"
              className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
