import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/** Access Supabase auth state + actions. Throws if used outside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
