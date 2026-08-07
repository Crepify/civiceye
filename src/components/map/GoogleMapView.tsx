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

const SEVERITY_HEX: Record<Severity, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#f43f5e',
};

/** Custom pin icon as an SVG data URL. */
function pinIcon(severity: Severity, selected: boolean, verified: boolean): google.maps.Icon {
  const color = SEVERITY_HEX[severity];
  const size = selected ? 46 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <path d="M12 0C7 0 3 4 3 9c0 6.6 7.5 13.6 8.4 14.5a1 1 0 0 0 1.2 0C13.5 22.6 21 15.6 21 9c0-5-4-9-9-9z" fill="${color}" stroke="#ffffff" stroke-width="1.6"/>
    <circle cx="12" cy="9" r="3.4" fill="#ffffff"/>
    ${verified ? '<circle cx="19" cy="5" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>' : ''}
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  };
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
          styles: getMapStyles(theme === 'dark'),
          disableDefaultUI: true,
          zoomControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy',
          minZoom: 10,
        });
        mapRef.current = map;
        readyRef.current = true;

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

    const markers = reports.map((report) => {
      const marker = new google.maps.Marker({
        position: { lat: report.coordinates.lat, lng: report.coordinates.lng },
        icon: pinIcon(report.severity, report.id === selectedId, report.verified),
        title: report.title,
      });
      marker.addListener('click', () => onSelect(report.id));
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
      icon: pinIcon('critical', true, false),
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
