import {
  User,
  Service,
  Counter,
  Appointment,
  QueueEntry,
  WorkingSchedule,
  InAppNotification,
  AuditLog,
} from '../types';
import { INITIAL_USERS } from '../mock/initialUsers';
import { INITIAL_SERVICES } from '../mock/initialServices';
import { INITIAL_COUNTERS } from '../mock/initialCounters';
import { INITIAL_APPOINTMENTS } from '../mock/initialAppointments';
import { INITIAL_QUEUE } from '../mock/initialQueue';
import { INITIAL_SCHEDULES } from '../mock/initialSchedules';
import { INITIAL_NOTIFICATIONS } from '../mock/initialNotifications';
import { INITIAL_AUDIT_LOGS } from '../mock/initialAuditLogs';

const STORAGE_KEYS = {
  USERS: 'dqams_users_v1',
  SERVICES: 'dqams_services_v1',
  COUNTERS: 'dqams_counters_v1',
  APPOINTMENTS: 'dqams_appointments_v1',
  QUEUE: 'dqams_queue_v1',
  SCHEDULES: 'dqams_schedules_v1',
  NOTIFICATIONS: 'dqams_notifications_v1',
  AUDIT_LOGS: 'dqams_audit_logs_v1',
  CURRENT_USER_ID: 'dqams_current_user_id_v1',
};

// Safe LocalStorage helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// Data Store initialization
export const getStoredUsers = (): User[] => loadData(STORAGE_KEYS.USERS, INITIAL_USERS);
export const saveStoredUsers = (users: User[]) => saveData(STORAGE_KEYS.USERS, users);

export const getStoredServices = (): Service[] => loadData(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
export const saveStoredServices = (services: Service[]) => saveData(STORAGE_KEYS.SERVICES, services);

export const getStoredCounters = (): Counter[] => loadData(STORAGE_KEYS.COUNTERS, INITIAL_COUNTERS);
export const saveStoredCounters = (counters: Counter[]) => saveData(STORAGE_KEYS.COUNTERS, counters);

export const getStoredAppointments = (): Appointment[] => loadData(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
export const saveStoredAppointments = (appointments: Appointment[]) => saveData(STORAGE_KEYS.APPOINTMENTS, appointments);

export const getStoredQueue = (): QueueEntry[] => loadData(STORAGE_KEYS.QUEUE, INITIAL_QUEUE);
export const saveStoredQueue = (queue: QueueEntry[]) => saveData(STORAGE_KEYS.QUEUE, queue);

export const getStoredSchedules = (): WorkingSchedule[] => loadData(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
export const saveStoredSchedules = (schedules: WorkingSchedule[]) => saveData(STORAGE_KEYS.SCHEDULES, schedules);

export const getStoredNotifications = (): InAppNotification[] => loadData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
export const saveStoredNotifications = (notifications: InAppNotification[]) => saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);

export const getStoredAuditLogs = (): AuditLog[] => loadData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
export const saveStoredAuditLogs = (logs: AuditLog[]) => saveData(STORAGE_KEYS.AUDIT_LOGS, logs);

export const getCurrentUserId = (): string => loadData(STORAGE_KEYS.CURRENT_USER_ID, 'usr-student-1');
export const saveCurrentUserId = (id: string) => saveData(STORAGE_KEYS.CURRENT_USER_ID, id);

// Reset prototype storage back to initial seeds
export const resetToInitialSeeds = (): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(INITIAL_COUNTERS));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(INITIAL_QUEUE));
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify('usr-student-1'));
};
