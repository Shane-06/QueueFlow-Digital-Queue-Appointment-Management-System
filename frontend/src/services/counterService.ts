import { Counter } from '../types';
import { getStoredCounters, saveStoredCounters, getStoredAuditLogs, saveStoredAuditLogs, getStoredUsers } from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const counterService = {
  async getAllCounters(): Promise<Counter[]> {
    await delay(80);
    return getStoredCounters();
  },

  async getCounterById(id: string): Promise<Counter | null> {
    await delay(50);
    const counters = getStoredCounters();
    return counters.find((c) => c.id === id) || null;
  },

  async createCounter(data: Omit<Counter, 'id'>, actorName = 'Admin'): Promise<Counter> {
    await delay(150);
    const counters = getStoredCounters();
    const newCounter: Counter = {
      ...data,
      id: `cnt-${Date.now().toString().slice(-4)}`,
    };
    counters.push(newCounter);
    saveStoredCounters(counters);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'COUNTER_CREATE',
      entityType: 'COUNTER',
      entityId: newCounter.id,
      timestamp: new Date().toISOString(),
      details: `Created new service counter: ${newCounter.name} (${newCounter.location}).`,
    });
    saveStoredAuditLogs(logs);

    return newCounter;
  },

  async updateCounter(id: string, updates: Partial<Counter>, actorName = 'Admin'): Promise<Counter> {
    await delay(150);
    const counters = getStoredCounters();
    const index = counters.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Counter not found');

    counters[index] = { ...counters[index], ...updates };
    saveStoredCounters(counters);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'COUNTER_UPDATE',
      entityType: 'COUNTER',
      entityId: id,
      timestamp: new Date().toISOString(),
      details: `Updated configuration for counter: ${counters[index].name}.`,
    });
    saveStoredAuditLogs(logs);

    return counters[index];
  },

  async assignStaff(counterId: string, staffId: string, actorName = 'Admin'): Promise<Counter> {
    await delay(120);
    const counters = getStoredCounters();
    const users = getStoredUsers();
    const counter = counters.find((c) => c.id === counterId);
    if (!counter) throw new Error('Counter not found');

    const staff = users.find((u) => u.id === staffId);
    counter.assignedStaffId = staff ? staff.id : undefined;
    counter.assignedStaffName = staff ? staff.name : undefined;

    saveStoredCounters(counters);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'STAFF_COUNTER_ASSIGNMENT',
      entityType: 'COUNTER',
      entityId: counterId,
      timestamp: new Date().toISOString(),
      details: `Assigned operator ${staff ? staff.name : 'Unassigned'} to ${counter.name}.`,
    });
    saveStoredAuditLogs(logs);

    return counter;
  },

  async toggleCounterStatus(counterId: string, actorName = 'Admin'): Promise<Counter> {
    await delay(100);
    const counters = getStoredCounters();
    const counter = counters.find((c) => c.id === counterId);
    if (!counter) throw new Error('Counter not found');

    counter.status = counter.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    saveStoredCounters(counters);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: counter.status === 'ACTIVE' ? 'COUNTER_ACTIVATE' : 'COUNTER_DEACTIVATE',
      entityType: 'COUNTER',
      entityId: counterId,
      timestamp: new Date().toISOString(),
      details: `Set ${counter.name} status to ${counter.status}.`,
    });
    saveStoredAuditLogs(logs);

    return counter;
  },
};
