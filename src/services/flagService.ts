import { supabase } from '@/lib/supabase';

/**
 * Flag (report an inappropriate post) service — backed by Supabase.
 * Civilians flag posts; admins review flags and take posts down.
 */

export type FlagReason = 'spam' | 'harassment' | 'false-info' | 'inappropriate' | 'other';

export const FLAG_REASONS: Array<{ id: FlagReason; label: string }> = [
  { id: 'spam', label: 'Spam / advertisement' },
  { id: 'harassment', label: 'Harassment or abuse' },
  { id: 'false-info', label: 'False or misleading info' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'other', label: 'Something else' },
];

export interface FlagRow {
  id: string;
  report_id: string;
  user_id: string | null;
  flagger_email: string;
  reason: string;
  note: string | null;
  created_at: string;
  report?: {
    id: string;
    code: string;
    title: string;
    category: string;
    scope: string;
    author_name: string;
    location_name: string | null;
    created_at: string;
    photo_url: string | null;
  } | null;
}

export interface Flag {
  id: string;
  reportId: string;
  reason: string;
  note: string | null;
  date: string;
  flaggerEmail: string;
  report?: FlagRow['report'];
}

function mapFlag(row: FlagRow): Flag {
  return {
    id: row.id,
    reportId: row.report_id,
    reason: row.reason,
    note: row.note,
    date: row.created_at,
    flaggerEmail: row.flagger_email,
    report: row.report,
  };
}

export const flagService = {
  /** Add a flag on a post. Requires a signed-in user. */
  async add(reportId: string, reason: string, note: string | null, flaggerEmail: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('report_flags').insert({
      report_id: reportId,
      flagger_email: flaggerEmail,
      reason,
      note,
    });
    if (error) throw error;
  },

  /** All flags (with the flagged report attached) — for the admin panel. */
  async getAll(): Promise<Flag[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('report_flags')
      .select('*, report:reports(id, code, title, category, scope, author_name, location_name, created_at, photo_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as FlagRow[]).map(mapFlag);
  },

  /** Admin removes a flag (e.g. after dismissing). */
  async remove(flagId: string) {
    if (!supabase) return;
    const { error } = await supabase.from('report_flags').delete().eq('id', flagId);
    if (error) throw error;
  },
};
