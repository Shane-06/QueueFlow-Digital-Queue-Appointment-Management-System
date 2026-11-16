import { InAppNotification } from '../types';

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-1',
    title: 'Appointment Confirmed',
    message: 'Your appointment for Transcript Verification is confirmed for today, Sep 10, 2026 at 10:30 AM (Counter 2).',
    type: 'SUCCESS',
    read: false,
    createdAt: '2026-09-08T14:22:05Z',
    linkUrl: '/student/appointments',
    relatedToken: 'TV-024',
  },
  {
    id: 'notif-2',
    userId: 'usr-student-1',
    title: 'Queue Token Allocated',
    message: 'Your token TV-024 is currently in the queue. 4 people are ahead of you.',
    type: 'INFO',
    read: false,
    createdAt: '2026-09-10T04:25:00Z',
    linkUrl: '/student/queue',
    relatedToken: 'TV-024',
  },
  {
    id: 'notif-3',
    userId: 'usr-student-1',
    title: 'Required Documents Notice',
    message: 'Please ensure you bring original marksheets, college ID card, and fee clearance receipt to Counter 2.',
    type: 'WARNING',
    read: true,
    createdAt: '2026-09-09T09:00:00Z',
    linkUrl: '/student/services',
  },
];
