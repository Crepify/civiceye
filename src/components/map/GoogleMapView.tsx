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
import { Search, X, Navigation, Crosshair } from 'lucide-react';

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
  onSearchTarget?: (target: { center: Coordinates; zoom: number; label?: string } | null) => void;
}

/** Tight, accurate Greater Bengaluru bounding box.
 *  strictBounds:true lets Google enforce the clamp every frame so zoom no
 *  longer slides sideways; an idle listener provides belt+suspenders
 *  recentering in case API slips a pixel. */
const BLR_BOUNDS_LITERAL = {
  north: 13.205,
  south: 12.835,
  west: 77.375,
  east: 77.835,
};
const BLR_INITIAL_CENTER = { lat: 12.9716, lng: 77.5946 };
const BLR_MIN_ZOOM = 12;
const BLR_MAX_ZOOM = 19;

const SEVERITY_HEX: Record<Severity, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

function getBoundsSides(b: google.maps.LatLngBounds) {
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  return { south: sw.lat(), west: sw.lng(), north: ne.lat(), east: ne.lng() };
}

function pinIcon(severity: Severity, selected: boolean, verified: boolean, resolved: boolean) {
  const color = resolved ? '#10b981' : SEVERITY_HEX[severity];
  const size = selected ? 50 : 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <defs><filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-color="#000" flood-opacity="0.45"/></filter></defs>
    <path d="M12 0C7 0 3 4 3 9c0 6.6 7.5 13.6 8.4 14.5a1 1 0 0 0 1.2 0C13.5 22.6 21 15.6 21 9c0-5-4-9-9-9z"
          fill="${color}" stroke="#ffffff" stroke-width="1.8" filter="url(#sh)"/>
    <circle cx="12" cy="9" r="3.4" fill="#ffffff" opacity="0.95"/>
    ${verified ? `<circle cx="19.5" cy="4.5" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.6"/>` : ''}
    ${resolved ? `<path d="M18 3l1.3 1.3L22 1.6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" transform="translate(-.5 1.5)"/>` : ''}
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  } as google.maps.Icon;
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
  const hoverInfoRef = useRef<google.maps.InfoWindow | null>(null);
  const droppedPinRef = useRef<google.maps.Marker | null>(null);
  const blackoutRefs = useRef<google.maps.Rectangle[]>([]);
  const viewSyncingRef = useRef(false);
  const clampLockRef = useRef(false);
  const { theme } = useTheme();

  // Bootstrap the map exactly once.
  useEffect(() => {
    let cancelled = false;
    let idleListener: google.maps.MapsEventListener | null = null;
    let zoomListener: google.maps.MapsEventListener | null = null;
    let clickListener: google.maps.MapsEventListener | null = null;
    let map: google.maps.Map | null = null;

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;

      const restrictionBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.west),
        new google.maps.LatLng(BLR_BOUNDS_LITERAL.north, BLR_BOUNDS_LITERAL.east),
      );

      map = new google.maps.Map(containerRef.current, {
        center: BLR_INITIAL_CENTER,
        zoom,
        // Use a real LatLngBounds object + strictBounds:true for the
        // strongest possible pan lock. Google's docs say this is the only
        // way to prevent over-drag at all zoom levels.
        restriction: { latLngBounds: restrictionBounds, strictBounds: true },
        minZoom: BLR_MIN_ZOOM,
        maxZoom: BLR_MAX_ZOOM,
        styles: getMapStyles(theme === 'dark'),
        disableDefaultUI: true,
        zoomControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy',
        clickableIcons: false,
        // Prevent two-finger rotate/tilt from slipping the view out of bounds
        tilt: 0,
      });
      mapRef.current = map;

      // Clamp zoom if API ever goes out of range.
      zoomListener = map.addListener('zoom_changed', () => {
        if (!map) return;
        const z = map.getZoom();
        if (typeof z !== 'number') return;
        if (z < BLR_MIN_ZOOM) map.setZoom(BLR_MIN_ZOOM);
        else if (z > BLR_MAX_ZOOM) map.setZoom(BLR_MAX_ZOOM);
      });

      // Aggressive centre clamp: fires continuously during drag so the map
      // can never escape Bangalore, even at low zoom where strictBounds
      // can leave one edge visible. Re-enters via setCenter but uses a
      // lock flag to avoid infinite recursion.
      map.addListener('center_changed', () => {
        if (!map || clampLockRef.current) return;
        const c = map.getCenter();
        if (!c) return;
        let lat = c.lat();
        let lng = c.lng();
        let fixed = false;
        if (lat < BLR_BOUNDS_LITERAL.south) { lat = BLR_BOUNDS_LITERAL.south; fixed = true; }
        if (lat > BLR_BOUNDS_LITERAL.north) { lat = BLR_BOUNDS_LITERAL.north; fixed = true; }
        if (lng < BLR_BOUNDS_LITERAL.west) { lng = BLR_BOUNDS_LITERAL.west; fixed = true; }
        if (lng > BLR_BOUNDS_LITERAL.east) { lng = BLR_BOUNDS_LITERAL.east; fixed = true; }
        if (fixed) {
          clampLockRef.current = true;
          map.setCenter({ lat, lng });
          clampLockRef.current = false;
        }
      });

      // Fire view changes only on idle (when pan/zoom has settled) to
      // avoid React re-render storms while the user drags.
      idleListener = map.addListener('idle', () => {
        if (!map) return;
        const c = map.getCenter();
        if (!c) return;
        const lat = clamp(c.lat(), BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.north);
        const lng = clamp(c.lng(), BLR_BOUNDS_LITERAL.west, BLR_BOUNDS_LITERAL.east);
        if (viewSyncingRef.current) { viewSyncingRef.current = false; return; }
        onViewChange({ lat, lng }, map.getZoom() ?? 12);
      });

      // Pin-drop click handler (default no-op; only fires when pinDropping).
      clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || !pinDropping || !map) return;
        const lat = clamp(e.latLng.lat(), BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.north);
        const lng = clamp(e.latLng.lng(), BLR_BOUNDS_LITERAL.west, BLR_BOUNDS_LITERAL.east);
        onPinDrop({ lat, lng });
      }) as google.maps.MapsEventListener;

      // Initial hover info window (reused across markers).
      hoverInfoRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -8),
      });
    });

    return () => {
      cancelled = true;
      idleListener?.remove();
      zoomListener?.remove();
      clickListener?.remove();
      clustererRef.current?.clearMarkers();
      clustererRef.current?.setMap(null);
      heatCirclesRef.current.forEach((c) => c.setMap(null));
      heatCirclesRef.current = [];
      infoRef.current?.close();
      hoverInfoRef.current?.close();
      droppedPinRef.current?.setMap(null);
      blackoutRefs.current.forEach((r) => r.setMap(null));
      blackoutRefs.current = [];
      map = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync theme.
  useEffect(() => {
    mapRef.current?.setOptions({ styles: getMapStyles(theme === 'dark') });
  }, [theme]);

  // External centre/zoom changes (from locate / fly-to / search).
  // Using a ref guard to avoid the panTo -> onViewChange -> setState ->
  // panTo feedback loop that fights the user's drag.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = {
      lat: clamp(center.lat, BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.north),
      lng: clamp(center.lng, BLR_BOUNDS_LITERAL.west, BLR_BOUNDS_LITERAL.east),
    };
    const newZ = clamp(zoom, BLR_MIN_ZOOM, BLR_MAX_ZOOM);
    viewSyncingRef.current = true;
    map.setCenter(target);
    map.setZoom(newZ);
  }, [center.lat, center.lng, zoom]);

  // Re-bind click for pin-drop mode.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    google.maps.event.clearListeners(map, 'click');
    if (pinDropping) {
      map.setOptions({ draggableCursor: 'crosshair' });
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        onPinDrop({
          lat: clamp(e.latLng.lat(), BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.north),
          lng: clamp(e.latLng.lng(), BLR_BOUNDS_LITERAL.west, BLR_BOUNDS_LITERAL.east),
        });
      });
    } else {
      map.setOptions({ draggableCursor: '' });
    }
  }, [pinDropping, onPinDrop]);

  // Markers + clustering (with working hover previews).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clustererRef.current?.clearMarkers();
    clustererRef.current?.setMap(null);

    const markers: google.maps.Marker[] = [];

    reports.forEach((r) => {
      const marker = new google.maps.Marker({
        position: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        icon: pinIcon(r.severity, r.id === selectedId, r.verified, r.status === 'resolved'),
        title: `${SEVERITY_META[r.severity].label}: ${r.title}`,
        zIndex:
          r.id === selectedId ? 1000 : r.severity === 'critical' ? 500 : r.severity === 'high' ? 400 : 200,
      });
      google.maps.event.addListener(marker, 'click', () => onSelect(r.id));

      // Hover preview: use a single shared InfoWindow with disableAutoPan —
      // this is Google's documented pattern and far more reliable than a
      // hand-rolled OverlayView.
      const hoverHtml = `
        <div style="font:12px/1.4 Inter,system-ui,sans-serif;color:#1f2937;max-width:220px">
          <div style="font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SEVERITY_HEX[r.severity]}"></span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px">${r.title || 'Report'}</span>
            ${r.status === 'resolved' ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:auto">Fixed</span>'
              : r.verified ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:auto">Verified</span>' : ''}
          </div>
          <div style="font-size:11px;color:#6b7280">${r.locationName || ''}</div>
          ${(r as any).annotatedImage || (r.ai as any)?.annotatedImage
            ? `<img src="${(r as any).annotatedImage || (r.ai as any)?.annotatedImage}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-top:4px;display:block" referrerpolicy="no-referrer"/>`
            : r.image
              ? `<img src="${r.image}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-top:4px;display:block" referrerpolicy="no-referrer"/>`
              : ''}
        </div>`;
      google.maps.event.addListener(marker, 'mouseover', () => {
        // Don't show the hover preview if the selected-pin card is already
        // open — InfoWindows are mutually exclusive and we don't want to
        // fight the user's selection.
        if (selectedId === r.id) return;
        const hover = hoverInfoRef.current;
        if (!hover || !map) return;
        hover.setContent(hoverHtml);
        hover.setPosition(marker.getPosition()!);
        hover.open(map);
      });
      google.maps.event.addListener(marker, 'mouseout', () => {
        hoverInfoRef.current?.close();
      });
      markers.push(marker);
    });

    clustererRef.current = new MarkerClusterer({
      markers,
      map,
      renderer: new ClusterRenderer(),
      algorithm: new GridAlgorithm({ gridSize: 56, maxDistance: 40000 }),
    });

    return () => {
      markers.forEach((m) => { google.maps.event.clearInstanceListeners(m); m.setMap(null); });
      clustererRef.current?.clearMarkers();
    };
  }, [reports, selectedId, onSelect]);

  // Heatmap circles.
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

  // Selected-pin InfoWindow (card popup).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const report = reports.find((r) => r.id === selectedId);
    if (!report) { infoRef.current?.close(); return; }

    const host = document.createElement('div');
    host.style.cssText = 'padding:0;background:transparent;';
    const root = createRoot(host);
    infoRootRef.current = root;
    root.render(<MapPopup report={report} onClose={() => onSelect(null)} />);
    const info = infoRef.current ?? new google.maps.InfoWindow({ maxWidth: 340, disableAutoPan: false });
    info.setContent(host);
    info.setPosition({ lat: report.coordinates.lat, lng: report.coordinates.lng });
    info.open({ map });
    infoRef.current = info;
    info.addListener('closeclick', () => onSelect(null));
    return () => { root.unmount(); infoRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, reports]);

  // Dropped pin for report flow.
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

  // ---- Places search + blackout overlay ----
  // Search is rendered as an absolutely-positioned overlay above the map so
  // React does NOT control its value — typing never re-renders the input
  // so focus is never stolen. We read the value via ref on submit, fly to
  // the result, then draw four solid rectangles that black out everything
  // outside the result's viewport (N / S / E / W bands — simpler and
  // visually perfect compared to inverted polygon holes).
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const focusBoundsRef = useRef<google.maps.LatLngBounds | null>(null);

  const clearBlackout = () => {
    blackoutRefs.current.forEach((r) => r.setMap(null));
    blackoutRefs.current = [];
    focusBoundsRef.current = null;
    setSearchLabel(null);
    onSearchTarget?.(null);
  };

  const drawBlackout = (bounds: google.maps.LatLngBounds) => {
    const map = mapRef.current;
    if (!map) return;
    blackoutRefs.current.forEach((r) => r.setMap(null));
    blackoutRefs.current = [];
    focusBoundsRef.current = bounds;
    const outer = BLR_BOUNDS_LITERAL;
    const sides = getBoundsSides(bounds);
    const { south, north, west, east } = sides;
    const rectOpts: google.maps.RectangleOptions = {
      fillColor: '#000000',
      fillOpacity: 0.55,
      strokeWeight: 0,
      clickable: false,
      map,
      zIndex: 50,
    };
    if (north < outer.north) blackoutRefs.current.push(new google.maps.Rectangle({ ...rectOpts, bounds: { north: outer.north, south: north, west: outer.west, east: outer.east } }));
    if (south > outer.south) blackoutRefs.current.push(new google.maps.Rectangle({ ...rectOpts, bounds: { north: south, south: outer.south, west: outer.west, east: outer.east } }));
    if (east < outer.east) blackoutRefs.current.push(new google.maps.Rectangle({ ...rectOpts, bounds: { north, south, west: east, east: outer.east } }));
    if (west > outer.west) blackoutRefs.current.push(new google.maps.Rectangle({ ...rectOpts, bounds: { north, south, west: outer.west, east: west } }));
    blackoutRefs.current.push(new google.maps.Rectangle({
      map, bounds, clickable: false, zIndex: 51,
      fillOpacity: 0, strokeColor: '#ef6b59', strokeWeight: 3, strokeOpacity: 0.9,
    }));
  };

  const handleSearch = () => {
    const map = mapRef.current;
    const input = searchInputRef.current;
    if (!map || !input) return;
    const q = input.value.trim();
    if (!q) return;
    setSearchBusy(true);
    const svc = new google.maps.places.PlacesService(map);
    svc.textSearch(
      { query: q, location: new google.maps.LatLng(BLR_INITIAL_CENTER.lat, BLR_INITIAL_CENTER.lng), radius: 20000 },
      (results, status) => {
        setSearchBusy(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results[0]) {
          input.classList.add('ring-2', 'ring-red-400');
          window.setTimeout(() => input.classList.remove('ring-2', 'ring-red-400'), 1200);
          return;
        }
        const place = results[0];
        const loc = place.geometry?.location;
        if (!loc) return;
        const vb = place.geometry?.viewport;
        let targetZoom = 16;
        if (vb) {
          map.fitBounds(vb);
          google.maps.event.addListenerOnce(map, 'idle', () => drawBlackout(vb));
        } else {
          map.setCenter(loc);
          map.setZoom(17);
          const nb = map.getBounds()!;
          drawBlackout(nb);
        }
        const finalZoom = map.getZoom() ?? targetZoom;
        setSearchLabel(place.name || q);
        onSearchTarget?.({ center: { lat: loc.lat(), lng: loc.lng() }, zoom: finalZoom, label: place.name || q });
        input.blur();
      },
    );
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = clamp(pos.coords.latitude, BLR_BOUNDS_LITERAL.south, BLR_BOUNDS_LITERAL.north);
        const lng = clamp(pos.coords.longitude, BLR_BOUNDS_LITERAL.west, BLR_BOUNDS_LITERAL.east);
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(17);
        clearBlackout();
      },
      () => { /* denied */ },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  // (Blackout rectangles stay anchored to lat/lng so they move with the map
  // naturally — no bounds_changed redraw needed.)

  return (
    <div className="relative h-full w-full" aria-label="Interactive map of Bengaluru">
      <div ref={containerRef} className="h-full w-full" />

      {/* Search overlay (UNCONTROLLED via ref — no React re-render on type) */}
      <div className="pointer-events-none absolute left-3 top-3 z-30 flex w-[min(calc(100%-1.5rem),360px)] items-stretch gap-0">
        <div className="pointer-events-auto flex flex-1 items-stretch overflow-hidden rounded-xl border-[3px] border-[#172b44] bg-white shadow-[4px_4px_0_#172b44]">
          <span className="flex items-center justify-center pl-3 text-slate-500"><Search className="h-4 w-4" /></span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search a place or area…"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') { searchInputRef.current!.value = ''; clearBlackout(); } }}
          />
          {searchLabel ? (
            <button
              type="button"
              onClick={() => { if (searchInputRef.current) searchInputRef.current.value = ''; clearBlackout(); }}
              className="flex items-center justify-center px-2 text-slate-400 hover:text-rose-500"
              aria-label="Clear search focus"
              title="Clear blackout"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searchBusy}
          className="pointer-events-auto ml-2 flex items-center justify-center rounded-xl border-[3px] border-[#172b44] bg-[#ffd630] px-3 text-xs font-black shadow-[4px_4px_0_#172b44] transition enabled:hover:-translate-y-0.5 disabled:opacity-50"
        >
          Go
        </button>
        <button
          type="button"
          onClick={handleLocate}
          className="pointer-events-auto ml-2 flex items-center justify-center rounded-xl border-[3px] border-[#172b44] bg-white px-2.5 text-slate-600 shadow-[4px_4px_0_#172b44] transition hover:-translate-y-0.5 hover:text-[#ef6b59]"
          aria-label="Use my location"
          title="My location"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      {searchLabel ? (
        <div className="pointer-events-none absolute left-3 top-16 z-30 flex items-center gap-2 rounded-lg border-2 border-[#172b44] bg-[#ffd630] px-3 py-1.5 text-xs font-black shadow-[3px_3px_0_#172b44]">
          <Navigation className="h-3.5 w-3.5" /> Focus: {searchLabel}
          <button onClick={clearBlackout} className="pointer-events-auto ml-1 rounded p-0.5 hover:bg-black/10" aria-label="Clear focus">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
