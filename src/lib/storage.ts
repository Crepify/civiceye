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

  // Bucket name + full error surfaced so failures are diagnosable.
  const BUCKET = 'report-photos';
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    const detail =
      typeof error.message === 'string' && error.message
        ? error.message
        : `HTTP ${error.statusCode ?? '?'}`;
    throw new Error(
      `Photo upload failed (${detail}). ` +
        `Check that the "${BUCKET}" bucket exists and is Public in Supabase → Storage.`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

