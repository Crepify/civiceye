import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crosshair, Footprints, MapPin, Navigation, Search, ShieldAlert, Smartphone } from 'lucide-react';
import { CAMPUS_GEO } from '@/data/amritaCampus/geo';
import { OFFICIAL_FLOOR_PLANS } from '@/data/amritaCampus/officialFloorPlans';
import {
  findCampusRoute,
  getCampusRouteNetwork,
  nearestCampusRouteNode,
  type CampusRouteNetwork,
} from '@/data/amritaCampus/routeNetwork';
import type { Coordinates } from '@/types';

type CampusPoint = [number, number];

interface RouteDestination {
  id: string;
  name: string;
  subtitle: string;
  point: CampusPoint;
  node: number;
  room?: { label: string; floorId: string; floorName: string; buildingId: string };
}

const originLat = CAMPUS_GEO.meta.origin[0] as number;
const originLng = CAMPUS_GEO.meta.origin[1] as number;
const metresPerDegreeLat = 111320;
const metresPerDegreeLng = metresPerDegreeLat * Math.cos((12.8945 * Math.PI) / 180);

function coordinatesToCampusPoint(coordinates: Coordinates): CampusPoint {
  return [
    (coordinates.lng - originLng) * metresPerDegreeLng,
    (CAMPUS_GEO.meta.height as number) - (coordinates.lat - originLat) * metresPerDegreeLat,
  ];
}

function destinationList(network: CampusRouteNetwork): RouteDestination[] {
  const destinations: RouteDestination[] = network.pois.map((poi) => ({
    id: poi.id,
    name: poi.name,
    subtitle: poi.kind === 'gate' ? 'Campus entrance' : 'Outdoor destination',
    point: poi.c,
    node: poi.node,
  }));
  const blockPois = new Map(network.pois.filter((poi) => poi.kind === 'block').map((poi) => [poi.id.toLowerCase(), poi]));
  OFFICIAL_FLOOR_PLANS.forEach((plan) => {
    const block = blockPois.get(`block-${plan.buildingId}`);
    if (!block) return;
    plan.rooms.forEach((room, index) => {
      destinations.push({
        id: `room-${plan.floorId}-${index}`,
        name: room.name,
        subtitle: `${room.label} · Block ${plan.buildingId.toUpperCase()} · ${plan.floorName}`,
        point: block.c,
        node: block.node,
        room: { label: room.label, floorId: plan.floorId, floorName: plan.floorName, buildingId: plan.buildingId },
      });
    });
  });
  return destinations;
}

function routeLine(origin: CampusPoint, route: { path: number[] }, destination: CampusPoint, network: CampusRouteNetwork) {
  return ['M', `${origin[0]},${origin[1]}`, ...route.path.flatMap((node) => ['L', `${network.nodes[node][0]},${network.nodes[node][1]}`]), 'L', `${destination[0]},${destination[1]}`].join(' ');
}

