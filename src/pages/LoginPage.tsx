import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, EyeOff, Loader2, Mail, ScanEye, X } from 'lucide-react';
import { getDefaultRouteForRole } from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';
import { requestPasswordReset } from '@/services/authService';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, rememberedEmail, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, [rememberedEmail]);

  const openForgotPassword = () => {
    setResetEmail(email);
    setResetError('');
    setResetSuccess(false);
    setForgotOpen(true);
  };

  const handleForgotClose = (open: boolean) => {
    setForgotOpen(open);
    if (!open) {
      setResetError('');
      setResetSuccess(false);
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    setResetLoading(true);

    const result = await requestPasswordReset(resetEmail.trim().toLowerCase());
    setResetLoading(false);

    if ('error' in result) {
      setResetError(result.error);
      return;
    }

    setResetSuccess(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, remember);
    setLoading(false);

    if (result.success && result.user) {
      navigate(getDefaultRouteForRole(result.user.role), { replace: true });
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1120]">
        <Loader2 className="h-8 w-8 animate-spin text-[#60a5fa]" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0b1120] text-[#f8fafc]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0b1120 0%, #0f172a 30%, #1e3a5f 70%, #0f172a 100%)',
        }}
      />

      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          top: -100,
          left: -80,
          width: 280,
          height: 280,
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          bottom: 60,
          right: -60,
          width: 200,
          height: 200,
          backgroundColor: 'rgba(250, 204, 21, 0.08)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <ScanEye className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#f8fafc]">TileVision</span>
        </div>
        <span className="text-xs font-medium text-[#64748b]">Management Portal</span>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4">
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px]"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                }}
              >
                <ScanEye className="h-9 w-9 text-white" strokeWidth={1.8} />
              </div>
            </div>
            <h1
              className="mb-2 text-[36px] font-extrabold tracking-[-0.04em] text-[#f8fafc]"
              style={{ letterSpacing: -1 }}
            >
              TileVision
            </h1>
            <p className="max-w-sm px-4 text-sm leading-[22px] text-[#94a3b8]">
              AI-Assisted Tile Defect Documentation and Decision Support System
            </p>
          </div>

          <div className="tilevision-glass-card mt-2 rounded-2xl p-5 sm:p-6">
            <h2 className="mb-1 text-[22px] font-bold text-[#f8fafc]">Sign In</h2>
            <p className="mb-6 text-sm text-[#94a3b8]">
              Management portal — monitoring, review, and decision support
            </p>

            <form onSubmit={handleSubmit}>
              <LoginField
                label="Email Address"
                type="email"
                placeholder="your@tilevision.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoComplete="email"
                required
              />

              <LoginField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoComplete="current-password"
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1 text-[#64748b] transition-colors hover:text-[#94a3b8]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />

              <div className="mb-4 flex items-center justify-between gap-3">
                <RememberCheckbox
                  checked={remember}
                  onChange={setRemember}
                  label="Remember Me"
                />
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-sm font-medium text-[#60a5fa] transition-colors hover:text-[#93c5fd]"
                >
                  Forgot password?
                </button>
              </div>

              {error ? (
                <p className="mb-3 text-center text-[13px] text-[#ef4444]">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-bold tracking-wide text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                  minHeight: 54,
                }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <footer className="relative z-10 border-t border-[rgba(148,163,184,0.12)] px-5 py-4 text-center sm:px-8">
        <p className="text-xs text-[#64748b]">
          &copy; {new Date().getFullYear()} TileVision · AI-Assisted Tile Defect Documentation and Decision Support System
        </p>
      </footer>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => handleForgotClose(false)}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetError={resetError}
        setResetError={setResetError}
        resetSuccess={resetSuccess}
        resetLoading={resetLoading}
        onSubmit={handleResetSubmit}
      />
    </div>
  );
}

function ForgotPasswordModal({
  open,
  onClose,
  resetEmail,
  setResetEmail,
  resetError,
  setResetError,
  resetSuccess,
  resetLoading,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  resetEmail: string;
  setResetEmail: (value: string) => void;
  resetError: string;
  setResetError: (value: string) => void;
  resetSuccess: boolean;
  resetLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-[400px] rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.96)] p-6 text-[#f8fafc] shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md p-1 text-[#94a3b8] transition-colors hover:bg-[rgba(148,163,184,0.1)] hover:text-[#f8fafc]"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 pr-8">
              <h2 id="reset-password-title" className="text-xl font-bold text-[#f8fafc]">
                Reset Password
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#94a3b8]">
                Enter your registered email and we&apos;ll send password reset instructions.
              </p>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.1)] p-4">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#22c55e]" />
                  <div>
                    <p className="text-sm font-semibold text-[#f8fafc]">Check your inbox</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">
                      If an account exists for{' '}
                      <span className="font-mono text-[#cbd5e1]">{resetEmail}</span>, reset
                      instructions have been sent.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-1">
                <LoginField
                  label="Email Address"
                  type="email"
                  placeholder="your@tilevision.com"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError('');
                  }}
                  autoComplete="email"
                  required
                />

                {resetError ? (
                  <p className="mb-3 text-center text-[13px] text-[#ef4444]">{resetError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function RememberCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="group flex cursor-pointer select-none items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200',
          'border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.75)]',
          'group-hover:border-[rgba(96,165,250,0.5)]',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(59,130,246,0.45)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0f172a]',
          checked && 'border-[#3b82f6] bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.35)]',
        )}
      >
        <Check
          className={cn(
            'h-3 w-3 text-white transition-all duration-200',
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
          strokeWidth={3}
        />
      </span>
      <span className="text-sm text-[#94a3b8] transition-colors group-hover:text-[#cbd5e1]">
        {label}
      </span>
    </label>
  );
}

function LoginField({
  label,
  trailing,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  label: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        className="mb-2 block text-[13px] font-semibold tracking-wide text-[#cbd5e1]"
        style={{ letterSpacing: 0.3 }}
      >
        {label}
      </label>
      <div
        className={cn(
          'flex items-center rounded-xl border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] px-4',
          trailing && 'pr-2',
        )}
      >
        <input
          className={cn(
            'flex-1 bg-transparent py-3.5 text-[15px] text-[#f8fafc] placeholder:text-[#64748b] focus:outline-none',
            className,
          )}
          {...props}
        />
        {trailing}
      </div>
    </div>
  );
}
