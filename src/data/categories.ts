import type { CategoryId, Severity } from '@/types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  short: string;
  description: string;
  /** Tailwind gradient classes used for icon tiles. */
  gradient: string;
  /** Tailwind text color used for accents. */
  text: string;
  /** Tailwind background chip color. */
  bg: string;
  /** Evidence photo served from /public/reports. */
  image: string;
  /** URL hash used for anchor links on the report page. */
  anchor: string;
}

/**
 * Metadata for every reportable category.
 * Icons are resolved in a LucideIcon map inside the components layer
 * (keeps this module data-only and tree-shakeable).
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'pothole',
    label: 'Pothole',
    short: 'Pothole',
    description:
      'A hole or depression in the road surface that is a hazard to vehicles and riders.',
    gradient: 'from-amber-500 to-orange-600',
    text: 'text-orange-600',
    bg: 'bg-orange-500/10',
    image: '/reports/pothole.jpg',
    anchor: 'pothole',
  },
  {
    id: 'broken-road',
    label: 'Broken Road',
    short: 'Broken road',
    description: 'Cracked, eroded or partially collapsed carriageway that needs resurfacing.',
    gradient: 'from-slate-500 to-slate-700',
    text: 'text-slate-600',
    bg: 'bg-slate-500/10',
    image: '/reports/broken-road.jpg',
    anchor: 'broken-road',
  },
  {
    id: 'garbage',
    label: 'Garbage Accumulation',
    short: 'Garbage',
    description: 'Uncollected waste piling up in public spaces, causing health and hygiene issues.',
    gradient: 'from-lime-500 to-green-600',
    text: 'text-green-600',
    bg: 'bg-green-500/10',
    image: '/reports/garbage.jpg',
    anchor: 'garbage',
  },
  {
    id: 'sidewalk',
    label: 'Broken Sidewalk',
    short: 'Sidewalk',
    description: 'Damaged, uneven or missing footpath tiles that make walking unsafe.',
    gradient: 'from-stone-400 to-stone-600',
    text: 'text-stone-600',
    bg: 'bg-stone-500/10',
    image: '/reports/sidewalk.jpg',
    anchor: 'sidewalk',
  },
  {
    id: 'manhole',
    label: 'Missing Manhole Cover',
    short: 'Manhole cover',
    description: 'An open or missing manhole cover — an extreme safety hazard for pedestrians.',
    gradient: 'from-zinc-500 to-zinc-800',
    text: 'text-zinc-600',
    bg: 'bg-zinc-500/10',
    image: '/reports/manhole.jpg',
    anchor: 'manhole',
  },
  {
    id: 'fallen-tree',
    label: 'Fallen Tree',
    short: 'Fallen tree',
    description: 'A tree that has fallen over, blocking roads, footpaths or parked vehicles.',
    gradient: 'from-emerald-500 to-teal-700',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    image: '/reports/fallen-tree.jpg',
    anchor: 'fallen-tree',
  },
  {
    id: 'street-light',
    label: 'Broken Street Light',
    short: 'Street light',
    description: 'A street lamp that is damaged, flickering, or out — leaving streets dark.',
    gradient: 'from-yellow-400 to-amber-600',
    text: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    image: '/reports/street-light.jpg',
    anchor: 'street-light',
  },
  {
    id: 'water-leakage',
    label: 'Water Leakage',
    short: 'Water leakage',
    description: 'A burst or leaking water line flooding the road and wasting precious water.',
    gradient: 'from-sky-400 to-blue-600',
    text: 'text-sky-600',
    bg: 'bg-sky-500/10',
    image: '/reports/water-leakage.jpg',
    anchor: 'water-leakage',
  },
  {
    id: 'sewage',
    label: 'Sewage Overflow',
    short: 'Sewage',
    description: 'Raw sewage overflowing from drains — a serious health and odour hazard.',
    gradient: 'from-teal-500 to-emerald-700',
    text: 'text-teal-600',
    bg: 'bg-teal-500/10',
    image: '/reports/sewage.jpg',
    anchor: 'sewage',
  },
  {
    id: 'illegal-dumping',
    label: 'Illegal Dumping',
    short: 'Illegal dumping',
    description: 'Construction debris or waste dumped illegally in public or empty plots.',
    gradient: 'from-red-500 to-rose-700',
    text: 'text-rose-600',
    bg: 'bg-rose-500/10',
    image: '/reports/illegal-dumping.jpg',
    anchor: 'illegal-dumping',
  },
  {
    id: 'traffic-signal',
    label: 'Traffic Signal Damage',
    short: 'Traffic signal',
    description: 'A broken, dark or malfunctioning traffic signal endangering road users.',
    gradient: 'from-violet-500 to-purple-700',
    text: 'text-violet-600',
    bg: 'bg-violet-500/10',
    image: '/reports/traffic-signal.svg',
    anchor: 'traffic-signal',
  },
  {
    id: 'accident',
    label: 'Traffic Accident',
    short: 'Accident',
    description: 'A road collision or crash scene — damaged vehicles, debris or stopped traffic.',
    gradient: 'from-rose-500 to-red-600',
    text: 'text-rose-600',
    bg: 'bg-rose-500/10',
    image: '/reports/accident.svg',
    anchor: 'accident',
  },
  {
    id: 'other',
    label: 'Other Infrastructure',
    short: 'Other',
    description: 'Any other broken public infrastructure that does not fit the categories above.',
    gradient: 'from-cyan-500 to-teal-600',
    text: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    image: '/reports/other.svg',
    anchor: 'other',
  },
];

/** Lookup helpers */
export const categoryById = (id: CategoryId): CategoryMeta =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string; dot: string; weight: number }
> = {
  low: {
    label: 'Low',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
    weight: 1,
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
    weight: 2,
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    dot: 'bg-orange-500',
    weight: 3,
  },
  critical: {
    label: 'Critical',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    dot: 'bg-rose-500',
    weight: 4,
  },
};

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-500/10' },
  verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  resolved: { label: 'Resolved', color: 'text-teal-600', bg: 'bg-teal-500/10' },
  rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-500/10' },
};
