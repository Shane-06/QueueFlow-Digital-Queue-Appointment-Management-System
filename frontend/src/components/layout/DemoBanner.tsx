import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Role } from '../../types';
import { UserCheck, Shield, GraduationCap, Briefcase, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const { role, switchRole, user } = useAuth();
  const { resetAllDemoData } = useAppData();
  const navigate = useNavigate();

  const handleRoleChange = async (targetRole: Role) => {
    if (role === targetRole) return;
    await switchRole(targetRole);
    if (targetRole === 'STUDENT') navigate('/student/dashboard');
    else if (targetRole === 'STAFF') navigate('/staff/dashboard');
    else if (targetRole === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="bg-[#0b1b2d] text-white border-b border-slate-800 text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none z-40">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-brand-300 uppercase tracking-wider text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          <UserCheck className="w-3 h-3 text-brand-400" />
          Class Demo Switcher
        </span>
        <span className="hidden md:inline text-slate-400 text-[11px]">
          Viewing as <strong className="text-slate-200">{user?.name}</strong> ({role})
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 text-[11px] hidden sm:inline mr-1">Switch Role:</span>

        <button
          onClick={() => handleRoleChange('STUDENT')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
            role === 'STUDENT'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Student Demo (Aarav Sharma - Roll 2023CS042)"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>

        <button
          onClick={() => handleRoleChange('STAFF')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
            role === 'STAFF'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Staff Demo (Rajesh Kumar - Counter 2 Operator)"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Staff (Counter 2)</span>
        </button>

        <button
          onClick={() => handleRoleChange('ADMIN')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
            role === 'ADMIN'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Admin Demo (Dr. Sunita Mehra - Dean / Admin)"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

        <button
          onClick={resetAllDemoData}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 text-slate-300 hover:bg-rose-900/40 hover:text-rose-200 border border-slate-700 transition-colors text-[11px]"
          title="Reset database back to initial seed data"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Seed Data</span>
        </button>
      </div>
    </div>
  );
};
