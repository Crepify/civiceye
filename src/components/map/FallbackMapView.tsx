import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Coordinates, Report } from '@/types';
import { SEVERITY_META } from '@/data/categories';
import { CITY_CENTER } from '@/utils/geo';
import { useTheme } from '@/hooks/useTheme';
import { clamp } from '@/utils/cn';
import { MapPopup } from './MapPopup';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const W = 800; // virtual canvas width
const H = 600; // virtual canvas height
const scaleFor = (zoom: number) => 256 * Math.pow(2, zoom - 10);
const CLUSTER_CELL_PX = 60;

const SEVERITY_HEX = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#f43f5e',
} as const;

/** Deterministic world background (roads/parks) built once. */
const WORLD_BG = (() => {
  const rand = (() => {
    let a = 987654321;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const roads: Array<{ horizontal: boolean; offset: number; width: number; major: boolean }> = [];
  for (let i = 0; i < 16; i++) {
    roads.push({
      horizontal: rand() > 0.5,
      offset: (rand() - 0.5) * 1.1,
      width: 5 + rand() * (i < 6 ? 14 : 7),
      major: i < 6,
    });
  }
  const parks: Array<{ lat: number; lng: number; w: number; h: number }> = [];
  for (let i = 0; i < 12; i++) {
    parks.push({
      lat: CITY_CENTER.lat + (rand() - 0.5) * 0.7,
      lng: CITY_CENTER.lng + (rand() - 0.5) * 0.7,
      w: 0.015 + rand() * 0.07,
      h: 0.01 + rand() * 0.06,
    });
  }
  return { roads, parks };
})();

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface FallbackMapViewProps {
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

type Cluster =
  | { kind: 'single'; report: Report }
  | { kind: 'cluster'; reports: Report[]; count: number; lat: number; lng: number };

/**
 * Built-in vector map used when no Google Maps key is configured.
 * Renders a stylised city grid (roads, parks), clustered severity pins,
 * a heatmap overlay, drag/wheel pan & zoom and click-to-pin.
 */
export function FallbackMapView({
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
}: FallbackMapViewProps) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    center: Coordinates;
    moved: boolean;
  } | null>(null);

  const scale = scaleFor(zoom);
  const cosLat = Math.cos((center.lat * Math.PI) / 180);

  /** World → canvas coordinates. */
  const toCanvas = useCallback(
    (coords: Coordinates) => ({
      x: W / 2 + (coords.lng - center.lng) * scale * cosLat,
      y: H / 2 - (coords.lat - center.lat) * scale,
    }),
    [center.lng, center.lat, scale, cosLat],
  );

  /** Canvas → world coordinates. */
  const toWorld = useCallback(
    (x: number, y: number): Coordinates => ({
      lng: center.lng + (x - W / 2) / (scale * cosLat),
      lat: center.lat - (y - H / 2) / scale,
    }),
    [center.lng, center.lat, scale, cosLat],
  );

  /** Cluster nearby markers into bubbles. */
  const clusters = useMemo<Cluster[]>(() => {
    const cellDeg = CLUSTER_CELL_PX / scale;
    const groups = new Map<string, Report[]>();
    for (const r of reports) {
      const key = `${Math.floor(r.coordinates.lat / cellDeg)}:${Math.floor(r.coordinates.lng / cellDeg)}`;
      const list = groups.get(key) ?? [];
      list.push(r);
      groups.set(key, list);
    }
    return [...groups.values()].map((group) => {
      if (group.length === 1) return { kind: 'single' as const, report: group[0] };
      const lat = group.reduce((s, r) => s + r.coordinates.lat, 0) / group.length;
      const lng = group.reduce((s, r) => s + r.coordinates.lng, 0) / group.length;
      return { kind: 'cluster' as const, reports: group, count: group.length, lat, lng };
    });
  }, [reports, scale]);

  const selectedReport = reports.find((r) => r.id === selectedId) ?? null;

  /* Wheel zoom (non-passive so we can preventDefault). */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = clamp(zoom + (e.deltaY < 0 ? 1 : -1), 10, 17);
      if (next !== zoom) onViewChange(center, next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, center, onViewChange]);

  /* Drag to pan + click to select / drop pin. */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, center, moved: false };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = containerRef.current;
    if (!drag || !el) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    if (!drag.moved) return;
    const factor = el.getBoundingClientRect().width / W;
    const next = {
      lng: drag.center.lng - dx / factor / (scale * cosLat),
      lat: drag.center.lat + dy / factor / scale,
    };
    onViewChange(next, zoom);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.moved) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;

    if (pinDropping) {
      const coords = toWorld(x, y);
      onPinDrop({ lat: clamp(coords.lat, -90, 90), lng: clamp(coords.lng, -180, 180) });
      return;
    }

    // Hit-test single markers (clusters zoom in instead).
    for (const c of clusters) {
      if (c.kind !== 'single') continue;
      const p = toCanvas(c.report.coordinates);
      if (Math.hypot(p.x - x, p.y - y) < 26) {
        onSelect(c.report.id);
        return;
      }
    }
    for (const c of clusters) {
      if (c.kind !== 'cluster') continue;
      const p = toCanvas({ lat: c.lat, lng: c.lng });
      if (Math.hypot(p.x - x, p.y - y) < 40) {
        onViewChange({ lat: c.lat, lng: c.lng }, clamp(zoom + 1, 10, 17));
        return;
      }
    }
    onSelect(null);
  };

  const popupPos = selectedReport ? toCanvas(selectedReport.coordinates) : null;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full touch-none overflow-hidden select-none ${pinDropping ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="application"
      aria-label="Interactive map (fallback view)"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* Base */}
        <rect width={W} height={H} fill={dark ? '#0b1120' : '#e8eef5'} />

        {/* Grid */}
        {Array.from({ length: 21 }, (_, i) => i - 10).map((i) => (
          <g key={i} stroke={dark ? '#ffffff' : '#0f172a'} strokeOpacity={dark ? 0.04 : 0.05}>
            <line x1={((i + 10) / 20) * W} y1={0} x2={((i + 10) / 20) * W} y2={H} />
            <line x1={0} y1={((i + 10) / 20) * H} x2={W} y2={((i + 10) / 20) * H} />
          </g>
        ))}

        {/* Parks */}
        {WORLD_BG.parks.map((p, i) => {
          const c = toCanvas({ lat: p.lat, lng: p.lng });
          const w = p.w * scale * cosLat;
          const h = p.h * scale;
          if (c.x + w < 0 || c.x - w > W || c.y + h < 0 || c.y - h > H) return null;
          return (
            <rect
              key={`park-${i}`}
              x={c.x - w / 2}
              y={c.y - h / 2}
              width={w}
              height={h}
              rx={18}
              fill={dark ? '#134e4a' : '#c7f0cf'}
              opacity={0.85}
            />
          );
        })}

        {/* Roads */}
        {WORLD_BG.roads.map((r, i) => {
          const c = r.horizontal
            ? toCanvas({ lat: center.lat + r.offset, lng: center.lng })
            : toCanvas({ lat: center.lat, lng: center.lng + r.offset });
          const visible = r.horizontal ? c.y > -100 && c.y < H + 100 : c.x > -100 && c.x < W + 100;
          if (!visible) return null;
          return r.horizontal ? (
            <rect
              key={`road-${i}`}
              x={-W}
              y={c.y - r.width / 2}
              width={3 * W}
              height={r.width}
              fill={dark ? '#1e293b' : '#ffffff'}
            />
          ) : (
            <rect
              key={`road-${i}`}
              x={c.x - r.width / 2}
              y={-H}
              width={r.width}
              height={3 * H}
              fill={dark ? '#1e293b' : '#ffffff'}
            />
          );
        })}

        {/* Heatmap glow */}
        {heatmap
          ? reports.map((r) => {
              const p = toCanvas(r.coordinates);
              if (p.x < -80 || p.x > W + 80 || p.y < -80 || p.y > H + 80) return null;
              return (
                <circle
                  key={`heat-${r.id}`}
                  cx={p.x}
                  cy={p.y}
                  r={30 + SEVERITY_META[r.severity].weight * 12}
                  fill={SEVERITY_HEX[r.severity]}
                  opacity={0.16 + SEVERITY_META[r.severity].weight * 0.05}
                />
              );
            })
          : null}

        {/* Clusters */}
        {clusters.map((c) => {
          if (c.kind === 'cluster') {
            const p = toCanvas({ lat: c.lat, lng: c.lng });
            if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) return null;
            const size = c.count > 50 ? 52 : c.count > 15 ? 44 : 36;
            return (
              <g
                key={`c-${c.lat}-${c.lng}`}
                transform={`translate(${p.x} ${p.y})`}
                pointerEvents="none"
              >
                <circle r={size / 2} fill="#4f46e5" fillOpacity={0.92} />
                <circle r={size / 2} fill="none" stroke="#c7d2fe" strokeWidth={2} />
                <text
                  y={4}
                  textAnchor="middle"
                  fontSize={c.count > 99 ? 13 : 15}
                  fontWeight={700}
                  fill="#ffffff"
                  fontFamily="Inter, sans-serif"
                >
                  {c.count}
                </text>
              </g>
            );
          }

          const p = toCanvas(c.report.coordinates);
          if (p.x < -50 || p.x > W + 50 || p.y < -70 || p.y > H + 70) return null;
          const selected = c.report.id === selectedId;
          const color = SEVERITY_HEX[c.report.severity];
          const pinSize = selected ? 46 : 34;
          return (
            <g key={`m-${c.report.id}`} transform={`translate(${p.x} ${p.y})`} pointerEvents="none">
              {selected ? (
                <circle
                  r={26}
                  fill={color}
                  opacity={0.25}
                  className="animate-pulse-ring"
                  style={{ transformOrigin: 'center' }}
                />
              ) : null}
              <path
                d="M0 -16 C-7 -16 -12 -11 -12 -4 C-12 5 -4 12 0 17 C4 12 12 5 12 -4 C12 -11 7 -16 0 -16 Z"
                fill={color}
                stroke={dark ? '#0b1120' : '#ffffff'}
                strokeWidth={1.8}
                transform={`scale(${pinSize / 34})`}
              />
              <circle cy={-4} r={3.4} fill={dark ? '#0b1120' : '#ffffff'} />
              {c.report.verified ? (
                <circle
                  cx={8.5}
                  cy={-13}
                  r={5}
                  fill="#10b981"
                  stroke={dark ? '#0b1120' : '#ffffff'}
                  strokeWidth={1.4}
                />
              ) : null}
            </g>
          );
        })}

        {/* Dropped pin (wizard) */}
        {droppedPin
          ? (() => {
              const p = toCanvas(droppedPin);
              return (
                <g transform={`translate(${p.x} ${p.y})`} pointerEvents="none">
                  <circle
                    r={30}
                    fill="#4f46e5"
                    opacity={0.2}
                    className="animate-pulse-ring"
                    style={{ transformOrigin: 'center' }}
                  />
                  <path
                    d="M0 -16 C-7 -16 -12 -11 -12 -4 C-12 5 -4 12 0 17 C4 12 12 5 12 -4 C12 -11 7 -16 0 -16 Z"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth={2}
                    transform="scale(1.35)"
                  />
                  <circle cy={-4} r={3.6} fill="#ffffff" transform="scale(1.35)" />
                </g>
              );
            })()
          : null}
      </svg>

      {/* Selected report popup */}
      {selectedReport && popupPos ? (
        <div
          className="absolute z-20"
          style={{
            left: `${(popupPos.x / W) * 100}%`,
            top: `${(popupPos.y / H) * 100}%`,
            transform: 'translate(-50%, -108%)',
          }}
        >
          <MapPopup report={selectedReport} onClose={() => onSelect(null)} />
        </div>
      ) : null}

      {/* Attribution */}
      <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-lg bg-white/70 px-2 py-1 text-[9px] font-medium text-slate-500 backdrop-blur dark:bg-slate-900/70 dark:text-slate-400">
        CivicEye map · no API key configured · {reports.length} reports
      </div>
    </div>
  );
}
