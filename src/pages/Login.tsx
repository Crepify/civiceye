import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useBrand } from '@/hooks/useBrand';
import { Logo } from '@/components/Logo';

const emailSchema = z.string().email('Enter a valid email (e.g. name@gmail.com).');

const emailValid = (v: string) => emailSchema.safeParse(v).success;

type Mode = 'signin' | 'signup' | 'magic';

/**
 * Login / sign up / magic-link screen.
 * - Any valid email is accepted (@gmail.com, @…amrita.edu, …).
 * - Logging in with an @…amrita.edu email activates the Amrita Eye brand.
 */
export function Login() {
  const { configured, loading, signInWithPassword, signUp, signInWithMagicLink, resetPassword } =
    useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentMagic, setSentMagic] = useState(false);
  const [sentReset, setSentReset] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!emailValid(email)) {
      setError('Enter a valid email address (e.g. name@gmail.com).');
      return false;
    }
    if (mode === 'signin' && password.length < 6) {
      setError('Enter your password.');
      return false;
    }
    if (mode === 'signup') {
      if (fullName.trim().length < 2) {
        setError('Enter your name.');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        toast.success('Welcome back! 👋', 'You are signed in.');
        navigate(next);
      } else if (mode === 'signup') {
        const { session } = await signUp(email, password, fullName);
        if (session) {
          // "Confirm email" is off in this project — straight in.
          toast.success('Account created! 🎉', 'You are signed in.');
          navigate(next);
        } else {
          setConfirmSent(true);
          setMode('signin');
          setPassword('');
        }
      } else {
        await signInWithMagicLink(email);
        setSentMagic(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(prettyAuthError(message));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    if (!emailValid(email)) {
      setError('Enter your email first, then request a reset.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setSentReset(true);
      toast.info('Reset link sent', 'Check your inbox for the password-reset email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return <SupabaseSetupScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 via-white to-white dark:from-primary-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary-400/15 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo to="/" className="justify-center" />
          <h1 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'signin'
              ? 'Welcome back'
              : mode === 'signup'
                ? 'Create your account'
                : 'Magic link sign in'}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Use any valid email — your <strong>@…amrita.edu</strong> address unlocks the Amrita Eye
            campus portal.
          </p>
        </div>

        <div className="card overflow-hidden p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/10">
                {(
                  [
                    ['signin', 'Sign in', LogIn],
                    ['signup', 'Sign up', UserPlus],
                    ['magic', 'Magic link', Mail],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMode(key);
                      setError(null);
                      setSentMagic(false);
                      setSentReset(false);
                      setConfirmSent(false);
                    }}
                    className={
                      mode === key
                        ? 'flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-bold text-primary-700 shadow-softer dark:bg-slate-800 dark:text-white'
                        : 'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-500 dark:text-slate-400'
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {error ? (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              ) : null}

              {confirmSent ? (
                <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                  <strong>Confirmation email sent to {email}.</strong> Click the link inside it, then
                  sign in below. No email? Check <strong>spam</strong> — or your project may have hit
                  Supabase&apos;s free email limit (~2–3/hour). See{' '}
                  <code className="font-semibold">SUPABASE_SETUP.md</code> for SMTP setup.
                </div>
              ) : null}

              {mode === 'magic' && sentMagic ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <MailCheck className="h-7 w-7" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Check your inbox
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    We sent a sign-in link to <strong>{email}</strong>. It expires in a few minutes.
                  </p>
                  <button
                    onClick={() => setSentMagic(false)}
                    className="mt-5 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Send to a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  {mode === 'signup' ? (
                    <div>
                      <label htmlFor="name" className="label-base">
                        Full name
                      </label>
                      <input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ananya Rao"
                        className="input-base"
                        autoComplete="name"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label htmlFor="email" className="label-base">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="input-base"
                      autoComplete="email"
                    />
                  </div>

                  {mode !== 'magic' ? (
                    <div>
                      <label htmlFor="password" className="label-base">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                        className="input-base"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                    </div>
                  ) : null}

                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === 'signin' ? (
                      <LogIn className="h-4 w-4" />
                    ) : mode === 'signup' ? (
                      <UserPlus className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {busy
                      ? 'Please wait…'
                      : mode === 'signin'
                        ? 'Sign in'
                        : mode === 'signup'
                          ? 'Create account'
                          : 'Email me a magic link'}
                  </button>

                  {mode === 'signin' ? (
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => void handleForgot()}
                        disabled={busy}
                        className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
                      >
                        <KeyRound className="mr-1 inline h-3 w-3" />
                        Forgot password?
                      </button>
                      {sentReset ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Reset link sent ✓
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </form>
              )}
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-bold text-primary-600 hover:underline dark:text-primary-400"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
          <span className="mx-2">·</span>
          <Link to="/" className="font-semibold hover:underline">
            Back to home
          </Link>
        </p>

        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>
            Amrita students & staff: signing in with your <strong>@…amrita.edu</strong> email
            switches the app to <strong>Amrita Eye</strong> — reports are pushed straight to campus
            staff.
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* "Connect Supabase" screen — shown when env keys are missing         */
/* ------------------------------------------------------------------ */

function SupabaseSetupScreen() {
  const { meta } = useBrand();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <Logo className="justify-center" />
        <h1 className="mt-8 text-2xl font-extrabold text-slate-900 dark:text-white">
          Connect {meta.appName} to Supabase
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Sign-in and real data need a free Supabase project. It takes 3 minutes:
        </p>
        <ol className="mx-auto mt-6 max-w-md space-y-3 text-left">
          {[
            'Create a free project at supabase.com',
            <>
              Run the schema in{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold dark:bg-white/10">
                supabase/schema.sql
              </code>{' '}
              (SQL Editor)
            </>,
            <>
              Copy the project URL + anon key into{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold dark:bg-white/10">
                .env
              </code>{' '}
              as{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold dark:bg-white/10">
                VITE_SUPABASE_URL
              </code>{' '}
              and{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold dark:bg-white/10">
                VITE_SUPABASE_ANON_KEY
              </code>
            </>,
            'Restart the dev server (or redeploy on Vercel)',
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-xs font-extrabold text-primary-600 dark:text-primary-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
          Full guide: <code className="font-semibold">SUPABASE_SETUP.md</code> in the project
        </p>
      </motion.div>
    </div>
  );
}

/* Map cryptic Supabase errors to friendly messages. */
function prettyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/already registered/i.test(message))
    return 'An account with this email already exists — try signing in instead.';
  if (/email not confirmed/i.test(message))
    return 'Please confirm your email first — check your inbox (and spam) for the link we sent.';
  if (/rate limit/i.test(message))
    return 'Too many attempts for this email — Supabase limits free sends to a few per hour. Please wait up to an hour, or set up a free SMTP (see SUPABASE_SETUP.md).';
  return message;
}
