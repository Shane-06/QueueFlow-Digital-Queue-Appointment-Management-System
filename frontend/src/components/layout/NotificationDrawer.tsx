import React, { useEffect, useState } from 'react';
import { InAppNotification } from '../../types';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { X, CheckCheck, Bell, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { dataVersion } = useAppData();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    if (!user) return;
    const items = await notificationService.getNotifications(user.id);
    setNotifications(items);
  };

  useEffect(() => {
    fetchNotifs();
  }, [user, dataVersion, isOpen]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    fetchNotifs();
  };

  const handleItemClick = async (notif: InAppNotification) => {
    await notificationService.markAsRead(notif.id);
    fetchNotifs();
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#0f243d] text-white rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Notifications</h3>
                <p className="text-xs text-slate-500">In-App Alerts & Queue Status Updates</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllRead}
                className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Updates regarding bookings and tokens will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-brand-50/50 border-brand-200 hover:border-brand-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                      {n.title}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>
                  {n.relatedToken && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                        Token: {n.relatedToken}
                      </span>
                      <span className="text-[11px] text-brand-700 font-medium flex items-center gap-1 hover:underline">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
            Real-time notifications synchronized via DQAMS Service Engine
          </div>
        </div>
      </div>
    </div>
  );
};
