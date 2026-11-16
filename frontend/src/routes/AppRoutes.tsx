import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnterpriseLayout } from '../components/layout/EnterpriseLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ServicesCatalog } from '../pages/student/ServicesCatalog';
import { BookAppointmentWizard } from '../pages/student/BookAppointmentWizard';
import { QueueLiveTracker } from '../pages/student/QueueLiveTracker';
import { MyAppointments } from '../pages/student/MyAppointments';
import { NotificationsPage } from '../pages/student/NotificationsPage';
import { ProfilePage } from '../pages/student/ProfilePage';

// Staff Pages
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffAppointments } from '../pages/staff/StaffAppointments';
import { StaffQueueList } from '../pages/staff/StaffQueueList';
import { StaffHistory } from '../pages/staff/StaffHistory';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ServiceManagement } from '../pages/admin/ServiceManagement';
import { CounterManagement } from '../pages/admin/CounterManagement';
import { ScheduleConfig } from '../pages/admin/ScheduleConfig';
import { StaffManagement } from '../pages/admin/StaffManagement';
import { ReportsAnalytics } from '../pages/admin/ReportsAnalytics';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-mono">
        INITIALIZING DQAMS PORTAL...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Layout Routes */}
      <Route element={<EnterpriseLayout />}>
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/services" element={<ServicesCatalog />} />
        <Route path="/student/appointments/new" element={<BookAppointmentWizard />} />
        <Route path="/student/queue" element={<QueueLiveTracker />} />
        <Route path="/student/appointments" element={<MyAppointments />} />
        <Route path="/student/history" element={<MyAppointments />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/profile" element={<ProfilePage />} />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/queue" element={<StaffQueueList />} />
        <Route path="/staff/appointments" element={<StaffAppointments />} />
        <Route path="/staff/history" element={<StaffHistory />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/services" element={<ServiceManagement />} />
        <Route path="/admin/counters" element={<CounterManagement />} />
        <Route path="/admin/schedules" element={<ScheduleConfig />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/reports" element={<ReportsAnalytics />} />
        <Route path="/admin/audit" element={<AuditLogsPage />} />
      </Route>

      {/* Default Root Redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === 'STUDENT' ? (
              <Navigate to="/student/dashboard" replace />
            ) : role === 'STAFF' ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Catch-all */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/student/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};
