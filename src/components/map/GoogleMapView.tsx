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

/* Bengaluru bounding box — restricts pan/zoom to Greater Bengaluru area so
 * users can't scroll the map into another city. */
const BLR_BOUNDS = {
  north: 13.22,
  south: 12.78,
  west: 77.35,
  east: 77.85,
};


const SEVERITY_HEX: Record<Severity, string> = {
  low: '#10b981',      // emerald
  medium: '#f59e0b',   // amber
  high: '#f97316',     // orange
  critical: '#ef4444', // red (was rose-500 — red reads "critical" better on a map)
};

/** Custom pin icon as an SVG data URL. Color is severity-coded. */
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

/** Escape a string for safe injection into an HTML tooltip. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Cluster renderer — a severity-aware counter bubble. */
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

/**
 * Full Google Maps view: clustered markers, severity heatmap, info
 * windows, pin-drop mode and dark-mode styling.
 */
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

  const readyRef = useRef(false);

  // Bootstrap the map once the API is available.
  useEffect(() => {
    let map: google.maps.Map | null = null;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        map = new google.maps.Map(containerRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom,
          restriction: {
            latLngBounds: BLR_BOUNDS,
            strictBounds: false, // let the edge bounds show with padding
          },
          minZoom: 11, // keep BBMP metro area visible, don't zoom out to country
          maxZoom: 19,
          styles: getMapStyles(theme === 'dark'),
          disableDefaultUI: true,
          zoomControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy',
        });
        mapRef.current = map;
        readyRef.current = true;

        // Keep the user from dragging outside Bengaluru.
        const bounds = new google.maps.LatLngBounds(
          { lat: BLR_BOUNDS.south, lng: BLR_BOUNDS.west },
          { lat: BLR_BOUNDS.north, lng: BLR_BOUNDS.east },
        );
        map.addListener('dragend', () => {
          if (!map) return;
          const c = map.getCenter();
          if (!c) return;
          if (!bounds.contains(c)) {
            map.panTo({
              lat: clamp(c.lat(), BLR_BOUNDS.south, BLR_BOUNDS.north),
              lng: clamp(c.lng(), BLR_BOUNDS.west, BLR_BOUNDS.east),
            });
          }
        });

        map.addListener('center_changed', () => {
          if (!map) return;
          const c = map.getCenter();
          if (!c) return;
          onViewChange({ lat: c.lat(), lng: c.lng() }, map.getZoom() ?? 12);
        });

        if (pinDropping) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            onPinDrop({
              lat: clamp(e.latLng.lat(), -90, 90),
              lng: clamp(e.latLng.lng(), -180, 180),
            });
          });
        }
      })
      .catch(() => {
        /* The dispatcher handles fallback rendering. */
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      clustererRef.current?.setMap(null);
      heatCirclesRef.current.forEach((c) => c.setMap(null));
      heatCirclesRef.current = [];
      infoRef.current?.close();
      map = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep styles in sync with the theme.
  useEffect(() => {
    mapRef.current?.setOptions({ styles: getMapStyles(theme === 'dark') });
  }, [theme]);

  // External centre/zoom changes (e.g. from search or locate).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (!c) return;
    const moved = Math.abs(c.lat() - center.lat) > 1e-6 || Math.abs(c.lng() - center.lng) > 1e-6;
    if (moved) map.panTo({ lat: center.lat, lng: center.lng });
    if (map.getZoom() !== zoom) map.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

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

      // Hover preview — a small dark card above the pin with AI-annotated image.
      let ovRef: google.maps.OverlayView | null = null;
      const onHoverOver = () => {
        if (ovRef || !map) return;
        const tip = document.createElement('div');
        tip.style.cssText =
          'position:absolute;z-index:9999;background:#111827;color:#fff;padding:8px 10px;border-radius:10px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:240px;width:220px;pointer-events:none;';
        const imgUrl = (r as any).annotatedImage || r.image;
        const sevColor = SEVERITY_HEX[r.severity];
        const statusBadge =
          r.status === 'resolved'
            ? `<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Fixed</span>`
            : r.verified
              ? `<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;font-size:10px">Verified</span>`
              : '';
        const title = escapeHtml(r.title || 'Report');
        const desc = escapeHtml((r.description || '').slice(0, 80));
        tip.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px;line-height:1.3">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sevColor};flex-shrink:0"></span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${title}</span>${statusBadge}
          </div>
          ${
            imgUrl
              ? `<img src="${imgUrl}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:6px;display:block" referrerpolicy="no-referrer" />`
              : `<div style="width:100%;height:60px;background:#1f2937;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">No photo</div>`
          }
          ${desc ? `<div style="margin-top:4px;opacity:.8;line-height:1.3">${desc}</div>` : ''}
        `;
        const ov = new google.maps.OverlayView();
        ov.onAdd = () => {
          ov.getPanes()!.floatPane.appendChild(tip);
        };
        ov.draw = () => {
          const proj = ov.getProjection();
          if (!proj) return;
          const pos = proj.fromLatLngToDivPixel(marker.getPosition()!);
          if (pos) {
            tip.style.left = pos.x - 110 + 'px';
            tip.style.top = pos.y - 170 + 'px';
          }
        };
        ov.onRemove = () => {
          tip.remove();
          ovRef = null;
        };
        ov.setMap(map);
        ovRef = ov;
      };
      const onHoverOut = () => {
        if (ovRef) {
          ovRef.setMap(null);
          ovRef = null;
        }
      };
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

    return () => {
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
    };
  }, [reports, selectedId, onSelect]);

  // Heatmap — custom overlay (the old google.maps.visualization.HeatmapLayer
  // was removed in Maps API v3.65, so we draw overlapping severity-tinted
  // circles instead: denser/hotter areas show more opacity, like a heatmap).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous circles.
    heatCirclesRef.current.forEach((c) => c.setMap(null));
    heatCirclesRef.current = [];

    if (!heatmap || reports.length === 0) return;

    heatCirclesRef.current = reports.map((r) => {
      const weight = SEVERITY_META[r.severity].weight;
      const color = SEVERITY_HEX[r.severity];
      return new google.maps.Circle({
        map,
        center: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        radius: 22 + weight * 20, // metres
        fillColor: color,
        fillOpacity: 0.1 + weight * 0.06,
        strokeColor: color,
        strokeOpacity: 0.3,
        strokeWeight: 1,
        zIndex: 1,
      });
    });

    return () => {
      heatCirclesRef.current.forEach((c) => c.setMap(null));
      heatCirclesRef.current = [];
    };
  }, [reports, heatmap]);

  // Info window for the selected report.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const report = reports.find((r) => r.id === selectedId);
    if (!report) {
      infoRef.current?.close();
      return;
    }

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

    return () => {
      root.unmount();
      infoRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, reports]);

  // Dropped pin (report wizard).
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
    return () => {
      droppedPinRef.current?.setMap(null);
      droppedPinRef.current = null;
    };
  }, [droppedPin]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Interactive map" />;
}
