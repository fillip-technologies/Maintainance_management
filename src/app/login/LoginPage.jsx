import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Sparkles,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Selected quick role tab: 'client_admin' | 'super_admin' | 'custom'
  const [selectedRoleTab, setSelectedRoleTab] = useState('client_admin');
  const [email, setEmail] = useState('client@apexestates.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const target = isSuperAdmin ? '/superadmin/overview' : '/clientadmin/overview';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleRoleTabSelect = (roleKey) => {
    setSelectedRoleTab(roleKey);
    setErrorInfo(null);
    if (roleKey === 'client_admin') {
      setEmail('client@apexestates.com');
      setPassword('Password123!');
    } else if (roleKey === 'super_admin') {
      setEmail('admin@fixly.io');
      setPassword('Password123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res && res.user) {
        const dest = res.user.role === 'super_admin' ? '/superadmin/overview' : '/clientadmin/overview';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      let message = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'INVALID_CREDENTIALS') {
        message = 'Invalid email or password. Please verify credentials.';
      } else if (err.code === 'FORBIDDEN') {
        message = 'Account is suspended. Please contact platform support.';
      }
      setErrorInfo({
        code: err.code || 'AUTH_ERROR',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/25 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Ambient Gradient Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Brand Showcase */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          {/* Logo Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Wrench size={22} className="-rotate-12" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">fixly</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-wide uppercase">
                  Enterprise
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Facility & Maintenance Platform
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Facility <br />
              <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Command & Telemetry
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              Manage facility equipment, monitor daily operational health logs, oversee Zone Officers, and coordinate certified field technicians seamlessly.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs backdrop-blur-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Multi-Role Security</span>
                <span className="text-[11px] text-slate-500">Strict RBAC & profile isolation</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs backdrop-blur-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Live Status Sync</span>
                <span className="text-[11px] text-slate-500">Real-time daily equipment checks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean White Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/90 flex flex-col gap-6 relative">
            
            {/* Card Header */}
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sign In to Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Select a quick demo account or enter your credentials.
              </p>
            </div>

            {/* Quick 1-Click Role Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => handleRoleTabSelect('client_admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRoleTab === 'client_admin'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Building2 size={15} className={selectedRoleTab === 'client_admin' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Client Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabSelect('super_admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRoleTab === 'super_admin'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <ShieldCheck size={15} className={selectedRoleTab === 'super_admin' ? 'text-indigo-600' : 'text-slate-400'} />
                <span>Super Admin</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorInfo && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold">{errorInfo.code}</span>
                  <span className="text-rose-600 text-[11px] mt-0.5">{errorInfo.message}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Email Address / Login ID
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedRoleTab('custom');
                    }}
                    placeholder="name@company.com"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:text-indigo-700">
                    Forgot?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedRoleTab('custom');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Helper Badge */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600" />
                <span>Demo Pass: <strong className="text-slate-700 font-mono">Password123!</strong></span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">v1.0 API</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
