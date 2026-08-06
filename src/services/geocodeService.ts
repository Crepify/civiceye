import type { Coordinates } from '@/types';
import { distanceMeters } from '@/utils/geo';

/** Mock neighbourhoods used for the fake reverse-geocoder. */
const AREAS: Array<{ name: string; lat: number; lng: number; r: number }> = [
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, r: 2600 },
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, r: 2600 },
  { name: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7499, r: 3000 },
  { name: 'MG Road, Bengaluru', lat: 12.9757, lng: 77.604, r: 1800 },
  { name: 'HSR Layout, Bengaluru', lat: 12.9116, lng: 77.6372, r: 2200 },
  { name: 'Jayanagar, Bengaluru', lat: 12.925, lng: 77.5938, r: 2200 },
  { name: 'Marathahalli, Bengaluru', lat: 12.9569, lng: 77.7011, r: 2400 },
  { name: 'Malleshwaram, Bengaluru', lat: 13.0034, lng: 77.5674, r: 2000 },
  { name: 'Electronic City, Bengaluru', lat: 12.8452, lng: 77.6602, r: 2600 },
  { name: 'BTM Layout, Bengaluru', lat: 12.9166, lng: 77.6101, r: 2000 },
  { name: 'Rajajinagar, Bengaluru', lat: 12.9917, lng: 77.5537, r: 2200 },
  { name: 'Hebbal, Bengaluru', lat: 13.0358, lng: 77.597, r: 2400 },
];

/**
 * Mock reverse geocoding: nearest known neighbourhood.
 * In production this would call the Google Geocoding API.
 */
export function mockReverseGeocode(coords: Coordinates): string {
  let best = 'Bengaluru, Karnataka';
  let bestDist = Number.POSITIVE_INFINITY;
  for (const area of AREAS) {
    const d = distanceMeters(coords, { lat: area.lat, lng: area.lng });
    if (d < bestDist) {
      bestDist = d;
      best = area.name;
    }
  }
  return bestDist < 3200 ? best : `Bengaluru (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`;
}
