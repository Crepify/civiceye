import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Route guard: redirects anonymous visitors to /login (remembering where
 * they were headed). Reporting is the only area that requires an account.
 *
 * The guard waits until the initial session restore has finished
 * (`loading === false`) before deciding — this avoids the race where a
 * just-signed-in user gets bounced back to /login because React state
 * hasn't been updated yet.
 */
export function RequireAuth({ children }: React.PropsWithChildren<RequireAuthProps>) {
  const { configured, loading, user } = useAuth();
  const location = useLocation();

  // Demo/local-preview mode remains navigable without credentials. When
  // Supabase is configured, normal sign-in protection still applies.
  if (!configured) {
    return <>{children}</>;
  }

  if (loading || !user) {
    // Keep a spinner while the session is being restored, rather than
    // immediately redirecting — that redirect race is exactly what caused
    // the "press Sign in twice" bug.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
        <p className="text-xs font-semibold tracking-wide text-slate-400">
          {loading ? 'Checking your session…' : 'Sign in required'}
        </p>
        {!loading && !user && (
          // Emit the redirect AFTER rendering once so the user isn't
          // flashed back to /login on a fast sign-in.
          <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
