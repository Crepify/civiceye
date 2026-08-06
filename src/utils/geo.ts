import type { Coordinates } from '@/types';

/**
 * Geographic helpers. The fallback map uses a simple equirectangular
 * projection centred on the city, which is more than enough for a
 * prototype visualisation.
 */

export const CITY_CENTER: Coordinates = { lat: 12.9716, lng: 77.5946 };
export const CITY_RADIUS_DEG = 0.09; // default half-viewport in degrees
export const MAX_ZOOM = 17;
export const MIN_ZOOM = 10;

/** radians */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distance between two coordinates in metres (haversine). */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

/**
 * Project lat/lng into a local "world" coordinate system.
 * `center` is the current viewport centre; `scale` = pixels per degree
 * (already longitude-compressed by cos(lat)).
 */
export function project(coords: Coordinates, center: Coordinates, scale: number): ProjectedPoint {
  const cosLat = Math.cos(toRad(center.lat));
  return {
    x: (coords.lng - center.lng) * scale * cosLat,
    y: -(coords.lat - center.lat) * scale,
  };
}

/** Inverse of {@link project}. */
export function unproject(point: ProjectedPoint, center: Coordinates, scale: number): Coordinates {
  const cosLat = Math.cos(toRad(center.lat));
  return {
    lng: center.lng + point.x / (scale * cosLat),
    lat: center.lat - point.y / scale,
  };
}

/** Default pixels-per-degree at a given zoom for the fallback map. */
export function scaleForZoom(zoom: number): number {
  return 4000 * Math.pow(2, zoom - 15);
}

/**
 * Snap a coordinate to a slightly "human" grid so pins feel deliberate
 * rather than randomly scattered.
 */
export function jitter(coords: Coordinates, radius = 0.00035): Coordinates {
  const j = (r: number) => (Math.random() - 0.5) * 2 * r;
  return { lat: coords.lat + j(radius), lng: coords.lng + j(radius) };
}

/** Round trip formatted value. */
export function round5(n: number): number {
  return Math.round(n * 100000) / 100000;
}
