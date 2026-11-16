import {
  Appointment,
  AppointmentStatus,
  TimeSlot,
  User,
} from '../types';
import {
  getStoredAppointments,
  saveStoredAppointments,
  getStoredServices,
  getStoredCounters,
  getStoredQueue,
  saveStoredQueue,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredAuditLogs,
  saveStoredAuditLogs,
} from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Standard operating slots (10:00 AM to 4:00 PM, skipping 1:00 PM - 2:00 PM lunch)
const STANDARD_SLOTS = [
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
  '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
];

export const appointmentService = {
  async getAvailableSlots(serviceId: string, date: string): Promise<TimeSlot[]> {
    await delay(120);
    const appointments = getStoredAppointments();
    const serviceAppointments = appointments.filter(
      (a) => a.serviceId === serviceId && a.slotDate === date && a.status !== 'CANCELLED'
    );

    const maxCapacityPerSlot = 2; // configurable capacity

    return STANDARD_SLOTS.map((time) => {
      const bookedCount = serviceAppointments.filter((a) => a.slotTime === time).length;
      const isAvailable = bookedCount < maxCapacityPerSlot;
      return {
        time,
        available: isAvailable,
        bookedCount,
        maxCapacity: maxCapacityPerSlot,
        status: isAvailable ? 'AVAILABLE' : 'FULL',
      };
    });
  },

  async bookAppointment(data: {
    serviceId: string;
    slotDate: string;
    slotTime: string;
    notes?: string;
    user: User;
  }): Promise<Appointment> {
    await delay(200);

    const services = getStoredServices();
    const service = services.find((s) => s.id === data.serviceId);
    if (!service) throw new Error('Service not found');
    if (service.status !== 'ACTIVE') throw new Error('Selected service is currently inactive for bookings.');
    if (!service.appointmentEnabled) throw new Error('This service only accepts walk-in tokens.');

    const appointments = getStoredAppointments();

    // Check for duplicate active appointment for same user on same date & service
    const existingActive = appointments.find(
      (a) =>
        a.userId === data.user.id &&
        a.serviceId === data.serviceId &&
        a.slotDate === data.slotDate &&
        (a.status === 'BOOKED' || a.status === 'CHECKED_IN' || a.status === 'SERVING')
    );
    if (existingActive) {
      throw new Error('You already have an active appointment for this service on the selected date.');
    }

    // Check slot availability (Backend validation & concurrency prevention)
    const slotBookings = appointments.filter(
      (a) =>
        a.serviceId === data.serviceId &&
        a.slotDate === data.slotDate &&
        a.slotTime === data.slotTime &&
        a.status !== 'CANCELLED'
    );
    if (slotBookings.length >= 2) {
      throw new Error('Selected time slot was just booked by another student. Please select another slot.');
    }

    // Find assigned counter
    const counters = getStoredCounters();
    const assignedCounter = counters.find((c) => c.assignedServiceIds.includes(service.id) && c.status === 'ACTIVE') || counters[0];

    // Generate token number (e.g. TV-025)
    const queue = getStoredQueue();
    const todayTokens = queue.filter(
      (q) => q.serviceId === service.id && q.queueDate === data.slotDate
    );
    const nextTokenNum = (todayTokens.length + 20).toString().padStart(3, '0');
    const tokenNo = `${service.code}-${nextTokenNum}`;

    const refNo = `APT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const appointmentId = `apt-${Date.now().toString().slice(-4)}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      referenceNo: refNo,
      userId: data.user.id,
      userName: data.user.name,
      userEmail: data.user.email,
      userRollNo: data.user.rollNumber,
      serviceId: service.id,
      serviceName: service.name,
      office: service.office,
      slotDate: data.slotDate,
      slotTime: data.slotTime,
      status: 'BOOKED',
      counterId: assignedCounter?.id,
      counterNumber: assignedCounter?.counterNumber,
      tokenNo,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    appointments.unshift(newAppointment);
    saveStoredAppointments(appointments);

    // If booking is for today, register in queue system
    const todayStr = new Date().toISOString().split('T')[0];
    if (data.slotDate === todayStr || true) { // For demo ease, register in queue
      const queueEntryId = `q-${service.code.toLowerCase()}-${nextTokenNum}`;
      queue.push({
        id: queueEntryId,
        tokenNo,
        serviceId: service.id,
        serviceName: service.name,
        userId: data.user.id,
        userName: data.user.name,
        userRollNo: data.user.rollNumber,
        appointmentId,
        isWalkIn: false,
        queueDate: data.slotDate,
        status: 'WAITING',
        counterId: assignedCounter?.id,
        counterNumber: assignedCounter?.counterNumber,
        joinedAt: new Date().toISOString(),
        notes: data.notes,
      });
      saveStoredQueue(queue);
    }

    // Add In-App Notification
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: data.user.id,
      title: 'Appointment Confirmed',
      message: `Your appointment for ${service.name} is booked for ${data.slotDate} at ${data.slotTime}. Token: ${tokenNo} (Counter ${assignedCounter?.counterNumber || 2}).`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/appointments',
      relatedToken: tokenNo,
    });
    saveStoredNotifications(notifs);

    // Audit Log
    const auditLogs = getStoredAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: data.user.id,
      actorName: data.user.name,
      actorRole: 'STUDENT',
      action: 'APPOINTMENT_BOOKED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      timestamp: new Date().toISOString(),
      details: `Booked appointment (${refNo}) for ${service.name} at ${data.slotTime} on ${data.slotDate}.`,
    });
    saveStoredAuditLogs(auditLogs);

    return newAppointment;
  },

  async cancelAppointment(id: string, reason = 'Cancelled by student'): Promise<Appointment> {
    await delay(150);
    const appointments = getStoredAppointments();
    const apt = appointments.find((a) => a.id === id);
    if (!apt) throw new Error('Appointment not found');

    if (apt.status === 'COMPLETED') {
      throw new Error('You cannot cancel an appointment that has already been completed.');
    }
    if (apt.status === 'SERVING') {
      throw new Error('You cannot cancel an appointment that is currently being served at the counter.');
    }

    apt.status = 'CANCELLED';
    apt.cancelledAt = new Date().toISOString();
    saveStoredAppointments(appointments);

    // Update corresponding queue entry if present
    const queue = getStoredQueue();
    const queueEntry = queue.find((q) => q.appointmentId === id || (q.tokenNo === apt.tokenNo && q.queueDate === apt.slotDate));
    if (queueEntry && queueEntry.status === 'WAITING') {
      queueEntry.status = 'SKIPPED';
      queueEntry.notes = `Appointment cancelled: ${reason}`;
      saveStoredQueue(queue);
    }

    // Add notification
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: apt.userId,
      title: 'Appointment Cancelled',
      message: `Your appointment for ${apt.serviceName} (${apt.referenceNo}) on ${apt.slotDate} has been cancelled.`,
      type: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/appointments',
    });
    saveStoredNotifications(notifs);

    // Audit Log
    const auditLogs = getStoredAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: apt.userId,
      actorName: apt.userName,
      actorRole: 'STUDENT',
      action: 'APPOINTMENT_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: id,
      timestamp: new Date().toISOString(),
      details: `Cancelled appointment ${apt.referenceNo}. Reason: ${reason}`,
    });
    saveStoredAuditLogs(auditLogs);

    return apt;
  },

  async getMyAppointments(userId: string): Promise<Appointment[]> {
    await delay(100);
    const appointments = getStoredAppointments();
    return appointments.filter((a) => a.userId === userId);
  },

  async getAllAppointments(): Promise<Appointment[]> {
    await delay(100);
    return getStoredAppointments();
  },
};
