import {
  QueueEntry,
  QueueStatus,
  User,
  Counter,
} from '../types';
import {
  getStoredQueue,
  saveStoredQueue,
  getStoredCounters,
  saveStoredCounters,
  getStoredServices,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredAuditLogs,
  saveStoredAuditLogs,
} from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const queueService = {
  async getMyActiveQueueEntry(userId: string): Promise<QueueEntry | null> {
    await delay(60);
    const queue = getStoredQueue();
    const services = getStoredServices();

    // Find active entry (SERVING, CALLED, or WAITING)
    const activeEntry = queue.find(
      (q) =>
        q.userId === userId &&
        (q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'SERVING' || q.status === 'HOLD')
    );

    if (!activeEntry) return null;

    // Calculate dynamic people ahead and estimated wait
    if (activeEntry.status === 'WAITING') {
      const waitingAhead = queue.filter(
        (q) =>
          q.serviceId === activeEntry.serviceId &&
          q.status === 'WAITING' &&
          new Date(q.joinedAt).getTime() < new Date(activeEntry.joinedAt).getTime()
      );
      activeEntry.peopleAhead = waitingAhead.length;

      const service = services.find((s) => s.id === activeEntry.serviceId);
      const avgDuration = service?.durationMinutes || 15;
      activeEntry.estimatedWaitMinutes = (waitingAhead.length + 1) * Math.min(avgDuration, 5); // realistic estimate
    } else if (activeEntry.status === 'CALLED' || activeEntry.status === 'SERVING') {
      activeEntry.peopleAhead = 0;
      activeEntry.estimatedWaitMinutes = 0;
    }

    return activeEntry;
  },

  async joinWalkInQueue(serviceId: string, user: User, notes?: string): Promise<QueueEntry> {
    await delay(180);
    const services = getStoredServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Service not found');
    if (service.status !== 'ACTIVE') throw new Error('Service is currently not accepting walk-ins.');
    if (!service.walkInEnabled) throw new Error('Walk-in queue is not enabled for this service.');

    const queue = getStoredQueue();

    // Check if user already in waiting queue for this service today
    const existingWaiting = queue.find(
      (q) =>
        q.userId === user.id &&
        q.serviceId === serviceId &&
        (q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'SERVING')
    );
    if (existingWaiting) {
      throw new Error(`You already have an active queue token (${existingWaiting.tokenNo}) for this service.`);
    }

    // Find assigned counter
    const counters = getStoredCounters();
    const assignedCounter =
      counters.find((c) => c.assignedServiceIds.includes(serviceId) && c.status === 'ACTIVE') ||
      counters[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTokens = queue.filter(
      (q) => q.serviceId === serviceId && q.queueDate === todayStr
    );
    const nextTokenNum = (todayTokens.length + 20).toString().padStart(3, '0');
    const tokenNo = `${service.code}-${nextTokenNum}`;

    const waitingAhead = queue.filter(
      (q) => q.serviceId === serviceId && q.status === 'WAITING'
    );
    const peopleAhead = waitingAhead.length;
    const estWait = (peopleAhead + 1) * Math.min(service.durationMinutes, 5);

    const newEntry: QueueEntry = {
      id: `q-${service.code.toLowerCase()}-${nextTokenNum}-${Date.now().toString().slice(-3)}`,
      tokenNo,
      serviceId: service.id,
      serviceName: service.name,
      userId: user.id,
      userName: user.name,
      userRollNo: user.rollNumber,
      isWalkIn: true,
      queueDate: todayStr,
      status: 'WAITING',
      counterId: assignedCounter?.id,
      counterNumber: assignedCounter?.counterNumber,
      joinedAt: new Date().toISOString(),
      peopleAhead,
      estimatedWaitMinutes: estWait,
      notes,
    };

    queue.push(newEntry);
    saveStoredQueue(queue);

    // Notification
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: user.id,
      title: 'Digital Token Issued',
      message: `Your token ${tokenNo} for ${service.name} is confirmed. Position in queue: #${peopleAhead + 1} (${estWait} min wait).`,
      type: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/queue',
      relatedToken: tokenNo,
    });
    saveStoredNotifications(notifs);

    // Audit log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: user.id,
      actorName: user.name,
      actorRole: 'STUDENT',
      action: 'QUEUE_JOIN_WALKIN',
      entityType: 'QUEUE',
      entityId: newEntry.id,
      timestamp: new Date().toISOString(),
      details: `Generated walk-in token ${tokenNo} for ${service.name}.`,
    });
    saveStoredAuditLogs(logs);

    return newEntry;
  },

  async getCounterQueue(counterId: string): Promise<{
    counter: Counter | null;
    currentServing: QueueEntry | null;
    waitingList: QueueEntry[];
    completedList: QueueEntry[];
  }> {
    await delay(80);
    const counters = getStoredCounters();
    const queue = getStoredQueue();

    const counter = counters.find((c) => c.id === counterId) || counters[1]; // default Counter 2
    const assignedServiceIds = counter ? counter.assignedServiceIds : ['srv-1', 'srv-2'];

    // Current serving entry
    const currentServing =
      queue.find(
        (q) =>
          (q.counterId === counter?.id || assignedServiceIds.includes(q.serviceId)) &&
          (q.status === 'SERVING' || q.status === 'CALLED')
      ) || null;

    // Waiting queue in strict FIFO order
    const waitingList = queue
      .filter(
        (q) =>
          assignedServiceIds.includes(q.serviceId) &&
          q.status === 'WAITING'
      )
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    // Completed today
    const completedList = queue
      .filter(
        (q) =>
          (q.counterId === counter?.id || assignedServiceIds.includes(q.serviceId)) &&
          (q.status === 'COMPLETED' || q.status === 'SKIPPED')
      )
      .sort((a, b) => new Date(b.completedAt || b.joinedAt).getTime() - new Date(a.completedAt || a.joinedAt).getTime());

    return {
      counter: counter || null,
      currentServing,
      waitingList,
      completedList,
    };
  },

  async callNextToken(counterId: string, staff: User): Promise<QueueEntry> {
    await delay(150);
    const counters = getStoredCounters();
    const queue = getStoredQueue();

    const counter = counters.find((c) => c.id === counterId);
    if (!counter) throw new Error('Counter not found');

    // Rule: check if counter currently has an uncompleted active token
    const existingActive = queue.find(
      (q) => q.counterId === counter.id && (q.status === 'CALLED' || q.status === 'SERVING')
    );
    if (existingActive) {
      throw new Error(`Counter ${counter.counterNumber} is currently serving token ${existingActive.tokenNo}. Please complete or skip it first.`);
    }

    // FIFO: Find next eligible WAITING token for this counter's assigned services
    const eligibleWaitingIndex = queue.findIndex(
      (q) =>
        counter.assignedServiceIds.includes(q.serviceId) &&
        q.status === 'WAITING'
    );

    if (eligibleWaitingIndex === -1) {
      throw new Error('No waiting tokens in the queue for this counter.');
    }

    const nextToken = queue[eligibleWaitingIndex];
    nextToken.status = 'CALLED';
    nextToken.counterId = counter.id;
    nextToken.counterNumber = counter.counterNumber;
    nextToken.staffId = staff.id;
    nextToken.staffName = staff.name;
    nextToken.calledAt = new Date().toISOString();

    // Update counter current token
    counter.currentTokenNo = nextToken.tokenNo;
    counter.currentQueueEntryId = nextToken.id;
    saveStoredCounters(counters);
    saveStoredQueue(queue);

    // Update appointment status if linked
    if (nextToken.appointmentId) {
      const appointments = getStoredAppointments();
      const apt = appointments.find((a) => a.id === nextToken.appointmentId);
      if (apt) {
        apt.status = 'CHECKED_IN';
        saveStoredAppointments(appointments);
      }
    }

    // Student In-App Notification (High priority)
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: nextToken.userId,
      title: 'Token Called - Proceed to Counter',
      message: `Token ${nextToken.tokenNo}: Please proceed to Counter ${counter.counterNumber} (${counter.location}) for ${nextToken.serviceName}.`,
      type: 'ALERT',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/queue',
      relatedToken: nextToken.tokenNo,
    });
    saveStoredNotifications(notifs);

    // Audit Log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: staff.id,
      actorName: staff.name,
      actorRole: 'STAFF',
      action: 'TOKEN_CALLED',
      entityType: 'QUEUE',
      entityId: nextToken.id,
      timestamp: new Date().toISOString(),
      details: `Staff ${staff.name} called token ${nextToken.tokenNo} (${nextToken.userName}) to Counter ${counter.counterNumber}.`,
    });
    saveStoredAuditLogs(logs);

    return nextToken;
  },

  async startServingToken(queueEntryId: string, staff: User): Promise<QueueEntry> {
    await delay(100);
    const queue = getStoredQueue();
    const entry = queue.find((q) => q.id === queueEntryId);
    if (!entry) throw new Error('Token entry not found');

    entry.status = 'SERVING';
    entry.servedAt = new Date().toISOString();
    saveStoredQueue(queue);

    if (entry.appointmentId) {
      const appointments = getStoredAppointments();
      const apt = appointments.find((a) => a.id === entry.appointmentId);
      if (apt) {
        apt.status = 'SERVING';
        saveStoredAppointments(appointments);
      }
    }

    return entry;
  },

  async completeToken(queueEntryId: string, staff: User, remarks?: string): Promise<QueueEntry> {
    await delay(150);
    const queue = getStoredQueue();
    const entry = queue.find((q) => q.id === queueEntryId);
    if (!entry) throw new Error('Token entry not found');

    entry.status = 'COMPLETED';
    entry.completedAt = new Date().toISOString();
    if (remarks) entry.notes = remarks;

    // Clear counter current token
    const counters = getStoredCounters();
    const counter = counters.find((c) => c.id === entry.counterId);
    if (counter && counter.currentQueueEntryId === entry.id) {
      counter.currentTokenNo = undefined;
      counter.currentQueueEntryId = undefined;
      saveStoredCounters(counters);
    }
    saveStoredQueue(queue);

    // Update linked appointment
    if (entry.appointmentId) {
      const appointments = getStoredAppointments();
      const apt = appointments.find((a) => a.id === entry.appointmentId);
      if (apt) {
        apt.status = 'COMPLETED';
        apt.completedAt = entry.completedAt;
        saveStoredAppointments(appointments);
      }
    }

    // Student Notification
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: entry.userId,
      title: 'Service Completed',
      message: `Your service for token ${entry.tokenNo} (${entry.serviceName}) at Counter ${entry.counterNumber || 2} has been successfully completed.`,
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/history',
      relatedToken: entry.tokenNo,
    });
    saveStoredNotifications(notifs);

    // Audit Log
    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: staff.id,
      actorName: staff.name,
      actorRole: 'STAFF',
      action: 'TOKEN_COMPLETED',
      entityType: 'QUEUE',
      entityId: entry.id,
      timestamp: new Date().toISOString(),
      details: `Completed token ${entry.tokenNo} for student ${entry.userName}.`,
    });
    saveStoredAuditLogs(logs);

    return entry;
  },

  async skipToken(queueEntryId: string, staff: User, reason = 'Student did not appear after call'): Promise<QueueEntry> {
    await delay(120);
    const queue = getStoredQueue();
    const entry = queue.find((q) => q.id === queueEntryId);
    if (!entry) throw new Error('Token entry not found');

    entry.status = 'SKIPPED';
    entry.notes = `Skipped: ${reason}`;

    const counters = getStoredCounters();
    const counter = counters.find((c) => c.id === entry.counterId);
    if (counter && counter.currentQueueEntryId === entry.id) {
      counter.currentTokenNo = undefined;
      counter.currentQueueEntryId = undefined;
      saveStoredCounters(counters);
    }
    saveStoredQueue(queue);

    if (entry.appointmentId) {
      const appointments = getStoredAppointments();
      const apt = appointments.find((a) => a.id === entry.appointmentId);
      if (apt) {
        apt.status = 'NO_SHOW';
        saveStoredAppointments(appointments);
      }
    }

    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: entry.userId,
      title: 'Token Skipped',
      message: `Token ${entry.tokenNo} was skipped because you were not present when called at Counter ${entry.counterNumber || 2}.`,
      type: 'WARNING',
      read: false,
      createdAt: new Date().toISOString(),
      linkUrl: '/student/queue',
    });
    saveStoredNotifications(notifs);

    const logs = getStoredAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}`,
      actorId: staff.id,
      actorName: staff.name,
      actorRole: 'STAFF',
      action: 'TOKEN_SKIPPED',
      entityType: 'QUEUE',
      entityId: entry.id,
      timestamp: new Date().toISOString(),
      details: `Skipped token ${entry.tokenNo} (${entry.userName}). Reason: ${reason}`,
    });
    saveStoredAuditLogs(logs);

    return entry;
  },

  async holdToken(queueEntryId: string, staff: User): Promise<QueueEntry> {
    await delay(100);
    const queue = getStoredQueue();
    const entry = queue.find((q) => q.id === queueEntryId);
    if (!entry) throw new Error('Token entry not found');

    entry.status = 'HOLD';

    const counters = getStoredCounters();
    const counter = counters.find((c) => c.id === entry.counterId);
    if (counter && counter.currentQueueEntryId === entry.id) {
      counter.currentTokenNo = undefined;
      counter.currentQueueEntryId = undefined;
      saveStoredCounters(counters);
    }
    saveStoredQueue(queue);

    return entry;
  },
};
