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
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { configured, loading, user } = useAuth();
  const location = useLocation();

  // Demo/local-preview mode remains navigable without credentials. When
  // Supabase is configured, normal sign-in protection still applies.
  if (!configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
