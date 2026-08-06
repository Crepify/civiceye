import type { Coordinates } from '@/types';

/**
 * Formatting helpers shared across the app.
 */

/** "2026-08-01T09:30:00.000Z" → "Aug 1, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "2026-08-01T09:30:00.000Z" → "Aug 1, 2026 · 9:30 AM" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString(
    'en-IN',
    { hour: 'numeric', minute: '2-digit' },
  )}`;
}

/** Human friendly "time ago" string. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: Array<[number, string]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = seconds;
  let unit = 'second';
  for (const [size, name] of units) {
    if (value < size) {
      unit = name;
      break;
    }
    value /= size;
  }
  const rounded = Math.max(1, Math.floor(value));
  return `${rounded} ${unit}${rounded > 1 ? 's' : ''} ago`;
}

/** Compact number formatting: 1247 → "1.2k". */
export function compactNumber(n: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** "12.9715987, 77.5945627" → "12.9716° N, 77.5946° E" */
export function formatCoords(coords: Coordinates, digits = 5): string {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coords.lat).toFixed(digits)}° ${latDir}, ${Math.abs(coords.lng).toFixed(digits)}° ${lngDir}`;
}

/** Compact coordinate label for small UI: "12.9716, 77.5946". */
export function formatCoordsShort(coords: Coordinates, digits = 4): string {
  return `${coords.lat.toFixed(digits)}, ${coords.lng.toFixed(digits)}`;
}

/** Google Maps "directions" deep-link. */
export function directionsUrl(coords: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
}

/** Google Maps "view" deep-link. */
export function mapsUrl(coords: Coordinates): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}
