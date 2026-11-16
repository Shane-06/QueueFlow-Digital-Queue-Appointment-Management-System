import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Mail, Phone, Building, UserCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card">
        <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
          Identity & Access Management
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Institutional Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Verified university credentials associated with this portal session.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Student Record Information"
          subtitle="Greenwood State University Student Identity"
          action={<Badge variant={user?.status || 'ACTIVE'}>{user?.status || 'ACTIVE'}</Badge>}
        />
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="w-14 h-14 rounded-lg bg-[#0f243d] text-white text-xl font-bold flex items-center justify-center border border-slate-700">
              {user?.avatar || 'AS'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{user?.name}</h3>
              <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                <span className="font-mono font-semibold">{user?.rollNumber || '2023CS042'}</span>
                <span>•</span>
                <span>{user?.department}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> College Email
              </span>
              <strong className="text-slate-900 font-semibold block mt-1 font-mono">{user?.email}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Registered Mobile
              </span>
              <strong className="text-slate-900 font-semibold block mt-1 font-mono">{user?.phone || '+91 98765 43210'}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Department / Academic Unit
              </span>
              <strong className="text-slate-900 font-semibold block mt-1">{user?.department}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Portal Role
              </span>
              <strong className="text-slate-900 font-semibold block mt-1">{role}</strong>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
