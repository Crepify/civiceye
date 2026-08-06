import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Handles magic-link / recovery redirects.
 * Supabase sends users here (?code=…&next=…) after clicking an email
 * link; we exchange the code for a session and route them on.
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'exchanging' | 'error'>('exchanging');

  useEffect(() => {
    if (!supabase) {
      setStatus('error');
      return;
    }
    supabase.auth
      .exchangeCodeForSession(params.get('code') ?? '')
      .then(() => {
        navigate(params.get('next') ?? '/', { replace: true });
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {status === 'exchanging' ? (
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          Signing you in…
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-semibold text-rose-600">
            The sign-in link was invalid or expired.
          </p>
          <button onClick={() => navigate('/login')} className="btn-secondary mt-4">
            Back to login
          </button>
        </div>
      )}
    </div>
  );
}
