import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { landingFor } from '../common/roleRouting';
import { BrandMark } from '../ui/primitives';
import { useTheme } from '../ui/theme';

const COLS = 14;
const ROWS = 10;
const STATE_COLOR = { ok: '#2fc276', fix: '#f2a623', down: '#f2574d', idle: '#3a414c' };

/**
 * The "equipment wall": a grid of devices that quietly break and get fixed.
 * It is the product in one picture — every device, visible at once.
 */
function EquipmentWall() {
  const initial = useMemo(() => {
    const cells = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      const r = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const v = Math.abs(r);
      cells.push(v < 0.04 ? 'down' : v < 0.08 ? 'fix' : v < 0.13 ? 'idle' : 'ok');
    }
    return cells;
  }, []);
  const [cells, setCells] = useState(initial);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const t = setInterval(() => {
      setCells((prev) => {
        const next = prev.slice();
        // a broken device gets picked up, a fix completes, something new breaks
        const down = next.map((s, i) => (s === 'down' ? i : -1)).filter((i) => i >= 0);
        const fix = next.map((s, i) => (s === 'fix' ? i : -1)).filter((i) => i >= 0);
        if (down.length) next[down[Math.floor(Math.random() * down.length)]] = 'fix';
        if (fix.length) next[fix[Math.floor(Math.random() * fix.length)]] = 'ok';
        const j = Math.floor(Math.random() * next.length);
        if (next[j] === 'ok' && Math.random() < 0.8) next[j] = 'down';
        return next;
      });
    }, 1400);
    return () => clearInterval(t);
  }, []);

  const counts = cells.reduce((a, s) => ({ ...a, [s]: (a[s] || 0) + 1 }), {});

  return (
    <div className="relative">
      <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden="true">
        {cells.map((s, i) => (
          <span
            key={i}
            className="aspect-square rounded-[4px] transition-[background-color,box-shadow] duration-700"
            style={{
              background: STATE_COLOR[s],
              opacity: s === 'ok' ? 0.55 : 1,
              boxShadow: s === 'down' ? '0 0 0 3px rgba(242,87,77,0.18)' : s === 'fix' ? '0 0 0 3px rgba(242,166,35,0.16)' : 'none',
            }}
          />
        ))}
      </div>
      <div className="mt-5 flex items-center gap-5 text-[12px] text-white/60 font-mono">
        <span className="inline-flex items-center gap-2"><i className="w-2 h-2 rounded-full" style={{ background: STATE_COLOR.ok }} />{counts.ok || 0} working</span>
        <span className="inline-flex items-center gap-2"><i className="w-2 h-2 rounded-full" style={{ background: STATE_COLOR.fix }} />{counts.fix || 0} being fixed</span>
        <span className="inline-flex items-center gap-2"><i className="w-2 h-2 rounded-full" style={{ background: STATE_COLOR.down }} />{counts.down || 0} broken</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(landingFor(currentUser?.role), { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setErrorInfo(null);
    setLoading(true);

    try {
      const res = await login(email.trim(), password.trim());
      if (res && res.user) {
        navigate(landingFor(res.user.role), { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      let message = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'INVALID_CREDENTIALS') {
        message = 'That email and password don\'t match. Please try again.';
      } else if (err.code === 'FORBIDDEN') {
        message = 'This account is suspended. Please contact platform support.';
      }
      setErrorInfo({ code: err.code || 'AUTH_ERROR', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-[var(--paper)]">
      {/* Left: the product, in one picture */}
      <section className="relative hidden lg:flex flex-col gap-10 overflow-hidden bg-[#0e1115] text-white px-12 py-10 xl:px-16">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{ background: 'radial-gradient(900px 500px at 15% 0%, rgba(47,194,118,0.10), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(91,123,255,0.12), transparent 60%)' }}
        />
        <div className="relative flex items-center gap-3">
          <BrandMark size={34} />
          <div className="leading-none">
            <div className="text-[20px] font-[680] tracking-[-0.03em]">fixly</div>
            <div className="text-[11px] text-white/50 mt-1">by Fillip Technologies</div>
          </div>
        </div>

        <div className="relative max-w-[520px] my-auto">
          <h1 className="text-[38px] xl:text-[46px] leading-[1.02] font-[640] tracking-[-0.045em]">
            Every device.<br />
            Every location.<br />
            <span className="text-white/45">One look.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60 max-w-[44ch]">
            Cameras, lights, kiosks, screens and more — see what's working, what's broken and who is fixing it, across every site you look after.
          </p>
          <div className="mt-9 max-w-[400px]">
            <EquipmentWall />
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-[12px] text-white/40">
          <span>Live health</span>
          <span className="w-1 h-1 rounded-full bg-white/25" />
          <span>Daily on-site checks</span>
          <span className="w-1 h-1 rounded-full bg-white/25" />
          <span>Repairs tracked to closure</span>
        </div>
      </section>

      {/* Right: sign in */}
      <section className="relative flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        <button
          type="button"
          onClick={toggle}
          className="absolute top-5 right-5 w-9 h-9 grid place-items-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--color-interactive-hover)] cursor-pointer"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="w-full max-w-[380px]" style={{ animation: 'fx-rise 500ms cubic-bezier(.2,.7,.2,1) both' }}>
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <BrandMark size={32} />
            <span className="text-[20px] font-[680] tracking-[-0.03em]">fixly</span>
          </div>

          <h2 className="text-[28px] font-[650] tracking-[-0.035em] leading-tight">Sign in</h2>
          <p className="mt-2 text-[14px] text-[var(--ink-3)]">Use the email your administrator registered for you.</p>

          {errorInfo && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-[12px] border px-4 py-3 text-[13px]" style={{ background: 'var(--down-soft)', borderColor: 'color-mix(in oklab, var(--down) 30%, transparent)', color: 'var(--down-ink)' }}>
              <AlertCircle size={17} className="shrink-0 mt-[1px]" />
              <span>{errorInfo.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-[600] text-[var(--ink-2)]">Email</span>
              <span className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organisation.com"
                  className="fx-input !h-12 !text-[14.5px] !rounded-[12px] pl-10"
                />
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-[600] text-[var(--ink-2)]">Password</span>
              <span className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="fx-input !h-12 !text-[14.5px] !rounded-[12px] pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--color-interactive-hover)] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={loading} className="fx-btn fx-btn-primary !h-12 !rounded-[12px] !text-[14.5px] mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-[12px] text-[var(--ink-3)] leading-relaxed">
            Trouble signing in? Your organisation's administrator can reset your access.
          </p>
        </div>
      </section>
    </div>
  );
}
