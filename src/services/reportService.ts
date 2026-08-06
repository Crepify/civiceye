import type { Profile, Report, ReportStatus, VoteType } from '@/types';
import { supabase } from '@/lib/supabase';

/**
 * Real report database backed by Supabase Postgres.
 *
 * Mirrors the shape the frontend expects (`Report`) so pages didn't have
 * to change when we moved off the mock JSON. All reads are public; all
 * writes require an authenticated user (see supabase/schema.sql + RLS).
 */

export interface ReportRow {
  id: string;
  code: string;
  user_id: string | null;
  author_name: string;
  title: string;
  description: string;
  category: Report['category'];
  severity: Report['severity'];
  status: ReportStatus;
  lat: number;
  lng: number;
  location_name: string | null;
  photo_url: string | null;
  ai: unknown;
  upvotes: number;
  downvotes: number;
  confirms: number;
  rejects: number;
  verified: boolean;
  assigned_to: string | null;
  created_at: string;
}

export function mapRow(row: ReportRow): Report {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    coordinates: { lat: row.lat, lng: row.lng },
    locationName: row.location_name ?? '',
    category: row.category,
    severity: row.severity,
    status: row.status,
    image: row.photo_url ?? '',
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    votes: row.upvotes - row.downvotes,
    confirms: row.confirms,
    rejects: row.rejects,
    date: row.created_at,
    verified: row.verified,
    author: row.author_name,
    assignedTo: row.assigned_to ?? undefined,
    userId: row.user_id ?? undefined,
  };
}

export const reportService = {
  /** All reports, newest first. */
  async getAll(): Promise<Report[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ReportRow[]).map(mapRow);
  },

  async getById(idOrCode: string): Promise<Report | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .or(`id.eq.${idOrCode},code.eq.${idOrCode}`)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as ReportRow) : undefined;
  },

  /** Create a report. `photoUrl` is already uploaded to storage. */
  async create(input: {
    title: string;
    description: string;
    coordinates: { lat: number; lng: number };
    locationName: string;
    category: Report['category'];
    severity: Report['severity'];
    photoUrl: string;
    author: string;
    userId: string;
    ai?: unknown;
  }): Promise<Report> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: input.userId,
        author_name: input.author,
        title: input.title,
        description: input.description,
        category: input.category,
        severity: input.severity,
        lat: input.coordinates.lat,
        lng: input.coordinates.lng,
        location_name: input.locationName,
        photo_url: input.photoUrl,
        ai: input.ai ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRow(data as ReportRow);
  },

  /** Community vote via the atomic `vote_on_report` RPC. */
  async vote(id: string, voteType: VoteType): Promise<Report | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.rpc('vote_on_report', {
      p_report: id,
      p_vote: voteType,
    });
    if (error) throw error;
    return data ? mapRow(data as ReportRow) : undefined;
  },

  /** Authority actions. */
  async markResolved(id: string): Promise<void> {
    await this.updateStatus(id, 'resolved');
  },

  async markInProgress(id: string, assignedTo: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('reports')
      .update({ status: 'in-progress', assigned_to: assignedTo, verified: true })
      .eq('id', id);
    if (error) throw error;
  },

  async rejectReport(id: string): Promise<void> {
    await this.updateStatus(id, 'rejected');
  },

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) throw error;
  },
};

/** Resolve a report's public display name from the logged-in profile. */
export function displayName(profile: Profile | null): string {
  if (!profile) return 'Anonymous citizen';
  return profile.full_name?.trim() || profile.email.split('@')[0] || 'Anonymous citizen';
}
