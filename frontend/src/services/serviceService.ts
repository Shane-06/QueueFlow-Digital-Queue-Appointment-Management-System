import { Service, ServiceStatus } from '../types';
import { getStoredServices, saveStoredServices, getStoredAuditLogs, saveStoredAuditLogs } from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const serviceService = {
  async getAllServices(includeInactive = false): Promise<Service[]> {
    await delay(100);
    const services = getStoredServices();
    if (includeInactive) return services;
    return services.filter((s) => s.status === 'ACTIVE');
  },

  async getServiceById(id: string): Promise<Service | null> {
    await delay(50);
    const services = getStoredServices();
    return services.find((s) => s.id === id) || null;
  },

  async createService(serviceData: Omit<Service, 'id'>, actorName = 'Admin'): Promise<Service> {
    await delay(150);
    const services = getStoredServices();
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now().toString().slice(-4)}`,
    };
    services.push(newService);
    saveStoredServices(services);

    // Audit log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'SERVICE_CREATE',
      entityType: 'SERVICE',
      entityId: newService.id,
      timestamp: new Date().toISOString(),
      details: `Created new service: "${newService.name}" (${newService.code}) in ${newService.office}.`,
    });
    saveStoredAuditLogs(logs);

    return newService;
  },

  async updateService(id: string, updates: Partial<Service>, actorName = 'Admin'): Promise<Service> {
    await delay(150);
    const services = getStoredServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');

    services[index] = { ...services[index], ...updates };
    saveStoredServices(services);

    // Audit log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'SERVICE_UPDATE',
      entityType: 'SERVICE',
      entityId: id,
      timestamp: new Date().toISOString(),
      details: `Updated service parameters for: "${services[index].name}".`,
    });
    saveStoredAuditLogs(logs);

    return services[index];
  },

  async toggleServiceStatus(id: string, actorName = 'Admin'): Promise<Service> {
    await delay(100);
    const services = getStoredServices();
    const service = services.find((s) => s.id === id);
    if (!service) throw new Error('Service not found');

    service.status = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    saveStoredServices(services);

    // Audit log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: service.status === 'ACTIVE' ? 'SERVICE_ACTIVATE' : 'SERVICE_DEACTIVATE',
      entityType: 'SERVICE',
      entityId: id,
      timestamp: new Date().toISOString(),
      details: `Changed status of "${service.name}" to ${service.status}.`,
    });
    saveStoredAuditLogs(logs);

    return service;
  },
};
