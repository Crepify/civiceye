import type { Review } from '@/types';
import { supabase } from '@/lib/supabase';

/**
 * Reviews service — real Supabase-backed review system.
 *
 * Users review reports (text), and other users agree/disagree with each
 * review via the atomic `vote_on_review` RPC (one vote per user per
 * review, enforced by a unique key + Row Level Security).
 */

export type ReviewVote = 'agree' | 'disagree';

interface ReviewRow {
  id: string;
  report_id: string | null;
  user_id: string | null;
  author_name: string;
  content: string;
  agrees: number;
  disagrees: number;
  created_at: string;
  report?: { id: string; title: string } | null;
}

function mapRow(row: ReviewRow): Review {
  return {
    id: row.id,
    reportId: row.report_id,
    userId: row.user_id,
    authorName: row.author_name,
    content: row.content,
    agrees: row.agrees,
    disagrees: row.disagrees,
    date: row.created_at,
    reportTitle: row.report?.title,
  };
}

export const reviewService = {
  /** Reviews for one report, newest first. */
  async getForReport(reportId: string): Promise<Review[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ReviewRow[]).map(mapRow);
  },

  /** Latest reviews across the site (with report title for the landing). */
  async getRecent(limit = 6): Promise<Review[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*, report:reports(id, title)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as ReviewRow[]).map(mapRow);
  },

  /** Create a review on a report. Requires a signed-in user. */
  async create(input: {
    reportId: string;
    content: string;
    authorName: string;
    userId: string;
  }): Promise<Review> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        report_id: input.reportId,
        user_id: input.userId,
        author_name: input.authorName,
        content: input.content,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRow(data as ReviewRow);
  },

  /** Agree / disagree with a review (atomic, once per user). */
  async vote(reviewId: string, voteType: ReviewVote): Promise<Review | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.rpc('vote_on_review', {
      p_review: reviewId,
      p_vote: voteType,
    });
    if (error) throw error;
    return data ? mapRow(data as ReviewRow) : undefined;
  },

  /** Which reviews the current user has already voted on (for UI state). */
  async getMyVotes(reviewIds: string[]): Promise<Record<string, ReviewVote>> {
    if (!supabase || reviewIds.length === 0) return {};
    const { data } = await supabase
      .from('review_votes')
      .select('review_id, vote_type')
      .in('review_id', reviewIds);
    const map: Record<string, ReviewVote> = {};
    (data ?? []).forEach((v) => {
      map[v.review_id as string] = v.vote_type as ReviewVote;
    });
    return map;
  },

  /** Delete a review (owner only — RLS enforced server-side). */
  async remove(reviewId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) throw error;
  },
};
