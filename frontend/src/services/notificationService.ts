import { InAppNotification } from '../types';
import { getStoredNotifications, saveStoredNotifications } from './storage';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const notificationService = {
  async getNotifications(userId: string): Promise<InAppNotification[]> {
    await delay(60);
    const notifs = getStoredNotifications();
    return notifs.filter((n) => n.userId === userId);
  },

  async markAsRead(id: string): Promise<void> {
    await delay(40);
    const notifs = getStoredNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      saveStoredNotifications(notifs);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    await delay(60);
    const notifs = getStoredNotifications();
    notifs.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    saveStoredNotifications(notifs);
  },
};
