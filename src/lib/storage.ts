import { supabase } from './supabase';

/**
 * Upload a report photo (data URL) to Supabase Storage.
 * Returns the public URL of the stored file.
 */
export async function uploadReportPhoto(dataUrl: string, userId: string): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type === 'image/png' ? 'png' : 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from('report-photos')
    .upload(path, blob, { contentType: blob.type || 'image/jpeg' });
  if (error) throw error;
  const { data } = supabase.storage.from('report-photos').getPublicUrl(path);
  return data.publicUrl;
}
