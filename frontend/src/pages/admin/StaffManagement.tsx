import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { authService } from '../../services/authService';
import { counterService } from '../../services/counterService';
import { User, Counter } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, Mail, Phone, Building, UserCheck } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { dataVersion } = useAppData();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);

  useEffect(() => {
    Promise.all([authService.getAllUsers(), counterService.getAllCounters()]).then(
      ([users, cList]) => {
        setStaffList(users.filter((u) => u.role === 'STAFF' || u.role === 'ADMIN'));
        setCounters(cList);
      }
    );
  }, [dataVersion]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-card">
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider font-mono">
          Personnel & Roles
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Staff Operators & Administrators
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Directory of university administrative officers and physical counter assignments.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Staff Directory"
          subtitle={`Showing ${staffList.length} authenticated personnel`}
        />
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Assigned Desk</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => {
                const assignedCounter = counters.find((c) => c.assignedStaffId === st.id);
                return (
                  <tr key={st.id}>
                    <td>
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.email}</div>
                    </td>
                    <td className="font-mono text-xs text-slate-700">
                      {st.employeeId || 'EMP-XXXX'}
                    </td>
                    <td className="text-xs text-slate-700">{st.department}</td>
                    <td>
                      {assignedCounter ? (
                        <span className="font-semibold text-xs text-brand-900 px-2 py-0.5 bg-brand-50 rounded border border-brand-200">
                          {assignedCounter.name} ({assignedCounter.location})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={st.role}>{st.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={st.status}>{st.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
