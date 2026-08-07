import { Loader } from '@googlemaps/js-api-loader';
import { CITY_CENTER } from '@/utils/geo';

/**
 * Google Maps bootstrap.
 *
 * Loads the Maps JS API lazily (only when a valid key is configured).
 * The rest of the app uses `useGoogleMapsReady()` and gracefully falls
 * back to the built-in FallbackMapView when no key is present, so the
 * prototype runs with zero configuration.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

export function hasGoogleMapsKey(): boolean {
  return Boolean(API_KEY);
}

let loaderPromise: Promise<typeof google> | null = null;

/** Load (once) and resolve with the `google` namespace. */
export function loadGoogleMaps(): Promise<typeof google> {
  if (!API_KEY) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured.'));
  }
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

/** Async hook helper — resolves true when Maps is ready to be used. */
export async function isGoogleMapsReady(): Promise<boolean> {
  if (!hasGoogleMapsKey()) return false;
  try {
    await loadGoogleMaps();
    return true;
  } catch {
    return false;
  }
}

/**
 * Map style array: subtly desaturated, clean civic style.
 * Returns a dark variant when the app is in dark mode.
 */
export function getMapStyles(dark: boolean): google.maps.MapTypeStyle[] {
  const base: google.maps.MapTypeStyle[] = [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: dark ? '#1e293b' : '#ffffff' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: dark ? '#0f172a' : '#e2e8f0' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: dark ? '#94a3b8' : '#475569' }],
    },
    { featureType: 'water', stylers: [{ color: dark ? '#0e7490' : '#bae6fd' }] },
    { featureType: 'landscape', stylers: [{ color: dark ? '#0b1120' : '#f1f5f9' }] },
    { featureType: 'landscape.natural', stylers: [{ color: dark ? '#14532d' : '#dcfce7' }] },
  ];
  return base;
}

/** Default map centre (Bengaluru). */
export function defaultCenter(): google.maps.LatLngLiteral {
  return { lat: CITY_CENTER.lat, lng: CITY_CENTER.lng };
}

export { API_KEY };
