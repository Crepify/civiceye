import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import type { Cluster, Renderer } from '@googlemaps/markerclusterer';
import { loadGoogleMaps, getMapStyles } from '@/services/mapService';
import type { Coordinates, Report, Severity } from '@/types';
import { SEVERITY_META } from '@/data/categories';
import { useTheme } from '@/hooks/useTheme';
import { MapPopup } from './MapPopup';
import { clamp } from '@/utils/cn';
import { Search, X, Navigation } from 'lucide-react';

interface GoogleMapViewProps {
  reports: Report[];
  center: Coordinates;
  zoom: number;
  onViewChange: (center: Coordinates, zoom: number) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  heatmap: boolean;
  pinDropping: boolean;
  onPinDrop: (coords: Coordinates) => void;
  droppedPin: Coordinates | null;
  onSearchTarget?: (bounds: { north: number; south: number; east: number; west: number; label: string } | null) => void;
}

/**
 * Tight, accurate Greater Bengaluru bounding box. Values were chosen to
 * include BBMP limits + a bit of the airport road to the north and
 * Electronics City / Anekal to the south without letting you pan to
 * Hosur, Tumkur, or Kolar. strictBounds=true means the *map canvas itself*
 * can never be pulled outside this rectangle, which fixes the "zoom makes
 * it slide sideways" bug the previous listener-on-dragend version had.
 */
const BLR_BOUNDS = {
  north: 13.205,
  south: 12.835,
  west: 77.375,
  east: 77.835,
};
const BLR_INITIAL_CENTER = { lat: 12.9716, lng: 77.5946 };
const BLR_MIN_ZOOM = 11;
const BLR_MAX_ZOOM = 19;

const SEVERITY_HEX: Record<Severity, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

