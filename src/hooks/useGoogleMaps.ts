import { useEffect, useState } from 'react';
import { hasGoogleMapsKey, loadGoogleMaps } from '@/services/mapService';

export type GoogleMapsStatus = 'loading' | 'ready' | 'fallback';

/**
 * Resolves whether the Google Maps API is usable.
 * - No key configured → 'fallback' immediately (built-in fallback map).
 * - Key configured → load once; on failure fall back gracefully.
 */
export function useGoogleMapsStatus(): GoogleMapsStatus {
  const [status, setStatus] = useState<GoogleMapsStatus>(() =>
    hasGoogleMapsKey() ? 'loading' : 'fallback',
  );

  useEffect(() => {
    if (!hasGoogleMapsKey()) return;
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
