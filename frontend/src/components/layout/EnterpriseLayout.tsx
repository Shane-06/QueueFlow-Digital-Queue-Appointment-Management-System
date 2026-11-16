import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { DemoBanner } from './DemoBanner';
import { NotificationDrawer } from './NotificationDrawer';

export const EnterpriseLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Presentation Demo Switcher Bar */}
      <DemoBanner />

      {/* Main Top Navbar */}
      <TopNavbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 lg:pl-64 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
