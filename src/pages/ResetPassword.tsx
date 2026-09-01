import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';

/** Password reset screen — opened from the "recovery" email link. */
export function ResetPassword() {
  const { updatePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PKCE: the recovery link arrives as /reset?code=… — exchange it for a
  // session BEFORE showing the form (updatePassword needs a signed-in user).
  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    const code = params.get('code');
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('This reset link is invalid or expired. Please request a new one.');
        return;
      }
      setReady(true);
    })().catch(() =>
      setError('This reset link is invalid or expired. Please request a new one.'),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {error ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button onClick={() => navigate('/login')} className="btn-secondary mt-4">
              Back to login
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            Preparing your reset…
          </div>
        )}
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success('Password updated!', 'You can now sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo iconOnly />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Set a new password
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Choose a strong password for your account.
          </p>
          {error ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          ) : null}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="pw" className="label-base">
                New password
              </label>
              <input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="input-base"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="pw2" className="label-base">
                Confirm password
              </label>
              <input
                id="pw2"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="input-base"
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
