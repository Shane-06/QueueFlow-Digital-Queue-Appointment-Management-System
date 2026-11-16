import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { notificationService } from '../../services/notificationService';
import {
  Bell,
  Menu,
  LogOut,
  Calendar,
  Clock,
  ChevronDown,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
}) => {
  const { user, role, logout } = useAuth();
  const { dataVersion } = useAppData();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      notificationService.getNotifications(user.id).then((notifs) => {
        setUnreadCount(notifs.filter((n) => !n.read).length);
      });
    }
  }, [user, dataVersion]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#0f243d] text-white border-b border-slate-800 shrink-0 select-none">
      <div className="flex items-center justify-between px-3 sm:px-6 h-14">
        {/* Left: Mobile Toggle & University Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-brand-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-white">
                  GREENWOOD STATE UNIVERSITY
                </span>
                <span className="hidden xl:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-900 text-brand-200 border border-brand-800">
                  DQAMS Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Digital Queue & Appointment Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Date & Campus Hours Indicator (Desktop) */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            <span>Thu, 10 Sep 2026</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Counter Hours: 10:00 AM – 04:00 PM</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0f243d]">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-md bg-brand-700 text-white font-semibold text-xs flex items-center justify-center border border-brand-500">
                {user?.avatar || 'US'}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  {user?.name}
                  <Badge variant={role || 'DEFAULT'} size="sm">
                    {role}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {user?.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-30 text-slate-900 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>{user?.rollNumber || user?.employeeId || 'Verified User'}</span>
                    </div>
                  </div>

                  <div className="px-2 py-1.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate(role === 'STUDENT' ? '/student/profile' : `/${role?.toLowerCase()}/dashboard`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"
                    >
                      <span>Institutional Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>End Portal Session</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
