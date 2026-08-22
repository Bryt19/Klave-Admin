import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/base/Logo';

const DUMMY_EMAIL = 'founder@klavora.io';
const DUMMY_PASSWORD = 'klavora2026';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [filledFeedback, setFilledFeedback] = useState(false);

  const handleAutoFill = () => {
    setEmail(DUMMY_EMAIL);
    setPassword(DUMMY_PASSWORD);
    setError('');
    setFilledFeedback(true);
    setTimeout(() => setFilledFeedback(false), 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email.trim() === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
        localStorage.setItem('klavora_auth', 'true');
        navigate('/');
      } else {
        setError('Invalid credentials. Click "Auto-fill Demo Access" to test.');
      }
      setLoading(false);
    }, 700);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSignupSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg)' }}>
      {/* Left branding pane */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[540px] shrink-0 p-12 relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(145deg, #090d16 0%, #0f172a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Ambient background glows */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00D287 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -right-24 w-96 h-96 rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0EA5E9 0%, transparent 70%)' }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top brand header */}
        <div className="relative z-10">
          <Logo size="md" />
        </div>

        {/* Center narrative */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[12px] font-mono font-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Founder & Admin Console
            </div>
            <h2 className="text-[34px] font-extrabold tracking-tight leading-tight font-heading">
              Intelligent pharmacy operations, centralized.
            </h2>
            <p className="text-[14px] text-slate-400 font-body leading-relaxed max-w-md">
              Real-time oversight over pharmacy subscriptions, revenue metrics, batch stock tracking, and support cases across Ghana.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-600">Active Pharmacies</p>
              <p className="text-[22px] font-bold text-white font-mono mt-0.5">24</p>
              <p className="text-[11px] text-emerald-400 font-body mt-0.5 flex items-center gap-1">
                <i className="ri-arrow-up-line" /> +4 this month
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-600">Monthly Run Rate</p>
              <p className="text-[22px] font-bold text-white font-mono mt-0.5">GH₵18.4k</p>
              <p className="text-[11px] text-emerald-400 font-body mt-0.5 flex items-center gap-1">
                <i className="ri-arrow-up-line" /> +18.2% vs last mo
              </p>
            </div>
          </div>

          {/* Trust features */}
          <div className="space-y-2 max-w-md">
            {[
              { icon: 'ri-shield-keyhole-line', text: 'Multi-tenant secure data isolation' },
              { icon: 'ri-database-2-line', text: 'FEFO stock compliance & batch tracking' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2.5 text-[12px] text-slate-300 font-body">
                <i className={`${f.icon} text-sky-400 text-[14px]`} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 flex items-center justify-between text-[12px] text-slate-500 font-body">
          <span>© 2026 Klavora Inc.</span>
          <span>v2.4.0-admin</span>
        </div>
      </div>

      {/* Right form pane */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Mobile brand header */}
          <div className="flex lg:hidden justify-center mb-2">
            <Logo size="md" />
          </div>

          {/* Form container */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-sm transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Tab switch */}
            <div
              className="flex p-1 rounded-xl gap-1 mb-6"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSignupSuccess(false); }}
                className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'shadow-xs'
                    : 'hover:opacity-80'
                }`}
                style={{
                  background: tab === 'login' ? 'var(--surface)' : 'transparent',
                  color: tab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: tab === 'login' ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(''); }}
                className={`flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'shadow-xs'
                    : 'hover:opacity-80'
                }`}
                style={{
                  background: tab === 'signup' ? 'var(--surface)' : 'transparent',
                  color: tab === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: tab === 'signup' ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                Create Account
              </button>
            </div>

            {tab === 'login' ? (
              <div className="space-y-5">
                <div>
                  <h1 className="text-[22px] font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
                    Founder Sign In
                  </h1>
                  <p className="text-[13px] font-body mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Enter your credentials to manage your platform
                  </p>
                </div>

                {/* Auto-fill test pill */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl border transition-all"
                  style={{
                    background: 'rgba(14,165,233,0.06)',
                    borderColor: 'rgba(14,165,233,0.25)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <i className="ri-key-2-line text-sky-600 text-[15px]" />
                    <span className="text-[12px] font-semibold text-sky-700 dark:text-sky-300 font-body">
                      Demo Founder Access
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-700 cursor-pointer transition-all bg-sky-600 text-white hover:bg-sky-500 active:scale-95"
                  >
                    {filledFeedback ? 'Filled ✓' : 'Auto-fill'}
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-[12px] font-body">
                    <i className="ri-error-warning-line text-[15px] shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold font-body mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px]" style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="founder@klavora.io"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] uppercase tracking-wider font-semibold font-body" style={{ color: 'var(--text-secondary)' }}>
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <i className="ri-lock-2-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px]" style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-all bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-[16px]" />
                        <span>Verifying access...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <i className="ri-arrow-right-line text-[15px]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h1 className="text-[22px] font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
                    Founder Registration
                  </h1>
                  <p className="text-[13px] font-body mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Request administrative credentials for Klavora
                  </p>
                </div>

                {signupSuccess ? (
                  <div
                    className="p-6 rounded-xl text-center space-y-3"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-[22px]">
                      <i className="ri-check-line" />
                    </div>
                    <p className="font-bold text-[15px] font-heading" style={{ color: 'var(--text-primary)' }}>
                      Request Submitted
                    </p>
                    <p className="text-[12px] font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Your administrative registration is under review. You can sign in using demo credentials right away.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setSignupSuccess(false); }}
                      className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-sky-600 hover:bg-sky-500 cursor-pointer transition-all mt-2"
                    >
                      Go to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    {error && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-[12px] font-body">
                        <i className="ri-error-warning-line text-[15px] shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold font-body mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Dr. Kwame Mensah"
                        className="w-full h-10 px-3.5 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold font-body mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Work Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="kwame@klavora.io"
                        className="w-full h-10 px-3.5 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold font-body mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Password
                      </label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full h-10 px-3.5 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold font-body mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Confirm Password
                      </label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-10 px-3.5 rounded-xl text-[13px] font-body outline-none transition-all focus:ring-2 focus:ring-sky-500/30"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-all bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin text-[16px]" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <span>Submit Registration</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
