import type { Coordinates } from '@/types';

/**
 * Geolocation helpers with graceful fallbacks.
 */

export type GeoState =
  | { status: 'idle'; coords: null; error: null }
  | { status: 'loading'; coords: null; error: null }
  | { status: 'success'; coords: Coordinates; error: null }
  | { status: 'error'; coords: null; error: string };

/** Request the browser location, resolving to a typed result. */
export function requestLocation(timeoutMs = 8000): Promise<GeoState> {
  if (!('geolocation' in navigator)) {
    return Promise.resolve({
      status: 'error',
      coords: null,
      error: 'Geolocation is not supported by this browser.',
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          status: 'success',
          coords: {
            lat: Math.round(pos.coords.latitude * 1e5) / 1e5,
            lng: Math.round(pos.coords.longitude * 1e5) / 1e5,
          },
          error: null,
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. You can drop a pin manually instead.'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'Your position could not be determined. Please drop a pin manually.'
              : 'Location request timed out. Please drop a pin manually.';
        resolve({ status: 'error', coords: null, error: message });
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 },
    );
  });
}