function pinIcon(severity: Severity, selected: boolean, verified: boolean, resolved: boolean): google.maps.Icon {
  const color = resolved ? '#10b981' : SEVERITY_HEX[severity];
  const size = selected ? 48 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <defs><filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.35"/></filter></defs>
    <path d="M12 0C7 0 3 4 3 9c0 6.6 7.5 13.6 8.4 14.5a1 1 0 0 0 1.2 0C13.5 22.6 21 15.6 21 9c0-5-4-9-9-9z"
          fill="${color}" stroke="#ffffff" stroke-width="1.6" filter="url(#sh)"/>
    <circle cx="12" cy="9" r="3.2" fill="#ffffff" opacity="0.9"/>
    ${verified ? `<circle cx="19.5" cy="4.5" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>` : ''}
    ${resolved ? `<path d="M18 3l1.3 1.3L22 1.6" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" fill="none" transform="translate(-.5 1.5)"/>` : ''}
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  };
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class ClusterRenderer implements Renderer {
  render(cluster: Cluster) {
    const count = cluster.markers.length;
    const size = count > 50 ? 56 : count > 20 ? 48 : 40;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#4f46e5" fill-opacity="0.92"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="none" stroke="#c7d2fe" stroke-width="2"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="${count > 99 ? 13 : 15}" font-weight="700" fill="#ffffff">${count}</text>
    </svg>`;
    return new google.maps.Marker({
      position: cluster.position,
      icon: {
        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      },
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + cluster.markers.length,
      title: `${count} reports here`,
    });
  }
}

export function GoogleMapView({
  reports,
  center,
  zoom,
  onViewChange,
  selectedId,
  onSelect,
  heatmap,
  pinDropping,
  onPinDrop,
  droppedPin,
  onSearchTarget,
}: GoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const heatCirclesRef = useRef<google.maps.Circle[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const infoRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const droppedPinRef = useRef<google.maps.Marker | null>(null);
  const blackoutRef = useRef<google.maps.Polygon | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchLabel, setSearchLabel] = useState<string | null>(null);

  // Bootstrap the map once.
  useEffect(() => {
    let cancelled = false;
    let map: google.maps.Map | null = null;
    let clickListener: google.maps.MapsEventListener | null = null;

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      const blrBounds = new google.maps.LatLngBounds(
        { lat: BLR_BOUNDS.south, lng: BLR_BOUNDS.west },
        { lat: BLR_BOUNDS.north, lng: BLR_BOUNDS.east },
      );
      map = new google.maps.Map(containerRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom,
        // strictBounds=true is the magic flag that fixes the "zoom slides
        // sideways" bug: Google's own panning logic clamps every frame
        // instead of letting us drift and then correcting after dragend.
        restriction: {
          latLngBounds: BLR_BOUNDS,
          strictBounds: true,
        },
        minZoom: BLR_MIN_ZOOM,
        maxZoom: BLR_MAX_ZOOM,
        styles: getMapStyles(theme === 'dark'),
        disableDefaultUI: true,
        zoomControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy',
        // Force the initial center inside the bounds (belt & suspenders).
        center: blrBounds.contains(new google.maps.LatLng(center.lat, center.lng))
          ? { lat: center.lat, lng: center.lng }
          : BLR_INITIAL_CENTER,
      });
      mapRef.current = map;

      // Hard centre clamp on every idle tick — guarantees bounds are never
      // violated even after keyboard / programmatic moves.
      const clampCenter = () => {
        if (!map) return;
        const c = map.getCenter();
        if (!c) return;
        let lat = c.lat();
        let lng = c.lng();
        let moved = false;
        if (lat < BLR_BOUNDS.south) { lat = BLR_BOUNDS.south; moved = true; }
        if (lat > BLR_BOUNDS.north) { lat = BLR_BOUNDS.north; moved = true; }
        if (lng < BLR_BOUNDS.west) { lng = BLR_BOUNDS.west; moved = true; }
        if (lng > BLR_BOUNDS.east) { lng = BLR_BOUNDS.east; moved = true; }
        if (moved) map.panTo({ lat, lng });
      };
      map.addListener('idle', clampCenter);
      map.addListener('zoom_changed', () => {
        if (!map) return;
        const z = map.getZoom();
        if (typeof z !== 'number') return;
        if (z < BLR_MIN_ZOOM) map.setZoom(BLR_MIN_ZOOM);
        else if (z > BLR_MAX_ZOOM) map.setZoom(BLR_MAX_ZOOM);
      });

      map.addListener('center_changed', () => {
        if (!map) return;
        const c = map.getCenter();
        if (!c) return;
        onViewChange({ lat: c.lat(), lng: c.lng() }, map.getZoom() ?? 12);
      });

      clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        // Only handle clicks here when pin-dropping is active; otherwise the
        // click listener re-bound in the pinDropping effect takes over.
        if (pinDropping) {
          onPinDrop({ lat: clamp(e.latLng.lat(), BLR_BOUNDS.south, BLR_BOUNDS.north), lng: clamp(e.latLng.lng(), BLR_BOUNDS.west, BLR_BOUNDS.east) });
        }
      }) as unknown as google.maps.MapsEventListener;
    });

    return () => {
      cancelled = true;
      clickListener?.remove();
      clustererRef.current?.setMap(null);
      heatCirclesRef.current.forEach((c) => c.setMap(null));
      heatCirclesRef.current = [];
      infoRef.current?.close();
      blackoutRef.current?.setMap(null);
      searchMarkerRef.current?.setMap(null);
      map = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme sync
  useEffect(() => {
    mapRef.current?.setOptions({ styles: getMapStyles(theme === 'dark') });
  }, [theme]);

  // External centre/zoom changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (!c) return;
    const target = {
      lat: clamp(center.lat, BLR_BOUNDS.south, BLR_BOUNDS.north),
      lng: clamp(center.lng, BLR_BOUNDS.west, BLR_BOUNDS.east),
    };
    const moved = Math.abs(c.lat() - target.lat) > 1e-6 || Math.abs(c.lng() - target.lng) > 1e-6;
    if (moved) map.panTo(target);
    const z = map.getZoom();
    const newZ = clamp(zoom, BLR_MIN_ZOOM, BLR_MAX_ZOOM);
    if (z !== newZ) map.setZoom(newZ);
  }, [center.lat, center.lng, zoom]);

  // Pin-drop mode re-binding
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const listeners: google.maps.MapsEventListener[] = [];
    google.maps.event.clearListeners(map, 'click');
    if (pinDropping) {
      listeners.push(map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        onPinDrop({ lat: clamp(e.latLng.lat(), BLR_BOUNDS.south, BLR_BOUNDS.north), lng: clamp(e.latLng.lng(), BLR_BOUNDS.west, BLR_BOUNDS.east) });
      }) as unknown as google.maps.MapsEventListener);
    }
    return () => { listeners.forEach((l) => l.remove()); };
  }, [pinDropping, onPinDrop]);

  // Markers + clustering
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clustererRef.current?.setMap(null);

    const markers = reports.map((r) => {
      const marker = new google.maps.Marker({
        position: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        icon: pinIcon(r.severity, r.id === selectedId, r.verified, r.status === 'resolved'),
        title: `${SEVERITY_META[r.severity].label}: ${r.title}`,
        zIndex: r.id === selectedId ? 1000 : r.severity === 'critical' ? 500 : r.severity === 'high' ? 400 : 200,
      });
      google.maps.event.addListener(marker, 'click', () => onSelect(r.id));

      let ovRef: google.maps.OverlayView | null = null;
      const onHoverOver = () => {
        if (ovRef || !map) return;
        const tip = document.createElement('div');
        tip.style.cssText = 'position:absolute;z-index:9999;background:#111827;color:#fff;padding:8px 10px;border-radius:10px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:240px;width:220px;pointer-events:none;';
        const imgUrl = (r as any).annotatedImage || (r.ai as any)?.annotatedImage || r.image;
        const sevColor = SEVERITY_HEX[r.severity];
        const statusBadge =
          r.status === 'resolved'
            ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Fixed</span>'
            : r.verified
              ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Verified</span>'
              : '';
        const title = escapeHtml(r.title || 'Report');
        const desc = escapeHtml((r.description || '').slice(0, 80));
        tip.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px;line-height:1.3">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sevColor};flex-shrink:0"></span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${title}</span>${statusBadge}
          </div>
          ${imgUrl
            ? `<img src="${imgUrl}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:6px;display:block" referrerpolicy="no-referrer" />`
            : '<div style="width:100%;height:60px;background:#1f2937;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">No photo</div>'}
          ${desc ? `<div style="margin-top:4px;opacity:.8;line-height:1.3">${desc}</div>` : ''}
        `;
        const ov = new google.maps.OverlayView();
        ov.onAdd = () => { ov.getPanes()!.floatPane.appendChild(tip); };
        ov.draw = () => {
          const proj = ov.getProjection();
          if (!proj) return;
          const pos = proj.fromLatLngToDivPixel(marker.getPosition()!);
          if (pos) { tip.style.left = pos.x - 110 + 'px'; tip.style.top = pos.y - 170 + 'px'; }
        };
        ov.onRemove = () => { tip.remove(); ovRef = null; };
        ov.setMap(map);
        ovRef = ov;
      };
      const onHoverOut = () => { if (ovRef) { ovRef.setMap(null); ovRef = null; } };
      google.maps.event.addListener(marker, 'mouseover', onHoverOver);
      google.maps.event.addListener(marker, 'mouseout', onHoverOut);
      return marker;
    });

    clustererRef.current = new MarkerClusterer({
      markers,
      map,
      renderer: new ClusterRenderer(),
      algorithm: new GridAlgorithm({ gridSize: 56, maxDistance: 40000 }),
    });

    return () => { clustererRef.current?.setMap(null); clustererRef.current = null; };
  }, [reports, selectedId, onSelect]);

  // Heatmap circles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    heatCirclesRef.current.forEach((c) => c.setMap(null));
    heatCirclesRef.current = [];
    if (!heatmap || reports.length === 0) return;
    heatCirclesRef.current = reports.map((r) => {
      const weight = SEVERITY_META[r.severity].weight;
      const color = SEVERITY_HEX[r.severity];
      return new google.maps.Circle({
        map, center: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        radius: 22 + weight * 20,
        fillColor: color, fillOpacity: 0.1 + weight * 0.06,
        strokeColor: color, strokeOpacity: 0.3, strokeWeight: 1, zIndex: 1,
      });
    });
    return () => { heatCirclesRef.current.forEach((c) => c.setMap(null)); heatCirclesRef.current = []; };
  }, [reports, heatmap]);

  // InfoWindow for selected pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const report = reports.find((r) => r.id === selectedId);
    if (!report) { infoRef.current?.close(); return; }

    const host = document.createElement('div');
    const root = createRoot(host);
    infoRootRef.current = root;
    root.render(<MapPopup report={report} onClose={() => onSelect(null)} />);
    const info = infoRef.current ?? new google.maps.InfoWindow({ maxWidth: 360 });
    info.setContent(host);
    info.setPosition({ lat: report.coordinates.lat, lng: report.coordinates.lng });
    info.open({ map });
    infoRef.current = info;
    info.addListener('closeclick', () => onSelect(null));
    return () => { root.unmount(); infoRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, reports]);

  // Dropped pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    droppedPinRef.current?.setMap(null);
    droppedPinRef.current = null;
    if (!droppedPin) return;
    droppedPinRef.current = new google.maps.Marker({
      position: { lat: droppedPin.lat, lng: droppedPin.lng },
      icon: pinIcon('critical', true, false, false),
      map,
      zIndex: Number(google.maps.Marker.MAX_ZINDEX),
    });
    return () => { droppedPinRef.current?.setMap(null); droppedPinRef.current = null; };
  }, [droppedPin]);

  // ----- Search + blackout -----------------------------------------------
  async function runSearch(q: string) {
    const query = q.trim();
    const map = mapRef.current;
    if (!map) return;
    if (!query) { clearSearch(); return; }
    setSearching(true);
    try {
      // Bias results to Bengaluru via location+radius so searching
      // "Electronic City" always hits the one in Bengaluru.
      const request: google.maps.places.TextSearchRequest = {
        query,
        location: new google.maps.LatLng(BLR_INITIAL_CENTER.lat, BLR_INITIAL_CENTER.lng),
        radius: 25000,
        bounds: new google.maps.LatLngBounds(
          { lat: BLR_BOUNDS.south, lng: BLR_BOUNDS.west },
          { lat: BLR_BOUNDS.north, lng: BLR_BOUNDS.east },
        ),
      };
      const service = new google.maps.places.PlacesService(map);
      service.textSearch(request, (results, status) => {
        setSearching(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results[0]) {
          setSearchLabel(null);
          clearBlackout();
          onSearchTarget?.(null);
          return;
        }
        const place = results[0];
        const loc = place.geometry?.location;
        if (!loc) return;
        // Fly to the result.
        const target = { lat: loc.lat(), lng: loc.lng() };
        map?.fitBounds(place.geometry?.viewport || new google.maps.LatLngBounds(
          { lat: target.lat - 0.01, lng: target.lng - 0.01 },
          { lat: target.lat + 0.01, lng: target.lng + 0.01 },
        ));
        // Drop a marker.
        searchMarkerRef.current?.setMap(null);
        searchMarkerRef.current = new google.maps.Marker({
          position: target, map,
          icon: pinIcon('high', true, false, false),
          title: place.name || query,
          zIndex: 1001,
        });
        // Blackout rectangle = everything OUTSIDE the viewport bounds gets a
        // dimmed overlay. We draw it by adding a 4-polygon mask (inverted
        // rectangle) so the focused area stays bright.
        drawBlackout(place.geometry?.viewport || new google.maps.LatLngBounds(
          { lat: target.lat - 0.01, lng: target.lng - 0.01 },
          { lat: target.lat + 0.01, lng: target.lng + 0.01 },
        ));
        const vb = place.geometry?.viewport;
        const label = place.name || query;
        setSearchLabel(label);
        onSearchTarget?.(vb ? {
          north: vb.getNorthEast().lat(), south: vb.getSouthWest().lat(),
          east: vb.getNorthEast().lng(), west: vb.getSouthWest().lng(),
          label,
        } : { north: target.lat + 0.01, south: target.lat - 0.01, east: target.lng + 0.01, west: target.lng - 0.01, label });
      });
    } catch (err) {
      setSearching(false);
      console.warn('[map-search] failed', err);
    }
  }

  function drawBlackout(focus: google.maps.LatLngBounds) {
    const map = mapRef.current;
    if (!map) return;
    blackoutRef.current?.setMap(null);
    // Build an "inverted rectangle" polygon covering the whole visible area
    // minus the focused bbox — Google Maps doesn't have a built-in mask so
    // we use a polygon with a hole.
    const N = BLR_BOUNDS.north, S = BLR_BOUNDS.south, E = BLR_BOUNDS.east, W = BLR_BOUNDS.west;
    const fN = focus.getNorthEast().lat(), fS = focus.getSouthWest().lat();
    const fE = focus.getNorthEast().lng(), fW = focus.getSouthWest().lng();
    // Outer ring (clockwise around full bbox), inner ring (counter-clockwise
    // around the hole).
    const poly = new google.maps.Polygon({
      paths: [
        [{ lat: N, lng: W }, { lat: N, lng: E }, { lat: S, lng: E }, { lat: S, lng: W }, { lat: N, lng: W }],
        [{ lat: fN, lng: fW }, { lat: fS, lng: fW }, { lat: fS, lng: fE }, { lat: fN, lng: fE }, { lat: fN, lng: fW }],
      ],
      strokeColor: '#000000',
      strokeOpacity: 0.4,
      strokeWeight: 1,
      fillColor: '#000000',
      fillOpacity: 0.55,
      clickable: false,
      zIndex: 10,
    });
    poly.setMap(map);
    blackoutRef.current = poly;
  }

  function clearBlackout() {
    blackoutRef.current?.setMap(null);
    blackoutRef.current = null;
    searchMarkerRef.current?.setMap(null);
    searchMarkerRef.current = null;
    setSearchLabel(null);
    onSearchTarget?.(null);
  }

  function clearSearch() {
    setSearchQuery('');
    clearBlackout();
    searchInputRef.current?.blur();
  }

  return (
    <div className="relative h-full w-full">
      {/* Search bar */}
      <div className="pointer-events-auto absolute left-3 right-3 top-3 z-10 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/90 sm:right-auto sm:w-[360px]">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch(searchQuery);
            if (e.key === 'Escape') clearSearch();
          }}
          placeholder="Search a place in Bengaluru (e.g. Electronic City)"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
        />
        {searching ? (
          <span className="text-xs text-slate-400">…</span>
        ) : searchQuery ? (
          <button onClick={clearSearch} className="rounded-md p-1 text-slate-400 hover:text-slate-600" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          onClick={() => runSearch(searchQuery)}
          className="rounded-lg bg-primary-600 px-3 py-1 text-xs font-bold text-white hover:bg-primary-700"
        >
          Go
        </button>
      </div>

      {searchLabel ? (
        <div className="pointer-events-auto absolute left-3 top-16 z-10 flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:w-auto">
          <Navigation className="h-3 w-3" /> Focused on: {searchLabel}
          <button onClick={clearSearch} className="ml-1 rounded p-0.5 hover:bg-white/20" aria-label="Clear focus">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div ref={containerRef} className="h-full w-full" aria-label="Interactive map of Bengaluru" />
    </div>
  );
}
