import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Grid,
  CalendarPlus,
  Users,
  CalendarCheck,
  Bell,
  User,
  Radio,
  Sliders,
  Clock,
  BarChart3,
  FileText,
  Building,
  UserCog,
  CheckCircle2,
  PhoneCall,
  History,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const studentLinks: NavItem[] = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/services', label: 'Browse Services', icon: Grid },
    { to: '/student/appointments/new', label: 'Book Appointment', icon: CalendarPlus },
    { to: '/student/queue', label: 'Digital Queue Tracker', icon: Radio, highlight: true },
    { to: '/student/appointments', label: 'My Appointments', icon: CalendarCheck },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Student Profile', icon: User },
  ];

  const staffLinks: NavItem[] = [
    { to: '/staff/dashboard', label: 'Counter Console', icon: PhoneCall, highlight: true },
    { to: '/staff/queue', label: "Today's Queue List", icon: Users },
    { to: '/staff/appointments', label: "Counter Appointments", icon: CalendarCheck },
    { to: '/staff/history', label: 'Service History', icon: History },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/services', label: 'Service Management', icon: Grid },
    { to: '/admin/counters', label: 'Counter Management', icon: Building },
    { to: '/admin/schedules', label: 'Working Hours & Slots', icon: Clock },
    { to: '/admin/staff', label: 'Staff Assignments', icon: UserCog },
    { to: '/admin/reports', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin/audit', label: 'Audit Trail Logs', icon: FileText },
  ];

  const links: NavItem[] =
    role === 'STUDENT'
      ? studentLinks
      : role === 'STAFF'
      ? staffLinks
      : adminLinks;

  const roleTitle = {
    STUDENT: 'Student Portal',
    STAFF: 'Staff Counter Console',
    ADMIN: 'Administrative Suite',
  }[role || 'STUDENT'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-[#0f243d] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-20 lg:pt-0`}
      >
        {/* Desktop Portal Label */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0c1e33] hidden lg:block">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Active Workspace
          </div>
          <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
            <span>{roleTitle}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-700 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  } ${link.highlight && !link.to.includes('active') ? 'border border-brand-500/20' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
                {link.highlight && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-900 text-brand-200 border border-brand-700 uppercase">
                    Live
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Counter Info Banner for Staff */}
        {role === 'STAFF' && (
          <div className="p-3 mx-3 mb-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Assigned: Counter 2</span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1 leading-snug">
              Academic Affairs (Transcript & Bonafide)
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0b1b2d] text-slate-400 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-300">DQAMS v1.0.0</span>
            <span className="font-mono text-[10px] text-slate-400">Spring Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            Internal College Enterprise Network
          </p>
        </div>
      </aside>
    </>
  );
};
