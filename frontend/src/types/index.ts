export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string;
  employeeId?: string;
  department: string;
  status: UserStatus;
  phone?: string;
  avatar?: string;
}

export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface Service {
  id: string;
  name: string;
  code: string; // e.g. "TV", "BC", "FA", "SV", "HO", "IC", "EO", "SA"
  description: string;
  office: string; // e.g. "Academic Affairs (Admin Block - Room 102)"
  durationMinutes: number; // e.g. 15
  dailyCapacity: number; // e.g. 40
  appointmentEnabled: boolean;
  walkInEnabled: boolean;
  status: ServiceStatus;
  requiredDocuments: string[];
}

export type CounterStatus = 'ACTIVE' | 'INACTIVE';

export interface Counter {
  id: string;
  name: string; // e.g. "Counter 2"
  counterNumber: number; // 2
  location: string; // e.g. "Admin Block Ground Floor - Hall A"
  status: CounterStatus;
  assignedServiceIds: string[]; // Services this counter can serve
  assignedStaffId?: string;
  assignedStaffName?: string;
  currentTokenNo?: string;
  currentQueueEntryId?: string;
}

export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'SERVING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  referenceNo: string; // e.g. "APT-2026-00482"
  userId: string;
  userName: string;
  userEmail: string;
  userRollNo?: string;
  serviceId: string;
  serviceName: string;
  office: string;
  slotDate: string; // YYYY-MM-DD
  slotTime: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  counterId?: string;
  counterNumber?: number;
  tokenNo?: string; // e.g. "TV-024"
  notes?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export type QueueStatus =
  | 'WAITING'
  | 'CALLED'
  | 'SERVING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'HOLD';

export interface QueueEntry {
  id: string;
  tokenNo: string; // e.g. "TV-024"
  serviceId: string;
  serviceName: string;
  userId: string;
  userName: string;
  userRollNo?: string;
  appointmentId?: string;
  isWalkIn: boolean;
  queueDate: string; // YYYY-MM-DD
  status: QueueStatus;
  counterId?: string;
  counterNumber?: number;
  staffId?: string;
  staffName?: string;
  joinedAt: string;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
  estimatedWaitMinutes?: number;
  peopleAhead?: number;
  notes?: string;
}

export interface TimeSlot {
  time: string; // e.g. "10:00 AM"
  available: boolean;
  bookedCount: number;
  maxCapacity: number;
  status: 'AVAILABLE' | 'FULL' | 'CLOSED';
}

export interface WorkingSchedule {
  id: string;
  serviceId?: string; // global or service-specific
  daysOfWeek: number[]; // [1, 2, 3, 4, 5] (Mon - Fri)
  startTime: string; // "10:00"
  endTime: string; // "16:00"
  slotDurationMinutes: number; // 15
  dailyCapacity: number; // 40
  breakStartTime?: string; // "13:00"
  breakEndTime?: string; // "14:00"
  holidays: { date: string; name: string }[];
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkUrl?: string;
  relatedToken?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'APPOINTMENT' | 'QUEUE' | 'SERVICE' | 'COUNTER' | 'SCHEDULE' | 'AUTH';
  entityId: string;
  timestamp: string;
  details: string;
}

export interface DashboardStats {
  totalAppointmentsToday: number;
  waitingTokens: number;
  currentlyServing: number;
  completedToday: number;
  cancelledToday: number;
  noShowToday: number;
  averageWaitTimeMinutes: number;
  activeCountersCount: number;
  totalCountersCount: number;
}
