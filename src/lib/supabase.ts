import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase bootstrap.
 *
 * The app runs fully without Supabase (nice setup screen, empty states),
 * and lights up the moment `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
 * are set in `.env`.
 */

const URL = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(URL && ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(URL, ANON_KEY)
  : null;
