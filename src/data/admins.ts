import type { BrandId } from '@/types';

/**
 * Admin configuration — EASY TO EXTEND.
 *
 * To add a future admin, add their email to the list below (optionally
 * with a brand scope). Or set `VITE_ADMIN_EMAILS` in your environment as
 * a comma-separated list (emails are case-insensitive). Emails in the
 * database `admin_users` table are also checked server-side for deletes.
 *
 * Rule: every `@amrita.edu` email that is NOT a `*.students.*` address
 * (i.e. teachers/staff) is automatically an Amrita Eye admin.
 */

const ENV_ADMINS: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

/** Static admin list (extend here). */
const STATIC_ADMINS: Array<{ email: string; brand: BrandId | 'both' }> = [
  { email: 'bl.ai.u4aid26006@bl.students.amrita.edu', brand: 'amrita' },
  { email: 'architrenjeev@gmail.com', brand: 'civiceye' },
];

export function isAdminEmail(email: string | null | undefined, brand: BrandId): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  // Static config
  for (const a of STATIC_ADMINS) {
    if (a.email.toLowerCase() === normalized && (a.brand === 'both' || a.brand === brand)) {
      return true;
    }
  }
  // Env list
  if (ENV_ADMINS.includes(normalized)) return true;

  // Teacher rule: @amrita.edu but NOT *.students.* → Amrita admin
  if (brand === 'amrita' && normalized.endsWith('@amrita.edu') && !normalized.includes('.students.')) {
    return true;
  }

  return false;
}
