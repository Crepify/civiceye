import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isAmritaEmail } from '@/utils/auth';

export function RequireAmrita({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
        <span className="text-sm font-semibold text-slate-500">Checking campus access…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!user.email || !isAmritaEmail(user.email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="text-xl font-bold">Amrita account required</h2>
        <p className="max-w-md text-sm text-slate-500">
          Amrita Eye is available only to verified Amrita students and staff using an official Amrita email address.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
