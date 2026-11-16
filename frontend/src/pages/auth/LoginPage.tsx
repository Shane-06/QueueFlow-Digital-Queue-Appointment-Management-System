import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Building2, GraduationCap, Briefcase, Shield, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('aarav.sharma@college.edu');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'STAFF') navigate('/staff/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      // Error is handled via Toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: Role) => {
    setIsLoading(true);
    try {
      const user = await switchRole(role);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'STAFF') navigate('/staff/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between antialiased">
      {/* Top institution bar */}
      <div className="bg-[#0f243d] text-white py-3 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-brand-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white">GREENWOOD STATE UNIVERSITY</div>
              <div className="text-[10px] text-slate-400">Enterprise Administrative Services Portal</div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
            PORTAL ID: DQAMS-2026
          </span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-xl shadow-modal border border-slate-200 overflow-hidden">
          {/* Left: Context / Institutional Notice */}
          <div className="md:col-span-5 bg-[#0f243d] text-white p-6 sm:p-8 flex flex-col justify-between border-r border-slate-800">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-brand-900 text-brand-200 text-xs font-semibold tracking-wide uppercase border border-brand-700">
                Single Sign-On (SSO)
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mt-4 leading-snug">
                Digital Queue & Appointment Management System
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Centralized campus portal to book appointments, join digital walk-in queues, track token progress in real-time, and manage counter operations.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time FIFO token tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Guaranteed slot booking validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Integrated service counter operations</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Authorized access only. All actions are logged and audited in accordance with university IT policy.
            </div>
          </div>

          {/* Right: Login Form & Quick Demo Launchers */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Portal Authentication</h2>
                <span className="text-xs text-slate-500">Academic Year 2026-27</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in using your college email or university roll number.
              </p>

              {/* Standard Login Form */}
              <form onSubmit={handleStandardLogin} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email / ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] focus:border-transparent outline-none transition"
                      placeholder="e.g. aarav.sharma@college.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset is managed via Campus Identity Service.'); }} className="text-xs text-brand-700 hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#0f243d] focus:ring-brand-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600">Remember on this terminal</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Portal
                </Button>
              </form>

              {/* Presentation Demo Selector Section */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Instant Demo Profiles (Class Presentation)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('STUDENT')}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-xs text-slate-900">Student</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">Aarav Sharma</div>
                    <div className="text-[10px] text-slate-400 font-mono">Roll: 2023CS042</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('STAFF')}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-xs text-slate-900">Staff</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">Rajesh Kumar</div>
                    <div className="text-[10px] text-slate-400 font-mono">Counter 2 Operator</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ADMIN')}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-xs text-slate-900">Admin</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">Dr. S. Mehra</div>
                    <div className="text-[10px] text-slate-400 font-mono">Dean / Admin</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 mt-4">
              Greenwood State University Information Systems • Enterprise Architecture
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-2.5 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 Greenwood State University. All rights reserved. System connected to Spring Boot REST Endpoints ready.
      </div>
    </div>
  );
};
