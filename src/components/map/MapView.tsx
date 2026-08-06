import { useState } from 'react';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import type { Coordinates, Report } from '@/types';
import { useGoogleMapsStatus } from '@/hooks/useGoogleMaps';
import { requestLocation } from '@/services/geoService';
import { useToast } from '@/hooks/useToast';
import { CITY_CENTER, MAX_ZOOM, MIN_ZOOM } from '@/utils/geo';
import { clamp, cn } from '@/utils/cn';
import { GoogleMapView } from './GoogleMapView';
import { FallbackMapView } from './FallbackMapView';
import { Loader } from '../Loader';

interface MapViewProps {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Optional controlled centre/zoom. */
  center?: Coordinates;
  zoom?: number;
  onViewChange?: (center: Coordinates, zoom: number) => void;
  heatmap?: boolean;
  /** Allow clicks to drop a pin (report wizard). */
  pinDropping?: boolean;
  onPinDrop?: (coords: Coordinates) => void;
  droppedPin?: Coordinates | null;
  className?: string;
}

/**
 * Map shell: boots Google Maps when a key exists, otherwise renders the
 * built-in fallback vector map. Adds zoom + locate controls that work in
 * both modes.
 */
export function MapView({
  reports,
  selectedId,
  onSelect,
  center: centerProp,
  zoom: zoomProp,
  onViewChange: onViewChangeProp,
  heatmap = false,
  pinDropping = false,
  onPinDrop,
  droppedPin = null,
  className,
}: MapViewProps) {
  const status = useGoogleMapsStatus();
  const toast = useToast();
  const controlled = centerProp !== undefined && zoomProp !== undefined;

  const [internalCenter, setInternalCenter] = useState<Coordinates>(centerProp ?? CITY_CENTER);
  const [internalZoom, setInternalZoom] = useState<number>(zoomProp ?? 13);

  const center = controlled ? (centerProp as Coordinates) : internalCenter;
  const zoom = controlled ? (zoomProp as number) : internalZoom;

  const handleViewChange = (nextCenter: Coordinates, nextZoom: number) => {
    if (onViewChangeProp) onViewChangeProp(nextCenter, nextZoom);
    if (!controlled) {
      setInternalCenter(nextCenter);
      setInternalZoom(nextZoom);
    }
  };

  const zoomBy = (delta: number) =>
    handleViewChange(center, clamp(zoom + delta, MIN_ZOOM, MAX_ZOOM));

  const locateMe = async () => {
    toast.info('Locating you…');
    const result = await requestLocation();
    if (result.status === 'success' && result.coords) {
      handleViewChange(result.coords, 15);
      toast.success('Location found', 'Map centred on your position.');
    } else {
      toast.error('Location unavailable', result.error ?? 'Could not fetch your position.');
    }
  };

  const commonProps = {
    reports,
    center,
    zoom,
    onViewChange: handleViewChange,
    selectedId,
    onSelect,
    heatmap,
    pinDropping,
    onPinDrop: onPinDrop ?? (() => undefined),
    droppedPin,
  };

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-2xl', className)}>
      {status === 'loading' ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <Loader label="Loading maps…" />
        </div>
      ) : null}

      {status === 'ready' ? (
        <GoogleMapView {...commonProps} />
      ) : (
        <FallbackMapView {...commonProps} />
      )}

      {/* Shared controls */}
      <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
        <button
          onClick={() => zoomBy(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-slate-700 shadow-softer backdrop-blur transition-all hover:scale-105 hover:text-primary-600 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-200"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoomBy(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-slate-700 shadow-softer backdrop-blur transition-all hover:scale-105 hover:text-primary-600 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-200"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => void locateMe()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-slate-700 shadow-softer backdrop-blur transition-all hover:scale-105 hover:text-primary-600 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-200"
          aria-label="Show my location"
          title="Show my location"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
