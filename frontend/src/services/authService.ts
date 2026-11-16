import { User, Role } from '../types';
import { getStoredUsers, getCurrentUserId, saveCurrentUserId } from './storage';

// Simulated latency helper (50ms - 150ms for realistic snappy feel)
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    await delay(50);
    const users = getStoredUsers();
    const currentId = getCurrentUserId();
    return users.find((u) => u.id === currentId) || users[0] || null;
  },

  async login(email: string, role?: Role): Promise<User> {
    await delay(150);
    const users = getStoredUsers();
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      saveCurrentUserId(matched.id);
      return matched;
    }

    if (role) {
      const roleMatch = users.find((u) => u.role === role);
      if (roleMatch) {
        saveCurrentUserId(roleMatch.id);
        return roleMatch;
      }
    }

    throw new Error('Invalid college credentials. Please check your email or college ID.');
  },

  async switchDemoRole(role: Role): Promise<User> {
    await delay(50);
    const users = getStoredUsers();
    let targetUser = users.find((u) => u.role === role);

    if (role === 'STUDENT') {
      targetUser = users.find((u) => u.id === 'usr-student-1') || targetUser;
    } else if (role === 'STAFF') {
      targetUser = users.find((u) => u.id === 'usr-staff-1') || targetUser;
    } else if (role === 'ADMIN') {
      targetUser = users.find((u) => u.id === 'usr-admin-1') || targetUser;
    }

    if (!targetUser) {
      throw new Error(`No user found for role ${role}`);
    }

    saveCurrentUserId(targetUser.id);
    return targetUser;
  },

  async logout(): Promise<void> {
    await delay(50);
    saveCurrentUserId('');
  },

  async getAllUsers(): Promise<User[]> {
    await delay(100);
    return getStoredUsers();
  },
};
