import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<User>;
  switchRole: (role: Role) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('Failed to load initial auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, targetRole?: Role): Promise<User> => {
    try {
      const loggedUser = await authService.login(email, targetRole);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}`, 'success');
      return loggedUser;
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
      throw err;
    }
  };

  const switchRole = async (targetRole: Role): Promise<User> => {
    try {
      const switchedUser = await authService.switchDemoRole(targetRole);
      setUser(switchedUser);
      showToast(`Switched view to ${targetRole} (${switchedUser.name})`, 'info', 'Demo Profile Switched');
      return switchedUser;
    } catch (err: any) {
      showToast(err.message || 'Failed to switch role', 'error');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    showToast('Logged out of college portal session.', 'info');
  };

  const refreshUser = async (): Promise<void> => {
    const refreshed = await authService.getCurrentUser();
    setUser(refreshed);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        switchRole,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
