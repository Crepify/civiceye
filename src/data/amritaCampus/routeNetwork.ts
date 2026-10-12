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

export interface CampusRouteResult {
  path: number[];
  distance: number;
  startNode: number;
  endNode: number;
}

// v2 invalidates drafts made with the old synthetic Block E location.
const STORAGE_KEY = 'amrita-eye:campus-route-network:v2';

export const DEFAULT_ROUTE_NETWORK: CampusRouteNetwork = {
  nodes: CAMPUS_GEO.nav.nodes as Array<[number, number]>,
  edges: CAMPUS_GEO.nav.edges as Array<[number, number]>,
  pois: CAMPUS_GEO.nav.pois as CampusRouteNetwork['pois'],
  version: 1,
};

function isCampusPoint(value: unknown): value is [number, number] {
  return Array.isArray(value)
    && value.length === 2
    && value.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate));
}

function isUsableRouteNetwork(value: unknown): value is CampusRouteNetwork {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CampusRouteNetwork>;
  if (!Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges) || !Array.isArray(candidate.pois)) return false;
  if (typeof candidate.version !== 'number' || !Number.isInteger(candidate.version) || candidate.version < 1) return false;
  if (!candidate.nodes.every(isCampusPoint)) return false;
  if (!candidate.edges.every((edge) => (
    Array.isArray(edge)
    && edge.length === 2
    && edge.every((node) => Number.isInteger(node) && node >= 0 && node < candidate.nodes!.length)
    && edge[0] !== edge[1]
  ))) return false;
  return candidate.pois.every((poi) => (
    !!poi
    && typeof poi.id === 'string'
    && typeof poi.name === 'string'
    && typeof poi.kind === 'string'
    && isCampusPoint(poi.c)
    && Number.isInteger(poi.node)
    && poi.node >= 0
    && poi.node < candidate.nodes!.length
  ));
}

export function getCampusRouteNetwork(): CampusRouteNetwork {
  if (typeof window === 'undefined') return DEFAULT_ROUTE_NETWORK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROUTE_NETWORK;
    const parsed: unknown = JSON.parse(raw);
    return isUsableRouteNetwork(parsed) ? parsed : DEFAULT_ROUTE_NETWORK;
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

export function nearestCampusRouteNode(network: CampusRouteNetwork, point: [number, number]): number {
  if (!network.nodes.length) return -1;
  return network.nodes.reduce((nearest, candidate, index) => {
    const currentDistance = Math.hypot(network.nodes[nearest][0] - point[0], network.nodes[nearest][1] - point[1]);
    const candidateDistance = Math.hypot(candidate[0] - point[0], candidate[1] - point[1]);
    return candidateDistance < currentDistance ? index : nearest;
  }, 0);
}

export function findCampusRoute(network: CampusRouteNetwork, startNode: number, endNode: number): CampusRouteResult | null {
  if (startNode < 0 || endNode < 0 || startNode >= network.nodes.length || endNode >= network.nodes.length) return null;
  const adjacency = new Map<number, number[]>();
  network.nodes.forEach((_, index) => adjacency.set(index, []));
  network.edges.forEach(([from, to]) => {
    if (from < 0 || to < 0 || from >= network.nodes.length || to >= network.nodes.length || from === to) return;
    adjacency.get(from)?.push(to);
    adjacency.get(to)?.push(from);
  });
  const distances = new Map<number, number>([[startNode, 0]]);
  const previous = new Map<number, number>();
  const visited = new Set<number>();
  while (visited.size < network.nodes.length) {
    let current: number | undefined;
    let best = Infinity;
    distances.forEach((distance, node) => {
      if (!visited.has(node) && distance < best) {
        best = distance;
        current = node;
      }
    });
    if (current === undefined) break;
    if (current === endNode) break;
    visited.add(current);
    adjacency.get(current)?.forEach((next) => {
      const segment = Math.hypot(network.nodes[current!][0] - network.nodes[next][0], network.nodes[current!][1] - network.nodes[next][1]);
      const nextDistance = best + segment;
      if (nextDistance < (distances.get(next) ?? Infinity)) {
        distances.set(next, nextDistance);
        previous.set(next, current!);
      }
    });
  }
  const distance = distances.get(endNode);
  if (distance === undefined) return null;
  const path: number[] = [endNode];
  while (path[0] !== startNode) {
    const parent = previous.get(path[0]);
    if (parent === undefined) return null;
    path.unshift(parent);
  }
  return { path, distance, startNode, endNode };
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
