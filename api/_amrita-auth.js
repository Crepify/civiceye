/** Verify campus access with Supabase, never with client-provided claims. */
export async function requireAmritaSession(req) {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer \S+$/i.test(authorization)) {
    return { status: 401, error: 'Sign in with an official Amrita account.' };
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return { status: 503, error: 'Campus authentication is not configured.' };
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: key, Authorization: authorization },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { status: 401, error: 'Your session is invalid or expired.' };
    const user = await response.json();
    if (!user.email_confirmed_at || typeof user.email !== 'string' ||
        !/^[^\s@]+@(?:[a-z0-9-]+\.)*amrita\.edu$/i.test(user.email)) {
      return { status: 403, error: 'A verified Amrita email address is required.' };
    }
    return null;
  } catch {
    return { status: 503, error: 'Campus authentication is temporarily unavailable.' };
  }
}
