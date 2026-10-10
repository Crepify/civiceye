import { CAMPUS_GEO } from './geo';

export interface CampusRouteNetwork {
  nodes: Array<[number, number]>;
  edges: Array<[number, number]>;
  pois: Array<{ id: string; name: string; kind: string; c: [number, number]; node: number }>;
  version: number;
}

export interface RouteNetworkCheck {
  checks: number;
  failures: string[];
}

const STORAGE_KEY = 'amrita-eye:campus-route-network:v1';

export const DEFAULT_ROUTE_NETWORK: CampusRouteNetwork = {
  nodes: CAMPUS_GEO.nav.nodes as Array<[number, number]>,
  edges: CAMPUS_GEO.nav.edges as Array<[number, number]>,
  pois: CAMPUS_GEO.nav.pois as CampusRouteNetwork['pois'],
  version: 1,
};

export function getCampusRouteNetwork(): CampusRouteNetwork {
  if (typeof window === 'undefined') return DEFAULT_ROUTE_NETWORK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROUTE_NETWORK;
    const parsed = JSON.parse(raw) as CampusRouteNetwork;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges) || !Array.isArray(parsed.pois)) {
      return DEFAULT_ROUTE_NETWORK;
    }
    return parsed;
  } catch {
    return DEFAULT_ROUTE_NETWORK;
  }
}

export function saveCampusRouteNetwork(network: CampusRouteNetwork): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(network));
  }
}

export function clearCampusRouteNetwork(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
}

/** Validate node/edge references and verify every saved POI can reach every
 * other POI. This is intentionally graph-only; indoor/floor connectors still
 * need their own route data before they can be included in this check. */
export function checkCampusRouteNetwork(network: CampusRouteNetwork): RouteNetworkCheck {
  const failures: string[] = [];
  const nodeCount = network.nodes.length;
  const adjacency = new Map<number, number[]>();
  for (let index = 0; index < nodeCount; index += 1) adjacency.set(index, []);

  network.nodes.forEach((point, index) => {
    if (!Array.isArray(point) || point.length !== 2 || point.some((value) => !Number.isFinite(value))) {
      failures.push(`Node ${index} has invalid coordinates.`);
    }
  });

  network.edges.forEach(([from, to], index) => {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= nodeCount || to >= nodeCount || from === to) {
      failures.push(`Edge ${index} references invalid nodes.`);
      return;
    }
    adjacency.get(from)?.push(to);
    adjacency.get(to)?.push(from);
  });

  network.pois.forEach((poi) => {
    if (!Number.isInteger(poi.node) || poi.node < 0 || poi.node >= nodeCount) {
      failures.push(`${poi.name || poi.id} references an invalid node.`);
    }
  });

  const reachableFrom = (start: number) => {
    const visited = new Set<number>([start]);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      if (current === undefined) break;
      adjacency.get(current)?.forEach((next) => {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
    }
    return visited;
  };

  let checks = 0;
  network.pois.forEach((from) => {
    const reachable = reachableFrom(from.node);
    network.pois.forEach((to) => {
      if (from.id === to.id) return;
      checks += 1;
      if (!reachable.has(to.node)) failures.push(`No route from ${from.name} to ${to.name}.`);
    });
  });
  return { checks, failures: [...new Set(failures)] };
}

export const CAMPUS_ROUTE_STORAGE_KEY = STORAGE_KEY;
