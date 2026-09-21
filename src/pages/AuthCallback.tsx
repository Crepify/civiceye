import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Handles OAuth + magic-link + recovery redirects via PKCE code exchange.
 * Uses window.location.replace for the post-signin redirect so the app
 * re-mounts cleanly from the persisted session cookie (no React state
 * races).
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
    const code = params.get('code') ?? '';
    const next = params.get('next') ?? '/';
    // Supabase PKCE: ?code= is present after Google/magic-link return.
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setStatus('error');
            return;
          }
          // Hard reload so App/RequireAuth re-mount from the new cookie.
          window.location.replace(next);
        })
        .catch(() => setStatus('error'));
    } else {
      // No code — maybe an access_token fragment or just returning from
      // OAuth via implicit flow. Supabase's detectSessionInUrl handles it;
      // give it a beat then go home.
      window.setTimeout(() => window.location.replace(next), 300);
    }
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
