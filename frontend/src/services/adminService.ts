import {
  DashboardStats,
  AuditLog,
  WorkingSchedule,
} from '../types';
import {
  getStoredAppointments,
  getStoredQueue,
  getStoredCounters,
  getStoredServices,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  getStoredSchedules,
  saveStoredSchedules,
} from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(100);
    const appointments = getStoredAppointments();
    const queue = getStoredQueue();
    const counters = getStoredCounters();

    const todayAppointments = appointments;
    const waitingTokens = queue.filter((q) => q.status === 'WAITING').length;
    const currentlyServing = queue.filter((q) => q.status === 'SERVING' || q.status === 'CALLED').length;
    const completedToday = queue.filter((q) => q.status === 'COMPLETED').length;
    const cancelledToday = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShowToday = queue.filter((q) => q.status === 'SKIPPED').length;

    const activeCounters = counters.filter((c) => c.status === 'ACTIVE').length;

    return {
      totalAppointmentsToday: todayAppointments.length,
      waitingTokens,
      currentlyServing,
      completedToday,
      cancelledToday,
      noShowToday,
      averageWaitTimeMinutes: 14.5,
      activeCountersCount: activeCounters,
      totalCountersCount: counters.length,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(80);
    return getStoredAuditLogs();
  },

  async getSchedules(): Promise<WorkingSchedule[]> {
    await delay(60);
    return getStoredSchedules();
  },

  async updateSchedule(schedule: WorkingSchedule, actorName = 'Admin'): Promise<WorkingSchedule> {
    await delay(150);
    const schedules = [schedule];
    saveStoredSchedules(schedules);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName,
      actorRole: 'ADMIN',
      action: 'SCHEDULE_UPDATE',
      entityType: 'SCHEDULE',
      entityId: schedule.id,
      timestamp: new Date().toISOString(),
      details: `Updated operating hours (${schedule.startTime} - ${schedule.endTime}, slot: ${schedule.slotDurationMinutes}m, capacity: ${schedule.dailyCapacity}).`,
    });
    saveStoredAuditLogs(logs);

    return schedule;
  },
};