export function AmritaRoutePage() {
  const [network] = useState<CampusRouteNetwork>(() => getCampusRouteNetwork());
  const [originId, setOriginId] = useState('current');
  const [destinationId, setDestinationId] = useState('block-E');
  const [query, setQuery] = useState('');
  const [liveCoordinates, setLiveCoordinates] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState('Locating your device…');
  const [tracking, setTracking] = useState(true);

  const destinations = useMemo(() => destinationList(network), [network]);
  const destination = destinations.find((item) => item.id === destinationId) || destinations[0];
  const originPoi = network.pois.find((poi) => poi.id === originId);
  const livePoint = liveCoordinates ? coordinatesToCampusPoint(liveCoordinates) : null;
  const originPoint = originId === 'current' ? livePoint : originPoi?.c || null;
  const startNode = originPoint
    ? originId === 'current' && livePoint
      ? nearestCampusRouteNode(network, livePoint)
      : originPoi?.node ?? nearestCampusRouteNode(network, originPoint)
    : null;
  const route = startNode === null || !destination
    ? null
    : findCampusRoute(network, startNode, destination.node);
  const routeDistance = route && originPoint && destination
    ? route.distance + Math.hypot(originPoint[0] - network.nodes[route.startNode][0], originPoint[1] - network.nodes[route.startNode][1]) + Math.hypot(destination.point[0] - network.nodes[route.endNode][0], destination.point[1] - network.nodes[route.endNode][1])
    : 0;
  const filteredDestinations = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = term
      ? destinations.filter((item) => `${item.name} ${item.subtitle}`.toLowerCase().includes(term))
      : destinations.filter((item) => !item.room).slice(0, 14);
    return items.slice(0, 18);
  }, [destinations, query]);

  useEffect(() => {
    if (!tracking) return undefined;
    if (!navigator.geolocation) {
      setLocationMessage('Live location is not available in this browser.');
      return undefined;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationMessage('Live location active');
      },
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED ? 'Location permission was denied.' : 'Waiting for a location fix…');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking]);

  const routePath = route && originPoint && destination ? routeLine(originPoint, route, destination.point, network) : '';
  const steps = destination?.room
    ? [
      `Walk to the Block ${destination.room.buildingId.toUpperCase()} entrance`,
      `Enter Block ${destination.room.buildingId.toUpperCase()} and go to the ${destination.room.floorName}`,
      `Continue to ${destination.room.label} · ${destination.name}`,
    ]
    : destination
      ? [`Walk to ${destination.name}`, 'Follow the highlighted campus walkway', `Arrive at ${destination.name}`]
      : [];

  return (
    <main className="min-h-screen bg-[#fff7f8] text-slate-900 dark:bg-[#13070b] dark:text-white">
      <header className="flex items-center gap-3 border-b border-[#A51636]/15 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1b0b11]/95 sm:px-6">
        <Link to="/amrita/map" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10" aria-label="Back to campus map">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A51636]">Amrita Eye · Bengaluru</p>
          <h1 className="text-lg font-black tracking-tight">Live campus directions</h1>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-xs text-slate-500 sm:flex">
          <Footprints className="h-4 w-4 text-[#A51636]" /> Outdoor route + indoor handoff
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-66px)] max-w-[1600px] gap-0 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="relative min-h-[52vh] overflow-hidden border-b border-[#A51636]/10 bg-[#f5eef0] lg:min-h-0 lg:border-b-0 lg:border-r dark:bg-[#221116]">
          <svg viewBox={`0 0 ${CAMPUS_GEO.meta.width} ${CAMPUS_GEO.meta.height}`} className="h-full min-h-[52vh] w-full" preserveAspectRatio="xMidYMid meet" aria-label="Amrita campus route map">
            <rect width={CAMPUS_GEO.meta.width} height={CAMPUS_GEO.meta.height} fill="#f8eef0" />
            {(CAMPUS_GEO.zones as unknown as Array<{ d: string; id: string }>).map((zone) => <path key={zone.id} d={zone.d} fill={zone.id === 'south' ? '#f4dfe4' : '#ede5f5'} stroke="#d9c2c8" strokeWidth="2" />)}
            {(CAMPUS_GEO.roads as unknown as Array<{ d: string; type: string }>).map((road, index) => <path key={index} d={road.d} fill="none" stroke={road.type === 'footway' ? '#b8a8ad' : '#d1bfc4'} strokeWidth={road.type === 'footway' ? 2 : 4} strokeDasharray={road.type === 'footway' ? '5 5' : undefined} strokeLinecap="round" />)}
            {(CAMPUS_GEO.blocks as unknown as Array<{ block: string; d: string; c: CampusPoint }>).map((block) => <g key={block.block}><path d={block.d} fill="#A51636" fillOpacity="0.2" stroke="#A51636" strokeWidth="2" /><text x={block.c[0]} y={block.c[1]} textAnchor="middle" fontSize="13" fontWeight="800" fill="#7b1029">{block.block}</text></g>)}
            {network.pois.filter((poi) => poi.kind === 'gate').map((poi) => <circle key={poi.id} cx={poi.c[0]} cy={poi.c[1]} r="5" fill="#eab308" stroke="#713f12" strokeWidth="2" />)}
            {routePath ? <path d={routePath} fill="none" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" /> : null}
            {routePath ? <path d={routePath} fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
            {originPoint ? <circle cx={originPoint[0]} cy={originPoint[1]} r="7" fill="#16a34a" stroke="white" strokeWidth="3" /> : null}
            {destination ? <g><circle cx={destination.point[0]} cy={destination.point[1]} r="7" fill="#dc2626" stroke="white" strokeWidth="3" /><text x={destination.point[0]} y={destination.point[1] - 12} textAnchor="middle" fontSize="10" fontWeight="800" fill="#991b1b">{destination.room ? destination.room.buildingId.toUpperCase() : destination.name}</text></g> : null}
            {livePoint ? <g><circle cx={livePoint[0]} cy={livePoint[1]} r="14" fill="#2563eb" opacity="0.16" /><circle cx={livePoint[0]} cy={livePoint[1]} r="5" fill="#2563eb" stroke="white" strokeWidth="2" /></g> : null}
          </svg>
          <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Route preview</p>
            <p className="mt-0.5 text-sm font-black">{destination?.room ? `To ${destination.room.buildingId.toUpperCase()} · ${destination.room.floorName}` : destination?.name}</p>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/90 px-3 py-1.5 font-semibold shadow dark:bg-slate-950/85"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600" /> You</span>
            <span className="rounded-full bg-white/90 px-3 py-1.5 font-semibold shadow dark:bg-slate-950/85"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-sky-600" /> Walking route</span>
            <span className="rounded-full bg-white/90 px-3 py-1.5 font-semibold shadow dark:bg-slate-950/85"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-600" /> Destination</span>
          </div>
        </section>

        <aside className="flex flex-col bg-white dark:bg-[#1b0b11]">
          <div className="space-y-4 border-b border-slate-200 p-4 dark:border-white/10 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#A51636]">Directions</p><h2 className="text-xl font-black">Where are you going?</h2></div>
              <button type="button" onClick={() => setTracking((value) => !value)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tracking ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><Crosshair className="h-3.5 w-3.5" /> {tracking ? 'Live' : 'Off'}</button>
            </div>
            <label className="block text-xs font-bold text-slate-500">Starting point</label>
            <select value={originId} onChange={(event) => setOriginId(event.target.value)} className="input-base w-full">
              <option value="current">My live location · {locationMessage}</option>
              {network.pois.map((poi) => <option key={poi.id} value={poi.id}>{poi.name}</option>)}
            </select>
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blocks, gates, rooms, faculty areas…" className="input-base w-full pl-9" /></div>
            <div className="max-h-44 space-y-1 overflow-auto rounded-xl border border-slate-200 p-1 dark:border-white/10">
              {filteredDestinations.map((item) => <button key={item.id} type="button" onClick={() => { setDestinationId(item.id); setQuery(''); }} className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${destination?.id === item.id ? 'bg-[#A51636]/10 text-[#A51636]' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0"><span className="block truncate text-sm font-bold">{item.name}</span><span className="block truncate text-[11px] text-slate-500">{item.subtitle}</span></span></button>)}
              {!filteredDestinations.length ? <p className="p-3 text-xs text-slate-500">No destinations match that search.</p> : null}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
            {route ? <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-sky-50 p-3 dark:bg-sky-950/30"><div className="text-xs text-slate-500">Walking distance</div><div className="text-lg font-black text-sky-700 dark:text-sky-300">{Math.round(routeDistance)} m</div></div><div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30"><div className="text-xs text-slate-500">Estimated time</div><div className="text-lg font-black text-emerald-700 dark:text-emerald-300">{Math.max(1, Math.round(routeDistance / 80))} min</div></div></div> : <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/15">Allow location access or choose a fixed starting point to calculate directions.</div>}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"><div className="mb-3 flex items-center gap-2"><Navigation className="h-4 w-4 text-[#A51636]" /><h3 className="font-black">Step-by-step</h3></div><ol className="space-y-3">{steps.map((step, index) => <li key={step} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A51636] text-xs font-black text-white">{index + 1}</span><span className="pt-0.5">{step}</span></li>)}</ol></div>
            {destination?.room ? <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/25 dark:text-amber-200"><ShieldAlert className="mr-1 inline h-4 w-4" /><strong>Indoor handoff:</strong> outdoor routing ends at the mapped Block {destination.room.buildingId.toUpperCase()} entrance. The professional PDF for {destination.room.floorName} is the visual source while corridor-level indoor geometry is calibrated.<Link to={`/amrita/map?b=${destination.room.buildingId}&f=${destination.room.floorId}&room=${encodeURIComponent(destination.room.label)}`} className="mt-2 block font-bold text-[#A51636] underline dark:text-amber-300">Open the {destination.room.floorName} floor plan →</Link></div> : null}
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-white/5 dark:text-slate-400"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-[#A51636]" />Keep this page open while walking. The blue location marker updates as your device reports a new position.</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
