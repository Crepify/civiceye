import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import type { Cluster, Renderer } from '@googlemaps/markerclusterer';
import { loadGoogleMaps, getMapStyles } from '@/services/mapService';
import type { Coordinates, Report, Severity } from '@/types';
import { SEVERITY_META } from '@/data/categories';
import { useTheme } from '@/hooks/useTheme';
import { MapPopup } from './MapPopup';
import { clamp } from '@/utils/cn';

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
}

/** Tight, accurate Greater Bengaluru bounding box.
 *  strictBounds=true lets Google enforce the clamp every frame so zoom no
 *  longer slides sideways, and external centre/zoom changes get clamped
 *  back inside the bbox on the React side too (belt + suspenders). */
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

function pinIcon(severity: Severity, selected: boolean, verified: boolean, resolved: boolean) {
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
  } as google.maps.Icon;
}

function escapeHtml(s: string) {
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
}: GoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const heatCirclesRef = useRef<google.maps.Circle[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const infoRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const droppedPinRef = useRef<google.maps.Marker | null>(null);
  const { theme } = useTheme();

  // Bootstrap the map.
  useEffect(() => {
    let cancelled = false;
    let clickListener: google.maps.MapsEventListener | null = null;
    let map: google.maps.Map | null = null;

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      map = new google.maps.Map(containerRef.current, {
        center: BLR_INITIAL_CENTER,
        zoom,
        // strictBounds:true locks panning every frame — fixes the
        // "zooming slides sideways" bug we had with the dragend-only
        // clamp. User cannot pan outside Greater Bengaluru at any zoom.
        restriction: { latLngBounds: BLR_BOUNDS, strictBounds: true },
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
      });
      mapRef.current = map;

      // Extra clamp on zoom changes in case API fires a zoom outside range.
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

      // Pin-drop click handler.
      clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || !pinDropping || !map) return;
        const lat = clamp(e.latLng.lat(), BLR_BOUNDS.south, BLR_BOUNDS.north);
        const lng = clamp(e.latLng.lng(), BLR_BOUNDS.west, BLR_BOUNDS.east);
        onPinDrop({ lat, lng });
      }) as google.maps.MapsEventListener;
    });

    return () => {
      cancelled = true;
      clickListener?.remove();
      clustererRef.current?.setMap(null);
      heatCirclesRef.current.forEach((c) => c.setMap(null));
      heatCirclesRef.current = [];
      infoRef.current?.close();
      droppedPinRef.current?.setMap(null);
      map = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync theme
  useEffect(() => {
    mapRef.current?.setOptions({ styles: getMapStyles(theme === 'dark') });
  }, [theme]);

  // External centre/zoom changes (from locate/fly-to).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = {
      lat: clamp(center.lat, BLR_BOUNDS.south, BLR_BOUNDS.north),
      lng: clamp(center.lng, BLR_BOUNDS.west, BLR_BOUNDS.east),
    };
    map.panTo(target);
    const z = map.getZoom();
    const newZ = clamp(zoom, BLR_MIN_ZOOM, BLR_MAX_ZOOM);
    if (z !== newZ) map.setZoom(newZ);
  }, [center.lat, center.lng, zoom]);

  // Re-bind pin-drop when mode toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    google.maps.event.clearListeners(map, 'click');
    if (pinDropping) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        onPinDrop({
          lat: clamp(e.latLng.lat(), BLR_BOUNDS.south, BLR_BOUNDS.north),
          lng: clamp(e.latLng.lng(), BLR_BOUNDS.west, BLR_BOUNDS.east),
        });
      });
    }
  }, [pinDropping, onPinDrop]);

  // Markers + clustering.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clustererRef.current?.setMap(null);

    const markers = reports.map((r) => {
      const marker = new google.maps.Marker({
        position: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        icon: pinIcon(r.severity, r.id === selectedId, r.verified, r.status === 'resolved'),
        title: `${SEVERITY_META[r.severity].label}: ${r.title}`,
        zIndex:
          r.id === selectedId ? 1000 : r.severity === 'critical' ? 500 : r.severity === 'high' ? 400 : 200,
      });
      google.maps.event.addListener(marker, 'click', () => onSelect(r.id));

      // Hover tooltip (dark card over pin with AI-annotated preview).
      let ovRef: google.maps.OverlayView | null = null;
      const onHoverOver = () => {
        if (ovRef || !map) return;
        const tip = document.createElement('div');
        tip.style.cssText = 'position:absolute;z-index:9999;background:#111827;color:#fff;padding:8px 10px;border-radius:10px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:240px;width:220px;pointer-events:none;';
        const imgUrl = (r as any).annotatedImage || (r.ai as any)?.annotatedImage || r.image;
        const sevColor = SEVERITY_HEX[r.severity];
        const badge =
          r.status === 'resolved'
            ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Fixed</span>'
            : r.verified
              ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Verified</span>' : '';
        const title = escapeHtml(r.title || 'Report');
        const desc = escapeHtml((r.description || '').slice(0, 80));
        tip.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px;line-height:1.3">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sevColor};flex-shrink:0"></span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${title}</span>${badge}
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
          if (pos) { tip.style.left = `${pos.x - 110}px`; tip.style.top = `${pos.y - 170}px`; }
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

  // InfoWindow.
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
    const info = infoRef.current ?? new google.maps.InfoWindow({
      maxWidth: 340,
      disableAutoPan: false,
      pixelOffset: new google.maps.Size(0, -36),
    });
    info.setContent(host);
    info.setPosition({ lat: report.coordinates.lat, lng: report.coordinates.lng });
    info.open({ map });
    infoRef.current = info;
    info.addListener('closeclick', () => onSelect(null));
    return () => { root.unmount(); infoRef.current?.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, reports]);

  // Dropped pin.
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

  return <div ref={containerRef} className="h-full w-full" aria-label="Interactive map of Bengaluru" />;
}
