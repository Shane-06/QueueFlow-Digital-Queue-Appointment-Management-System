import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { notificationService } from '../../services/notificationService';
import { InAppNotification } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { dataVersion, triggerRefresh } = useAppData();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    if (!user) return;
    setLoading(true);
    const data = await notificationService.getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, [user, dataVersion]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    triggerRefresh();
  };

  const handleItemClick = async (notif: InAppNotification) => {
    await notificationService.markAsRead(notif.id);
    triggerRefresh();
    if (notif.linkUrl) navigate(notif.linkUrl);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
            In-App Communication
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Notifications & Queue Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit history of appointment confirmations, turn notifications, and queue status changes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<CheckCheck className="w-4 h-4" />}
        >
          Mark All as Read
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Notification Stream"
          subtitle={`Showing ${notifications.length} message records`}
        />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No Notifications</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                    !n.read ? 'bg-brand-50/40 hover:bg-brand-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {n.type === 'ALERT' && <AlertCircle className="w-4 h-4 text-blue-600 animate-pulse" />}
                      {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {n.type === 'INFO' && <Info className="w-4 h-4 text-brand-600" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {n.message}
                      </p>

                      {n.relatedToken && (
                        <div className="mt-2 inline-flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                            Token: {n.relatedToken}
                          </span>
                          <span className="text-xs text-brand-700 font-medium flex items-center gap-1 hover:underline">
                            View Status <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
